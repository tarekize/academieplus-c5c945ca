-- Table pour le suivi du temps passé
CREATE TABLE public.time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('chapter', 'quiz', 'exercise')),
  content_id TEXT NOT NULL,
  chapter_id TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_time_tracking_user_content ON public.time_tracking(user_id, content_type);
CREATE INDEX idx_time_tracking_chapter ON public.time_tracking(chapter_id) WHERE chapter_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own time tracking"
ON public.time_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time tracking"
ON public.time_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time tracking"
ON public.time_tracking
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_time_tracking_updated_at
BEFORE UPDATE ON public.time_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Fonction pour mettre à jour ou créer un enregistrement de temps
CREATE OR REPLACE FUNCTION public.upsert_time_tracking(
  p_user_id UUID,
  p_content_type TEXT,
  p_content_id TEXT,
  p_chapter_id TEXT DEFAULT NULL,
  p_additional_seconds INTEGER DEFAULT 0
)
RETURNS public.time_tracking
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.time_tracking;
BEGIN
  INSERT INTO public.time_tracking (
    user_id,
    content_type,
    content_id,
    chapter_id,
    time_spent_seconds,
    last_activity_at
  ) VALUES (
    p_user_id,
    p_content_type,
    p_content_id,
    p_chapter_id,
    p_additional_seconds,
    now()
  )
  ON CONFLICT (user_id, content_type, content_id)
  DO UPDATE SET
    time_spent_seconds = time_tracking.time_spent_seconds + p_additional_seconds,
    last_activity_at = now(),
    updated_at = now()
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;