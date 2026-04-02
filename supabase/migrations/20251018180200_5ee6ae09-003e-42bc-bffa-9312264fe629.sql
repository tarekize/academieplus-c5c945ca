-- Ajouter une colonne pour stocker temporairement le code de parrainage utilisé
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_referral_code TEXT;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_pending_referral_code ON profiles(pending_referral_code) WHERE pending_referral_code IS NOT NULL;