-- BUG DE PERTE DE DONNÉES : redeem_activation_code() insérait systématiquement
-- une NOUVELLE ligne dans student_subscriptions à chaque code activé. Or tous
-- les points de lecture (useChatLimits.ts, AdminContrats.tsx) ne regardent
-- que "l'abonnement le plus récent par utilisateur" (order by created_at desc
-- limit 1) : si un élève avait encore des jours restants sur un abonnement en
-- cours et activait un second code (renouvellement anticipé, ou paiement
-- fait deux fois — anomalie remontée "pas de règle empêchant un double
-- paiement pendant un abonnement actif"), les jours restants de l'ancienne
-- ligne devenaient invisibles/perdus au profit de la nouvelle ligne fraîche
-- (days_used=0). Corrigé en réutilisant exactement le même pattern atomique
-- que admin_grant_subscription_days (20260723140100) : verrouille la ligne la
-- plus récente, crédite d'abord le temps déjà écoulé depuis last_tick_at dans
-- days_used, puis AJOUTE les nouveaux jours au total au lieu de repartir de
-- zéro. Aucun jour n'est plus perdu, et un second paiement pendant un
-- abonnement actif prolonge simplement l'abonnement au lieu d'être bloqué ou
-- de faire disparaître le crédit restant.
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
          THEN days_used + EXTRACT(EPOCH FROM (now() - last_tick_at)) / 86400.0
        ELSE days_used
      END,
      total_days = total_days + v_total_days,
      is_paused = false,
      paused_at = NULL,
      last_tick_at = now(),
      activation_code_id = v_code.id
    WHERE id = v_existing_id
    RETURNING * INTO v_sub;
  END IF;

  IF v_beneficiary = auth.uid() THEN
    UPDATE public.profiles SET is_active = true WHERE id = auth.uid();
  END IF;

  RETURN v_sub;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_activation_code(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(text, uuid) TO authenticated;
