-- Créer une facture pour le paiement de ttt
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
  COALESCE(sp.payment_method, 'test') as payment_method,
  'Facture générée automatiquement pour le paiement de ' || sp.amount_paid || ' DA' as notes
FROM subscription_payments sp
JOIN subscriptions s ON s.id = sp.subscription_id
WHERE sp.id = 'bdc0cce6-0af1-4903-a08c-fdde4503a101'
AND NOT EXISTS (
  SELECT 1 FROM invoices 
  WHERE subscription_id = sp.subscription_id 
  AND user_id = s.user_id
);