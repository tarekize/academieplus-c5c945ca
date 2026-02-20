-- Mettre à jour la fonction pour utiliser les montants corrects (en DA, pas en centimes)
CREATE OR REPLACE FUNCTION public.generate_invoice_from_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
  v_is_family_plan BOOLEAN;
  v_original_price NUMERIC;
  v_discount_amount NUMERIC := 0;
  v_discount_info TEXT := '';
BEGIN
  -- Vérifier que le paiement est validé
  IF NEW.status = 'paid' THEN
    -- Récupérer les infos de la subscription
    SELECT s.user_id, s.plan_id, s.is_family_plan 
    INTO v_user_id, v_plan_id, v_is_family_plan
    FROM subscriptions s
    WHERE s.id = NEW.subscription_id;
    
    -- Récupérer le prix original du plan
    SELECT 
      CASE 
        WHEN v_is_family_plan THEN sp.price_family 
        ELSE sp.price_single 
      END INTO v_original_price
    FROM subscription_plans sp
    WHERE sp.id = v_plan_id;
    
    -- Calculer la réduction si le montant payé est inférieur au prix original
    IF NEW.amount_paid < v_original_price THEN
      v_discount_amount := v_original_price - NEW.amount_paid;
      
      -- Récupérer les détails de la réduction depuis l'historique
      SELECT 'Réduction parrainage: -' || rdh.discount_amount || ' DA (' || rdh.discount_percentage || '%)'
      INTO v_discount_info
      FROM referral_discount_history rdh
      WHERE rdh.subscription_payment_id = NEW.id
      LIMIT 1;
      
      IF v_discount_info IS NULL OR v_discount_info = '' THEN
        v_discount_info := 'Réduction appliquée: -' || v_discount_amount || ' DA';
      END IF;
    END IF;
    
    -- Vérifier qu'une facture n'existe pas déjà pour ce paiement
    IF NOT EXISTS (
      SELECT 1 FROM invoices 
      WHERE subscription_id = NEW.subscription_id 
      AND user_id = v_user_id
      AND issue_date = NEW.payment_date
    ) THEN
      -- Créer la facture avec le montant ORIGINAL
      INSERT INTO invoices (
        user_id,
        subscription_id,
        amount_ht,
        tva_percentage,
        tva_amount,
        amount_ttc,
        status,
        issue_date,
        paid_date,
        payment_method,
        notes
      ) VALUES (
        v_user_id,
        NEW.subscription_id,
        ROUND(v_original_price / 1.20, 2),
        20.00,
        ROUND(v_original_price - (v_original_price / 1.20), 2),
        v_original_price,
        'paid',
        NEW.payment_date,
        NEW.payment_date,
        COALESCE(NEW.payment_method, 'non spécifié'),
        'Facture générée automatiquement - Paiement ID: ' || NEW.id || 
        CASE WHEN v_discount_amount > 0 THEN ' | ' || v_discount_info || ' | Montant payé: ' || NEW.amount_paid || ' DA' ELSE '' END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Mettre à jour les factures existantes avec les montants originaux
UPDATE invoices i
SET 
  amount_ht = ROUND(
    (SELECT 
      CASE 
        WHEN s.is_family_plan THEN sp.price_family 
        ELSE sp.price_single 
      END
    FROM subscriptions s
    JOIN subscription_plans sp ON sp.id = s.plan_id
    WHERE s.id = i.subscription_id) / 1.20, 2
  ),
  tva_amount = ROUND(
    (SELECT 
      CASE 
        WHEN s.is_family_plan THEN sp.price_family 
        ELSE sp.price_single 
      END
    FROM subscriptions s
    JOIN subscription_plans sp ON sp.id = s.plan_id
    WHERE s.id = i.subscription_id) - 
    ((SELECT 
      CASE 
        WHEN s.is_family_plan THEN sp.price_family 
        ELSE sp.price_single 
      END
    FROM subscriptions s
    JOIN subscription_plans sp ON sp.id = s.plan_id
    WHERE s.id = i.subscription_id) / 1.20), 2
  ),
  amount_ttc = (
    SELECT 
      CASE 
        WHEN s.is_family_plan THEN sp.price_family 
        ELSE sp.price_single 
      END
    FROM subscriptions s
    JOIN subscription_plans sp ON sp.id = s.plan_id
    WHERE s.id = i.subscription_id
  ),
  notes = i.notes || 
    CASE 
      WHEN (SELECT amount_paid FROM subscription_payments sp WHERE sp.subscription_id = i.subscription_id AND sp.payment_date = i.issue_date LIMIT 1) < 
           (SELECT CASE WHEN s.is_family_plan THEN sp.price_family ELSE sp.price_single END FROM subscriptions s JOIN subscription_plans sp ON sp.id = s.plan_id WHERE s.id = i.subscription_id)
      THEN ' | Réduction appliquée | Montant payé: ' || 
           (SELECT amount_paid FROM subscription_payments sp WHERE sp.subscription_id = i.subscription_id AND sp.payment_date = i.issue_date LIMIT 1) || ' DA'
      ELSE ''
    END
WHERE i.subscription_id IS NOT NULL;