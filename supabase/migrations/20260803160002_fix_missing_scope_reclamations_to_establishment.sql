-- Réconciliation du registre de migrations (audit externe) : le fichier
-- 20260723120100_scope_reclamations_to_establishment.sql existait déjà dans
-- le dépôt mais n'avait en réalité jamais été appliqué en base — les policies
-- "Etablissement view all reclamations" / "Etablissement update reclamations"
-- (role = 'etablissement' seul, sans scoping par établissement) étaient
-- encore actives, permettant à n'importe quel compte établissement de lire ET
-- modifier les réclamations de TOUS les établissements. Application fidèle au
-- fichier local d'origine.
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
