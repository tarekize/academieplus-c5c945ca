-- Function to check if a user is a child of another user
CREATE OR REPLACE FUNCTION public.is_child_of(_child_id UUID, _parent_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.parent_child_links
        WHERE parent_id = _parent_id
        AND child_id = _child_id
        AND status = 'active'
    )
$$;

-- RLS Policy: Children can view their linked parents' profiles
CREATE POLICY "Children can view linked parent profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_child_of(auth.uid(), id));

-- RPC function to get linked parents info (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_linked_parents(_child_id UUID)
RETURNS TABLE (
  link_id UUID,
  parent_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ,
  first_name TEXT,
  last_name TEXT,
  email TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    pcl.id AS link_id,
    pcl.parent_id,
    pcl.status,
    pcl.created_at,
    p.first_name,
    p.last_name,
    p.email
  FROM public.parent_child_links pcl
  LEFT JOIN public.profiles p ON p.id = pcl.parent_id
  WHERE pcl.child_id = _child_id
$$;
