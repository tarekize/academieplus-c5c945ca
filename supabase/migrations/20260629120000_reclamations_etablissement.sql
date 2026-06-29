-- Add 'etablissement' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'etablissement';

-- Create reclamations table
CREATE TABLE IF NOT EXISTS public.reclamations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

GRANT SELECT, INSERT ON public.reclamations TO authenticated;
GRANT UPDATE (status, response, resolved_at) ON public.reclamations TO authenticated;
GRANT ALL ON public.reclamations TO service_role;

ALTER TABLE public.reclamations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own reclamations"
ON public.reclamations FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own reclamations"
ON public.reclamations FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Etablissement view all reclamations"
ON public.reclamations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

CREATE POLICY "Etablissement update reclamations"
ON public.reclamations FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

-- Allow etablissement to view all profiles
CREATE POLICY "Etablissement view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

-- Allow etablissement to view all classes
CREATE POLICY "Etablissement view all classes"
ON public.classes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

-- Allow etablissement to view all class_students
CREATE POLICY "Etablissement view all class students"
ON public.class_students FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

-- Allow etablissement to view all user_roles
CREATE POLICY "Etablissement view all user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);
