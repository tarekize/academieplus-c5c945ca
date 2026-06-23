-- 1. Establishments
CREATE TABLE public.establishments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  ville text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.establishments TO authenticated;
GRANT ALL ON public.establishments TO service_role;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers manage their own establishments"
  ON public.establishments FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE TRIGGER establishments_updated_at
  BEFORE UPDATE ON public.establishments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Link classes to an establishment
ALTER TABLE public.classes
  ADD COLUMN establishment_id uuid REFERENCES public.establishments(id) ON DELETE SET NULL;

-- 3. Teacher content (exercises / quizzes / exams)
CREATE TABLE public.teacher_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('exercise','quiz','exam')),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  school_level public.school_level,
  filiere text,
  title text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  difficulty integer NOT NULL DEFAULT 3,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ai')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_content TO authenticated;
GRANT ALL ON public.teacher_content TO service_role;
ALTER TABLE public.teacher_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers manage their own content"
  ON public.teacher_content FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE TRIGGER teacher_content_updated_at
  BEFORE UPDATE ON public.teacher_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Content assignments (to a class or a single student)
CREATE TABLE public.teacher_content_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL REFERENCES public.teacher_content(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (class_id IS NOT NULL OR student_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_content_assignments TO authenticated;
GRANT ALL ON public.teacher_content_assignments TO service_role;
ALTER TABLE public.teacher_content_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers manage their own assignments"
  ON public.teacher_content_assignments FOR ALL TO authenticated
  USING (auth.uid() = assigned_by) WITH CHECK (auth.uid() = assigned_by);
CREATE POLICY "Students view their assignments"
  ON public.teacher_content_assignments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR class_id IN (SELECT cs.class_id FROM public.class_students cs WHERE cs.student_id = auth.uid())
  );

-- 5. Now add the student SELECT policy on teacher_content (depends on assignments table)
CREATE POLICY "Students view content assigned to them"
  ON public.teacher_content FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teacher_content_assignments a
    WHERE a.content_id = teacher_content.id
      AND (
        a.student_id = auth.uid()
        OR a.class_id IN (SELECT cs.class_id FROM public.class_students cs WHERE cs.student_id = auth.uid())
      )
  ));

CREATE INDEX idx_teacher_content_teacher ON public.teacher_content(teacher_id, content_type, created_at DESC);
CREATE INDEX idx_tca_content ON public.teacher_content_assignments(content_id);
CREATE INDEX idx_tca_student ON public.teacher_content_assignments(student_id);
CREATE INDEX idx_tca_class ON public.teacher_content_assignments(class_id);