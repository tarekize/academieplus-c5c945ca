
-- Table pour stocker le style d'apprentissage détecté
CREATE TABLE public.learning_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  visual_score INTEGER NOT NULL DEFAULT 0,
  textual_score INTEGER NOT NULL DEFAULT 0,
  practical_score INTEGER NOT NULL DEFAULT 0,
  preferred_style TEXT NOT NULL DEFAULT 'mixed',
  assessment_data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning style"
  ON public.learning_styles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning style"
  ON public.learning_styles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning style"
  ON public.learning_styles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_learning_styles_updated_at
  BEFORE UPDATE ON public.learning_styles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Table pour les recommandations ITS
CREATE TABLE public.its_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.its_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
  ON public.its_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.its_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
  ON public.its_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
