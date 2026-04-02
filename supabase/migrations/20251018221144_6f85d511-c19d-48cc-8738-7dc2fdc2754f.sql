-- Modifier la fonction add_referral_credit_on_payment pour mettre à jour un code promo unique
CREATE OR REPLACE FUNCTION public.add_referral_credit_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referee_id uuid;
  v_referrer_id uuid;
  v_referral_id uuid;
  v_credit_amount numeric;
  v_credit_percentage numeric := 5;
  v_base_price_monthly numeric;
  v_base_price_total numeric;
  v_plan_billing_period text;
  v_is_family_plan boolean;
  v_plan_id uuid;
  v_duration_months integer;
  v_existing_promo_id uuid;
  v_promo_code text;
  v_current_balance numeric;
BEGIN
  IF NEW.status = 'paid' THEN
    SELECT s.user_id, s.is_family_plan, s.plan_id 
    INTO v_referee_id, v_is_family_plan, v_plan_id
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
    -- Vérifier que c'est le premier paiement du filleul
    IF NOT EXISTS (
      SELECT 1 
      FROM subscription_payments sp
      JOIN subscriptions s ON s.id = sp.subscription_id
      WHERE s.user_id = v_referee_id 
      AND sp.status = 'paid'
      AND sp.id != NEW.id
    ) THEN
      SELECT r.referrer_id, r.id INTO v_referrer_id, v_referral_id
      FROM referrals r
      WHERE r.referee_id = v_referee_id
      AND r.status = 'active'
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        SELECT sp.billing_period, sp.duration_months INTO v_plan_billing_period, v_duration_months
        FROM subscription_plans sp
        WHERE sp.id = v_plan_id;
        
        -- Crédit uniquement pour les formules annuelles (scolaires)
        IF v_plan_billing_period = 'annual' THEN
          -- Récupérer le prix mensuel
          SELECT 
            CASE 
              WHEN v_is_family_plan THEN sp.price_family 
              ELSE sp.price_single 
            END INTO v_base_price_monthly
          FROM subscription_plans sp
          WHERE sp.id = v_plan_id;
          
          -- Calculer le prix total sur la durée (10 mois pour formule scolaire)
          v_base_price_total := v_base_price_monthly * v_duration_months;
          
          -- Calculer le crédit de 5% sur le prix TOTAL
          v_credit_amount := ROUND(v_base_price_total * (v_credit_percentage / 100), 2);
          
          -- Mettre à jour ou créer le solde de crédit
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
            'Crédit gagné grâce au parrainage (5% sur formule scolaire ' || 
            CASE WHEN v_is_family_plan THEN 'famille' ELSE '1 enfant' END || 
            ' - ' || v_duration_months || ' mois = ' || v_base_price_total || ' DA)'
          );
          
          -- Récupérer le solde total actuel
          SELECT balance_euros INTO v_current_balance
          FROM referral_credits
          WHERE user_id = v_referrer_id;
          
          -- Vérifier s'il existe déjà un code promo non utilisé pour cet utilisateur
          SELECT id, code INTO v_existing_promo_id, v_promo_code
          FROM promo_codes
          WHERE user_id = v_referrer_id
          AND used = false
          LIMIT 1;
          
          IF v_existing_promo_id IS NOT NULL THEN
            -- Mettre à jour le code promo existant avec le nouveau solde
            UPDATE promo_codes
            SET 
              discount_euros = v_current_balance,
              discount_percentage = v_credit_percentage
            WHERE id = v_existing_promo_id;
          ELSE
            -- Créer un nouveau code promo avec le solde total
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
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;