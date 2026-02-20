-- Allow users to view their own activity logs
CREATE POLICY "Users can view their own logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
