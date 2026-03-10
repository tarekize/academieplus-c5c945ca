-- Allow parents to view subscriptions linked to codes they created
CREATE POLICY "Parents can view subs by activation code"
ON public.student_subscriptions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.activation_codes ac
    WHERE ac.id = activation_code_id
    AND ac.created_by = auth.uid()
  )
);
