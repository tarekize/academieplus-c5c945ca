-- Corriger le calcul du crédit parrain pour utiliser 10 mois au lieu de 12
-- Le crédit doit être de 5% sur le montant total de la formule annuelle (10 mois)

CREATE OR REPLACE FUNCTION public.add_referral_credit_on_payment()
RETURNS trigger
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
BEGIN
  -- Vérifier que c'est un paiement réussi
  IF NEW.status = 'paid' THEN
    -- Récupérer l'user_id du filleul depuis la subscription
    SELECT s.user_id INTO v_referee_id
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
      -- Récupérer le parrain
      SELECT r.referrer_id, r.id INTO v_referrer_id, v_referral_id
      FROM referrals r
      WHERE r.referee_id = v_referee_id
      AND r.status = 'active'
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Calculer le montant total de la formule annuelle (10 mois)
        -- Le crédit est de 5% sur ce montant total
        v_annual_amount := NEW.monthly_price * 10;
        
        -- Calculer le crédit (5% du montant annuel sur 10 mois)
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
          'Crédit gagné grâce au parrainage (5% sur formule annuelle 10 mois)'
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
  
  RETURN NEW;
END;
$$;