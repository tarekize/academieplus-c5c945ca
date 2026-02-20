-- Supprimer le trigger et la fonction qui désactivaient les anciens codes
DROP TRIGGER IF EXISTS trigger_deactivate_old_codes ON referral_codes;
DROP FUNCTION IF EXISTS deactivate_old_referral_codes();

-- Supprimer la contrainte unique sur user_id pour permettre plusieurs codes actifs par utilisateur
ALTER TABLE referral_codes DROP CONSTRAINT IF EXISTS referral_codes_user_id_key;

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);

-- Modifier la contrainte sur referrals pour empêcher qu'un filleul utilise plusieurs codes
-- Un filleul ne peut avoir qu'un seul parrainage actif
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS unique_referee;
ALTER TABLE referrals ADD CONSTRAINT unique_referee UNIQUE (referee_id);