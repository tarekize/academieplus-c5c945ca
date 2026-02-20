-- Pedagos can manage chapters
CREATE POLICY "Pedagos can manage chapters"
ON public.chapters FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'pedago'::app_role))
WITH CHECK (has_role(auth.uid(), 'pedago'::app_role));

-- Pedagos can manage lessons
CREATE POLICY "Pedagos can manage lessons"
ON public.lessons FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'pedago'::app_role))
WITH CHECK (has_role(auth.uid(), 'pedago'::app_role));