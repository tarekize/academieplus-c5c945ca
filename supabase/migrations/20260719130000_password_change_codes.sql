-- Vérification obligatoire par email avant changement de mot de passe.
-- Ne s'appuie PAS sur supabase.auth.reauthenticate()/nonce : ce mécanisme
-- natif exempte les sessions "récentes" (<24h) même avec "Secure password
-- change" activé côté dashboard, ce qui le rend impossible à rendre
-- inconditionnel. Cette table est gérée exclusivement par les edge
-- functions request-password-change / confirm-password-change via
-- service_role — aucun accès direct depuis le client (RLS sans policy =
-- deny par défaut pour anon/authenticated).
-- Le nouveau mot de passe lui-même n'est jamais stocké ici : le client le
-- renvoie directement à l'étape de confirmation (il est déjà dans son état
-- React depuis l'étape précédente), seul le code de vérification transite
-- par cette table, sous forme hachée.
CREATE TABLE public.password_change_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_change_codes_user_id ON public.password_change_codes(user_id);

GRANT ALL ON public.password_change_codes TO service_role;

ALTER TABLE public.password_change_codes ENABLE ROW LEVEL SECURITY;
