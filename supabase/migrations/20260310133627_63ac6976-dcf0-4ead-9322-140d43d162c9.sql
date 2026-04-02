
-- Drop the restrictive update policy and replace with a proper one
DROP POLICY IF EXISTS "Authenticated can update codes" ON public.activation_codes;

CREATE POLICY "Authenticated can update free codes"
ON public.activation_codes
FOR UPDATE TO authenticated
USING (status = 'free')
WITH CHECK (true);
