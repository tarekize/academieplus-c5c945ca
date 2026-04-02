-- Table pour les plans d'abonnement (mensuel, annuel)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('mensuel', 'annuel')),
  price_ht numeric(10, 2) NOT NULL,
  tva_percentage numeric(5, 2) NOT NULL DEFAULT 20.00,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les abonnements des utilisateurs
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending')) DEFAULT 'pending',
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  auto_renew boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les factures
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id),
  amount_ht numeric(10, 2) NOT NULL,
  tva_percentage numeric(5, 2) NOT NULL DEFAULT 20.00,
  tva_amount numeric(10, 2) NOT NULL,
  amount_ttc numeric(10, 2) NOT NULL,
  issue_date timestamp with time zone NOT NULL DEFAULT now(),
  due_date timestamp with time zone,
  paid_date timestamp with time zone,
  status text NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')) DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Trigger pour mettre à jour updated_at automatiquement (seulement pour les nouvelles tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscription_plans_updated_at') THEN
    CREATE TRIGGER update_subscription_plans_updated_at
      BEFORE UPDATE ON public.subscription_plans
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Activer RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies pour subscription_plans (tout le monde peut voir les plans disponibles)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Anyone can view active subscription plans') THEN
    CREATE POLICY "Anyone can view active subscription plans"
      ON public.subscription_plans
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Only admins can manage subscription plans') THEN
    CREATE POLICY "Only admins can manage subscription plans"
      ON public.subscription_plans
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Policies pour subscriptions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscriptions') THEN
    CREATE POLICY "Users can view their own subscriptions"
      ON public.subscriptions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert their own subscriptions') THEN
    CREATE POLICY "Users can insert their own subscriptions"
      ON public.subscriptions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update their own subscriptions') THEN
    CREATE POLICY "Users can update their own subscriptions"
      ON public.subscriptions
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Admins can view all subscriptions') THEN
    CREATE POLICY "Admins can view all subscriptions"
      ON public.subscriptions
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Admins can manage all subscriptions') THEN
    CREATE POLICY "Admins can manage all subscriptions"
      ON public.subscriptions
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Policies pour invoices
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can view their own invoices') THEN
    CREATE POLICY "Users can view their own invoices"
      ON public.invoices
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Admins can view all invoices') THEN
    CREATE POLICY "Admins can view all invoices"
      ON public.invoices
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Admins can manage all invoices') THEN
    CREATE POLICY "Admins can manage all invoices"
      ON public.invoices
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number text;
  year_part text;
  sequence_part text;
  count_invoices integer;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Compter les factures de l'année en cours
  SELECT COUNT(*) INTO count_invoices
  FROM public.invoices
  WHERE EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM NOW());
  
  -- Incrémenter et formater
  sequence_part := LPAD((count_invoices + 1)::text, 3, '0');
  
  new_number := 'FAC-' || year_part || '-' || sequence_part;
  
  RETURN new_number;
END;
$$;

-- Fonction pour calculer les montants de la facture
CREATE OR REPLACE FUNCTION public.calculate_invoice_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculer TVA et TTC si pas déjà définis
  IF NEW.tva_amount IS NULL THEN
    NEW.tva_amount := ROUND(NEW.amount_ht * (NEW.tva_percentage / 100), 2);
  END IF;
  
  IF NEW.amount_ttc IS NULL THEN
    NEW.amount_ttc := NEW.amount_ht + NEW.tva_amount;
  END IF;
  
  -- Générer le numéro de facture si pas défini
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := public.generate_invoice_number();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour calculer automatiquement les montants
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_invoice_amounts_trigger') THEN
    CREATE TRIGGER calculate_invoice_amounts_trigger
      BEFORE INSERT ON public.invoices
      FOR EACH ROW
      EXECUTE FUNCTION public.calculate_invoice_amounts();
  END IF;
END $$;

-- Insérer des plans d'abonnement par défaut
INSERT INTO public.subscription_plans (name, type, price_ht, tva_percentage, description, is_active)
VALUES 
  ('Abonnement Mensuel Standard', 'mensuel', 4166.67, 20.00, 'Accès complet à tous les cours pendant 1 mois', true),
  ('Abonnement Annuel Standard', 'annuel', 41666.67, 20.00, 'Accès complet à tous les cours pendant 1 an avec réduction', true)
ON CONFLICT DO NOTHING;
