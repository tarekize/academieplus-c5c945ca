-- SÉCURITÉ — les limiteurs de débit (quota IA payant dans lovable-chat /
-- generate-editorial-assistant, et anti-brute-force du code de liaison dans
-- link-child-by-code) faisaient tous un "compte les tentatives récentes, PUIS
-- insère la nouvelle tentative" en deux requêtes séparées et non atomiques.
-- Plusieurs requêtes concurrentes du même compte pouvaient toutes lire le
-- même compte AVANT qu'aucune n'ait inséré sa ligne, et donc toutes passer le
-- contrôle : une rafale de N requêtes en parallèle suffisait à dépasser
-- n'importe quel quota configuré.
--
-- Ce RPC verrouille (pg_advisory_xact_lock, par utilisateur+action) le compte
-- ET l'insertion dans une seule transaction : les appels concurrents pour le
-- même (user_id, action) sont sérialisés, ce qui élimine la fenêtre de course.
CREATE OR REPLACE FUNCTION public.check_and_log_rate_limit(
  p_user_id uuid,
  p_action text,
  p_window_seconds integer,
  p_max_requests integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_action, 0));

  SELECT count(*) INTO v_count
  FROM public.activity_logs
  WHERE user_id = p_user_id
    AND action = p_action
    AND created_at >= now() - (p_window_seconds || ' seconds')::interval;

  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;

  INSERT INTO public.activity_logs (user_id, action) VALUES (p_user_id, p_action);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_log_rate_limit(uuid, text, integer, integer) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
