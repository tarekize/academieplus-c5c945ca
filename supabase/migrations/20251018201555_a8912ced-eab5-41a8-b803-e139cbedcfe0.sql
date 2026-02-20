-- Recréer la fonction activate_referral_on_first_payment
CREATE OR REPLACE FUNCTION public.activate_referral_on_first_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referee_id UUID;
  v_referrer_id UUID;
  v_referral_id UUID;
  v_discount_percentage NUMERIC := 5;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
  v_plan_billing_period text;
  v_pending_referral_code TEXT;
  v_base_price NUMERIC;
  v_plan_id UUID;
  v_is_family_plan BOOLEAN;
BEGIN
  SELECT s.user_id, s.plan_id, s.is_family_plan 
  INTO v_referee_id, v_plan_id, v_is_family_plan
  FROM subscriptions s
  WHERE s.id = NEW.subscription_id;
  
  IF NOT EXISTS (
    SELECT 1 
    FROM subscription_payments sp
    JOIN subscriptions s ON s.id = sp.subscription_id
    WHERE s.user_id = v_referee_id 
    AND sp.status = 'paid'
    AND sp.id != NEW.id
  ) THEN
    SELECT pending_referral_code INTO v_pending_referral_code
    FROM profiles
    WHERE id = v_referee_id;
    
    IF v_pending_referral_code IS NOT NULL THEN
      SELECT user_id INTO v_referrer_id
      FROM referral_codes
      WHERE code = v_pending_referral_code
      AND is_active = true
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        INSERT INTO referrals (
          referrer_id,
          referee_id,
          code_used,
          status,
          pending_validation,
          first_payment_date,
          first_subscription_id
        ) VALUES (
          v_referrer_id,
          v_referee_id,
          v_pending_referral_code,
          'active',
          FALSE,
          NEW.payment_date,
          NEW.subscription_id
        ) RETURNING id INTO v_referral_id;
        
        SELECT sp.billing_period INTO v_plan_billing_period
        FROM subscription_plans sp
        WHERE sp.id = v_plan_id;
        
        IF v_plan_billing_period = 'annual' THEN
          SELECT 
            CASE 
              WHEN v_is_family_plan THEN sp.price_family 
              ELSE sp.price_single 
            END INTO v_base_price
          FROM subscription_plans sp
          WHERE sp.id = v_plan_id;
          
          v_discount_amount := ROUND(v_base_price * (v_discount_percentage / 100), 2);
          v_final_amount := v_base_price - v_discount_amount;
          
          UPDATE referrals
          SET 
            referee_discount_applied = v_discount_amount,
            discount_applied_referee = TRUE
          WHERE id = v_referral_id;
          
          INSERT INTO referral_discount_history (
            referrer_id,
            referee_id,
            subscription_payment_id,
            original_price,
            discount_percentage,
            discount_amount,
            final_price,
            notes
          ) VALUES (
            v_referrer_id,
            v_referee_id,
            NEW.id,
            v_base_price,
            v_discount_percentage,
            v_discount_amount,
            v_final_amount,
            'Réduction de 5% appliquée au filleul lors de son premier paiement (formule annuelle)'
          );
          
          UPDATE subscription_payments
          SET 
            amount_paid = v_final_amount,
            notes = COALESCE(notes || ' | ', '') || 'Réduction parrainage filleul: -' || v_discount_amount || ' DA'
          WHERE id = NEW.id;
        END IF;
        
        UPDATE referral_codes
        SET is_active = FALSE
        WHERE code = v_pending_referral_code;
        
        UPDATE profiles
        SET pending_referral_code = NULL
        WHERE id = v_referee_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recréer add_referral_credit_on_payment
CREATE OR REPLACE FUNCTION public.add_referral_credit_on_payment()
RETURNS trigger
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
  v_base_price numeric;
  v_plan_billing_period text;
  v_is_family_plan boolean;
  v_plan_id uuid;
BEGIN
  IF NEW.status = 'paid' THEN
    SELECT s.user_id, s.is_family_plan, s.plan_id 
    INTO v_referee_id, v_is_family_plan, v_plan_id
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
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
        SELECT sp.billing_period INTO v_plan_billing_period
        FROM subscription_plans sp
        WHERE sp.id = v_plan_id;
        
        IF v_plan_billing_period = 'annual' THEN
          SELECT 
            CASE 
              WHEN v_is_family_plan THEN sp.price_family 
              ELSE sp.price_single 
            END INTO v_base_price
          FROM subscription_plans sp
          WHERE sp.id = v_plan_id;
          
          v_credit_amount := ROUND(v_base_price * (v_credit_percentage / 100), 2);
          
          INSERT INTO referral_credits (user_id, balance_euros, balance_percentage, last_updated)
          VALUES (v_referrer_id, v_credit_amount, v_credit_percentage, now())
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            balance_euros = referral_credits.balance_euros + v_credit_amount,
            balance_percentage = referral_credits.balance_percentage + v_credit_percentage,
            last_updated = now();
          
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
          
          DECLARE
            v_promo_code text;
            v_current_balance numeric;
          BEGIN
            SELECT balance_euros INTO v_current_balance
            FROM referral_credits
            WHERE user_id = v_referrer_id;
            
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
$function$;