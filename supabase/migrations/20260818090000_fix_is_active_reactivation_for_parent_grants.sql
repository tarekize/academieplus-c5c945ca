-- BUG : redeem_activation_code() ne réactivait profiles.is_active que quand
-- l'appelant activait SON PROPRE code (v_beneficiary = auth.uid()). Quand un
-- PARENT active un code pour son enfant (le flux normal du dashboard parent —
-- "Activer l'abonnement"), v_beneficiary = l'enfant ≠ auth.uid() = le parent,
-- donc cette condition ne se déclenche jamais : l'enfant reste is_active =
-- false même après un abonnement redevenu valide, et se fait rejeter vers
-- /auth?deactivated=1 à chaque connexion. Le job quotidien
-- recompute_expired_contracts() ne fait que désactiver (jamais réactiver) —
-- rien d'autre ne corrige is_active après une expiration passive.
-- admin_grant_subscription_days() avait le même trou : aucune mise à jour de
-- is_active du tout, même en auto-redemption.
-- Corrigé : les deux fonctions réactivent désormais systématiquement le
-- bénéficiaire (v_beneficiary / p_user_id), quel que soit l'appelant.
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
  v_existing_id uuid;
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

  SELECT id INTO v_existing_id
  FROM public.student_subscriptions
  WHERE user_id = v_beneficiary
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.student_subscriptions (user_id, plan_type, total_days, days_used, is_paused, started_at, last_tick_at, activation_code_id)
    VALUES (v_beneficiary, v_code.plan_type, v_total_days, 0, false, now(), now(), v_code.id)
    RETURNING * INTO v_sub;
  ELSE
    UPDATE public.student_subscriptions
    SET
      days_used = CASE
        WHEN NOT is_paused AND last_tick_at IS NOT NULL
          THEN LEAST(days_used + EXTRACT(EPOCH FROM (now() - last_tick_at)) / 86400.0, total_days)
        ELSE LEAST(days_used, total_days)
      END,
      total_days = total_days + v_total_days,
      is_paused = false,
      paused_at = NULL,
      last_tick_at = now(),
      activation_code_id = v_code.id
    WHERE id = v_existing_id
    RETURNING * INTO v_sub;
  END IF;

  -- Réactive systématiquement le bénéficiaire (élève OU parent qui active
  -- pour lui), pas seulement en auto-redemption.
  UPDATE public.profiles SET is_active = true WHERE id = v_beneficiary;

  RETURN v_sub;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_activation_code(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(text, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_grant_subscription_days(p_user_id uuid, p_days integer)
RETURNS public.student_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.student_subscriptions;
  v_existing_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin') THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;
  IF p_days IS NULL OR p_days <= 0 THEN
    RAISE EXCEPTION 'Nombre de jours invalide.';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.student_subscriptions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.student_subscriptions (user_id, plan_type, total_days, days_used, is_paused, started_at, last_tick_at)
    VALUES (p_user_id, 'admin_grant', p_days, 0, false, now(), now())
    RETURNING * INTO v_row;
    UPDATE public.profiles SET is_active = true WHERE id = p_user_id;
    RETURN v_row;
  END IF;

  UPDATE public.student_subscriptions
  SET
    days_used = CASE
      WHEN NOT is_paused AND last_tick_at IS NOT NULL
        THEN LEAST(days_used + EXTRACT(EPOCH FROM (now() - last_tick_at)) / 86400.0, total_days)
      ELSE LEAST(days_used, total_days)
    END,
    total_days = total_days + p_days,
    is_paused = false,
    paused_at = NULL,
    last_tick_at = now()
  WHERE id = v_existing_id
  RETURNING * INTO v_row;

  UPDATE public.profiles SET is_active = true WHERE id = p_user_id;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_subscription_days(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_subscription_days(uuid, integer) TO authenticated;
