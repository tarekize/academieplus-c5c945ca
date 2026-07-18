-- Security fix: parent_child_links allowed a client-side INSERT to set
-- status directly, bypassing the linking_code verification done by the
-- link-child-by-code Edge Function and the child's consent (respondToRequest
-- in useProfile.ts, which is the only place status is legitimately set to
-- 'active'). Any authenticated user could insert
--   { parent_id: auth.uid(), child_id: <any uuid>, status: 'active' }
-- directly and immediately gain is_parent_of() access to an arbitrary
-- child's profile, scores, AI comments, reports and notes.
--
-- Fix: force every new link to start as 'pending' regardless of what the
-- inserting client submits. This matches the only two legitimate paths
-- (the edge function's initial request, and the child's own approval via
-- UPDATE) — neither of which needs to set 'active' on INSERT.

CREATE OR REPLACE FUNCTION public.force_pending_link_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated')
     OR public.has_role(auth.uid(), 'admin'::public.app_role)
  THEN
    RETURN NEW;
  END IF;

  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_pending_link_status ON public.parent_child_links;
CREATE TRIGGER trg_force_pending_link_status
  BEFORE INSERT ON public.parent_child_links
  FOR EACH ROW
  EXECUTE FUNCTION public.force_pending_link_status();

-- Defense in depth: also stop a child from reassigning an existing link to
-- a different parent_id via UPDATE — RLS's WITH CHECK only sees the NEW
-- row (no OLD to compare against), so this needs a trigger, not a policy
-- expression.
CREATE OR REPLACE FUNCTION public.lock_parent_child_link_parent_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated')
     OR public.has_role(auth.uid(), 'admin'::public.app_role)
  THEN
    RETURN NEW;
  END IF;

  NEW.parent_id := OLD.parent_id;
  NEW.child_id := OLD.child_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_parent_child_link_parent_id ON public.parent_child_links;
CREATE TRIGGER trg_lock_parent_child_link_parent_id
  BEFORE UPDATE ON public.parent_child_links
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_parent_child_link_parent_id();
