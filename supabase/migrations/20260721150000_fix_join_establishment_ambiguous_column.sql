-- join_establishment_by_code() déclare RETURNS TABLE(establishment_id uuid, ...),
-- ce qui crée une variable plpgsql implicite nommée "establishment_id". Cette
-- variable entre en conflit avec la colonne du même nom sur
-- teacher_establishments référencée dans l'INSERT/ON CONFLICT ci-dessous,
-- provoquant "column reference "establishment_id" is ambiguous" à chaque appel
-- (donc un ajout d'établissement systématiquement rejeté côté enseignant,
-- masqué jusqu'ici par le message générique "Code d'établissement invalide."
-- côté client). #variable_conflict use_column force Postgres à toujours
-- privilégier la colonne de la table sur la variable de retour dans ce cas.
CREATE OR REPLACE FUNCTION public.join_establishment_by_code(p_code text)
RETURNS TABLE(establishment_id uuid, establishment_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
#variable_conflict use_column
DECLARE
  v_id uuid;
  v_name text;
BEGIN
  SELECT id, first_name INTO v_id, v_name
  FROM public.profiles
  WHERE establishment_code = upper(trim(p_code))
  LIMIT 1;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Code d''établissement invalide.';
  END IF;

  INSERT INTO public.teacher_establishments (teacher_id, establishment_id)
  VALUES (auth.uid(), v_id)
  ON CONFLICT (teacher_id, establishment_id) DO NOTHING;

  RETURN QUERY SELECT v_id, v_name;
END;
$$;
