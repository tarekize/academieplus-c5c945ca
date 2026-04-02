-- Créer un trigger pour générer automatiquement un code de parrainage pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.create_referral_code_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Générer un code de parrainage pour le nouvel utilisateur
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, public.generate_referral_code());
  
  RETURN NEW;
END;
$$;

-- Activer le trigger sur la table profiles
DROP TRIGGER IF EXISTS create_referral_code_on_signup ON public.profiles;
CREATE TRIGGER create_referral_code_on_signup
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_referral_code_for_new_user();

-- Générer des codes de parrainage pour tous les utilisateurs existants qui n'en ont pas
INSERT INTO public.referral_codes (user_id, code)
SELECT p.id, public.generate_referral_code()
FROM public.profiles p
LEFT JOIN public.referral_codes rc ON rc.user_id = p.id
WHERE rc.id IS NULL;