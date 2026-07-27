-- Étend la notification en cascade de l'admin (matière -> niveau -> filière,
-- déjà affichée dans ListeCours.tsx via admin_pending_content_items) au
-- contenu de LEÇON en attente de validation, jusqu'ici seulement visible via
-- les pastilles sur la carte du chapitre et la liste des leçons (Cours.tsx /
-- Cours.AdaptiveLessonContent.tsx), mais pas remontée jusqu'à la matière/le
-- niveau/la filière comme pour les exercices/quiz.
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
  submitted_at timestamptz
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
    ce.submitted_by_name, ce.submitted_at
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
    cq.submitted_by_name, cq.submitted_at
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
    lv.created_by_name, lv.created_at
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lesson_versions lv ON lv.id = l.pending_version_id
  WHERE l.pending_version_id IS NOT NULL AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_pending_content_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_pending_content_items() TO authenticated;

NOTIFY pgrst, 'reload schema';
