
ALTER TABLE public.parent_reports
  ADD COLUMN IF NOT EXISTS report_type text NOT NULL DEFAULT 'periodic';

CREATE INDEX IF NOT EXISTS idx_parent_reports_type_generated
  ON public.parent_reports(child_id, report_type, generated_at DESC);
