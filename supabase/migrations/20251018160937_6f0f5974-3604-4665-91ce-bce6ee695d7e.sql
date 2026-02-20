-- Supprimer la contrainte unique sur user_id pour permettre plusieurs codes par utilisateur
ALTER TABLE referral_codes DROP CONSTRAINT IF EXISTS referral_codes_user_id_key;

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);

-- Désactiver les anciens codes quand un nouveau est créé
CREATE OR REPLACE FUNCTION deactivate_old_referral_codes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Désactiver tous les anciens codes de cet utilisateur
  UPDATE referral_codes
  SET is_active = FALSE
  WHERE user_id = NEW.user_id
  AND id != NEW.id;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_deactivate_old_codes ON referral_codes;
CREATE TRIGGER trigger_deactivate_old_codes
AFTER INSERT ON referral_codes
FOR EACH ROW
EXECUTE FUNCTION deactivate_old_referral_codes();

-- Modifier la contrainte sur referrals pour empêcher qu'un filleul utilise plusieurs codes
-- Un filleul ne peut avoir qu'un seul parrainage actif
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS unique_referee;
ALTER TABLE referrals ADD CONSTRAINT unique_referee UNIQUE (referee_id);