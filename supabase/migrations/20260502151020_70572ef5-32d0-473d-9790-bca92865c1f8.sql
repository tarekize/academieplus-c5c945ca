
-- 1) Allow logged-in users to call has_role (needed by RLS and by AuthContext RPC)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- 2) Fix user_roles INSERT policy: a user choosing their profile type should be able
-- to insert either 'student' or 'parent' for themselves (only once).
DROP POLICY IF EXISTS "Users can insert their own student role" ON public.user_roles;

CREATE POLICY "Users can insert their own initial role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('student'::public.app_role, 'parent'::public.app_role)
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  )
);
