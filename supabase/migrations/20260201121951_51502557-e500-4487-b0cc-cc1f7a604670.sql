-- Fix security warnings: add search_path to trigger functions

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, email_verified)
    VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL);
    RETURN NEW;
END;
$$;

-- Fix overly permissive policy for activity_logs insert
-- Drop the old permissive policy
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

-- Create a more restrictive policy - only authenticated users can log their own actions
CREATE POLICY "Authenticated users can insert logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));