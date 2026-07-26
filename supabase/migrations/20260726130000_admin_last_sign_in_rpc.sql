-- Expose auth.users.last_sign_in_at to admins only, via a SECURITY DEFINER RPC.
-- Client code cannot query auth.users directly, so this function bridges the gap
-- for the admin "gestion des utilisateurs" table.
CREATE OR REPLACE FUNCTION public.admin_get_last_sign_in_times()
RETURNS TABLE (user_id uuid, last_sign_in_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT u.id, u.last_sign_in_at
  FROM auth.users u
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_get_last_sign_in_times() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_last_sign_in_times() TO authenticated;
