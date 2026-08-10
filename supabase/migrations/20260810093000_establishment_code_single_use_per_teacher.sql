-- Avec le même code et le même compte, un enseignant pouvait ajouter N fois
-- le même établissement (join_establishment_by_code fait un upsert
-- idempotent sur teacher_establishments, mais rien n'empêchait
-- EstablishmentManager.addByCode / CompleteProfile d'insérer autant de
-- lignes "establishments" en double que de clics). Un doublon existe déjà
-- en prod (même teacher_id/establishment_profile_id) : on le fusionne avant
-- de poser la contrainte, en réattachant ses classes éventuelles à la ligne
-- la plus ancienne pour ne perdre aucune donnée.
DO $$
DECLARE
  dup record;
  keeper uuid;
BEGIN
  FOR dup IN
    SELECT teacher_id, establishment_profile_id
    FROM public.establishments
    WHERE establishment_profile_id IS NOT NULL
    GROUP BY teacher_id, establishment_profile_id
    HAVING count(*) > 1
  LOOP
    SELECT id INTO keeper FROM public.establishments
    WHERE teacher_id = dup.teacher_id AND establishment_profile_id = dup.establishment_profile_id
    ORDER BY created_at ASC LIMIT 1;

    UPDATE public.classes SET establishment_id = keeper
    WHERE establishment_id IN (
      SELECT id FROM public.establishments
      WHERE teacher_id = dup.teacher_id AND establishment_profile_id = dup.establishment_profile_id
        AND id <> keeper
    );

    DELETE FROM public.establishments
    WHERE teacher_id = dup.teacher_id AND establishment_profile_id = dup.establishment_profile_id
      AND id <> keeper;
  END LOOP;
END $$;

CREATE UNIQUE INDEX establishments_teacher_profile_unique
  ON public.establishments (teacher_id, establishment_profile_id)
  WHERE establishment_profile_id IS NOT NULL;
