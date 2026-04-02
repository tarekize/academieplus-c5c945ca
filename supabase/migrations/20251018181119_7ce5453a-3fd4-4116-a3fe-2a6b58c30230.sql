-- Modifier le trigger add_referral_credit_on_payment pour s'assurer qu'il fonctionne avec le nouveau système
CREATE OR REPLACE FUNCTION public.add_referral_credit_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referee_id uuid;
  v_referrer_id uuid;
  v_referral_id uuid;
  v_credit_amount numeric;
  v_credit_percentage numeric := 5;
  v_annual_amount numeric;
  v_plan_billing_period text;
  v_is_family_plan boolean;
BEGIN
  -- Vérifier que c'est un paiement réussi
  IF NEW.status = 'paid' THEN
    -- Récupérer l'user_id du filleul depuis la subscription
    SELECT s.user_id, s.is_family_plan INTO v_referee_id, v_is_family_plan
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
    -- Vérifier si c'est le premier paiement du filleul ET qu'il y a un parrainage
    IF NOT EXISTS (
      SELECT 1 
      FROM subscription_payments sp
      JOIN subscriptions s ON s.id = sp.subscription_id
      WHERE s.user_id = v_referee_id 
      AND sp.status = 'paid'
      AND sp.id != NEW.id
    ) THEN
      -- Récupérer le parrain via la table referrals (créée par activate_referral_on_first_payment)
      SELECT r.referrer_id, r.id INTO v_referrer_id, v_referral_id
      FROM referrals r
      WHERE r.referee_id = v_referee_id
      AND r.status = 'active'
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Récupérer le type de formule (monthly ou annual)
        SELECT sp.billing_period INTO v_plan_billing_period
        FROM subscription_plans sp
        WHERE sp.id = (SELECT plan_id FROM subscriptions WHERE id = NEW.subscription_id);
        
        -- Calculer le crédit UNIQUEMENT pour les formules annuelles
        IF v_plan_billing_period = 'annual' THEN
          -- Pour une formule annuelle : le crédit est 5% du montant total payé
          v_annual_amount := NEW.amount_paid;
          v_credit_amount := ROUND(v_annual_amount * (v_credit_percentage / 100), 2);
          
          -- Créer ou mettre à jour le solde de crédit du parrain
          INSERT INTO referral_credits (user_id, balance_euros, balance_percentage, last_updated)
          VALUES (v_referrer_id, v_credit_amount, v_credit_percentage, now())
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            balance_euros = referral_credits.balance_euros + v_credit_amount,
            balance_percentage = referral_credits.balance_percentage + v_credit_percentage,
            last_updated = now();
          
          -- Enregistrer la transaction
          INSERT INTO credit_transactions (
            user_id,
            amount_euros,
            amount_percentage,
            transaction_type,
            referral_id,
            subscription_payment_id,
            description
          ) VALUES (
            v_referrer_id,
            v_credit_amount,
            v_credit_percentage,
            'earned',
            v_referral_id,
            NEW.id,
            'Crédit gagné grâce au parrainage (5% sur formule annuelle ' || 
            CASE WHEN v_is_family_plan THEN 'famille' ELSE 'enfant' END || ')'
          );
          
          -- Générer automatiquement un code promo pour le montant total du crédit
          DECLARE
            v_promo_code text;
            v_current_balance numeric;
          BEGIN
            -- Récupérer le solde actuel
            SELECT balance_euros INTO v_current_balance
            FROM referral_credits
            WHERE user_id = v_referrer_id;
            
            -- Générer le code promo
            v_promo_code := generate_promo_code();
            
            INSERT INTO promo_codes (
              code,
              user_id,
              discount_euros,
              discount_percentage,
              used
            ) VALUES (
              v_promo_code,
              v_referrer_id,
              v_current_balance,
              v_credit_percentage,
              false
            );
          END;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;