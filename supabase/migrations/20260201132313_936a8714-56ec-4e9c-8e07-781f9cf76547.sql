-- Update handle_new_user function to copy first_name, last_name, and school_level from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, email_verified, first_name, last_name, school_level)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        (NEW.raw_user_meta_data ->> 'school_level')::school_level
    );
    
    -- Also create user_role based on metadata
    IF NEW.raw_user_meta_data ->> 'role' IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, (NEW.raw_user_meta_data ->> 'role')::app_role);
    END IF;
    
    RETURN NEW;
END;
$$;