-- update-user-email used to update profiles.email immediately, in lockstep
-- with an admin-API email change that bypassed Supabase's confirmation
-- flow. Now that the edge function goes through the normal (confirmed)
-- email-change flow, profiles.email must stay in sync automatically once
-- the change actually takes effect on auth.users — not before, and not
-- manually from the edge function.

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_email ON auth.users;
CREATE TRIGGER trg_sync_profile_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();
