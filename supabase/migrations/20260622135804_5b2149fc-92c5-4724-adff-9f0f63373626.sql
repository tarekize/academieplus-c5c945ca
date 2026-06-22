CREATE POLICY "Parents view class memberships of their children"
  ON public.class_students FOR SELECT TO authenticated
  USING (public.is_parent_of(auth.uid(), student_id));