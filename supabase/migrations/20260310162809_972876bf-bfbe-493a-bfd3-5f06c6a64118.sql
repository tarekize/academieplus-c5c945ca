-- Allow parents to delete activation codes they created
CREATE POLICY "Creators can delete their codes"
ON public.activation_codes
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Allow parents to delete student subscriptions linked to their activation codes
CREATE POLICY "Parents can delete subs by activation code"
ON public.student_subscriptions
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM activation_codes ac
  WHERE ac.id = student_subscriptions.activation_code_id
  AND ac.created_by = auth.uid()
));