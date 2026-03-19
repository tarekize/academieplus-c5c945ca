-- Scope quiz/exercise content to a specific lesson when needed.
-- Existing chapter-level rows remain valid with lesson_id = NULL.

ALTER TABLE public.chapter_quizzes
  ADD COLUMN IF NOT EXISTS lesson_id UUID NULL;

ALTER TABLE public.chapter_exercises
  ADD COLUMN IF NOT EXISTS lesson_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chapter_quizzes_lesson_id_fkey'
  ) THEN
    ALTER TABLE public.chapter_quizzes
      ADD CONSTRAINT chapter_quizzes_lesson_id_fkey
      FOREIGN KEY (lesson_id)
      REFERENCES public.lessons(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chapter_exercises_lesson_id_fkey'
  ) THEN
    ALTER TABLE public.chapter_exercises
      ADD CONSTRAINT chapter_exercises_lesson_id_fkey
      FOREIGN KEY (lesson_id)
      REFERENCES public.lessons(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chapter_quizzes_chapter_lesson_order
  ON public.chapter_quizzes(chapter_id, lesson_id, order_index);

CREATE INDEX IF NOT EXISTS idx_chapter_exercises_chapter_lesson_order
  ON public.chapter_exercises(chapter_id, lesson_id, order_index);
