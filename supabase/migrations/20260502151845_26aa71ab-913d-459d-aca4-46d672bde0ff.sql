-- Fix helper function permissions used by RLS policies and frontend RPC calls
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_parent_of(uuid, uuid) TO authenticated, anon;

-- Avoid recursive RLS checks on public.user_roles by moving the existence check
-- into a SECURITY DEFINER helper function.
CREATE OR REPLACE FUNCTION public.user_has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

GRANT EXECUTE ON FUNCTION public.user_has_any_role(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can insert their own initial role" ON public.user_roles;

CREATE POLICY "Users can insert their own initial role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('student'::public.app_role, 'parent'::public.app_role)
  AND NOT public.user_has_any_role(auth.uid())
);