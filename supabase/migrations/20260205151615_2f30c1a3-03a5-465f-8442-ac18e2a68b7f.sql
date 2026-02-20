
-- Table des filières (spécialisations par niveau)
CREATE TABLE public.filieres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT,
  school_level public.school_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des chapitres
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_level public.school_level NOT NULL,
  filiere_id UUID REFERENCES public.filieres(id) ON DELETE SET NULL,
  subject TEXT NOT NULL DEFAULT 'math',
  title TEXT NOT NULL,
  title_ar TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des leçons (cours)
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  content TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_chapters_school_level ON public.chapters(school_level);
CREATE INDEX idx_chapters_filiere ON public.chapters(filiere_id);
CREATE INDEX idx_chapters_subject ON public.chapters(subject);
CREATE INDEX idx_lessons_chapter ON public.lessons(chapter_id);

-- Enable RLS
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policies: lecture publique pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view filieres"
ON public.filieres FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view chapters"
ON public.chapters FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (true);

-- Policies: seuls les admins peuvent modifier
CREATE POLICY "Admins can manage filieres"
ON public.filieres FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage chapters"
ON public.chapters FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE TRIGGER update_chapters_updated_at
BEFORE UPDATE ON public.chapters
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
