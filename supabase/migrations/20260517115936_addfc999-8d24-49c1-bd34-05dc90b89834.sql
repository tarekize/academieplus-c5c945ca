-- Create parent_reports table
CREATE TABLE public.parent_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  global_success_rate NUMERIC,
  global_level INTEGER,
  strong_chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_recommendations TEXT,
  summary TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_parent_reports_parent ON public.parent_reports(parent_id, generated_at DESC);
CREATE INDEX idx_parent_reports_child ON public.parent_reports(child_id, generated_at DESC);

ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children's reports"
ON public.parent_reports
FOR SELECT
TO authenticated
USING (auth.uid() = parent_id OR auth.uid() = child_id);

CREATE POLICY "Admins manage all reports"
ON public.parent_reports
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can insert reports for linked children"
ON public.parent_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = parent_id AND is_parent_of(auth.uid(), child_id));