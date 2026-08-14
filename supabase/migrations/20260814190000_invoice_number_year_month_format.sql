-- Change le format du numéro de facture de FA-AAAA-NNNNNN (ex: FA-2026-000001)
-- vers FA-AA-MM-XX (ex: FA-26-08-01) : année sur 2 chiffres, mois, puis un
-- compteur qui repart de 1 chaque mois — à la demande du client.
-- Les factures déjà émises gardent leur ancien numéro (document immuable,
-- cf. commentaire de la table invoices : un numéro ne change jamais après
-- émission) ; seules les nouvelles factures utilisent le nouveau format.
--
-- Le compteur mensuel est géré par une table dédiée avec upsert atomique
-- (INSERT ... ON CONFLICT ... RETURNING) plutôt qu'un COUNT(*) sur invoices,
-- pour rester correct sous accès concurrents (deux paiements complétés au
-- même instant ne doivent jamais recevoir le même numéro).
CREATE TABLE IF NOT EXISTS public.invoice_month_counters (
  year_month text PRIMARY KEY,
  last_seq integer NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_month_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invoice counters"
  ON public.invoice_month_counters FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.create_invoice_for_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_year_month text := to_char(now(), 'YYMM');
  v_seq integer;
  v_invoice_number text;
BEGIN
  IF new.status = 'completed' AND (tg_op = 'INSERT' OR old.status IS DISTINCT FROM 'completed') THEN
    INSERT INTO public.invoice_month_counters (year_month, last_seq)
    VALUES (v_year_month, 1)
    ON CONFLICT (year_month) DO UPDATE SET last_seq = invoice_month_counters.last_seq + 1
    RETURNING last_seq INTO v_seq;

    v_invoice_number := 'FA-' || to_char(now(), 'YY') || '-' || to_char(now(), 'MM') || '-' || lpad(v_seq::text, 2, '0');

    INSERT INTO public.invoices (
      invoice_number, payment_id, user_id, amount, amount_ht, vat_rate, vat_amount, amount_ttc,
      period_start, period_end, plan_type, plan_label, is_family, children_count, issued_at
    )
    VALUES (
      v_invoice_number,
      new.id, new.user_id, new.amount, new.amount_ht, new.vat_rate, new.vat_amount, new.amount_ttc,
      new.period_start, new.period_end, new.plan_type, new.plan_label, new.is_family, new.children_count, now()
    )
    ON CONFLICT (payment_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;
