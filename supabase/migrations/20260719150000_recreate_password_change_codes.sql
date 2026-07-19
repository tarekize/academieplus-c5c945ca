-- Recrée password_change_codes (supprimée dans 20260719140000, puis le
-- flux custom est finalement rétabli à la demande de l'exploitant : le
-- mécanisme natif Supabase reauthenticate()/nonce n'impose pas réellement
-- la vérification pour une session récente, confirmé en test — n'importe
-- quel code était accepté).
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
