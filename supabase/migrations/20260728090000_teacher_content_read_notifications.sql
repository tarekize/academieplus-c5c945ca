-- Point rouge élève : quand un enseignant envoie un exercice/quiz/examen, l'élève
-- doit voir une notification en cascade (matière → chapitre → leçon → "Ma classe",
-- ou matière → chapitre → examen pour un examen) jusqu'à ce qu'il consulte ce
-- contenu. Rien de tout ça n'existait : ni le suivi "vu par l'élève", ni la
-- matière stockée sur teacher_content (nécessaire pour badge la carte de matière
-- sans jointure vers chapters).

ALTER TABLE public.teacher_content ADD COLUMN IF NOT EXISTS subject text;

CREATE TABLE public.teacher_content_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL REFERENCES public.teacher_content(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_id, student_id)
);
GRANT SELECT, INSERT, UPDATE ON public.teacher_content_reads TO authenticated;
GRANT ALL ON public.teacher_content_reads TO service_role;
ALTER TABLE public.teacher_content_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own reads"
  ON public.teacher_content_reads FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers view reads on their content"
  ON public.teacher_content_reads FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teacher_content tc
    WHERE tc.id = teacher_content_reads.content_id AND tc.teacher_id = auth.uid()
  ));

CREATE INDEX idx_tcr_student ON public.teacher_content_reads(student_id);
CREATE INDEX idx_tcr_content ON public.teacher_content_reads(content_id);

-- Contenu enseignant non lu par l'élève courant, avec assez de contexte
-- (matière/chapitre/leçon) pour poser le point rouge à chaque niveau de la
-- navigation, sans dupliquer côté client la logique d'assignation (classe vs
-- élève direct) déjà encodée dans les policies RLS de teacher_content_assignments.
CREATE OR REPLACE FUNCTION public.student_unread_teacher_content()
RETURNS TABLE(
  content_id uuid,
  content_type text,
  subject text,
  chapter_id uuid,
  lesson_id uuid,
  school_level public.school_level
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT DISTINCT tc.id, tc.content_type, tc.subject, tc.chapter_id, tc.lesson_id, tc.school_level
  FROM public.teacher_content tc
  JOIN public.teacher_content_assignments a ON a.content_id = tc.id
  WHERE (
    a.student_id = auth.uid()
    OR a.class_id IN (SELECT cs.class_id FROM public.class_students cs WHERE cs.student_id = auth.uid())
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.teacher_content_reads r
    WHERE r.content_id = tc.id AND r.student_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.student_unread_teacher_content() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_unread_teacher_content() TO authenticated;

NOTIFY pgrst, 'reload schema';
