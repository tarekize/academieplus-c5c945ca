ALTER TABLE public.ai_generated_content
DROP CONSTRAINT IF EXISTS ai_generated_content_content_type_check;

ALTER TABLE public.ai_generated_content
ADD CONSTRAINT ai_generated_content_content_type_check
CHECK (content_type = ANY (ARRAY['quiz'::text, 'exercise'::text, 'revision'::text, 'remediation'::text]));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_generated_content TO authenticated;
GRANT ALL ON public.ai_generated_content TO service_role;