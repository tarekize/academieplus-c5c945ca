-- Créer une subscription et un paiement de test pour le filleul ttt@ttt.fr
DO $$
DECLARE
  v_subscription_id UUID;
  v_plan_id UUID := 'adce2840-b2d4-4f80-a3ca-e07b0ffa9f03'; -- Plan annuel
  v_user_id UUID := 'd49180b3-962f-4b19-b3f6-c79a8ecbe6cb'; -- ttt@ttt.fr
  v_amount NUMERIC := 1000; -- Montant annuel
BEGIN
  -- Créer l'abonnement
  INSERT INTO subscriptions (user_id, plan_id, status, is_family_plan, start_date, months_count)
  VALUES (v_user_id, v_plan_id, 'active', true, NOW(), 10)
  RETURNING id INTO v_subscription_id;
  
  -- Créer le paiement (cela déclenchera les triggers de parrainage)
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
    v_amount,
    NOW(),
    NOW(),
    NOW() + INTERVAL '10 months',
    'test',
    'paid',
    v_amount / 10,
    10,
    true
  );
END $$;