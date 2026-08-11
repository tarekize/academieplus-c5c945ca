-- Le numéro de facture affiché (Factures.tsx) était recalculé à la volée
-- côté client à partir de la date + d'un fragment de l'UUID du paiement —
-- ni séquentiel, ni stable en base, ni garanti unique. Ajoute une vraie
-- séquence + colonne invoice_number générée automatiquement à l'insertion,
-- au format FA-<année>-<numéro sur 6 chiffres>, unique et définitive.
CREATE SEQUENCE IF NOT EXISTS public.payments_invoice_seq START 1;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS invoice_number text;

CREATE OR REPLACE FUNCTION public.set_payment_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'FA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.payments_invoice_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_payment_invoice_number ON public.payments;
CREATE TRIGGER trg_set_payment_invoice_number
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_payment_invoice_number();

-- Backfill des paiements existants, dans l'ordre chronologique.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id, created_at FROM public.payments WHERE invoice_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.payments
    SET invoice_number = 'FA-' || to_char(r.created_at, 'YYYY') || '-' || lpad(nextval('public.payments_invoice_seq')::text, 6, '0')
    WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.payments ALTER COLUMN invoice_number SET NOT NULL;
ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_number_unique UNIQUE (invoice_number);
