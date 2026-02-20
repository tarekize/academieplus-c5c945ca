-- Créer des données de test pour les factures
-- Récupérer un utilisateur existant (le premier de la table profiles)
DO $$
DECLARE
  test_user_id uuid;
  test_plan_mensuel_id uuid;
  test_plan_annuel_id uuid;
  test_subscription_id uuid;
BEGIN
  -- Récupérer un utilisateur existant
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  -- Si un utilisateur existe, créer des données de test
  IF test_user_id IS NOT NULL THEN
    -- Récupérer les IDs des plans d'abonnement
    SELECT id INTO test_plan_mensuel_id FROM public.subscription_plans WHERE type = 'mensuel' LIMIT 1;
    SELECT id INTO test_plan_annuel_id FROM public.subscription_plans WHERE type = 'annuel' LIMIT 1;
    
    -- Créer un abonnement actif pour l'utilisateur
    INSERT INTO public.subscriptions (user_id, plan_id, status, start_date, end_date, auto_renew)
    VALUES (
      test_user_id,
      test_plan_mensuel_id,
      'active',
      NOW() - INTERVAL '3 months',
      NOW() + INTERVAL '1 month',
      true
    )
    RETURNING id INTO test_subscription_id;
    
    -- Créer des factures de test
    -- Facture 1 - Payée (il y a 3 mois)
    INSERT INTO public.invoices (
      user_id,
      subscription_id,
      amount_ht,
      tva_percentage,
      issue_date,
      paid_date,
      status,
      payment_method
    ) VALUES (
      test_user_id,
      test_subscription_id,
      4166.67,
      20.00,
      NOW() - INTERVAL '3 months',
      NOW() - INTERVAL '3 months' + INTERVAL '1 day',
      'paid',
      'Carte bancaire'
    );
    
    -- Facture 2 - Payée (il y a 2 mois)
    INSERT INTO public.invoices (
      user_id,
      subscription_id,
      amount_ht,
      tva_percentage,
      issue_date,
      paid_date,
      status,
      payment_method
    ) VALUES (
      test_user_id,
      test_subscription_id,
      4166.67,
      20.00,
      NOW() - INTERVAL '2 months',
      NOW() - INTERVAL '2 months' + INTERVAL '2 days',
      'paid',
      'Carte bancaire'
    );
    
    -- Facture 3 - Payée (il y a 1 mois)
    INSERT INTO public.invoices (
      user_id,
      subscription_id,
      amount_ht,
      tva_percentage,
      issue_date,
      paid_date,
      status,
      payment_method
    ) VALUES (
      test_user_id,
      test_subscription_id,
      4166.67,
      20.00,
      NOW() - INTERVAL '1 month',
      NOW() - INTERVAL '1 month' + INTERVAL '1 day',
      'paid',
      'Carte bancaire'
    );
    
    -- Facture 4 - Payée (mois en cours)
    INSERT INTO public.invoices (
      user_id,
      subscription_id,
      amount_ht,
      tva_percentage,
      issue_date,
      paid_date,
      status,
      payment_method
    ) VALUES (
      test_user_id,
      test_subscription_id,
      4166.67,
      20.00,
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '3 days',
      'paid',
      'Carte bancaire'
    );
    
    -- Facture 5 - En attente (prochaine facture)
    INSERT INTO public.invoices (
      user_id,
      subscription_id,
      amount_ht,
      tva_percentage,
      issue_date,
      due_date,
      status
    ) VALUES (
      test_user_id,
      test_subscription_id,
      4166.67,
      20.00,
      NOW(),
      NOW() + INTERVAL '7 days',
      'pending'
    );
    
    RAISE NOTICE 'Données de test créées pour l''utilisateur %', test_user_id;
  ELSE
    RAISE NOTICE 'Aucun utilisateur trouvé dans la table profiles';
  END IF;
END $$;
