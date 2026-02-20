-- Ajouter des colonnes pour une traçabilité complète des transactions

-- Ajouter des colonnes à la table subscriptions pour tracer les détails
ALTER TABLE public.subscriptions
ADD COLUMN is_family_plan boolean DEFAULT false,
ADD COLUMN months_count integer DEFAULT 1 CHECK (months_count >= 1 AND months_count <= 10);

COMMENT ON COLUMN public.subscriptions.is_family_plan IS 'Indique si c''est une formule famille (true) ou 1 enfant (false)';
COMMENT ON COLUMN public.subscriptions.months_count IS 'Nombre de mois de l''abonnement (1-9 pour mensuel, 10 pour annuel)';

-- Ajouter des colonnes à subscription_payments pour tracer les détails financiers
ALTER TABLE public.subscription_payments
ADD COLUMN monthly_price numeric NOT NULL DEFAULT 0,
ADD COLUMN months_count integer NOT NULL DEFAULT 1 CHECK (months_count >= 1 AND months_count <= 10),
ADD COLUMN is_family_plan boolean DEFAULT false,
ADD COLUMN total_amount numeric GENERATED ALWAYS AS (monthly_price * months_count) STORED;

COMMENT ON COLUMN public.subscription_payments.monthly_price IS 'Prix mensuel unitaire appliqué';
COMMENT ON COLUMN public.subscription_payments.months_count IS 'Nombre de mois payés dans cette transaction';
COMMENT ON COLUMN public.subscription_payments.is_family_plan IS 'Indique si le paiement concerne une formule famille';
COMMENT ON COLUMN public.subscription_payments.total_amount IS 'Montant total calculé automatiquement (monthly_price × months_count)';

-- Créer un index pour faciliter les requêtes de traçabilité
CREATE INDEX idx_subscription_payments_transaction_details 
ON public.subscription_payments(payment_date, is_family_plan, months_count);

-- Créer une vue pour la traçabilité financière complète
CREATE OR REPLACE VIEW public.financial_transactions AS
SELECT 
  sp.id AS payment_id,
  sp.payment_date,
  sp.amount_paid,
  sp.monthly_price,
  sp.months_count,
  sp.total_amount,
  sp.is_family_plan,
  sp.status,
  sp.payment_method,
  sp.period_start_date,
  sp.period_end_date,
  s.user_id,
  s.plan_id,
  s.status AS subscription_status,
  p.name AS plan_name,
  p.billing_period,
  prof.full_name AS user_name,
  prof.email AS user_email
FROM public.subscription_payments sp
JOIN public.subscriptions s ON sp.subscription_id = s.id
JOIN public.subscription_plans p ON s.plan_id = p.id
JOIN public.profiles prof ON s.user_id = prof.id
ORDER BY sp.payment_date DESC;

COMMENT ON VIEW public.financial_transactions IS 'Vue complète pour la traçabilité de toutes les transactions financières';

-- Politique RLS pour la vue (admin seulement)
ALTER VIEW public.financial_transactions SET (security_invoker = on);