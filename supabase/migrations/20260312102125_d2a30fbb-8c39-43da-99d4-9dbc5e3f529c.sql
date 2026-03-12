CREATE POLICY "Parents can view linked children profiles (any status)"
ON public.profiles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = profiles.id
  )
);