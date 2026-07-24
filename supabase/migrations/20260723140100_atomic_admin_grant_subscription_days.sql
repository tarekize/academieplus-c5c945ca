-- SÉCURITÉ / INTÉGRITÉ — AdminContrats.tsx (handleAddDays) accordait des
-- jours d'abonnement via un "lit total_days, calcule côté client, réécrit"
-- non atomique : deux actions admin rapprochées (double-clic, deux onglets)
-- peuvent lire la même valeur avant qu'aucune n'ait écrit, et la seconde
-- écrasE silencieusement la première (un élève qui devait recevoir
-- 30+15=45 jours n'en reçoit que 15). Le même flux réinitialisait aussi
-- last_tick_at sans d'abord créditer le temps déjà écoulé depuis le dernier
-- last_tick_at dans days_used — un abonnement actif depuis 10 jours non
-- encore "banked" perdait ces 10 jours au profit de l'élève (au lieu d'être
-- comptés), gonflant silencieusement le temps restant.
--
-- Remplace ce flux par un RPC atomique (verrou de ligne FOR UPDATE) qui lit,
-- crédite le temps écoulé, incrémente et réécrit en une seule transaction —
-- même pattern que check_and_log_rate_limit (20260723120200) et
-- increment_chat_usage (20260713120000).
CREATE OR REPLACE FUNCTION public.admin_grant_subscription_days(p_user_id uuid, p_days integer)
RETURNS public.student_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.student_subscriptions;
  v_existing_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin') THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;
  IF p_days IS NULL OR p_days <= 0 THEN
    RAISE EXCEPTION 'Nombre de jours invalide.';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.student_subscriptions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.student_subscriptions (user_id, plan_type, total_days, days_used, is_paused, started_at, last_tick_at)
    VALUES (p_user_id, 'admin_grant', p_days, 0, false, now(), now())
    RETURNING * INTO v_row;
    RETURN v_row;
  END IF;

  UPDATE public.student_subscriptions
  SET
    days_used = CASE
      WHEN NOT is_paused AND last_tick_at IS NOT NULL
        THEN days_used + EXTRACT(EPOCH FROM (now() - last_tick_at)) / 86400.0
      ELSE days_used
    END,
    total_days = total_days + p_days,
    is_paused = false,
    paused_at = NULL,
    last_tick_at = now()
  WHERE id = v_existing_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_subscription_days(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_subscription_days(uuid, integer) TO authenticated;
