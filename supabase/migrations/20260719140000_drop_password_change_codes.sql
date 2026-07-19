-- Revert de 20260719130000_password_change_codes.sql : le flux de
-- vérification par code (Resend) est abandonné au profit du mécanisme
-- natif Supabase (auth.reauthenticate() + nonce), à la demande explicite
-- de l'exploitant — l'envoi via Resend nécessitait une clé API valide et
-- un domaine vérifié, non disponibles immédiatement.
DROP TABLE IF EXISTS public.password_change_codes;
