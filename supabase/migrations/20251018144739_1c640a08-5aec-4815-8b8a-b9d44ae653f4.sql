-- Ajouter une contrainte UNIQUE sur referee_id pour empêcher les parrainages multiples
-- Un utilisateur ne peut être filleul qu'une seule fois

-- D'abord, supprimer les doublons potentiels (garder le plus ancien)
DELETE FROM referrals a
USING referrals b
WHERE a.referee_id = b.referee_id
  AND a.created_at > b.created_at;

-- Ajouter la contrainte UNIQUE sur referee_id
ALTER TABLE referrals
ADD CONSTRAINT referrals_referee_id_unique UNIQUE (referee_id);

-- Ajouter un commentaire pour documenter la règle
COMMENT ON CONSTRAINT referrals_referee_id_unique ON referrals IS 
'Un utilisateur ne peut être parrainé qu''une seule fois, uniquement lors de sa première inscription';

-- Ajouter une politique RLS pour empêcher l'insertion de parrainages multiples
CREATE POLICY "Prevent multiple referrals for same referee"
ON referrals
FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM referrals
    WHERE referee_id = auth.uid()
  )
);