-- MOYEN (conformité mineurs, audit externe) : 17 profils élèves existants
-- (créés avant que date_of_birth ne soit rendu obligatoire, cf. 20260803090009)
-- n'ont pas de date de naissance, donc aucun contrôle d'âge ni de consentement
-- parental n'a jamais pu être appliqué pour eux. On ne force pas ces comptes en
-- masse (décision produit hors périmètre technique) : on ajoute une RPC pour
-- une collecte douce au prochain login (cf. page /completer-naissance côté
-- frontend), qui ne peut être utilisée qu'une fois — tant que date_of_birth
-- est déjà renseignée, elle refuse silencieusement de la modifier.

CREATE OR REPLACE FUNCTION public.submit_missing_date_of_birth(
  p_date_of_birth date,
  p_consent_parent_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_dob date;
  v_age integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'student'::public.app_role) THEN
    RAISE EXCEPTION 'Réservé aux comptes élève.';
  END IF;

  SELECT date_of_birth INTO v_current_dob FROM public.profiles WHERE id = auth.uid();
  IF v_current_dob IS NOT NULL THEN
    RAISE EXCEPTION 'Date de naissance déjà renseignée.';
  END IF;

  IF p_date_of_birth IS NULL OR p_date_of_birth > current_date THEN
    RAISE EXCEPTION 'Date de naissance invalide.';
  END IF;

  v_age := public.calculate_age(p_date_of_birth);
  IF v_age < 15 THEN
    p_consent_parent_email := NULLIF(trim(COALESCE(p_consent_parent_email, '')), '');
    IF p_consent_parent_email IS NULL THEN
      RAISE EXCEPTION 'Un email de contact du parent est requis pour un élève de moins de 15 ans.';
    END IF;
  END IF;

  UPDATE public.profiles SET date_of_birth = p_date_of_birth WHERE id = auth.uid();

  IF v_age < 15 THEN
    INSERT INTO public.parental_consents (child_id, parent_email, token)
    VALUES (auth.uid(), p_consent_parent_email, encode(extensions.gen_random_bytes(24), 'hex'));
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_missing_date_of_birth(date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_missing_date_of_birth(date, text) TO authenticated;
