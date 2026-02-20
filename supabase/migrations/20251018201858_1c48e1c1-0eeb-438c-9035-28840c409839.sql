-- Ajouter les colonnes total_single et total_family à subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN total_single NUMERIC,
ADD COLUMN total_family NUMERIC;

-- Calculer les totaux pour les lignes existantes
UPDATE subscription_plans
SET 
  total_single = price_single * duration_months,
  total_family = price_family * duration_months;

-- Créer une fonction pour calculer automatiquement les totaux
CREATE OR REPLACE FUNCTION calculate_subscription_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.total_single := NEW.price_single * NEW.duration_months;
  NEW.total_family := NEW.price_family * NEW.duration_months;
  RETURN NEW;
END;
$function$;

-- Créer un trigger pour calculer les totaux automatiquement
CREATE TRIGGER calculate_totals_before_insert_update
BEFORE INSERT OR UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION calculate_subscription_totals();