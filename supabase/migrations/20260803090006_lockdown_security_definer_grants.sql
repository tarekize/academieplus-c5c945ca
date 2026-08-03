-- MOYEN/MAJEUR : principe du moindre privilège sur les fonctions
-- SECURITY DEFINER. Toutes ont un search_path fixé (bon point déjà en
-- place), mais 51 sont exécutables par le rôle anon par défaut (Postgres
-- accorde EXECUTE à PUBLIC à la création). On révoque explicitement pour
-- les fonctions qui n'ont aucune raison d'être appelées anonymement ou par
-- un client PostgREST direct.

REVOKE ALL ON FUNCTION public.profile_display_name(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_and_log_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_establishment_name_by_code(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_expired_contracts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_establishment_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_activation_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_get_last_sign_in_times() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_list_notification_candidates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_pending_content_items() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_content_review_history() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_last_sign_in_times() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_notification_candidates() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_pending_content_items() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_content_review_history() TO authenticated;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- join_establishment_by_code est appelée par le frontend authentifié
-- (EstablishmentManager.tsx) : on garde authenticated, on ferme anon, et on
-- ajoute la vérification de rôle manquante (jusqu'ici un élève ou parent
-- pouvait aussi se rattacher à un établissement comme "enseignant").
REVOKE ALL ON FUNCTION public.join_establishment_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_establishment_by_code(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_establishment_by_code(p_code text)
 RETURNS TABLE(establishment_id uuid, establishment_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_id uuid;
  v_name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'teacher'::public.app_role) THEN
    RAISE EXCEPTION 'Seul un enseignant peut rejoindre un établissement.';
  END IF;

  SELECT id, first_name INTO v_id, v_name
  FROM public.profiles
  WHERE establishment_code = upper(trim(p_code))
  LIMIT 1;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Code d''établissement invalide.';
  END IF;

  INSERT INTO public.teacher_establishments (teacher_id, establishment_id)
  VALUES (auth.uid(), v_id)
  ON CONFLICT (teacher_id, establishment_id) DO NOTHING;

  RETURN QUERY SELECT v_id, v_name;
END;
$function$;
