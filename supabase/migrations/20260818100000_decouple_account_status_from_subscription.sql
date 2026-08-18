-- Clarification produit : il existe DEUX statuts distincts, qui ne doivent
-- jamais se piloter l'un l'autre :
--   1. Le statut du COMPTE (profiles.is_active) — contrôle uniquement l'accès
--      à la connexion. Un compte est actif dès l'inscription/vérification de
--      l'email, et le reste indépendamment de tout abonnement.
--   2. Le statut de l'ABONNEMENT (student_subscriptions / subscription_end_date)
--      — contrôle uniquement l'accès aux fonctionnalités premium (chatbot IA),
--      déjà lu séparément par useChatLimits/Account.tsx/ParentDashboard.tsx.
--
-- Deux bugs violaient cette séparation dans le sens opposé l'un de l'autre :
--   a) recompute_expired_contracts() (cron quotidien) désactivait le COMPTE
--      d'un élève/parent dès que son abonnement expirait — un élève sans
--      abonnement actif se retrouvait bloqué à la connexion, alors qu'il
--      devrait pouvoir se connecter (juste sans accès premium).
--   b) Le correctif précédent (20260818090000) faisait l'inverse : il
--      réactivait le COMPTE depuis les fonctions d'activation d'abonnement
--      (redeem_activation_code, admin_grant_subscription_days), couplant à
--      nouveau les deux statuts au lieu de les découpler.
--
-- Corrigé : le cron ne touche plus jamais is_active pour student/parent (le
-- bloc établissement, qui reflète un vrai contrat d'accès à la plateforme,
-- est conservé) ; les fonctions d'abonnement ne touchent plus is_active du
-- tout. Réactive aussi les comptes actuellement désactivés par le bug (a) —
-- seule cause automatique connue de désactivation pour ces rôles.

CREATE OR REPLACE FUNCTION public.recompute_expired_contracts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Établissements : force le re-déclenchement du trigger BEFORE UPDATE via un no-op.
  -- (Un contrat établissement expiré coupe réellement l'accès à la plateforme pour
  -- l'établissement et ses enseignants — ce n'est pas un abonnement premium élève,
  -- donc pas concerné par la séparation compte/abonnement ci-dessus.)
  UPDATE public.profiles p
  SET contract_end_date = p.contract_end_date
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'etablissement')
    AND (p.contract_start_date IS NOT NULL OR p.contract_end_date IS NOT NULL);
END;
$$;

UPDATE public.profiles p
SET is_active = true
WHERE p.is_active = false
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('student', 'parent')
  );

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

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_subscription_days(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_subscription_days(uuid, integer) TO authenticated;
