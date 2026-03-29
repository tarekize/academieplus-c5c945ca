
-- RPC function for students to fetch quizzes (without correct_answer and explanation)
CREATE OR REPLACE FUNCTION public.get_student_quizzes(
  _chapter_id uuid,
  _lesson_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  chapter_id uuid,
  lesson_id uuid,
  question text,
  options jsonb,
  difficulty integer,
  order_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    cq.id,
    cq.chapter_id,
    cq.lesson_id,
    cq.question,
    cq.options,
    cq.difficulty,
    cq.order_index
  FROM public.chapter_quizzes cq
  WHERE cq.chapter_id = _chapter_id
    AND (_lesson_id IS NULL OR cq.lesson_id = _lesson_id)
  ORDER BY cq.order_index;
$$;

-- RPC function for students to fetch exercises (without expected_answer, accepted_answers, solution)
CREATE OR REPLACE FUNCTION public.get_student_exercises(
  _chapter_id uuid,
  _lesson_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  chapter_id uuid,
  lesson_id uuid,
  title text,
  statement text,
  difficulty integer,
  order_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ce.id,
    ce.chapter_id,
    ce.lesson_id,
    ce.title,
    ce.statement,
    ce.difficulty,
    ce.order_index
  FROM public.chapter_exercises ce
  WHERE ce.chapter_id = _chapter_id
    AND (_lesson_id IS NULL OR ce.lesson_id = _lesson_id)
  ORDER BY ce.order_index;
$$;
