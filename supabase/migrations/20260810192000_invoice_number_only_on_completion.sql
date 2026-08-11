-- Correction : la migration précédente assignait un invoice_number dès
-- l'INSERT, y compris pour un paiement encore 'pending' (non vérifié par un
-- admin) — une "facture" ne devrait exister que pour un paiement réellement
-- complété. Déplace l'attribution du numéro à la transition vers
-- 'completed' (INSERT direct en 'completed', ou UPDATE status -> 'completed'
-- via admin_approve_payment), et retire les numéros déjà attribués à des
-- paiements encore en attente.
CREATE OR REPLACE FUNCTION public.set_payment_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'FA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.payments_invoice_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_payment_invoice_number ON public.payments;
CREATE TRIGGER trg_set_payment_invoice_number
  BEFORE INSERT OR UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_payment_invoice_number();

ALTER TABLE public.payments ALTER COLUMN invoice_number DROP NOT NULL;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_invoice_number_unique;
ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_number_unique UNIQUE (invoice_number);

UPDATE public.payments SET invoice_number = NULL WHERE status <> 'completed';
