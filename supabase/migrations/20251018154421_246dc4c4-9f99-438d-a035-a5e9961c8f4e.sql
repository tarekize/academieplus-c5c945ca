-- Supprimer l'ancienne foreign key vers auth.users
ALTER TABLE public.referral_codes
DROP CONSTRAINT IF EXISTS referral_codes_user_id_fkey;

-- Ajouter une nouvelle foreign key vers profiles
ALTER TABLE public.referral_codes
ADD CONSTRAINT referral_codes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;