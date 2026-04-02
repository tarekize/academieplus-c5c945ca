CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_school_level_text text;
  v_school_level_enum public.school_level;
  v_role_text text;
  v_role_enum public.app_role;
BEGIN
  v_school_level_text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'school_level', '')), '');

  v_school_level_enum := CASE v_school_level_text
    WHEN '6ème' THEN '6eme'::public.school_level
    WHEN '6eme' THEN '6eme'::public.school_level
    WHEN '5ème' THEN '5eme'::public.school_level
    WHEN '5eme' THEN '5eme'::public.school_level
    WHEN '4ème' THEN '4eme'::public.school_level
    WHEN '4eme' THEN '4eme'::public.school_level
    WHEN '3ème' THEN '3eme'::public.school_level
    WHEN '3eme' THEN '3eme'::public.school_level
    WHEN 'Seconde' THEN 'seconde'::public.school_level
    WHEN 'seconde' THEN 'seconde'::public.school_level
    WHEN '1ère' THEN 'premiere'::public.school_level
    WHEN 'Première' THEN 'premiere'::public.school_level
    WHEN 'premiere' THEN 'premiere'::public.school_level
    WHEN 'Terminale' THEN 'terminale'::public.school_level
    WHEN 'terminale' THEN 'terminale'::public.school_level
    ELSE NULL
  END;

  INSERT INTO public.profiles (id, email, email_verified, first_name, last_name, school_level)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    v_school_level_enum
  );

  v_role_text := NULLIF(lower(trim(COALESCE(NEW.raw_user_meta_data ->> 'role', ''))), '');
  v_role_enum := CASE v_role_text
    WHEN 'student' THEN 'student'::public.app_role
    WHEN 'parent' THEN 'parent'::public.app_role
    WHEN 'admin' THEN 'admin'::public.app_role
    WHEN 'pedago' THEN 'pedago'::public.app_role
    ELSE NULL
  END;

  IF v_role_enum IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role_enum)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;