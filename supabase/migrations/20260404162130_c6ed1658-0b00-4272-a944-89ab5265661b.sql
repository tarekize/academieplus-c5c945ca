
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_level public.school_level NOT NULL,
  trimester INTEGER NOT NULL CHECK (trimester IN (1, 2, 3)),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  subject TEXT NOT NULL DEFAULT 'math',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exams"
ON public.exams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage exams"
ON public.exams FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Pedagos can manage exams"
ON public.exams FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'pedago'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'pedago'::public.app_role));

CREATE INDEX idx_exams_level_trimester ON public.exams (school_level, trimester);
