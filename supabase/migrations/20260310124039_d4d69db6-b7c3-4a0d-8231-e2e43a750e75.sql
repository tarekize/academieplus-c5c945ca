
CREATE OR REPLACE FUNCTION public.generate_activation_code()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT upper(encode(extensions.gen_random_bytes(4), 'hex'))
$$;
