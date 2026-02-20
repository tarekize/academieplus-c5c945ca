-- Create subjects table
CREATE TABLE public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'speciality')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class_subjects table to link school levels with subjects
CREATE TABLE public.class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_level school_level NOT NULL,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_level, subject_id)
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects (public read access)
CREATE POLICY "Anyone can view subjects"
ON public.subjects
FOR SELECT
USING (true);

-- RLS Policies for class_subjects (public read access)
CREATE POLICY "Anyone can view class subjects"
ON public.class_subjects
FOR SELECT
USING (true);

-- Insert all subjects
INSERT INTO public.subjects (id, name, icon_name, color, category) VALUES
('philosophie', 'Philosophie', 'Brain', 'hsl(350 89% 70%)', 'general'),
('histoire', 'Histoire-Géographie', 'Landmark', 'hsl(27 96% 61%)', 'general'),
('anglais', 'Anglais', 'Languages', 'hsl(200 94% 65%)', 'general'),
('francais', 'Français', 'BookOpen', 'hsl(140 60% 60%)', 'general'),
('mathematiques', 'Mathématiques', 'Calculator', 'hsl(250 75% 65%)', 'general'),
('ses', 'SES', 'Globe', 'hsl(33 100% 70%)', 'speciality'),
('svt', 'SVT', 'Microscope', 'hsl(140 60% 60%)', 'speciality'),
('physique', 'Physique-Chimie', 'Beaker', 'hsl(200 94% 65%)', 'speciality'),
('arts', 'Arts Plastiques', 'Palette', 'hsl(280 80% 70%)', 'speciality'),
('musique', 'Éducation Musicale', 'Music', 'hsl(320 85% 70%)', 'speciality'),
('eps', 'EPS', 'HeartPulse', 'hsl(10 90% 65%)', 'speciality'),
('nsi', 'NSI', 'Code', 'hsl(190 80% 60%)', 'speciality');

-- Insert class_subjects mappings for CP
INSERT INTO public.class_subjects (school_level, subject_id, is_mandatory) VALUES
('cp', 'francais', true),
('cp', 'mathematiques', true);

-- CE1, CE2, CM1, CM2
INSERT INTO public.class_subjects (school_level, subject_id, is_mandatory) VALUES
('ce1', 'francais', true),
('ce1', 'mathematiques', true),
('ce1', 'anglais', true),
('ce2', 'francais', true),
('ce2', 'mathematiques', true),
('ce2', 'anglais', true),
('cm1', 'francais', true),
('cm1', 'mathematiques', true),
('cm1', 'anglais', true),
('cm1', 'histoire', true),
('cm2', 'francais', true),
('cm2', 'mathematiques', true),
('cm2', 'anglais', true),
('cm2', 'histoire', true);

-- Collège (6ème à 3ème)
INSERT INTO public.class_subjects (school_level, subject_id, is_mandatory) VALUES
('sixieme', 'francais', true),
('sixieme', 'mathematiques', true),
('sixieme', 'anglais', true),
('sixieme', 'histoire', true),
('sixieme', 'svt', true),
('sixieme', 'physique', true),
('sixieme', 'eps', true),
('sixieme', 'arts', true),
('sixieme', 'musique', true),
('cinquieme', 'francais', true),
('cinquieme', 'mathematiques', true),
('cinquieme', 'anglais', true),
('cinquieme', 'histoire', true),
('cinquieme', 'svt', true),
('cinquieme', 'physique', true),
('cinquieme', 'eps', true),
('cinquieme', 'arts', true),
('cinquieme', 'musique', true),
('quatrieme', 'francais', true),
('quatrieme', 'mathematiques', true),
('quatrieme', 'anglais', true),
('quatrieme', 'histoire', true),
('quatrieme', 'svt', true),
('quatrieme', 'physique', true),
('quatrieme', 'eps', true),
('quatrieme', 'arts', true),
('quatrieme', 'musique', true),
('troisieme', 'francais', true),
('troisieme', 'mathematiques', true),
('troisieme', 'anglais', true),
('troisieme', 'histoire', true),
('troisieme', 'svt', true),
('troisieme', 'physique', true),
('troisieme', 'eps', true),
('troisieme', 'arts', true),
('troisieme', 'musique', true);

-- Lycée (Seconde)
INSERT INTO public.class_subjects (school_level, subject_id, is_mandatory) VALUES
('seconde', 'francais', true),
('seconde', 'mathematiques', true),
('seconde', 'anglais', true),
('seconde', 'histoire', true),
('seconde', 'svt', true),
('seconde', 'physique', true),
('seconde', 'ses', true),
('seconde', 'eps', true),
('seconde', 'arts', false),
('seconde', 'musique', false);

-- Première
INSERT INTO public.class_subjects (school_level, subject_id, is_mandatory) VALUES
('premiere', 'francais', true),
('premiere', 'philosophie', true),
('premiere', 'anglais', true),
('premiere', 'histoire', true),
('premiere', 'mathematiques', false),
('premiere', 'svt', false),
('premiere', 'physique', false),
('premiere', 'ses', false),
('premiere', 'nsi', false),
('premiere', 'eps', true),
('premiere', 'arts', false),
('premiere', 'musique', false);

-- Terminale
INSERT INTO public.class_subjects (school_level, subject_id, is_mandatory) VALUES
('terminale', 'philosophie', true),
('terminale', 'anglais', true),
('terminale', 'histoire', true),
('terminale', 'mathematiques', false),
('terminale', 'svt', false),
('terminale', 'physique', false),
('terminale', 'ses', false),
('terminale', 'nsi', false),
('terminale', 'eps', true),
('terminale', 'arts', false),
('terminale', 'musique', false);