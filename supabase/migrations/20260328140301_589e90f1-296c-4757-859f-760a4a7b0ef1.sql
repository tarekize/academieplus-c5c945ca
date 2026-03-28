-- Fix 1: Remove client-side INSERT policy on payments (payments should only be created server-side)
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;

-- Fix 2: Restrict quiz/exercise table SELECT to admin/pedago only, create views for students

-- Drop broad student SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON public.chapter_quizzes;
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON public.chapter_exercises;

-- Add restricted SELECT policies for admin/pedago only on the raw tables
CREATE POLICY "Only admin/pedago can view quizzes"
ON public.chapter_quizzes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pedago')
);

CREATE POLICY "Only admin/pedago can view exercises"
ON public.chapter_exercises FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pedago')
);

-- Create secure views for students (no sensitive columns)
CREATE OR REPLACE VIEW public.student_chapter_quizzes AS
SELECT id, chapter_id, lesson_id, question, options, difficulty, order_index, created_at, updated_at
FROM public.chapter_quizzes;

CREATE OR REPLACE VIEW public.student_chapter_exercises AS
SELECT id, chapter_id, lesson_id, title, statement, difficulty, order_index, created_at, updated_at
FROM public.chapter_exercises;

-- Grant access to authenticated users on the views
GRANT SELECT ON public.student_chapter_quizzes TO authenticated;
GRANT SELECT ON public.student_chapter_exercises TO authenticated;