
CREATE TABLE IF NOT EXISTS public.ai_lesson_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  chapter_id uuid,
  lesson_title text,
  chapter_title text,
  level_before integer NOT NULL DEFAULT 0,
  level_after integer NOT NULL DEFAULT 0,
  level_delta integer NOT NULL DEFAULT 0,
  weak_concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  strong_concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  message text NOT NULL,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_lesson_comments_user_lesson ON public.ai_lesson_comments(user_id, lesson_id, created_at DESC);

ALTER TABLE public.ai_lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own AI comments"
  ON public.ai_lesson_comments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own AI comments"
  ON public.ai_lesson_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own AI comments"
  ON public.ai_lesson_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can view children AI comments"
  ON public.ai_lesson_comments FOR SELECT
  TO authenticated
  USING (public.is_parent_of(auth.uid(), user_id));
