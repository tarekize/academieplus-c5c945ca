
-- Corriger les données existantes pour le compte jjj
-- Mettre à jour le paiement avec le bon montant
UPDATE subscription_payments sp
SET amount_paid = 14250
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE sp.subscription_id = s.id
AND p.full_name = 'jjj'
AND sp.status = 'paid';

-- Mettre à jour l'historique de réduction
UPDATE referral_discount_history rdh
SET 
  original_price = 15000,
  discount_amount = 750,
  discount_percentage = 5,
  final_price = 14250
FROM subscription_payments sp
JOIN subscriptions s ON s.id = sp.subscription_id
JOIN profiles p ON p.id = s.user_id
WHERE rdh.subscription_payment_id = sp.id
AND p.full_name = 'jjj';

-- Mettre à jour la facture avec les bons montants
UPDATE invoices i
SET 
  amount_ht = ROUND(14250 / 1.20, 2),
  tva_amount = ROUND(14250 - (14250 / 1.20), 2),
  amount_ttc = 14250,
  notes = 'Facture générée automatiquement - Paiement ID: ' || sp.id || ' | Prix de base: 15000 DA | Réduction parrainage: -750 DA (5%) | Montant payé: 14250 DA'
FROM subscription_payments sp
JOIN subscriptions s ON s.id = sp.subscription_id
JOIN profiles p ON p.id = s.user_id
WHERE i.subscription_id = s.id
AND p.full_name = 'jjj'
AND sp.id = i.subscription_id;
