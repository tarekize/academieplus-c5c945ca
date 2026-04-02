-- Corriger le trigger de création de code de parrainage pour éviter les doublons
CREATE OR REPLACE FUNCTION public.create_referral_code_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Générer un code de parrainage pour le nouvel utilisateur seulement s'il n'en a pas déjà un
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, public.generate_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;