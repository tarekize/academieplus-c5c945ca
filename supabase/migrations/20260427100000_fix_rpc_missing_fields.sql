-- Fix RPC functions to include all necessary fields (explanation, correct_answer, solution, etc.)

DROP FUNCTION IF EXISTS public.get_student_quizzes(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_student_exercises(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_student_quizzes(_chapter_id uuid, _lesson_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, chapter_id uuid, lesson_id uuid, question text, options jsonb, correct_answer text, explanation text, difficulty integer, order_index integer, hint text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT cq.id, cq.chapter_id, cq.lesson_id, cq.question, cq.options, cq.correct_answer, cq.explanation, cq.difficulty, cq.order_index, cq.hint
  FROM public.chapter_quizzes cq
  WHERE cq.chapter_id = _chapter_id AND (_lesson_id IS NULL OR cq.lesson_id = _lesson_id)
  ORDER BY cq.order_index;
$function$;

CREATE OR REPLACE FUNCTION public.get_student_exercises(_chapter_id uuid, _lesson_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, chapter_id uuid, lesson_id uuid, title text, statement text, expected_answer text, accepted_answers jsonb, solution text, difficulty integer, order_index integer, hint text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT ce.id, ce.chapter_id, ce.lesson_id, ce.title, ce.statement, ce.expected_answer, ce.accepted_answers::jsonb, ce.solution, ce.difficulty, ce.order_index, ce.hint
  FROM public.chapter_exercises ce
  WHERE ce.chapter_id = _chapter_id AND (_lesson_id IS NULL OR ce.lesson_id = _lesson_id)
  ORDER BY ce.order_index;
$function$;
