
-- Supprimer l'ancien trigger qui ne fonctionne pas correctement
DROP TRIGGER IF EXISTS activate_referral_on_first_payment ON subscription_payments;

-- Recréer le trigger avec la logique corrigée
CREATE OR REPLACE FUNCTION public.activate_referral_on_first_payment()
RETURNS TRIGGER
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
BEGIN
  IF NEW.status = 'paid' THEN
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
      -- Vérifier s'il y a un parrainage actif pour ce filleul
      SELECT r.id, r.referrer_id INTO v_referral_id, v_referrer_id
      FROM referrals r
      WHERE r.referee_id = v_referee_id
      AND r.status = 'active'
      AND r.first_payment_date IS NULL
      LIMIT 1;
      
      IF v_referrer_id IS NOT NULL THEN
        -- Calculer la réduction de 5%
        v_discount_amount := ROUND(NEW.amount_paid * (v_discount_percentage / 100), 2);
        v_final_amount := NEW.amount_paid - v_discount_amount;
        
        -- Mettre à jour le referral
        UPDATE referrals
        SET 
          first_payment_date = NEW.payment_date,
          first_subscription_id = NEW.subscription_id,
          pending_validation = TRUE,
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
          'Réduction de 5% appliquée au filleul lors de son premier paiement'
        );
        
        -- Mettre à jour le montant du paiement avec la réduction
        NEW.amount_paid := v_final_amount;
        NEW.notes := COALESCE(NEW.notes || ' | ', '') || 'Réduction parrainage: -' || v_discount_amount || ' DA';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recréer le trigger
CREATE TRIGGER activate_referral_on_first_payment
  BEFORE INSERT ON subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_referral_on_first_payment();

-- Appliquer manuellement la réduction pour le paiement test existant
DO $$
DECLARE
  v_payment_id UUID;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
BEGIN
  -- Récupérer le dernier paiement du filleul
  SELECT sp.id INTO v_payment_id
  FROM subscription_payments sp
  JOIN subscriptions s ON s.id = sp.subscription_id
  WHERE s.user_id = '8dc9cef6-ca3e-4a91-b175-d498e1eaa18a'
  ORDER BY sp.payment_date DESC
  LIMIT 1;
  
  IF v_payment_id IS NOT NULL THEN
    -- Calculer la réduction
    v_discount_amount := ROUND(1500 * 0.05, 2); -- 75 DA
    v_final_amount := 1500 - v_discount_amount; -- 1425 DA
    
    -- Mettre à jour le paiement
    UPDATE subscription_payments
    SET 
      amount_paid = v_final_amount,
      notes = COALESCE(notes || ' | ', '') || 'Réduction parrainage: -' || v_discount_amount || ' DA'
    WHERE id = v_payment_id;
    
    -- Mettre à jour le referral
    UPDATE referrals
    SET 
      referee_discount_applied = v_discount_amount,
      discount_applied_referee = TRUE
    WHERE referee_id = '8dc9cef6-ca3e-4a91-b175-d498e1eaa18a';
    
    -- Ajouter à l'historique si pas déjà présent
    INSERT INTO referral_discount_history (
      referrer_id,
      referee_id,
      subscription_payment_id,
      original_price,
      discount_percentage,
      discount_amount,
      final_price,
      notes
    )
    SELECT 
      r.referrer_id,
      r.referee_id,
      v_payment_id,
      1500,
      5,
      v_discount_amount,
      v_final_amount,
      'Réduction de 5% appliquée au filleul lors de son premier paiement (correction manuelle)'
    FROM referrals r
    WHERE r.referee_id = '8dc9cef6-ca3e-4a91-b175-d498e1eaa18a'
    AND NOT EXISTS (
      SELECT 1 FROM referral_discount_history
      WHERE subscription_payment_id = v_payment_id
    );
  END IF;
END $$;
