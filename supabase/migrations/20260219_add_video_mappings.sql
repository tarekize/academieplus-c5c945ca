-- Table pour mapper les titres de cours aux vidéos YouTube
CREATE TABLE IF NOT EXISTS public.video_mappings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_title text NOT NULL,
  lesson_title_ar text,
  main_video_url text, -- Vidéo de cours principale
  main_video_duration text DEFAULT '15:00',
  reel_videos jsonb DEFAULT '[]'::jsonb, -- Array de micro-vidéos: [{"title": "...", "url": "...", "duration": "..."}]
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(lesson_title)
);

-- Index pour recherche rapide
CREATE INDEX idx_video_mappings_title ON public.video_mappings(lesson_title);

-- RLS
ALTER TABLE public.video_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read" ON public.video_mappings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to manage" ON public.video_mappings
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('pedago', 'admin')
    )
  );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_video_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_mappings_updated_at
BEFORE UPDATE ON public.video_mappings
FOR EACH ROW
EXECUTE FUNCTION update_video_mappings_updated_at();
