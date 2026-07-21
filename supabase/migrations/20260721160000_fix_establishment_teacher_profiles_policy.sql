-- "Establishments can view their teachers profiles" ne vérifiait que l'ancien lien
-- unique (profiles.establishment_id = auth.uid()), jamais mis à jour pour
-- reconnaître aussi teacher_establishments (la table de liaison plusieurs-à-
-- plusieurs introduite ensuite). Les policies soeurs sur classes/class_students/
-- user_roles appellent toutes is_establishment_teacher(), qui couvre déjà les
-- deux cas — celle-ci était la seule oubliée. Résultat : un enseignant lié
-- uniquement via "Rejoindre par code" (teacher_establishments) restait invisible
-- pour l'établissement : le lien et ses classes remontaient, mais pas son profil
-- (nom/email), donc le tableau de bord affichait 0 enseignant.
DROP POLICY IF EXISTS "Establishments can view their teachers profiles" ON public.profiles;
CREATE POLICY "Establishments can view their teachers profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_establishment_teacher(auth.uid(), id));
