-- Table pour stocker le contenu des cours par chapitres
CREATE TABLE IF NOT EXISTS public.course_content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX idx_course_content_subject ON public.course_content_chunks(subject);
CREATE INDEX idx_course_content_chapter ON public.course_content_chunks(subject, chapter_number);

-- RLS policies
ALTER TABLE public.course_content_chunks ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire le contenu des cours
CREATE POLICY "Anyone can read course content"
  ON public.course_content_chunks
  FOR SELECT
  USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "Only admins can modify course content"
  ON public.course_content_chunks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_course_content_chunks_updated_at
  BEFORE UPDATE ON public.course_content_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();