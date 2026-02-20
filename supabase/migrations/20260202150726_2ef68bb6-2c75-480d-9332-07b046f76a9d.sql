-- Allow users to insert their own role (for profile completion after SSO signup)
CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid()
  )
);