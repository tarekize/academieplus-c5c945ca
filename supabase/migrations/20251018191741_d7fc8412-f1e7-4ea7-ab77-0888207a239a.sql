-- Créer une fonction pour générer automatiquement une facture à partir d'un paiement
CREATE OR REPLACE FUNCTION public.generate_invoice_from_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  -- Vérifier que le paiement est validé
  IF NEW.status = 'paid' THEN
    -- Récupérer l'user_id depuis la subscription
    SELECT user_id INTO v_user_id
    FROM subscriptions
    WHERE id = NEW.subscription_id;
    
    -- Vérifier qu'une facture n'existe pas déjà pour ce paiement
    IF NOT EXISTS (
      SELECT 1 FROM invoices 
      WHERE subscription_id = NEW.subscription_id 
      AND user_id = v_user_id
      AND issue_date = NEW.payment_date
    ) THEN
      -- Créer la facture
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
        ROUND(NEW.amount_paid / 1.20, 2),
        20.00,
        ROUND(NEW.amount_paid - (NEW.amount_paid / 1.20), 2),
        NEW.amount_paid,
        'paid',
        NEW.payment_date,
        NEW.payment_date,
        COALESCE(NEW.payment_method, 'non spécifié'),
        'Facture générée automatiquement - Paiement ID: ' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le trigger pour générer automatiquement les factures
DROP TRIGGER IF EXISTS generate_invoice_on_payment ON subscription_payments;
CREATE TRIGGER generate_invoice_on_payment
  AFTER INSERT ON subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_from_payment();

-- Générer les factures manquantes pour tous les paiements existants
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
)
SELECT 
  s.user_id,
  sp.subscription_id,
  ROUND(sp.amount_paid / 1.20, 2) as amount_ht,
  20.00 as tva_percentage,
  ROUND(sp.amount_paid - (sp.amount_paid / 1.20), 2) as tva_amount,
  sp.amount_paid as amount_ttc,
  'paid' as status,
  sp.payment_date as issue_date,
  sp.payment_date as paid_date,
  COALESCE(sp.payment_method, 'non spécifié') as payment_method,
  'Facture générée automatiquement - Paiement ID: ' || sp.id as notes
FROM subscription_payments sp
JOIN subscriptions s ON s.id = sp.subscription_id
WHERE sp.status = 'paid'
AND NOT EXISTS (
  SELECT 1 FROM invoices i
  WHERE i.subscription_id = sp.subscription_id 
  AND i.user_id = s.user_id
  AND i.issue_date = sp.payment_date
);