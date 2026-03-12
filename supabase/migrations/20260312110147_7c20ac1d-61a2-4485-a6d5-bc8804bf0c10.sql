
-- Allow parents to view their linked children's scores
CREATE POLICY "Parents can view children scores"
ON public.student_scores
FOR SELECT
TO authenticated
USING (is_parent_of(auth.uid(), user_id));
