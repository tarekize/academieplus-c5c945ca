
CREATE TABLE public.teacher_content_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL REFERENCES public.teacher_content(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  errors integer NOT NULL DEFAULT 0,
  hints_used integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  is_correct boolean,
  last_answer text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (content_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_content_attempts TO authenticated;
GRANT ALL ON public.teacher_content_attempts TO service_role;

ALTER TABLE public.teacher_content_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own attempts"
ON public.teacher_content_attempts
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers view attempts on their content"
ON public.teacher_content_attempts
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.teacher_content tc
  WHERE tc.id = teacher_content_attempts.content_id
    AND tc.teacher_id = auth.uid()
));

CREATE TRIGGER trg_teacher_content_attempts_updated_at
BEFORE UPDATE ON public.teacher_content_attempts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
