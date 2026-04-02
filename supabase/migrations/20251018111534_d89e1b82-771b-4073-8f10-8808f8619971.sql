-- Table pour tracer l'historique des réductions appliquées
CREATE TABLE public.referral_discount_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_payment_id uuid NOT NULL REFERENCES public.subscription_payments(id) ON DELETE CASCADE,
  original_price numeric NOT NULL,
  discount_percentage numeric NOT NULL,
  discount_amount numeric NOT NULL,
  final_price numeric NOT NULL,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_discount_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own discount history as referrer"
ON public.referral_discount_history
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Admins can view all discount history"
ON public.referral_discount_history
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert discount history"
ON public.referral_discount_history
FOR INSERT
WITH CHECK (true);

-- Mettre à jour la table referrals pour ajouter la date du premier paiement
ALTER TABLE public.referrals
ADD COLUMN IF NOT EXISTS first_payment_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS discount_activation_date timestamp with time zone;

-- Fonction pour activer le statut d'un filleul après son premier paiement
CREATE OR REPLACE FUNCTION public.activate_referral_on_first_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referee_id uuid;
  v_referrer_id uuid;
BEGIN
  -- Vérifier que c'est un paiement réussi
  IF NEW.status = 'paid' THEN
    -- Récupérer l'user_id du filleul depuis la subscription
    SELECT s.user_id INTO v_referee_id
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
    -- Vérifier si c'est le premier paiement du filleul
    IF NOT EXISTS (
      SELECT 1 
      FROM subscription_payments sp
      JOIN subscriptions s ON s.id = sp.subscription_id
      WHERE s.user_id = v_referee_id 
      AND sp.status = 'paid'
      AND sp.id != NEW.id
    ) THEN
      -- Mettre à jour le referral avec la date du premier paiement
      UPDATE referrals
      SET 
        first_payment_date = NEW.payment_date,
        status = 'active',
        discount_activation_date = NEW.payment_date,
        first_subscription_id = NEW.subscription_id
      WHERE referee_id = v_referee_id
      AND first_payment_date IS NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour activer automatiquement le parrainage après le premier paiement
DROP TRIGGER IF EXISTS activate_referral_after_payment ON public.subscription_payments;
CREATE TRIGGER activate_referral_after_payment
AFTER INSERT ON public.subscription_payments
FOR EACH ROW
EXECUTE FUNCTION public.activate_referral_on_first_payment();

-- Fonction améliorée pour appliquer la réduction et tracer l'historique
CREATE OR REPLACE FUNCTION public.apply_referral_discount_with_tracking(
  p_base_price numeric,
  p_user_id uuid,
  p_payment_id uuid DEFAULT NULL
)
RETURNS TABLE(
  final_price numeric,
  discount_percentage numeric,
  discount_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discount_percentage numeric;
  v_discount_amount numeric;
  v_final_price numeric;
  v_referee_id uuid;
  v_referrer_id uuid;
BEGIN
  -- Calculer la réduction applicable
  v_discount_percentage := public.calculate_referral_discount(p_user_id);
  
  -- Calculer le montant de la réduction et le prix final
  v_discount_amount := ROUND(p_base_price * (v_discount_percentage / 100), 2);
  v_final_price := p_base_price - v_discount_amount;
  
  -- Si un payment_id est fourni, tracer l'application de la réduction
  IF p_payment_id IS NOT NULL AND v_discount_percentage > 0 THEN
    -- Récupérer les informations du paiement pour tracer
    -- (le user_id peut être soit le parrain soit le filleul)
    
    -- Vérifier si l'utilisateur est un parrain
    IF EXISTS (SELECT 1 FROM referrals WHERE referrer_id = p_user_id AND status = 'active') THEN
      -- Insérer dans l'historique pour chaque filleul actif
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
        p_user_id,
        r.referee_id,
        p_payment_id,
        p_base_price,
        v_discount_percentage,
        v_discount_amount,
        v_final_price,
        'Réduction appliquée automatiquement'
      FROM referrals r
      WHERE r.referrer_id = p_user_id AND r.status = 'active'
      LIMIT 1; -- Une seule entrée par paiement
    END IF;
  END IF;
  
  -- Retourner les résultats
  RETURN QUERY SELECT v_final_price, v_discount_percentage, v_discount_amount;
END;
$$;

-- Vue pour l'historique complet de traçabilité
CREATE OR REPLACE VIEW public.referral_tracking AS
SELECT 
  r.id as referral_id,
  r.referrer_id,
  r.referee_id,
  p_referrer.full_name as referrer_name,
  p_referee.full_name as referee_name,
  rc.code as referral_code,
  rc.created_at as code_created_at,
  r.created_at as referral_created_at,
  r.first_payment_date,
  r.discount_activation_date,
  r.status,
  rdh.id as discount_history_id,
  rdh.original_price,
  rdh.discount_percentage,
  rdh.discount_amount,
  rdh.final_price,
  rdh.applied_at as discount_applied_at,
  sp.payment_date
FROM referrals r
JOIN profiles p_referrer ON p_referrer.id = r.referrer_id
JOIN profiles p_referee ON p_referee.id = r.referee_id
JOIN referral_codes rc ON rc.user_id = r.referrer_id
LEFT JOIN referral_discount_history rdh ON (rdh.referrer_id = r.referrer_id AND rdh.referee_id = r.referee_id)
LEFT JOIN subscription_payments sp ON sp.id = rdh.subscription_payment_id
ORDER BY r.created_at DESC, rdh.applied_at DESC;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_referral_discount_history_referrer ON public.referral_discount_history(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_discount_history_referee ON public.referral_discount_history(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_first_payment ON public.referrals(first_payment_date) WHERE first_payment_date IS NOT NULL;