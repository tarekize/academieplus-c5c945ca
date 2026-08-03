-- Complète le workflow de consentement parental (20260803090009) : jusqu'ici
-- une ligne parental_consents était créée à l'inscription mais aucun email
-- n'était jamais envoyé au parent, donc le consentement ne pouvait jamais être
-- vérifié. Ce trigger appelle l'Edge Function send-parental-consent-email
-- (protégée par le secret CRON_SECRET partagé, cf. 20260803090005) dès qu'une
-- ligne parental_consents est insérée.

CREATE OR REPLACE FUNCTION public.trigger_send_parental_consent_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'app_cron_secret';
  PERFORM net.http_post(
    url := 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/send-parental-consent-email',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := jsonb_build_object('consent_id', NEW.id)
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_send_parental_consent_email ON public.parental_consents;
CREATE TRIGGER trg_send_parental_consent_email
  AFTER INSERT ON public.parental_consents
  FOR EACH ROW EXECUTE FUNCTION public.trigger_send_parental_consent_email();
