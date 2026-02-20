-- Supprimer l'ancien trigger BEFORE INSERT
DROP TRIGGER IF EXISTS activate_referral_on_first_payment ON subscription_payments;

-- Créer un nouveau trigger AFTER INSERT pour qu'il se déclenche après la création du paiement
CREATE TRIGGER activate_referral_on_first_payment
AFTER INSERT ON subscription_payments
FOR EACH ROW
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION activate_referral_on_first_payment();

-- Modifier légèrement la fonction pour ne pas modifier NEW (car c'est un AFTER trigger)
CREATE OR REPLACE FUNCTION public.activate_referral_on_first_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referee_id UUID;
  v_referrer_id UUID;
  v_referral_id UUID;
  v_discount_percentage NUMERIC := 5;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
  v_plan_billing_period text;
  v_pending_referral_code TEXT;
BEGIN
  -- Récupérer l'ID du filleul
  SELECT s.user_id INTO v_referee_id
  FROM subscriptions s
  WHERE s.id = NEW.subscription_id;
  
  -- Vérifier si c'est le premier paiement du filleul
  IF NOT EXISTS (
    SELECT 1 
    FROM subscription_payments sp
    JOIN subscriptions s ON s.id = sp.subscription_id
    WHERE s.user_id = v_referee_id 
    AND sp.status = 'paid'
    AND sp.id != NEW.id
  ) THEN
    -- Récupérer le code de parrainage en attente depuis le profil
    SELECT pending_referral_code INTO v_pending_referral_code
    FROM profiles
    WHERE id = v_referee_id;
    
    IF v_pending_referral_code IS NOT NULL THEN
      -- Récupérer l'ID du parrain via le code
      SELECT user_id INTO v_referrer_id
      FROM referral_codes
      WHERE code = v_pending_referral_code
      AND is_active = true
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Créer la relation de parrainage maintenant
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
        
        -- Récupérer le type de formule
        SELECT sp.billing_period INTO v_plan_billing_period
        FROM subscription_plans sp
        WHERE sp.id = (SELECT plan_id FROM subscriptions WHERE id = NEW.subscription_id);
        
        -- Appliquer la réduction UNIQUEMENT pour les formules annuelles
        IF v_plan_billing_period = 'annual' THEN
          -- Calculer la réduction de 5%
          v_discount_amount := ROUND(NEW.amount_paid * (v_discount_percentage / 100), 2);
          v_final_amount := NEW.amount_paid - v_discount_amount;
          
          -- Mettre à jour le referral avec les infos de réduction
          UPDATE referrals
          SET 
            referee_discount_applied = v_discount_amount,
            discount_applied_referee = TRUE
          WHERE id = v_referral_id;
          
          -- Enregistrer dans l'historique
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
            NEW.amount_paid,
            v_discount_percentage,
            v_discount_amount,
            v_final_amount,
            'Réduction de 5% appliquée au filleul lors de son premier paiement (formule annuelle)'
          );
          
          -- Mettre à jour le montant du paiement avec la réduction
          UPDATE subscription_payments
          SET 
            amount_paid = v_final_amount,
            notes = COALESCE(notes || ' | ', '') || 'Réduction parrainage filleul: -' || v_discount_amount || ' DA'
          WHERE id = NEW.id;
        END IF;
        
        -- Désactiver le code de parrainage car il a été utilisé
        UPDATE referral_codes
        SET is_active = FALSE
        WHERE code = v_pending_referral_code;
        
        -- Nettoyer le code en attente du profil
        UPDATE profiles
        SET pending_referral_code = NULL
        WHERE id = v_referee_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;