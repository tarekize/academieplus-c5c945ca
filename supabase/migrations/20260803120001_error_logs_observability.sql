-- MAJEUR (observabilité) : aucun mécanisme ne permettait de détecter qu'une
-- erreur se produisait — c'est ce qui a permis aux deux tâches cron
-- (gdpr-cleanup, scheduled-parent-reports) d'échouer silencieusement
-- pendant des mois avant cet audit. Sans compte Sentry/Datadog disponible,
-- on ajoute une table de logs d'erreurs minimaliste : le client (ErrorBoundary
-- + window.onerror/onunhandledrejection) et les fonctions cron y écrivent,
-- un admin peut consulter.

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  context text NOT NULL,
  message text NOT NULL,
  stack text,
  url text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log an error"
  ON public.error_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view error logs"
  ON public.error_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_context ON public.error_logs(context);
