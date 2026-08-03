-- CRITIQUE (C3) : contrairement à chapters/lessons/exams, chapter_exercises
-- et chapter_quizzes n'avaient AUCUN trigger de verrouillage sur leur colonne
-- status : un pédago pouvait valider directement son propre contenu (ou
-- celui d'un collègue) via un simple .update({status:'approved'}), en
-- contournant entièrement submit_chapter_item_for_review / approve_chapter_item.
-- On applique ici le même pattern "verrou + bypass" déjà en place ailleurs.

CREATE OR REPLACE FUNCTION public.guard_chapter_exercise_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     AND current_setting('app.bypass_exercise_status_lock', true) IS DISTINCT FROM 'on' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_by_name IS DISTINCT FROM OLD.reviewed_by_name
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
       OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
       OR NEW.submitted_by_name IS DISTINCT FROM OLD.submitted_by_name
       OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de validation d''un exercice.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.guard_chapter_quiz_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     AND current_setting('app.bypass_quiz_status_lock', true) IS DISTINCT FROM 'on' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_by_name IS DISTINCT FROM OLD.reviewed_by_name
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
       OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
       OR NEW.submitted_by_name IS DISTINCT FROM OLD.submitted_by_name
       OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de validation d''un quiz.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_guard_chapter_exercise_update ON public.chapter_exercises;
CREATE TRIGGER trg_guard_chapter_exercise_update
  BEFORE UPDATE ON public.chapter_exercises
  FOR EACH ROW EXECUTE FUNCTION public.guard_chapter_exercise_update();

DROP TRIGGER IF EXISTS trg_guard_chapter_quiz_update ON public.chapter_quizzes;
CREATE TRIGGER trg_guard_chapter_quiz_update
  BEFORE UPDATE ON public.chapter_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.guard_chapter_quiz_update();

-- submit_chapter_item_for_review doit désormais lever le verrou pour ses
-- propres écritures (pédago non-admin faisant passer un item en 'pending').
CREATE OR REPLACE FUNCTION public.submit_chapter_item_for_review(p_item_type text, p_item_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz', 'chapter', 'lesson_creation') THEN
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
    WHERE id = p_item_id AND status IN ('draft', 'rejected');
  ELSIF p_item_type = 'quiz' THEN
    PERFORM set_config('app.bypass_quiz_status_lock', 'on', true);
    UPDATE public.chapter_quizzes
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status IN ('draft', 'rejected');
  ELSIF p_item_type = 'chapter' THEN
    PERFORM set_config('app.bypass_chapter_status_lock', 'on', true);
    UPDATE public.chapters
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status = 'rejected';
  ELSE
    PERFORM set_config('app.bypass_lesson_status_lock', 'on', true);
    UPDATE public.lessons
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status = 'rejected';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà envoyé.';
  END IF;
END;
$function$;
