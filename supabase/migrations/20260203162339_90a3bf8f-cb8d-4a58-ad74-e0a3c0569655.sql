-- Add filiere column to profiles table for storing student specialty/track
ALTER TABLE public.profiles 
ADD COLUMN filiere TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.filiere IS 'Student specialty/track (e.g., tronc_commun_scientifique, sciences, lettres)';