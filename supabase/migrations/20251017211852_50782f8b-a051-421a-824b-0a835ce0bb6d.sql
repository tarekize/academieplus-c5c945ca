-- Supprimer l'ancienne contrainte CHECK sur le type
ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_type_check;

-- Ajouter une nouvelle contrainte avec les nouveaux types
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_type_check 
  CHECK (type IN ('mensuel', 'annuel', 'mensuel_regulier', 'mensuel_regulier_famille', 'mensuel_intensif', 'mensuel_intensif_famille'));

-- Désactiver les anciens plans
UPDATE subscription_plans SET is_active = false;

-- Insérer les nouveaux plans avec les bons prix HT
INSERT INTO subscription_plans (name, type, price_ht, tva_percentage, description, is_active)
VALUES 
  ('Formule Régulière - 1 Enfant', 'mensuel_regulier', 1458.33, 20.00, 'Accès complet pour un enfant', true),
  ('Formule Régulière - Famille', 'mensuel_regulier_famille', 1822.92, 20.00, 'Accès complet pour toute la famille', true),
  ('Formule Intensive - 1 Enfant', 'mensuel_intensif', 2083.33, 20.00, 'Formule intensive pour un enfant', true),
  ('Formule Intensive - Famille', 'mensuel_intensif_famille', 2604.17, 20.00, 'Formule intensive pour toute la famille', true);