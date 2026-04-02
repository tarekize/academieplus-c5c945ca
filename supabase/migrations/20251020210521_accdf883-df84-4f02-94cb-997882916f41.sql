-- Correction du schéma pour utiliser auth.users(id) directement (UUID)
-- Supprimer les contraintes existantes sur historique_versions
ALTER TABLE historique_versions 
DROP CONSTRAINT IF EXISTS historique_versions_auteur_id_fkey;

-- Changer le type de auteur_id de BIGINT vers UUID
ALTER TABLE historique_versions 
ALTER COLUMN auteur_id TYPE UUID USING NULL;

-- Ajouter la référence correcte vers auth.users
ALTER TABLE historique_versions
ADD CONSTRAINT historique_versions_auteur_id_fkey 
FOREIGN KEY (auteur_id) REFERENCES auth.users(id);

-- Faire de même pour la table cours si nécessaire
ALTER TABLE cours
DROP CONSTRAINT IF EXISTS cours_auteur_id_fkey,
DROP CONSTRAINT IF EXISTS cours_revieur_id_fkey;

-- Changer les types si nécessaire (seulement si ce sont des BIGINT)
DO $$
BEGIN
  -- Vérifier et convertir auteur_id si c'est BIGINT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cours' 
    AND column_name = 'auteur_id' 
    AND data_type = 'bigint'
  ) THEN
    ALTER TABLE cours ALTER COLUMN auteur_id TYPE UUID USING NULL;
  END IF;
  
  -- Vérifier et convertir revieur_id si c'est BIGINT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cours' 
    AND column_name = 'revieur_id' 
    AND data_type = 'bigint'
  ) THEN
    ALTER TABLE cours ALTER COLUMN revieur_id TYPE UUID USING NULL;
  END IF;
END $$;

-- Ajouter les références vers auth.users
ALTER TABLE cours
ADD CONSTRAINT cours_auteur_id_fkey 
FOREIGN KEY (auteur_id) REFERENCES auth.users(id);

ALTER TABLE cours
ADD CONSTRAINT cours_revieur_id_fkey 
FOREIGN KEY (revieur_id) REFERENCES auth.users(id);

-- Faire de même pour medias
ALTER TABLE medias
DROP CONSTRAINT IF EXISTS medias_uploader_id_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medias' 
    AND column_name = 'uploader_id' 
    AND data_type = 'bigint'
  ) THEN
    ALTER TABLE medias ALTER COLUMN uploader_id TYPE UUID USING NULL;
  END IF;
END $$;

ALTER TABLE medias
ADD CONSTRAINT medias_uploader_id_fkey 
FOREIGN KEY (uploader_id) REFERENCES auth.users(id);