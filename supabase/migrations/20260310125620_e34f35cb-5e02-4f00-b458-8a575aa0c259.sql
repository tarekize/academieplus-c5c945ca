
-- Allow any authenticated user to SELECT free activation codes (needed for code activation lookup)
CREATE POLICY "Anyone can lookup free codes" ON public.activation_codes
  FOR SELECT TO authenticated
  USING (status = 'free');
