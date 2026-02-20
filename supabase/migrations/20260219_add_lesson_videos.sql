-- Créer la table lesson_videos pour stocker les vidéos YouTube des leçons
CREATE TABLE IF NOT EXISTS public.lesson_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_ar text,
  youtube_url text NOT NULL,
  duration text NOT NULL, -- Format: "10:30"
  type text NOT NULL DEFAULT 'reel' CHECK (type IN ('main', 'reel')), -- main = vidéo cours, reel = micro-vidéo
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos(lesson_id);
CREATE INDEX idx_lesson_videos_type ON public.lesson_videos(type);
CREATE INDEX idx_lesson_videos_order ON public.lesson_videos(lesson_id, order_index);

-- RLS (Row Level Security)
ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

-- Politique: Tout utilisateur authentifié peut lire
CREATE POLICY "Allow authenticated users to read" ON public.lesson_videos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique: Seuls les pédagogues et admins peuvent créer/modifier/supprimer
CREATE POLICY "Allow pedago and admin to manage" ON public.lesson_videos
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('pedago', 'admin')
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_lesson_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_videos_updated_at
BEFORE UPDATE ON public.lesson_videos
FOR EACH ROW
EXECUTE FUNCTION update_lesson_videos_updated_at();
