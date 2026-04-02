-- Table pour la détection de fraude
CREATE TABLE IF NOT EXISTS public.fraud_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  fraud_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'LOW',
  status TEXT NOT NULL DEFAULT 'PENDING',
  details JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fraud_detection_user ON public.fraud_detection(user_id);
CREATE INDEX idx_fraud_detection_status ON public.fraud_detection(status);
CREATE INDEX idx_fraud_detection_severity ON public.fraud_detection(severity);

ALTER TABLE public.fraud_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view fraud detections"
ON public.fraud_detection FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage fraud detections"
ON public.fraud_detection FOR ALL
USING (public.is_admin(auth.uid()));

-- Améliorer la table referrals
ALTER TABLE public.referrals
ADD COLUMN IF NOT EXISTS pending_validation BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS validation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS referee_discount_applied NUMERIC DEFAULT 0;

-- Fonction pour appliquer la réduction de 5% au filleul
CREATE OR REPLACE FUNCTION public.apply_referee_discount(
  p_subscription_payment_id UUID,
  p_referee_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discount_percentage NUMERIC := 5;
  v_base_amount NUMERIC;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
  v_referral_id UUID;
BEGIN
  SELECT amount_paid INTO v_base_amount
  FROM subscription_payments
  WHERE id = p_subscription_payment_id;
  
  IF EXISTS (
    SELECT 1 FROM referrals 
    WHERE referee_id = p_referee_id 
    AND first_payment_date IS NULL
  ) THEN
    v_discount_amount := ROUND(v_base_amount * (v_discount_percentage / 100), 2);
    v_final_amount := v_base_amount - v_discount_amount;
    
    SELECT id INTO v_referral_id
    FROM referrals
    WHERE referee_id = p_referee_id
    LIMIT 1;
    
    UPDATE referrals
    SET referee_discount_applied = v_discount_amount
    WHERE id = v_referral_id;
    
    INSERT INTO referral_discount_history (
      referrer_id,
      referee_id,
      subscription_payment_id,
      original_price,
      discount_percentage,
      discount_amount,
      final_price,
      notes
    )
    SELECT 
      r.referrer_id,
      r.referee_id,
      p_subscription_payment_id,
      v_base_amount,
      v_discount_percentage,
      v_discount_amount,
      v_final_amount,
      'Réduction de 5% appliquée au filleul lors de son premier paiement'
    FROM referrals r
    WHERE r.id = v_referral_id;
    
    RETURN v_final_amount;
  END IF;
  
  RETURN v_base_amount;
END;
$$;

-- Fonction pour valider un parrainage après 3 jours
CREATE OR REPLACE FUNCTION public.validate_referral_after_delay(
  p_referral_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_payment_date TIMESTAMPTZ;
  v_days_since_payment INTEGER;
BEGIN
  SELECT first_payment_date INTO v_first_payment_date
  FROM referrals
  WHERE id = p_referral_id
  AND pending_validation = TRUE;
  
  IF v_first_payment_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  v_days_since_payment := EXTRACT(DAY FROM (NOW() - v_first_payment_date));
  
  IF v_days_since_payment >= 3 AND NOT EXISTS (
    SELECT 1 FROM fraud_detection
    WHERE referral_id = p_referral_id
    AND status = 'CONFIRMED'
  ) THEN
    UPDATE referrals
    SET 
      pending_validation = FALSE,
      validation_date = NOW(),
      status = 'active'
    WHERE id = p_referral_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Fonction pour utiliser un code promo
CREATE OR REPLACE FUNCTION public.use_promo_code(
  p_promo_code TEXT,
  p_user_id UUID,
  p_payment_id UUID,
  p_original_amount NUMERIC
)
RETURNS TABLE(
  valid BOOLEAN,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo RECORD;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
BEGIN
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_promo_code
  AND user_id = p_user_id
  AND used = FALSE
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, p_original_amount, 'Code promo invalide ou déjà utilisé';
    RETURN;
  END IF;
  
  v_discount_amount := LEAST(v_promo.discount_euros, p_original_amount);
  v_final_amount := p_original_amount - v_discount_amount;
  
  UPDATE promo_codes
  SET 
    used = TRUE,
    used_at = NOW(),
    used_for_payment_id = p_payment_id
  WHERE code = p_promo_code;
  
  UPDATE referral_credits
  SET 
    balance_euros = balance_euros - v_discount_amount,
    last_updated = NOW()
  WHERE user_id = p_user_id;
  
  INSERT INTO credit_transactions (
    user_id,
    amount_euros,
    amount_percentage,
    transaction_type,
    promo_code,
    subscription_payment_id,
    description
  ) VALUES (
    p_user_id,
    v_discount_amount,
    v_promo.discount_percentage,
    'used',
    p_promo_code,
    p_payment_id,
    'Utilisation du code promo ' || p_promo_code
  );
  
  RETURN QUERY SELECT TRUE, v_discount_amount, v_final_amount, 'Code promo appliqué avec succès';
END;
$$;

-- Fonction de détection automatique de fraude
CREATE OR REPLACE FUNCTION public.detect_potential_fraud()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_count INTEGER;
  v_same_day_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_same_day_count
  FROM referrals
  WHERE referrer_id = NEW.referrer_id
  AND DATE(created_at) = DATE(NOW());
  
  IF v_same_day_count > 3 THEN
    INSERT INTO fraud_detection (
      user_id,
      referral_id,
      fraud_type,
      severity,
      status,
      details
    ) VALUES (
      NEW.referrer_id,
      NEW.id,
      'SUSPICIOUS_PATTERN',
      'MEDIUM',
      'PENDING',
      jsonb_build_object(
        'reason', 'Trop de filleuls créés le même jour',
        'count', v_same_day_count
      )
    );
  END IF;
  
  SELECT COUNT(*) INTO v_referral_count
  FROM referrals
  WHERE referrer_id = NEW.referrer_id
  AND status = 'active';
  
  IF v_referral_count >= 10 THEN
    INSERT INTO fraud_detection (
      user_id,
      referral_id,
      fraud_type,
      severity,
      status,
      details
    ) VALUES (
      NEW.referrer_id,
      NEW.id,
      'SUSPICIOUS_PATTERN',
      'HIGH',
      'PENDING',
      jsonb_build_object(
        'reason', 'Limite de 10 filleuls atteinte',
        'count', v_referral_count
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS detect_fraud_on_referral ON public.referrals;
CREATE TRIGGER detect_fraud_on_referral
AFTER INSERT ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.detect_potential_fraud();

-- Améliorer le trigger d'activation
CREATE OR REPLACE FUNCTION public.activate_referral_on_first_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referee_id UUID;
BEGIN
  IF NEW.status = 'paid' THEN
    SELECT s.user_id INTO v_referee_id
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
    IF NOT EXISTS (
      SELECT 1 
      FROM subscription_payments sp
      JOIN subscriptions s ON s.id = sp.subscription_id
      WHERE s.user_id = v_referee_id 
      AND sp.status = 'paid'
      AND sp.id != NEW.id
    ) THEN
      UPDATE referrals
      SET 
        first_payment_date = NEW.payment_date,
        first_subscription_id = NEW.subscription_id,
        pending_validation = TRUE
      WHERE referee_id = v_referee_id
      AND first_payment_date IS NULL;
      
      PERFORM public.apply_referee_discount(NEW.id, v_referee_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;