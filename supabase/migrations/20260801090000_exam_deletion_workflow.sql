-- Suppression d'examens : un admin supprime toujours immédiatement. Un
-- pédago qui supprime un examen jamais publié (statut 'draft', 'pending' ou
-- 'rejected', donc déjà invisible des élèves) supprime aussi immédiatement.
-- Un pédago qui supprime un examen publié ('approved') n'efface rien tout
-- de suite : la ligne reste intacte et visible des élèves, marquée
-- deletion_requested = true avec un motif obligatoire, en attente de
-- décision admin — même mécanique que pour chapitres/leçons
-- (20260730120000_chapter_lesson_deletion_validation.sql).

ALTER TABLE public.exams
  ADD COLUMN deletion_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN deletion_requested_by uuid REFERENCES public.profiles(id),
  ADD COLUMN deletion_requested_by_name text,
  ADD COLUMN deletion_requested_at timestamptz,
  ADD COLUMN deletion_reason text;

CREATE INDEX idx_exams_deletion_requested ON public.exams (deletion_requested) WHERE deletion_requested;

-- Étend le garde-fou existant : ces colonnes ne sont modifiables que via les
-- RPC de confiance ci-dessous (même drapeau de transaction
-- app.bypass_exam_lock que pour le reste du workflow de validation).
CREATE OR REPLACE FUNCTION public.guard_exam_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR current_setting('app.bypass_exam_lock', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.version_number IS DISTINCT FROM OLD.version_number
     OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
     OR NEW.submitted_by_name IS DISTINCT FROM OLD.submitted_by_name
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.reviewed_by_name IS DISTINCT FROM OLD.reviewed_by_name
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
     OR NEW.deletion_requested IS DISTINCT FROM OLD.deletion_requested
     OR NEW.deletion_requested_by IS DISTINCT FROM OLD.deletion_requested_by
     OR NEW.deletion_requested_by_name IS DISTINCT FROM OLD.deletion_requested_by_name
     OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at
     OR NEW.deletion_reason IS DISTINCT FROM OLD.deletion_reason THEN
    RAISE EXCEPTION 'Ce champ ne peut être modifié que via le workflow de validation.';
  END IF;

  IF OLD.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'Un examen soumis ou validé ne peut pas être modifié directement.';
  END IF;

  RETURN NEW;
END;
$$;

-- Demande de suppression d'un examen. Retourne true si la ligne a été
-- supprimée immédiatement, false si une demande a été enregistrée en
-- attente de décision admin (motif alors obligatoire).
CREATE OR REPLACE FUNCTION public.request_exam_deletion(p_exam_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
  v_is_admin boolean;
  v_status text;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  v_is_admin := public.has_role(auth.uid(), 'admin'::public.app_role);
  v_name := public.profile_display_name(auth.uid());

  SELECT status INTO v_status FROM public.exams WHERE id = p_exam_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Examen introuvable.';
  END IF;

  IF v_is_admin OR v_status <> 'approved' THEN
    DELETE FROM public.exams WHERE id = p_exam_id;
    RETURN true;
  END IF;

  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Merci de préciser un motif de suppression.';
  END IF;

  PERFORM set_config('app.bypass_exam_lock', 'on', true);
  UPDATE public.exams
  SET deletion_requested = true, deletion_requested_by = auth.uid(), deletion_requested_by_name = v_name, deletion_requested_at = now(), deletion_reason = p_reason
  WHERE id = p_exam_id AND deletion_requested = false;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Une demande de suppression est déjà en attente pour cet examen.';
  END IF;
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.request_exam_deletion(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_exam_deletion(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_exam_deletion(p_exam_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;
  DELETE FROM public.exams WHERE id = p_exam_id AND deletion_requested = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucune demande de suppression en attente pour cet examen.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_exam_deletion(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_exam_deletion(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_exam_deletion(p_exam_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;
  PERFORM set_config('app.bypass_exam_lock', 'on', true);
  UPDATE public.exams
  SET deletion_requested = false, deletion_requested_by = NULL, deletion_requested_by_name = NULL, deletion_requested_at = NULL, deletion_reason = NULL
  WHERE id = p_exam_id AND deletion_requested = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucune demande de suppression en attente pour cet examen.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_exam_deletion(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_exam_deletion(uuid) TO authenticated;

-- File d'attente admin : ajoute le type 'exam_deletion'.
DROP FUNCTION IF EXISTS public.admin_pending_content_items();

CREATE OR REPLACE FUNCTION public.admin_pending_content_items()
RETURNS TABLE (
  id uuid,
  item_type text,
  title text,
  difficulty integer,
  chapter_id uuid,
  chapter_title text,
  subject text,
  school_level public.school_level,
  filiere_id uuid,
  filiere_code text,
  filiere_name text,
  lesson_id uuid,
  lesson_title text,
  submitted_by_name text,
  submitted_at timestamptz,
  deletion_reason text,
  trimester integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ce.id, 'exercise'::text, ce.title, ce.difficulty,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    ce.submitted_by_name, ce.submitted_at, NULL::text, NULL::integer
  FROM public.chapter_exercises ce
  JOIN public.chapters ch ON ch.id = ce.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = ce.lesson_id
  WHERE ce.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    cq.id, 'quiz'::text, cq.question, cq.difficulty,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    cq.submitted_by_name, cq.submitted_at, NULL::text, NULL::integer
  FROM public.chapter_quizzes cq
  JOIN public.chapters ch ON ch.id = cq.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = cq.lesson_id
  WHERE cq.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    lv.id, 'lesson'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    lv.created_by_name, lv.created_at, NULL::text, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lesson_versions lv ON lv.id = l.pending_version_id
  WHERE l.pending_version_id IS NOT NULL AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    ch.id, 'chapter'::text, COALESCE(ch.title_ar, ch.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    ch.submitted_by_name, ch.submitted_at, NULL::text, NULL::integer
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_creation'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.submitted_by_name, l.submitted_at, NULL::text, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    ch.id, 'chapter_deletion'::text, COALESCE(ch.title_ar, ch.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    ch.deletion_requested_by_name, ch.deletion_requested_at, ch.deletion_reason, NULL::integer
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_deletion'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.deletion_requested_by_name, l.deletion_requested_at, l.deletion_reason, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    e.id, 'exam'::text, e.title, NULL::integer,
    NULL::uuid, NULL::text, e.subject, e.school_level,
    e.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    e.submitted_by_name, e.submitted_at, NULL::text, e.trimester
  FROM public.exams e
  LEFT JOIN public.filieres f ON f.id = e.filiere_id
  WHERE e.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    e.id, 'exam_deletion'::text, e.title, NULL::integer,
    NULL::uuid, NULL::text, e.subject, e.school_level,
    e.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    e.deletion_requested_by_name, e.deletion_requested_at, e.deletion_reason, e.trimester
  FROM public.exams e
  LEFT JOIN public.filieres f ON f.id = e.filiere_id
  WHERE e.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_pending_content_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_pending_content_items() TO authenticated;

NOTIFY pgrst, 'reload schema';
