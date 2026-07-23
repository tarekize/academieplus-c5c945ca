-- SÉCURITÉ — fuite inter-établissements sur les réclamations : les policies
-- "Etablissement view all reclamations" / "Etablissement update reclamations"
-- (20260629120000, reprises telles quelles par 20260721200000) ne vérifient
-- que role = 'etablissement', jamais l'établissement du membre auteur de la
-- réclamation. N'importe quel compte établissement pouvait donc lire ET
-- modifier (status, response, resolved_at) les réclamations soumises par les
-- élèves/enseignants/parents d'un tout autre établissement.
--
-- Réutilise is_establishment_teacher()/is_establishment_student() (déjà en
-- place) pour scoper l'accès aux réclamations des membres du même
-- établissement que l'appelant, en couvrant les 3 profils qui soumettent des
-- réclamations : enseignant, élève, et parent (via son lien actif vers un
-- élève de l'établissement).
CREATE OR REPLACE FUNCTION public.is_establishment_member(_est_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_establishment_teacher(_est_id, _user_id)
      OR public.is_establishment_student(_est_id, _user_id)
      OR EXISTS (
           SELECT 1 FROM public.parent_child_links pcl
           WHERE pcl.parent_id = _user_id
             AND pcl.status = 'active'
             AND public.is_establishment_student(_est_id, pcl.child_id)
         )
$$;

DROP POLICY IF EXISTS "Etablissement view all reclamations" ON public.reclamations;
CREATE POLICY "Etablissement view own establishment reclamations"
ON public.reclamations FOR SELECT TO authenticated
USING (public.is_establishment_member(auth.uid(), user_id));

DROP POLICY IF EXISTS "Etablissement update reclamations" ON public.reclamations;
CREATE POLICY "Etablissement update own establishment reclamations"
ON public.reclamations FOR UPDATE TO authenticated
USING (public.is_establishment_member(auth.uid(), user_id))
WITH CHECK (public.is_establishment_member(auth.uid(), user_id));

NOTIFY pgrst, 'reload schema';
