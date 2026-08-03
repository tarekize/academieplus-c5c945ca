CREATE OR REPLACE FUNCTION public.submit_chapter_items_for_review(p_item_type text, p_chapter_id uuid, p_lesson_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_count integer;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  v_name := public.profile_display_name(auth.uid());

  IF p_item_type = 'exercise' THEN
    PERFORM set_config('app.bypass_exercise_status_lock', 'on', true);
    UPDATE public.chapter_exercises
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE chapter_id = p_chapter_id AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id) AND status IN ('draft', 'rejected');
  ELSE
    PERFORM set_config('app.bypass_quiz_status_lock', 'on', true);
    UPDATE public.chapter_quizzes
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE chapter_id = p_chapter_id AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id) AND status IN ('draft', 'rejected');
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;
