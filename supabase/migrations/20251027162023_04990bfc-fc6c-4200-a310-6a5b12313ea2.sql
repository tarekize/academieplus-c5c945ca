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
        url:='https://jrgjvjnhdliymljelhgd.supabase.co/functions/v1/gdpr-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2p2am5oZGxpeW1samVsaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTA2NjYsImV4cCI6MjA3NTU4NjY2Nn0.gqxAPzrF4mMuGGMS0xSxq69GeNQ8FbWQBxKVE6ARg7Q"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);