-- Supprimer les triggers qui dépendent de la fonction
DROP TRIGGER IF EXISTS on_user_profile_created_referral ON public.profiles;
DROP TRIGGER IF EXISTS create_referral_code_on_signup ON public.profiles;
DROP TRIGGER IF EXISTS on_user_created_generate_referral_code ON auth.users;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS public.create_referral_code_for_new_user();