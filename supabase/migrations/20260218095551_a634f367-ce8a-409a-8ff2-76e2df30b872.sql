
-- Table pour les quiz par chapitre
CREATE TABLE public.chapter_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les exercices par chapitre
CREATE TABLE public.chapter_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  accepted_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  solution TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chapter_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_exercises ENABLE ROW LEVEL SECURITY;

-- Quizzes RLS
CREATE POLICY "Authenticated users can view quizzes" ON public.chapter_quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON public.chapter_quizzes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Pedagos can manage quizzes" ON public.chapter_quizzes FOR ALL USING (has_role(auth.uid(), 'pedago'::app_role)) WITH CHECK (has_role(auth.uid(), 'pedago'::app_role));

-- Exercises RLS
CREATE POLICY "Authenticated users can view exercises" ON public.chapter_exercises FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON public.chapter_exercises FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Pedagos can manage exercises" ON public.chapter_exercises FOR ALL USING (has_role(auth.uid(), 'pedago'::app_role)) WITH CHECK (has_role(auth.uid(), 'pedago'::app_role));

-- Updated_at triggers
CREATE TRIGGER update_chapter_quizzes_updated_at BEFORE UPDATE ON public.chapter_quizzes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_chapter_exercises_updated_at BEFORE UPDATE ON public.chapter_exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_exercises;
