
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old schedule if it exists, then create the daily job (08:00 UTC).
DO $$
BEGIN
  PERFORM cron.unschedule('daily-parent-reports');
EXCEPTION WHEN OTHERS THEN
  NULL;
END$$;

SELECT cron.schedule(
  'daily-parent-reports',
  '0 8 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/scheduled-parent-reports',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3RobHhvaXhheWppeXR3d3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQzNjUsImV4cCI6MjA4NzA4MDM2NX0.Z5uiVCL7jrcYIenOhGyFfXbGULHP30j_E9W390NYS3U"}'::jsonb,
    body := '{}'::jsonb
  );
  $cron$
);
