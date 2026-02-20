-- Créer des données de test pour l'utilisateur actuellement connecté
DO $$
DECLARE
  current_user_id uuid := '8faad60b-82ba-4ec0-92fc-dbe99fd92eb7';
  test_plan_mensuel_id uuid;
  test_subscription_id uuid;
BEGIN
  -- Récupérer le plan mensuel
  SELECT id INTO test_plan_mensuel_id FROM public.subscription_plans WHERE type = 'mensuel' LIMIT 1;
  
  -- Créer un abonnement pour cet utilisateur
  INSERT INTO public.subscriptions (user_id, plan_id, status, start_date, end_date, auto_renew)
  VALUES (
    current_user_id,
    test_plan_mensuel_id,
    'active',
    NOW() - INTERVAL '3 months',
    NOW() + INTERVAL '1 month',
    true
  )
  RETURNING id INTO test_subscription_id;
  
  -- Créer des factures
  INSERT INTO public.invoices (user_id, subscription_id, amount_ht, tva_percentage, issue_date, paid_date, status, payment_method)
  VALUES 
    (current_user_id, test_subscription_id, 4166.67, 20.00, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '1 day', 'paid', 'Carte bancaire'),
    (current_user_id, test_subscription_id, 4166.67, 20.00, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '2 days', 'paid', 'Carte bancaire'),
    (current_user_id, test_subscription_id, 4166.67, 20.00, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '1 day', 'paid', 'Carte bancaire'),
    (current_user_id, test_subscription_id, 4166.67, 20.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 'paid', 'Carte bancaire'),
    (current_user_id, test_subscription_id, 4166.67, 20.00, NOW(), NOW() + INTERVAL '7 days', 'pending', NULL);
    
  RAISE NOTICE 'Factures créées pour l''utilisateur aze@aze.fr';
END $$;
