-- Mettre à jour la fonction handle_new_user pour inclure la date de naissance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, avatar_url, role, school_level, date_of_birth)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'student'),
    (new.raw_user_meta_data->>'school_level')::school_level,
    (new.raw_user_meta_data->>'date_of_birth')::date
  );
  
  -- Assign default role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'student')
  );
  
  RETURN new;
END;
$function$;