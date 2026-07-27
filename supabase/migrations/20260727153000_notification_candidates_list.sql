-- Remplace le simple "aperçu du nombre de destinataires" par une vraie liste
-- cochable : l'admin doit voir tous les utilisateurs concernés, le filtre ne
-- fait que les faire apparaître/disparaître de la liste, et l'envoi cible
-- exactement la sélection cochée (pas automatiquement "tout ce qui correspond
-- au filtre"). count_notification_recipients n'a donc plus d'utilité.
DROP FUNCTION IF EXISTS public.count_notification_recipients(public.app_role[], text);

CREATE OR REPLACE FUNCTION public.admin_list_notification_candidates()
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  role public.app_role,
  contract_status text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      p.id, p.first_name, p.last_name, p.email, ur.role,
      CASE WHEN ur.role = 'etablissement' THEN p.contract_end_date ELSE p.subscription_end_date END AS expiry
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role IN ('student', 'teacher', 'pedago', 'etablissement', 'parent')
      AND p.email IS NOT NULL
      AND p.is_active IS NOT FALSE
  )
  SELECT
    base.id, base.first_name, base.last_name, base.email, base.role,
    CASE
      WHEN base.expiry IS NULL THEN 'no_contract'
      WHEN base.expiry < CURRENT_DATE THEN 'expired'
      WHEN base.expiry <= CURRENT_DATE + 30 THEN 'expiring_soon'
      ELSE 'has_contract'
    END
  FROM base
  ORDER BY base.first_name NULLS LAST, base.last_name NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_notification_candidates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_notification_candidates() TO authenticated;

-- L'envoi cible désormais une sélection libre d'utilisateurs (potentiellement
-- à cheval sur plusieurs statuts de contrat) plutôt qu'un unique filtre — la
-- contrainte figée sur une valeur d'énum n'a plus de sens, la colonne devient
-- un résumé texte libre écrit par l'edge function (ex: "no_contract, expired"
-- ou "sélection manuelle").
ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_filter_contract_status_check;
ALTER TABLE public.email_campaigns ALTER COLUMN filter_contract_status SET DEFAULT 'sélection manuelle';

NOTIFY pgrst, 'reload schema';
