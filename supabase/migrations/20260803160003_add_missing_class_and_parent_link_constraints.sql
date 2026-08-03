-- Réconciliation du registre de migrations (audit externe) : le fichier
-- 20260723120300_class_and_parent_link_constraints.sql existait déjà dans le
-- dépôt mais les contraintes UNIQUE n'avaient en réalité jamais été créées en
-- base — un élève pouvait toujours être inscrit dans deux classes différentes
-- simultanément (double-clic/retry concurrent), et deux liaisons
-- parent_child_links dupliquées pouvaient être créées entre le même parent et
-- le même enfant. Aucun doublon en base au moment de l'application (vérifié),
-- la déduplication préalable du fichier original n'était pas nécessaire.
ALTER TABLE public.class_students
  ADD CONSTRAINT class_students_student_id_key UNIQUE (student_id);

ALTER TABLE public.parent_child_links
  ADD CONSTRAINT parent_child_links_parent_child_key UNIQUE (parent_id, child_id);
