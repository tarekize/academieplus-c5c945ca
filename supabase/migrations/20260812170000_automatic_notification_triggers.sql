-- Demande utilisateur du 12/08 (page Contrat/Élèves + page Notifications) :
--
-- 1) "L'ajout de jours doit automatiquement mettre à jour la date" —
--    profiles.subscription_end_date (utilisée pour classer un profil
--    'expiring_soon'/'expired' dans admin_list_notification_candidates et
--    dans le contenu de l'email de rappel) n'était JAMAIS écrite par aucun
--    code applicatif : ni admin_grant_subscription_days, ni aucun autre flux
--    touchant student_subscriptions. Elle restait donc NULL pour tout élève
--    n'ayant jamais eu cette colonne renseignée manuellement, ce qui cassait
--    silencieusement le statut "contrat" affiché et rendait tout rappel basé
--    sur la date d'expiration impossible à cibler correctement.
--    Corrigé par un trigger sur student_subscriptions qui recalcule
--    systématiquement profiles.subscription_end_date à chaque changement
--    (ajout de jours, pause, reprise, création), plus un backfill unique des
--    lignes déjà existantes.
--
-- 2) "Le bouton Rappel ne sert à rien : l'envoi doit être programmé
--    automatiquement via le planificateur de notifications" — ajoute un
--    type de modèle ('manual'/'automatic') sur email_templates : un modèle
--    automatique définit une condition (rôles ciblés, statut de profil,
--    nombre de jours avant expiration) évaluée quotidiennement par
--    process-automatic-notifications (pg_cron), qui envoie l'email et
--    journalise l'envoi dans automatic_notification_log pour ne jamais
--    relancer le même rappel deux fois pour la même échéance (mais permettre
--    un nouveau rappel si l'échéance a été repoussée par un renouvellement).

-- ----------------------------------------------------------------------------
-- 1. Synchronisation automatique de profiles.subscription_end_date
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_subscription_end_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_remaining numeric;
  v_base_date date;
BEGIN
  v_remaining := COALESCE(NEW.total_days, 0) - COALESCE(NEW.days_used, 0);
  -- En pause : le compteur est figé, la date de référence est aujourd'hui
  -- (combien de jours resteraient si l'abonnement reprenait maintenant).
  -- Actif : la date de référence est le dernier "tick" (déjà remis à `now()`
  -- par admin_grant_subscription_days et les autres écritures), donc
  -- v_base_date + v_remaining donne directement la vraie date de fin —
  -- pas besoin de recalculer à chaque lecture, contrairement à
  -- computeSubStatus() côté frontend qui, lui, doit afficher un compte à
  -- rebours qui avance en direct entre deux écritures.
  IF NEW.is_paused THEN
    v_base_date := CURRENT_DATE;
  ELSE
    v_base_date := COALESCE(NEW.last_tick_at, now())::date;
  END IF;

  UPDATE public.profiles
  SET subscription_end_date = v_base_date + GREATEST(0, ROUND(v_remaining))::int
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_subscription_end_date ON public.student_subscriptions;
CREATE TRIGGER trg_sync_subscription_end_date
AFTER INSERT OR UPDATE ON public.student_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_subscription_end_date();

-- Backfill : même formule, appliquée une fois à l'abonnement le plus récent
-- de chaque élève déjà existant, pour ne pas rester à NULL jusqu'à leur
-- prochain changement d'abonnement.
UPDATE public.profiles p
SET subscription_end_date = sub.end_date
FROM (
  SELECT DISTINCT ON (user_id)
    user_id,
    (CASE WHEN is_paused THEN CURRENT_DATE ELSE COALESCE(last_tick_at, now())::date END
      + GREATEST(0, ROUND(COALESCE(total_days, 0) - COALESCE(days_used, 0)))::int) AS end_date
  FROM public.student_subscriptions
  ORDER BY user_id, created_at DESC
) sub
WHERE p.id = sub.user_id;

-- ----------------------------------------------------------------------------
-- 2. Modèles automatiques : colonnes de condition sur email_templates
-- ----------------------------------------------------------------------------

ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS trigger_roles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trigger_days_before integer,
  ADD COLUMN IF NOT EXISTS trigger_profile_status text NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS trigger_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.email_templates
  DROP CONSTRAINT IF EXISTS email_templates_trigger_type_check;
ALTER TABLE public.email_templates
  ADD CONSTRAINT email_templates_trigger_type_check CHECK (trigger_type IN ('manual', 'automatic'));

ALTER TABLE public.email_templates
  DROP CONSTRAINT IF EXISTS email_templates_trigger_profile_status_check;
ALTER TABLE public.email_templates
  ADD CONSTRAINT email_templates_trigger_profile_status_check CHECK (trigger_profile_status IN ('any', 'active', 'inactive'));

ALTER TABLE public.email_templates
  DROP CONSTRAINT IF EXISTS email_templates_trigger_days_before_check;
ALTER TABLE public.email_templates
  ADD CONSTRAINT email_templates_trigger_days_before_check
  CHECK (trigger_type = 'manual' OR (trigger_days_before IS NOT NULL AND trigger_days_before >= 0));

COMMENT ON COLUMN public.email_templates.trigger_type IS
  'manual = envoyé à la main depuis l''onglet Envoyer. automatic = envoyé automatiquement par process-automatic-notifications quand la condition (rôles/statut/jours avant expiration) est remplie.';
COMMENT ON COLUMN public.email_templates.trigger_days_before IS
  'Nombre de jours avant la date d''expiration (contrat établissement ou abonnement) à partir duquel ce modèle automatique doit être envoyé.';
COMMENT ON COLUMN public.email_templates.trigger_roles IS
  'Rôles ciblés par ce modèle automatique. Tableau vide = tous les rôles éligibles (student, teacher, pedago, etablissement, parent).';
COMMENT ON COLUMN public.email_templates.trigger_profile_status IS
  'any = peu importe profiles.is_active. active = compte actif uniquement. inactive = compte désactivé uniquement.';

-- ----------------------------------------------------------------------------
-- 3. Journal des envois automatiques (déduplication par échéance)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.automatic_notification_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Date d'expiration au moment de l'envoi : la contrainte d'unicité porte
  -- dessus (et non sur une simple paire template/utilisateur) pour qu'un
  -- renouvellement qui repousse l'échéance rende le rappel de nouveau
  -- envoyable, sans jamais renvoyer deux fois le même rappel pour la même
  -- échéance non renouvelée.
  expiry_date_snapshot date NOT NULL,
  success boolean NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, target_user_id, expiry_date_snapshot)
);

CREATE INDEX IF NOT EXISTS idx_automatic_notification_log_created_at
  ON public.automatic_notification_log (created_at DESC);

ALTER TABLE public.automatic_notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view automatic notification log" ON public.automatic_notification_log;
CREATE POLICY "Admins can view automatic notification log"
ON public.automatic_notification_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Aucune policy INSERT/UPDATE/DELETE pour authenticated/anon : seule l'edge
-- function process-automatic-notifications (service_role, contourne RLS)
-- écrit dans cette table, même principe que email_campaigns.
REVOKE ALL ON public.automatic_notification_log FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.automatic_notification_log TO authenticated;
GRANT ALL ON public.automatic_notification_log TO service_role;

-- ----------------------------------------------------------------------------
-- 4. Planification quotidienne (même mécanisme que gdpr-cleanup /
--    scheduled-parent-reports : secret partagé lu depuis Vault, jamais
--    stocké en clair dans la définition du job cron).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trigger_process_automatic_notifications()
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
    url := 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/process-automatic-notifications',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := '{}'::jsonb
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.trigger_process_automatic_notifications() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule(
  'process-automatic-notifications-daily',
  '0 7 * * *',
  $cron$ SELECT public.trigger_process_automatic_notifications(); $cron$
);
