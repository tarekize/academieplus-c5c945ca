-- Créer une subscription de test pour le filleul aaaa@aze.fr
DO $$
DECLARE
  v_subscription_id UUID;
  v_plan_id UUID := 'adce2840-b2d4-4f80-a3ca-e07b0ffa9f03';
  v_user_id UUID := '0a2cb5b0-9655-441e-a4b2-e36fe44257e6';
  v_amount NUMERIC := 1000;
BEGIN
  -- Créer l'abonnement
  INSERT INTO subscriptions (user_id, plan_id, status, is_family_plan, start_date, months_count)
  VALUES (v_user_id, v_plan_id, 'active', false, NOW(), 10)
  RETURNING id INTO v_subscription_id;
  
  -- Créer le paiement (cela déclenchera les triggers) - sans total_amount car c'est une colonne générée
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
    false
  );
END $$;