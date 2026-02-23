-- Configuration du cron job GDPR quotidien
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Créer le cron job pour exécuter gdpr-cleanup tous les jours à 3h du matin
SELECT cron.schedule(
  'gdpr-cleanup-daily',
  '0 3 * * *', -- Tous les jours à 3h du matin (UTC)
  $$
  SELECT
    net.http_post(
        url:='https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/gdpr-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3RobHhvaXhheWppeXR3d3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQzNjUsImV4cCI6MjA4NzA4MDM2NX0.Z5uiVCL7jrcYIenOhGyFfXbGULHP30j_E9W390NYS3U"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);