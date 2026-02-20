
-- Créer une subscription de test pour le filleul
INSERT INTO subscriptions (user_id, plan_id, status, start_date, is_family_plan)
VALUES ('8dc9cef6-ca3e-4a91-b175-d498e1eaa18a', '60db278b-afc9-4c78-bd02-73604beee14f', 'active', NOW(), false);

-- Créer un paiement de test pour déclencher le système de crédits
-- Note: Le trigger add_referral_credit_on_payment va automatiquement:
-- 1. Créer le crédit de 5% pour le parrain
-- 2. Générer un code promo
-- 3. Appliquer la réduction de 5% au filleul
INSERT INTO subscription_payments (
  subscription_id, 
  amount_paid, 
  payment_date, 
  period_start_date, 
  period_end_date,
  monthly_price,
  months_count,
  status,
  payment_method,
  notes,
  is_family_plan
)
SELECT 
  s.id,
  1500, -- Prix du plan mensuel
  NOW(),
  NOW(),
  NOW() + INTERVAL '1 month',
  1500,
  1,
  'paid',
  'test',
  'Paiement de test pour valider le système de parrainage',
  false
FROM subscriptions s
WHERE s.user_id = '8dc9cef6-ca3e-4a91-b175-d498e1eaa18a'
ORDER BY s.created_at DESC
LIMIT 1;
