CREATE POLICY "Children can view linked parent profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_child_links.child_id = auth.uid()
      AND parent_child_links.parent_id = profiles.id
  )
);