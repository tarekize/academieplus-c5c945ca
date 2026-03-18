-- Migrate AI report/advice tracking from learning_styles to student_scores

-- 1) Add AI report/advice columns to student_scores
ALTER TABLE public.student_scores
ADD COLUMN IF NOT EXISTS assessment_data JSONB,
ADD COLUMN IF NOT EXISTS report_first_shown_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_advice_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS periodic_advice JSONB,
ADD COLUMN IF NOT EXISTS advice_seen BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.student_scores.current_level IS 'Initial placement test score (0-100), then adaptive pedagogical level';
COMMENT ON COLUMN public.student_scores.assessment_data IS 'Placement test payload (answers, report, score) used by AI report and periodic advice';
COMMENT ON COLUMN public.student_scores.report_first_shown_at IS 'Timestamp of the first display of the AI placement report';
COMMENT ON COLUMN public.student_scores.last_advice_generated_at IS 'Timestamp of the last periodic advice generation (every 10 days)';
COMMENT ON COLUMN public.student_scores.periodic_advice IS 'JSON payload for periodic advice (level, advice, generated_at, weaknesses)';
COMMENT ON COLUMN public.student_scores.advice_seen IS 'Whether the student has read the latest periodic advice';

-- 2) Ensure exactly one global (non-lesson) score row per user for placement/advice tracking
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_scores_user_global_unique
ON public.student_scores(user_id)
WHERE lesson_id IS NULL;

-- 3) Backfill global student_scores rows from learning_styles when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'learning_styles'
  ) THEN
    -- Insert missing global rows
    INSERT INTO public.student_scores (
      user_id,
      lesson_id,
      chapter_id,
      current_level,
      reading_time_seconds,
      quiz_time_seconds,
      exercise_time_seconds,
      total_answers,
      correct_answers,
      accuracy_rate,
      streak,
      assessment_data,
      report_first_shown_at,
      last_advice_generated_at,
      periodic_advice,
      advice_seen,
      created_at,
      updated_at
    )
    SELECT
      ls.user_id,
      NULL,
      NULL,
      LEAST(100, GREATEST(0, ROUND((COALESCE(ls.visual_score, 0) + COALESCE(ls.textual_score, 0) + COALESCE(ls.practical_score, 0)) / 3.0))),
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      ls.assessment_data,
      ls.report_first_shown_at,
      ls.last_advice_generated_at,
      ls.periodic_advice,
      COALESCE(ls.advice_seen, false),
      COALESCE(ls.created_at, now()),
      COALESCE(ls.updated_at, now())
    FROM public.learning_styles ls
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.student_scores ss
      WHERE ss.user_id = ls.user_id
        AND ss.lesson_id IS NULL
    );

    -- Update existing global rows with learning_styles data when needed
    UPDATE public.student_scores ss
    SET
      current_level = LEAST(100, GREATEST(0, ROUND((COALESCE(ls.visual_score, 0) + COALESCE(ls.textual_score, 0) + COALESCE(ls.practical_score, 0)) / 3.0))),
      assessment_data = COALESCE(ss.assessment_data, ls.assessment_data),
      report_first_shown_at = COALESCE(ss.report_first_shown_at, ls.report_first_shown_at),
      last_advice_generated_at = COALESCE(ss.last_advice_generated_at, ls.last_advice_generated_at),
      periodic_advice = COALESCE(ss.periodic_advice, ls.periodic_advice),
      advice_seen = COALESCE(ss.advice_seen, ls.advice_seen, false),
      updated_at = now()
    FROM public.learning_styles ls
    WHERE ss.user_id = ls.user_id
      AND ss.lesson_id IS NULL;

    -- Remove legacy policies/triggers/table after successful data migration
    DROP POLICY IF EXISTS "Users can view their own learning style" ON public.learning_styles;
    DROP POLICY IF EXISTS "Users can insert their own learning style" ON public.learning_styles;
    DROP POLICY IF EXISTS "Users can update their own learning style" ON public.learning_styles;
    DROP TRIGGER IF EXISTS update_learning_styles_updated_at ON public.learning_styles;
    DROP TABLE IF EXISTS public.learning_styles;
  END IF;
END $$;
