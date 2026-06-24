CREATE POLICY "Students can leave their own classes"
ON public.class_students
FOR DELETE
TO authenticated
USING (auth.uid() = student_id);