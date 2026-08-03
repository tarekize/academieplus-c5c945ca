-- MAJEUR : le secret x-cron-secret était stocké en clair dans
-- cron.job.command (lisible par quiconque a un accès SQL), et le job
-- "daily-parent-reports" n'envoyait carrément aucun header x-cron-secret
-- (401 systématique, rapports parents jamais envoyés). On stocke désormais
-- un secret unique dans Supabase Vault (chiffré at-rest) et on fait passer
-- les deux jobs par des fonctions wrapper qui le lisent au moment de l'appel
-- au lieu de l'écrire en clair dans la définition du job.
--
-- IMPORTANT : après application, le secret Edge Function "CRON_SECRET" doit
-- être aligné manuellement (dashboard Supabase ou `supabase secrets set`)
-- sur la valeur stockée dans vault.decrypted_secrets (name='app_cron_secret'),
-- sans quoi les appels cron continueront d'échouer en 401.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'app_cron_secret') THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'app_cron_secret',
      'Secret partage pour authentifier les appels pg_cron vers les Edge Functions cron (gdpr-cleanup, scheduled-parent-reports). Doit correspondre au secret Edge Function CRON_SECRET.'
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.trigger_scheduled_parent_reports()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'app_cron_secret';
  PERFORM net.http_post(
    url := 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/scheduled-parent-reports',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := '{}'::jsonb
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_gdpr_cleanup()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'app_cron_secret';
  PERFORM net.http_post(
    url := 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/gdpr-cleanup',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := '{}'::jsonb
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.trigger_scheduled_parent_reports() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_gdpr_cleanup() FROM PUBLIC, anon, authenticated;

SELECT cron.alter_job(jobid, command => 'SELECT public.trigger_scheduled_parent_reports();')
FROM cron.job WHERE jobname = 'daily-parent-reports';

SELECT cron.alter_job(jobid, command => 'SELECT public.trigger_gdpr_cleanup();')
FROM cron.job WHERE jobname = 'gdpr-cleanup-daily';
