-- Update existing profiles with data from auth.users metadata
UPDATE public.profiles p
SET 
  first_name = COALESCE(p.first_name, (SELECT au.raw_user_meta_data->>'first_name' FROM auth.users au WHERE au.id = p.id)),
  last_name = COALESCE(p.last_name, (SELECT au.raw_user_meta_data->>'last_name' FROM auth.users au WHERE au.id = p.id)),
  date_of_birth = COALESCE(p.date_of_birth, (SELECT (au.raw_user_meta_data->>'date_of_birth')::date FROM auth.users au WHERE au.id = p.id))
WHERE 
  p.first_name IS NULL 
  OR p.last_name IS NULL 
  OR p.date_of_birth IS NULL;