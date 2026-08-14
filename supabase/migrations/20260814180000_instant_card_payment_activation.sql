-- Active instantanément un abonnement payé par carte (sans validation admin
-- manuelle), à la demande explicite du client : le formulaire carte est pour
-- l'instant un test, aucune passerelle de paiement réelle n'est branchée.
-- Le virement bancaire garde la validation admin manuelle (un humain doit
-- vérifier le reçu réel).
--
-- Miroir de admin_approve_payment (mêmes étapes : verrou de ligne, passage à
-- 'completed', émission des codes d'activation), mais sans vérification de
-- rôle admin — la restriction d'accès est assurée par REVOKE/GRANT EXECUTE
-- ci-dessous (accordé au seul service_role), pas par un check interne : à
-- l'intérieur d'une fonction SECURITY DEFINER, current_user reflète le
-- PROPRIÉTAIRE de la fonction, pas l'appelant — un check "current_user =
-- service_role" dans le corps de la fonction bloquerait donc aussi
-- l'appelant légitime. Seule l'edge function record-payment (via la clé
-- service_role, jamais exposée au client) peut donc l'appeler, juste après
-- avoir inséré un paiement par carte ; un utilisateur authentifié qui tente
-- de l'appeler reçoit "permission denied for function" avant même d'entrer
-- dans le corps de la fonction (vérifié empiriquement).
CREATE OR REPLACE FUNCTION public.complete_card_payment(p_payment_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_payment public.payments;
  v_codes text[] := '{}';
  v_code text;
  i integer;
BEGIN
  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF v_payment.id IS NULL THEN
    RAISE EXCEPTION 'Paiement introuvable.';
  END IF;
  IF v_payment.payment_method <> 'card' THEN
    RAISE EXCEPTION 'Activation instantanée réservée aux paiements par carte.';
  END IF;
  IF v_payment.status <> 'pending' THEN
    RAISE EXCEPTION 'Ce paiement n''est plus en attente (statut actuel : %).', v_payment.status;
  END IF;

  UPDATE public.payments SET status = 'completed' WHERE id = p_payment_id;

  FOR i IN 1..GREATEST(v_payment.children_count, 1) LOOP
    SELECT public.generate_activation_code() INTO v_code;
    INSERT INTO public.activation_codes (code, payment_id, created_by, plan_type, is_family, status)
    VALUES (
      v_code, p_payment_id, v_payment.user_id,
      CASE WHEN v_payment.plan_type = 'annual' THEN 'annual' ELSE 'monthly' END,
      v_payment.is_family, 'free'
    );
    v_codes := array_append(v_codes, v_code);
  END LOOP;

  RETURN v_codes;
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_card_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_card_payment(uuid) FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.complete_card_payment(uuid) TO service_role;
