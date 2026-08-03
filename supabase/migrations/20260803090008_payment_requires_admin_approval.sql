-- CRITIQUE (C2) : record-payment marquait tout paiement 'completed' et
-- émettait des codes d'activation sur simple appel authentifié, sans
-- passerelle de paiement réelle (aucune intégration CIB/EDAHABIA/Chargily/
-- Stripe trouvée dans le code). En l'absence d'un vrai PSP à intégrer
-- (nécessite des identifiants marchands non disponibles ici), le correctif
-- responsable est : un paiement entre désormais en statut 'pending', et
-- seul un compte admin authentifié peut le faire passer à 'completed' (via
-- une vérification manuelle du virement/paiement réel) — ce qui génère
-- alors, et alors seulement, les codes d'activation.

ALTER TABLE public.payments ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

CREATE OR REPLACE FUNCTION public.admin_approve_payment(p_payment_id uuid)
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
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF v_payment.id IS NULL THEN
    RAISE EXCEPTION 'Paiement introuvable.';
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

CREATE OR REPLACE FUNCTION public.admin_reject_payment(p_payment_id uuid, p_reason text DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  UPDATE public.payments SET status = 'failed'
  WHERE id = p_payment_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Paiement introuvable ou déjà traité.';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_approve_payment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reject_payment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_approve_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_payment(uuid, text) TO authenticated;
