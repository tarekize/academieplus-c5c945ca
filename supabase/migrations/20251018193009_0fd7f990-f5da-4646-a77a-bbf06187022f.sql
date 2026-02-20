
-- Créer un abonnement annuel pour tester le parrainage
DO $$
DECLARE
  v_user_id UUID := 'ef14e2f3-f9e0-480c-83c5-56491728f08b';
  v_plan_id UUID;
  v_subscription_id UUID;
  v_referral_code TEXT := 'DF90E84D';
BEGIN
  -- Récupérer le plan annuel
  SELECT id INTO v_plan_id
  FROM subscription_plans
  WHERE billing_period = 'annual'
  LIMIT 1;
  
  -- Créer l'abonnement
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    is_family_plan,
    status,
    start_date
  ) VALUES (
    v_user_id,
    v_plan_id,
    false,
    'pending',
    NOW()
  ) RETURNING id INTO v_subscription_id;
  
  -- Créer le paiement (950 DA car réduction de 5% sur 1000 DA)
  INSERT INTO subscription_payments (
    subscription_id,
    amount_paid,
    payment_date,
    period_start_date,
    period_end_date,
    payment_method,
    status,
    monthly_price,
    months_count,
    is_family_plan
  ) VALUES (
    v_subscription_id,
    9500, -- 9500 DA avec réduction de 5%
    NOW(),
    NOW(),
    NOW() + INTERVAL '10 months',
    'virement',
    'paid',
    1000,
    10,
    false
  );
  
END $$;
