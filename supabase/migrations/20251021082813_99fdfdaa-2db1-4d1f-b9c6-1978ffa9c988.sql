-- Fix handle_new_user function to use correct column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    full_name, 
    avatar_url, 
    role, 
    school_level,
    date_of_birth
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'::app_role),
    (NEW.raw_user_meta_data->>'school_level')::school_level,
    (NEW.raw_user_meta_data->>'date_of_birth')::date
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;