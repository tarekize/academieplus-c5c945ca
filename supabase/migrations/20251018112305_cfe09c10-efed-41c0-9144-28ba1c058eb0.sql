-- Table pour le porte-monnaie de crédits de parrainage
CREATE TABLE public.referral_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance_euros numeric NOT NULL DEFAULT 0,
  balance_percentage numeric NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credits"
ON public.referral_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage credits"
ON public.referral_credits
FOR ALL
USING (true)
WITH CHECK (true);

-- Table pour l'historique des transactions de crédit
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_euros numeric NOT NULL,
  amount_percentage numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'used', 'expired')),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  subscription_payment_id uuid REFERENCES public.subscription_payments(id) ON DELETE SET NULL,
  description text,
  promo_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (true);

-- Table pour les codes promo générés
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discount_euros numeric NOT NULL,
  discount_percentage numeric NOT NULL,
  used boolean NOT NULL DEFAULT false,
  used_at timestamp with time zone,
  used_for_payment_id uuid REFERENCES public.subscription_payments(id) ON DELETE SET NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own promo codes"
ON public.promo_codes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view unused promo codes by code"
ON public.promo_codes
FOR SELECT
USING (used = false);

CREATE POLICY "System can manage promo codes"
ON public.promo_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Fonction pour générer un code promo unique
CREATE OR REPLACE FUNCTION public.generate_promo_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Générer un code de 10 caractères (lettres majuscules et chiffres)
    new_code := 'PROMO-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 10));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.promo_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour ajouter des crédits au parrain après paiement du filleul
CREATE OR REPLACE FUNCTION public.add_referral_credit_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referee_id uuid;
  v_referrer_id uuid;
  v_referral_id uuid;
  v_credit_amount numeric;
  v_credit_percentage numeric := 5;
  v_annual_amount numeric;
BEGIN
  -- Vérifier que c'est un paiement réussi
  IF NEW.status = 'paid' THEN
    -- Récupérer l'user_id du filleul depuis la subscription
    SELECT s.user_id INTO v_referee_id
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
    -- Vérifier si c'est le premier paiement du filleul ET qu'il y a un parrainage
    IF NOT EXISTS (
      SELECT 1 
      FROM subscription_payments sp
      JOIN subscriptions s ON s.id = sp.subscription_id
      WHERE s.user_id = v_referee_id 
      AND sp.status = 'paid'
      AND sp.id != NEW.id
    ) THEN
      -- Récupérer le parrain
      SELECT r.referrer_id, r.id INTO v_referrer_id, v_referral_id
      FROM referrals r
      WHERE r.referee_id = v_referee_id
      AND r.status = 'active'
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Calculer le montant annuel (si mensuel, on multiplie par 12)
        SELECT 
          CASE 
            WHEN sp.billing_period = 'monthly' THEN NEW.monthly_price * 12
            ELSE NEW.amount_paid
          END INTO v_annual_amount
        FROM subscription_plans sp
        WHERE sp.id = (SELECT plan_id FROM subscriptions WHERE id = NEW.subscription_id);
        
        -- Calculer le crédit (5% du montant annuel)
        v_credit_amount := ROUND(v_annual_amount * (v_credit_percentage / 100), 2);
        
        -- Créer ou mettre à jour le solde de crédit du parrain
        INSERT INTO referral_credits (user_id, balance_euros, balance_percentage, last_updated)
        VALUES (v_referrer_id, v_credit_amount, v_credit_percentage, now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          balance_euros = referral_credits.balance_euros + v_credit_amount,
          balance_percentage = referral_credits.balance_percentage + v_credit_percentage,
          last_updated = now();
        
        -- Enregistrer la transaction
        INSERT INTO credit_transactions (
          user_id,
          amount_euros,
          amount_percentage,
          transaction_type,
          referral_id,
          subscription_payment_id,
          description
        ) VALUES (
          v_referrer_id,
          v_credit_amount,
          v_credit_percentage,
          'earned',
          v_referral_id,
          NEW.id,
          'Crédit gagné grâce au parrainage'
        );
        
        -- Générer automatiquement un code promo pour le montant total du crédit
        DECLARE
          v_promo_code text;
          v_current_balance numeric;
        BEGIN
          -- Récupérer le solde actuel
          SELECT balance_euros INTO v_current_balance
          FROM referral_credits
          WHERE user_id = v_referrer_id;
          
          -- Générer le code promo
          v_promo_code := generate_promo_code();
          
          INSERT INTO promo_codes (
            code,
            user_id,
            discount_euros,
            discount_percentage,
            used
          ) VALUES (
            v_promo_code,
            v_referrer_id,
            v_current_balance,
            v_credit_percentage,
            false
          );
        END;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour ajouter automatiquement les crédits après paiement
DROP TRIGGER IF EXISTS add_credit_after_payment ON public.subscription_payments;
CREATE TRIGGER add_credit_after_payment
AFTER INSERT ON public.subscription_payments
FOR EACH ROW
EXECUTE FUNCTION public.add_referral_credit_on_payment();

-- Vue pour le tableau de bord des crédits
CREATE OR REPLACE VIEW public.user_credit_dashboard AS
SELECT 
  rc.user_id,
  COALESCE(rc.balance_euros, 0) as balance_euros,
  COALESCE(rc.balance_percentage, 0) as balance_percentage,
  rc.last_updated,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'active') as active_referrals_count,
  COUNT(pc.id) FILTER (WHERE pc.used = false) as available_promo_codes,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', ct.id,
        'amount_euros', ct.amount_euros,
        'transaction_type', ct.transaction_type,
        'description', ct.description,
        'created_at', ct.created_at
      ) ORDER BY ct.created_at DESC
    )
    FROM credit_transactions ct
    WHERE ct.user_id = rc.user_id
    LIMIT 10
  ) as recent_transactions
FROM referral_credits rc
LEFT JOIN referrals r ON r.referrer_id = rc.user_id
LEFT JOIN promo_codes pc ON pc.user_id = rc.user_id
GROUP BY rc.user_id, rc.balance_euros, rc.balance_percentage, rc.last_updated;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_referral_credits_user ON public.referral_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_user ON public.promo_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code) WHERE used = false;