
-- RPC: look up an establishment's name by its code (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_establishment_name_by_code(p_code text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT first_name
  FROM public.profiles
  WHERE establishment_code = upper(trim(p_code))
  LIMIT 1;
$$;

-- RPC: get the name of the establishment this teacher was linked to during signup
CREATE OR REPLACE FUNCTION public.get_my_primary_establishment_name()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p2.first_name
  FROM public.profiles p1
  JOIN public.profiles p2 ON p2.id = p1.establishment_id
  WHERE p1.id = auth.uid()
  LIMIT 1;
$$;
