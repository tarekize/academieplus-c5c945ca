-- Supprimer le trigger en double
DROP TRIGGER IF EXISTS activate_referral_after_payment ON subscription_payments;

-- S'assurer qu'il n'y a qu'un seul trigger BEFORE INSERT
DROP TRIGGER IF EXISTS activate_referral_on_first_payment ON subscription_payments;

-- Recréer le trigger correctement
CREATE TRIGGER activate_referral_on_first_payment
BEFORE INSERT ON subscription_payments
FOR EACH ROW
EXECUTE FUNCTION activate_referral_on_first_payment();