-- ============================================================================
-- Security review fixes: prevent self-service privilege escalation.
--
-- 1. profiles          — a user could self-update subscription_end_date,
--                         contract_start_date/end_date, is_active,
--                         email_verified via the existing "own row" policy.
-- 2. student_subscriptions — a user could insert/update their own row with
--                         arbitrary plan_type/total_days/days_used, bypassing
--                         activation codes entirely.
-- 3. chat_usage         — a user could reset message_count/image_count used
--                         for AI quota enforcement.
-- 4. has_role / is_parent_of — were EXECUTE-granted to `anon`, but no table
--                         in this schema is anon-readable, so anon never
--                         legitimately needs to call them.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles: block self-escalation of privileged columns via a trigger.
--
-- WITH CHECK can restrict which *rows* an UPDATE may touch, not which
-- *columns* change, so column-level protection needs a trigger. Trusted
-- writers (service_role, direct DB/cron sessions, and the SECURITY DEFINER
-- RPCs below, which all execute as the table owner and therefore have
-- current_user NOT IN ('anon','authenticated')) and admins pass through
-- untouched; everyone else has these columns silently reverted to their
-- previous value.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
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

  NEW.subscription_end_date := OLD.subscription_end_date;
  NEW.contract_start_date   := OLD.contract_start_date;
  NEW.contract_end_date     := OLD.contract_end_date;
  NEW.is_active             := OLD.is_active;
  NEW.email_verified        := OLD.email_verified;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_columns
  BEFORE UPDATE OF subscription_end_date, contract_start_date, contract_end_date, is_active, email_verified
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Explicit (idempotent) admin policy: AdminContrats.tsx reads and updates
-- OTHER users' profiles (contract dates) as an authenticated admin session.
-- Must be FOR ALL, not just UPDATE: Postgres requires an UPDATE target row
-- to also pass a SELECT policy, so an UPDATE-only policy here would still
-- silently match zero rows for a row the admin has no SELECT policy for.
-- Adding this defensively — if equivalent policies already exist live,
-- this is simply redundant (permissive policies OR together), never a
-- regression.
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ----------------------------------------------------------------------------
-- 2. student_subscriptions: no more direct client insert/update. All
--    self-service writes now go through SECURITY DEFINER RPCs that enforce
--    the activation-code / elapsed-time rules server-side. Admins keep a
--    dedicated policy for the manual "add days" / "deactivate" tools.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.student_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.student_subscriptions;

DROP POLICY IF EXISTS "Admins can manage student subscriptions" ON public.student_subscriptions;
CREATE POLICY "Admins can manage student subscriptions"
  ON public.student_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Redeems a free activation code for the calling user, or for one of their
-- linked children (p_target_user_id) — replacing the two separate 3-step
-- client-side flows (Account.tsx self-activation, ParentDashboard.tsx
-- activation-for-child) that let anyone skip the code check entirely and
-- insert an arbitrary subscription. Validates + locks the code row, marks
-- it used, creates the subscription, and — self-activation only, matching
-- the previous behavior — reactivates the profile.
CREATE OR REPLACE FUNCTION public.redeem_activation_code(p_code text, p_target_user_id uuid DEFAULT NULL)
RETURNS public.student_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code public.activation_codes;
  v_total_days integer;
  v_sub public.student_subscriptions;
  v_beneficiary uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise.';
  END IF;

  IF p_target_user_id IS NULL OR p_target_user_id = auth.uid() THEN
    v_beneficiary := auth.uid();
  ELSIF public.is_parent_of(auth.uid(), p_target_user_id) THEN
    v_beneficiary := p_target_user_id;
  ELSE
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à activer un code pour cet utilisateur.';
  END IF;

  SELECT * INTO v_code
  FROM public.activation_codes
  WHERE code = trim(p_code) AND status = 'free'
  FOR UPDATE;

  IF v_code IS NULL THEN
    RAISE EXCEPTION 'Ce code n''existe pas ou a déjà été utilisé.';
  END IF;

  UPDATE public.activation_codes
  SET status = 'used', used_by = auth.uid(), used_at = now()
  WHERE id = v_code.id;

  v_total_days := CASE WHEN v_code.plan_type = 'annual' THEN 360 ELSE 30 END;

  INSERT INTO public.student_subscriptions (user_id, plan_type, total_days, activation_code_id)
  VALUES (v_beneficiary, v_code.plan_type, v_total_days, v_code.id)
  RETURNING * INTO v_sub;

  IF v_beneficiary = auth.uid() THEN
    UPDATE public.profiles SET is_active = true WHERE id = auth.uid();
  END IF;

  RETURN v_sub;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_activation_code(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(text, uuid) TO authenticated;

-- Pauses the caller's own most recent subscription, snapshotting elapsed
-- days server-side (so days_used can no longer be reset/frozen by the client).
CREATE OR REPLACE FUNCTION public.pause_my_subscription()
RETURNS public.student_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sub public.student_subscriptions;
  v_elapsed double precision;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise.';
  END IF;

  SELECT * INTO v_sub
  FROM public.student_subscriptions
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'Aucun abonnement trouvé.';
  END IF;

  IF v_sub.is_paused THEN
    RETURN v_sub;
  END IF;

  v_elapsed := EXTRACT(EPOCH FROM (now() - v_sub.last_tick_at)) / 86400.0;

  UPDATE public.student_subscriptions
  SET is_paused = true,
      paused_at = now(),
      days_used = days_used + v_elapsed,
      last_tick_at = now()
  WHERE id = v_sub.id
  RETURNING * INTO v_sub;

  RETURN v_sub;
END;
$$;

REVOKE ALL ON FUNCTION public.pause_my_subscription() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pause_my_subscription() TO authenticated;

-- Resumes the caller's own most recent subscription.
CREATE OR REPLACE FUNCTION public.resume_my_subscription()
RETURNS public.student_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sub public.student_subscriptions;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise.';
  END IF;

  UPDATE public.student_subscriptions
  SET is_paused = false,
      paused_at = NULL,
      last_tick_at = now()
  WHERE id = (
    SELECT id FROM public.student_subscriptions
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC
    LIMIT 1
  )
  RETURNING * INTO v_sub;

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'Aucun abonnement trouvé.';
  END IF;

  RETURN v_sub;
END;
$$;

REVOKE ALL ON FUNCTION public.resume_my_subscription() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resume_my_subscription() TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. chat_usage: no more direct client insert/update — quota counters can
--    only move via this atomic, server-side increment.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.chat_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.chat_usage;

CREATE OR REPLACE FUNCTION public.increment_chat_usage(p_messages integer DEFAULT 0, p_images integer DEFAULT 0)
RETURNS public.chat_usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.chat_usage;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise.';
  END IF;
  IF p_messages < 0 OR p_images < 0 THEN
    RAISE EXCEPTION 'Valeurs invalides.';
  END IF;

  INSERT INTO public.chat_usage (user_id, usage_date, message_count, image_count)
  VALUES (auth.uid(), CURRENT_DATE, p_messages, p_images)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    message_count = public.chat_usage.message_count + excluded.message_count,
    image_count = public.chat_usage.image_count + excluded.image_count,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_chat_usage(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_chat_usage(integer, integer) TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. has_role / is_parent_of: no table in this schema grants anon any
--    access, so anon has no legitimate reason to call these — they were
--    callable pre-login, letting anyone probe arbitrary user_id/role or
--    parent/child pairs.
--
-- Both a REVOKE FROM PUBLIC (Postgres grants EXECUTE to PUBLIC by default on
-- function creation) and a REVOKE FROM anon (an earlier migration also
-- explicitly granted anon EXECUTE) are needed — either alone leaves anon
-- with access through the other path. Re-grant explicitly to the roles that
-- actually need it (edge functions call both via the service_role admin
-- client).
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_parent_of(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_parent_of(uuid, uuid) TO authenticated, service_role;
