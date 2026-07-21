-- La table "establishments" (liste libre gérée côté enseignant, avec
-- establishment_profile_id pointant vers le vrai compte établissement) n'avait
-- qu'une policy "Teachers manage their own establishments" (USING auth.uid() =
-- teacher_id) : le compte établissement lui-même n'avait aucun droit de
-- lecture dessus. La page établissement filtre désormais les classes via
-- cette table (establishment_profile_id -> classes.establishment_id) pour
-- éviter d'afficher les classes d'un enseignant liées à un AUTRE
-- établissement ; sans cette policy, ce filtre renvoie toujours une liste
-- vide côté établissement, donc "0 classes" malgré des classes bien
-- rattachées et visibles.
CREATE POLICY "Establishments can view their own establishment rows"
  ON public.establishments FOR SELECT
  TO authenticated
  USING (establishment_profile_id = auth.uid());
