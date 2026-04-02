
-- Table for school year periods (admin configurable)
CREATE TABLE public.subscription_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active periods" ON public.subscription_periods
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage periods" ON public.subscription_periods
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Table for subscription pricing config
CREATE TABLE public.subscription_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type text NOT NULL CHECK (plan_type IN ('annual', 'monthly')),
  price_single integer NOT NULL,
  price_family integer NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view config" ON public.subscription_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage config" ON public.subscription_config
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Table for payment records
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL,
  plan_label text NOT NULL,
  amount integer NOT NULL,
  is_family boolean NOT NULL DEFAULT false,
  children_count integer NOT NULL DEFAULT 1,
  period_id uuid REFERENCES public.subscription_periods(id),
  payment_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial config
INSERT INTO public.subscription_config (plan_type, price_single, price_family, label) VALUES
  ('annual', 15000, 25000, 'Formule Scolaire'),
  ('monthly', 2000, 3500, 'Formule Mensuelle');
