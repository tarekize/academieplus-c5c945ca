-- Historique des validations de l'admin connecté : chapitres, créations de
-- leçons, versions de contenu de leçon, exercices et quiz déjà traités
-- (approuvés ou refusés) par CET admin, du plus récent au plus ancien.
-- Consommé par un bouton "Historique" sur la page /admin/validation.
CREATE OR REPLACE FUNCTION public.admin_content_review_history()
RETURNS TABLE (
  id uuid,
  item_type text,
  title text,
  chapter_id uuid,
  chapter_title text,
  subject text,
  school_level public.school_level,
  filiere_id uuid,
  filiere_code text,
  filiere_name text,
  lesson_id uuid,
  lesson_title text,
  status text,
  rejection_reason text,
  submitted_by_name text,
  reviewed_by_name text,
  reviewed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ce.id, 'exercise'::text, ce.title,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    ce.status, ce.rejection_reason, ce.submitted_by_name, ce.reviewed_by_name, ce.reviewed_at
  FROM public.chapter_exercises ce
  JOIN public.chapters ch ON ch.id = ce.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = ce.lesson_id
  WHERE ce.status IN ('approved', 'rejected') AND ce.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    cq.id, 'quiz'::text, cq.question,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    cq.status, cq.rejection_reason, cq.submitted_by_name, cq.reviewed_by_name, cq.reviewed_at
  FROM public.chapter_quizzes cq
  JOIN public.chapters ch ON ch.id = cq.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = cq.lesson_id
  WHERE cq.status IN ('approved', 'rejected') AND cq.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    lv.id, 'lesson'::text, COALESCE(l.title_ar, l.title),
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    lv.status, lv.rejection_reason, lv.created_by_name, lv.reviewed_by_name, lv.reviewed_at
  FROM public.lesson_versions lv
  JOIN public.lessons l ON l.id = lv.lesson_id
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE lv.status IN ('approved', 'rejected') AND lv.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    ch.id, 'chapter'::text, COALESCE(ch.title_ar, ch.title),
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    ch.status, ch.rejection_reason, ch.submitted_by_name, ch.reviewed_by_name, ch.reviewed_at
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.status IN ('approved', 'rejected') AND ch.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_creation'::text, COALESCE(l.title_ar, l.title),
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.status, l.rejection_reason, l.submitted_by_name, l.reviewed_by_name, l.reviewed_at
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.status IN ('approved', 'rejected') AND l.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY reviewed_at DESC NULLS LAST
  LIMIT 300;
$$;

REVOKE ALL ON FUNCTION public.admin_content_review_history() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_content_review_history() TO authenticated;

NOTIFY pgrst, 'reload schema';
