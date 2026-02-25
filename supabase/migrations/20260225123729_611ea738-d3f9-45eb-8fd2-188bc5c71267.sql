
-- Table pour stocker le score dynamique de l'élève
CREATE TABLE public.student_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 50, -- 0-100 scale
  reading_time_seconds INTEGER NOT NULL DEFAULT 0,
  quiz_time_seconds INTEGER NOT NULL DEFAULT 0,
  exercise_time_seconds INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  accuracy_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0, -- consecutive correct answers
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scores" ON public.student_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scores" ON public.student_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON public.student_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON public.student_scores FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_student_scores_updated_at BEFORE UPDATE ON public.student_scores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table pour stocker le contenu IA généré par leçon pour chaque élève
CREATE TABLE public.ai_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'exercise', 'revision')),
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty_level INTEGER NOT NULL DEFAULT 50, -- level at generation time
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI content" ON public.ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI content" ON public.ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI content" ON public.ai_generated_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own AI content" ON public.ai_generated_content FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_ai_generated_content_updated_at BEFORE UPDATE ON public.ai_generated_content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table pour les notifications de remédiation
CREATE TABLE public.student_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('performance_drop', 'stagnation', 'improvement', 'content_regenerated')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  diagnostic TEXT,
  advice TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.student_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON public.student_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.student_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.student_notifications FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_student_scores_user_lesson ON public.student_scores(user_id, lesson_id);
CREATE INDEX idx_ai_generated_content_user_lesson ON public.ai_generated_content(user_id, lesson_id);
CREATE INDEX idx_student_notifications_user ON public.student_notifications(user_id, is_read);
