-- =====================================================
-- SYSTÈME D'ABONNEMENTS FAMILIAUX
-- =====================================================

-- 1. Recréer la table subscription_plans avec les nouvelles formules
DROP TABLE IF EXISTS subscription_plans CASCADE;

CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  duration_months integer NOT NULL,
  price_single numeric NOT NULL CHECK (price_single > 0),
  price_family numeric NOT NULL CHECK (price_family > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(billing_period)
);

-- Insérer les formules tarifaires
INSERT INTO subscription_plans (name, billing_period, duration_months, price_single, price_family) VALUES
  ('Formule Mensuelle', 'monthly', 1, 1500, 2500),
  ('Formule Annuelle (10 mois)', 'annual', 10, 1000, 1500);

-- 2. Modifier la table subscriptions pour lier uniquement aux parents
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_plan_id_fkey 
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT;

-- Ajouter un index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- 3. Créer la table des paiements
CREATE TABLE IF NOT EXISTS subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount_paid numeric NOT NULL CHECK (amount_paid > 0),
  payment_date timestamptz NOT NULL DEFAULT now(),
  period_start_date timestamptz NOT NULL,
  period_end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_end_date > period_start_date)
);

-- Index pour vérifier rapidement le statut actif
CREATE INDEX IF NOT EXISTS idx_payments_subscription_period ON subscription_payments(subscription_id, period_end_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status_date ON subscription_payments(status, payment_date);

-- Enable RLS
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour subscription_payments
CREATE POLICY "Users can view their own payments"
  ON subscription_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_payments.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own payments"
  ON subscription_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_payments.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON subscription_payments FOR ALL
  USING (is_admin(auth.uid()));

-- 4. Fonction pour compter les membres du groupe familial
CREATE OR REPLACE FUNCTION get_family_member_count(parent_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 1 + COUNT(*)::integer
  FROM parent_children pc
  JOIN profiles p ON p.id = pc.child_id
  WHERE pc.parent_id = parent_id
  AND p.account_active = true;
$$;

-- 5. Fonction pour calculer le prix de l'abonnement
CREATE OR REPLACE FUNCTION calculate_subscription_price(plan_id uuid, parent_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_count integer;
  plan_data record;
BEGIN
  -- Compter les membres du groupe familial
  member_count := get_family_member_count(parent_id);
  
  -- Récupérer les prix du plan
  SELECT price_single, price_family INTO plan_data
  FROM subscription_plans
  WHERE id = plan_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found or inactive';
  END IF;
  
  -- Retourner le prix selon le nombre de personnes
  IF member_count = 1 THEN
    RETURN plan_data.price_single;
  ELSE
    RETURN plan_data.price_family;
  END IF;
END;
$$;

-- 6. Fonction pour calculer la date de fin de période
CREATE OR REPLACE FUNCTION calculate_period_end_date(start_date timestamptz, plan_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  duration integer;
BEGIN
  SELECT duration_months INTO duration
  FROM subscription_plans
  WHERE id = plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;
  
  RETURN start_date + (duration || ' months')::interval;
END;
$$;

-- 7. Fonction pour vérifier si un abonnement est actif
CREATE OR REPLACE FUNCTION is_subscription_active(subscription_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM subscription_payments
    WHERE subscription_payments.subscription_id = is_subscription_active.subscription_id
    AND subscription_payments.status = 'paid'
    AND now() >= subscription_payments.period_start_date
    AND now() < subscription_payments.period_end_date
  );
$$;

-- 8. Vue pour récupérer facilement l'abonnement actif avec toutes les infos
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.id AS subscription_id,
  s.user_id AS parent_id,
  p.full_name AS parent_name,
  sp.name AS plan_name,
  sp.billing_period,
  sp.duration_months,
  get_family_member_count(s.user_id) AS family_member_count,
  calculate_subscription_price(s.plan_id, s.user_id) AS current_price,
  last_payment.amount_paid AS last_payment_amount,
  last_payment.payment_date,
  last_payment.period_start_date,
  last_payment.period_end_date,
  last_payment.status AS payment_status,
  CASE 
    WHEN now() >= last_payment.period_start_date AND now() < last_payment.period_end_date 
    THEN true 
    ELSE false 
  END AS is_active,
  s.created_at AS subscription_created_at
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
JOIN subscription_plans sp ON sp.id = s.plan_id
LEFT JOIN LATERAL (
  SELECT * FROM subscription_payments
  WHERE subscription_payments.subscription_id = s.id
  AND subscription_payments.status = 'paid'
  ORDER BY period_end_date DESC
  LIMIT 1
) last_payment ON true
WHERE s.status = 'active';

-- RLS pour la vue
ALTER VIEW active_subscriptions SET (security_invoker = on);

-- 9. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 10. Fonction helper pour créer un paiement
CREATE OR REPLACE FUNCTION create_subscription_payment(
  p_subscription_id uuid,
  p_payment_date timestamptz DEFAULT now(),
  p_payment_method text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount numeric;
  v_plan_id uuid;
  v_user_id uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_payment_id uuid;
BEGIN
  -- Récupérer les infos de l'abonnement
  SELECT s.plan_id, s.user_id INTO v_plan_id, v_user_id
  FROM subscriptions s
  WHERE s.id = p_subscription_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Calculer le montant
  v_amount := calculate_subscription_price(v_plan_id, v_user_id);
  
  -- Calculer les dates de période
  v_period_start := p_payment_date;
  v_period_end := calculate_period_end_date(v_period_start, v_plan_id);
  
  -- Créer le paiement
  INSERT INTO subscription_payments (
    subscription_id,
    amount_paid,
    payment_date,
    period_start_date,
    period_end_date,
    payment_method,
    status
  ) VALUES (
    p_subscription_id,
    v_amount,
    p_payment_date,
    v_period_start,
    v_period_end,
    p_payment_method,
    'paid'
  ) RETURNING id INTO v_payment_id;
  
  -- Mettre à jour le statut de l'abonnement
  UPDATE subscriptions 
  SET status = 'active', updated_at = now()
  WHERE id = p_subscription_id;
  
  RETURN v_payment_id;
END;
$$;

-- Commentaires pour documentation
COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement avec tarifs individuels et familiaux';
COMMENT ON TABLE subscription_payments IS 'Historique des paiements avec périodes d''activité';
COMMENT ON FUNCTION get_family_member_count IS 'Compte le parent + enfants actifs dans le groupe familial';
COMMENT ON FUNCTION calculate_subscription_price IS 'Calcule le prix selon le nombre de personnes (1 = single, 2-3 = family)';
COMMENT ON FUNCTION is_subscription_active IS 'Vérifie si un abonnement est actuellement actif';
COMMENT ON FUNCTION create_subscription_payment IS 'Crée un nouveau paiement et active l''abonnement pour la période';