ALTER TABLE public.chapter_exercises ADD COLUMN IF NOT EXISTS difficulty integer NOT NULL DEFAULT 1;
ALTER TABLE public.chapter_quizzes ADD COLUMN IF NOT EXISTS difficulty integer NOT NULL DEFAULT 1;