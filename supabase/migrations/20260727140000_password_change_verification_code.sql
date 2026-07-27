-- Rétablit la vérification par email avant changement de mot de passe,
-- abandonnée deux fois (20260719140000, 20260719160000) faute de solution
-- d'envoi d'email fiable pour joindre n'importe quel utilisateur. Un SMTP
-- personnalisé est maintenant configuré (dashboard Supabase Auth), et les
-- nouvelles edge functions request-password-change / confirm-password-change
-- envoient elles-mêmes le code par SMTP (indépendamment du mailer Auth
-- intégré, qui ne gère que les flux natifs de Supabase).
-- Le nouveau mot de passe n'est jamais stocké ici : il reste côté client
-- entre les deux étapes, seul le code de vérification transite par cette
-- table, sous forme hachée. RLS activé sans policy = deny par défaut pour
-- anon/authenticated ; seules les edge functions (service_role) y accèdent.
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
