
-- Table for activation codes generated after payment
CREATE TABLE public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  plan_type text NOT NULL, -- 'monthly' or 'annual'
  is_family boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'free', -- 'free' or 'used'
  used_by uuid DEFAULT NULL,
  used_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Creator (parent) can see their codes
CREATE POLICY "Creators can view their codes" ON public.activation_codes
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

-- Users can view codes they used
CREATE POLICY "Users can view codes they used" ON public.activation_codes
  FOR SELECT TO authenticated
  USING (auth.uid() = used_by);

-- Authenticated users can insert codes (after payment)
CREATE POLICY "Authenticated can insert codes" ON public.activation_codes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update code status (activate)
CREATE POLICY "Authenticated can update codes" ON public.activation_codes
  FOR UPDATE TO authenticated
  USING (status = 'free');

-- Admins can manage all codes
CREATE POLICY "Admins can manage codes" ON public.activation_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Table for student subscriptions with pause/resume
CREATE TABLE public.student_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activation_code_id uuid REFERENCES public.activation_codes(id) ON DELETE SET NULL,
  plan_type text NOT NULL, -- 'monthly' or 'annual'
  total_days integer NOT NULL, -- 30 or 360
  days_used numeric(10,4) NOT NULL DEFAULT 0,
  is_paused boolean NOT NULL DEFAULT false,
  paused_at timestamp with time zone DEFAULT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  last_tick_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.student_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions" ON public.student_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions (pause/resume)
CREATE POLICY "Users can update own subscriptions" ON public.student_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins manage subscriptions" ON public.student_subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Parents can view their children's subscriptions
CREATE POLICY "Parents can view children subscriptions" ON public.student_subscriptions
  FOR SELECT TO authenticated
  USING (is_parent_of(auth.uid(), user_id));

-- Function to generate a random 8-char activation code
CREATE OR REPLACE FUNCTION public.generate_activation_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT upper(encode(gen_random_bytes(4), 'hex'))
$$;
