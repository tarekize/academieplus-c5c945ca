-- La page de paiement demande à l'utilisateur de faire un virement / versement
-- EDAHABIA/CCP/bancaire, mais n'affiche jamais les coordonnées vers lesquelles
-- l'envoyer — impossible en l'état de réaliser ce versement. Cette table
-- stocke ces coordonnées (une seule ligne, singleton) pour qu'un admin puisse
-- les éditer depuis l'interface, sans jamais redéployer de code.
CREATE TABLE public.payment_bank_details (
  id boolean PRIMARY KEY DEFAULT true CONSTRAINT payment_bank_details_singleton CHECK (id),
  bank_name text,
  rib text,
  ccp_number text,
  ccp_key text,
  account_holder text,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.payment_bank_details (id) VALUES (true);

ALTER TABLE public.payment_bank_details ENABLE ROW LEVEL SECURITY;

-- Visible par tout utilisateur connecté (nécessaire pour payer), pas par anon
-- (évite d'exposer un RIB à un robot qui scrape le site sans compte).
CREATE POLICY "Authenticated users can view bank details"
  ON public.payment_bank_details FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can update bank details"
  ON public.payment_bank_details FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

NOTIFY pgrst, 'reload schema';
