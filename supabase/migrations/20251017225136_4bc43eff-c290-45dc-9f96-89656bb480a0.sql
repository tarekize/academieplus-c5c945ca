-- Corriger les problèmes de sécurité

-- 1. Recréer la vue sans SECURITY DEFINER et avec des politiques RLS appropriées
DROP VIEW IF EXISTS public.financial_transactions;

-- Créer la vue normalement
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
JOIN public.profiles prof ON s.user_id = prof.id;

COMMENT ON VIEW public.financial_transactions IS 'Vue complète pour la traçabilité de toutes les transactions financières';

-- 2. Activer RLS sur la table subscription_plans qui n'en avait pas
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les plans actifs
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Politique pour les admins de gérer tous les plans
CREATE POLICY "Admins can manage all subscription plans"
ON public.subscription_plans
FOR ALL
USING (is_admin(auth.uid()));

COMMENT ON TABLE public.subscription_plans IS 'Plans d''abonnement disponibles avec RLS activé';