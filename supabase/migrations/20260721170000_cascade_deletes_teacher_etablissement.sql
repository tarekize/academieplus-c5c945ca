-- Complète les suppressions en cascade pour que la suppression d'un compte
-- (enseignant, établissement, élève ou parent) nettoie bien toutes les
-- liaisons qui en dépendent, au lieu de laisser des lignes orphelines.
--
-- Avant cette migration :
--   - classes.teacher_id n'avait AUCUNE contrainte de clé étrangère : supprimer
--     le profil d'un enseignant laissait ses classes en base, avec un
--     teacher_id pointant dans le vide.
--   - class_students.student_id n'avait AUCUNE contrainte de clé étrangère :
--     supprimer le profil d'un élève laissait sa liaison de classe orpheline.
--   - establishments.establishment_profile_id était en ON DELETE SET NULL :
--     supprimer le compte établissement détachait juste la ligne "establishments"
--     du teacher (elle restait visible dans son propre espace), au lieu de la
--     supprimer avec elle.
--   - classes.establishment_id était en ON DELETE SET NULL : supprimer la ligne
--     "establishments" ci-dessus ne supprimait pas les classes qui y étaient
--     rattachées, elle les détachait seulement.
--
-- Résultat combiné recherché : supprimer le compte d'un établissement supprime
-- en cascade ses lignes "establishments" -> les classes qui leur sont
-- rattachées -> les liaisons class_students de ces classes (déjà en cascade),
-- donc les élèves perdent bien leur enseignant. Supprimer le compte d'un
-- enseignant supprime en cascade ses classes -> les liaisons class_students.
-- Les liaisons élève<->parent (parent_child_links) et enseignant<->établissement
-- (teacher_establishments) étaient déjà correctement en cascade.

-- Nettoyage préalable : sans ça, l'ajout des contraintes ci-dessous échouerait
-- s'il existe déjà des lignes orphelines en base (teacher_id/student_id ne
-- correspondant plus à aucun profil).
DELETE FROM public.classes c
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = c.teacher_id);

DELETE FROM public.class_students cs
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = cs.student_id);

ALTER TABLE public.classes
  ADD CONSTRAINT classes_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.class_students
  ADD CONSTRAINT class_students_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.establishments
  DROP CONSTRAINT IF EXISTS establishments_establishment_profile_id_fkey,
  ADD CONSTRAINT establishments_establishment_profile_id_fkey
    FOREIGN KEY (establishment_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.classes
  DROP CONSTRAINT IF EXISTS classes_establishment_id_fkey,
  ADD CONSTRAINT classes_establishment_id_fkey
    FOREIGN KEY (establishment_id) REFERENCES public.establishments(id) ON DELETE CASCADE;
