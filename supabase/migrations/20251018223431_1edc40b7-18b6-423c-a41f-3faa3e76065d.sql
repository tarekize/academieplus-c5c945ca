-- Créer la table des codes prépayés
CREATE TABLE public.prepaid_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  is_family_plan BOOLEAN NOT NULL DEFAULT false,
  used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.prepaid_codes ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage prepaid codes"
ON public.prepaid_codes
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Les utilisateurs peuvent voir les codes non utilisés pour validation
CREATE POLICY "Users can view unused codes by code"
ON public.prepaid_codes
FOR SELECT
TO authenticated
USING (used = false);

-- Les utilisateurs peuvent voir leurs codes utilisés
CREATE POLICY "Users can view their used codes"
ON public.prepaid_codes
FOR SELECT
TO authenticated
USING (used_by = auth.uid());

-- Fonction pour générer un code prépayé unique
CREATE OR REPLACE FUNCTION public.generate_prepaid_code()
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
    -- Générer un code de 12 caractères (format: XXXX-XXXX-XXXX)
    new_code := upper(
      substring(md5(random()::text || clock_timestamp()::text) from 1 for 4) || '-' ||
      substring(md5(random()::text || clock_timestamp()::text) from 1 for 4) || '-' ||
      substring(md5(random()::text || clock_timestamp()::text) from 1 for 4)
    );
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.prepaid_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour activer un code prépayé
CREATE OR REPLACE FUNCTION public.activate_prepaid_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  subscription_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prepaid RECORD;
  v_subscription_id UUID;
  v_is_already_active BOOLEAN;
BEGIN
  -- Vérifier si le compte est déjà actif
  SELECT account_active INTO v_is_already_active
  FROM profiles
  WHERE id = p_user_id;
  
  -- Récupérer les infos du code prépayé
  SELECT * INTO v_prepaid
  FROM prepaid_codes
  WHERE code = p_code
  AND used = false
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Code invalide, déjà utilisé ou expiré'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Créer l'abonnement
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    is_family_plan,
    status,
    start_date
  ) VALUES (
    p_user_id,
    v_prepaid.plan_id,
    v_prepaid.is_family_plan,
    'active',
    NOW()
  ) RETURNING id INTO v_subscription_id;
  
  -- Créer le paiement initial (montant 0 car prépayé)
  INSERT INTO subscription_payments (
    subscription_id,
    amount_paid,
    payment_date,
    period_start_date,
    period_end_date,
    payment_method,
    status,
    notes
  )
  SELECT
    v_subscription_id,
    0,
    NOW(),
    NOW(),
    calculate_period_end_date(NOW(), v_prepaid.plan_id),
    'prepaid_code',
    'paid',
    'Activé avec code prépayé: ' || p_code
  FROM subscription_plans
  WHERE id = v_prepaid.plan_id;
  
  -- Activer le compte
  UPDATE profiles
  SET account_active = true
  WHERE id = p_user_id;
  
  -- Marquer le code comme utilisé
  UPDATE prepaid_codes
  SET 
    used = true,
    used_by = p_user_id,
    used_at = NOW()
  WHERE code = p_code;
  
  RETURN QUERY SELECT true, 'Compte activé avec succès!'::TEXT, v_subscription_id;
END;
$$;