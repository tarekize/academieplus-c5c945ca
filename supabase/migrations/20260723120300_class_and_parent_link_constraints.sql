-- SÉCURITÉ / INTÉGRITÉ — deux règles métier n'étaient appliquées que côté
-- application via un "vérifie puis insère" non atomique, donc contournables
-- par deux requêtes concurrentes du même compte (double-clic, retry réseau,
-- ou script) :
--
-- 1. join-class (supabase/functions/join-class/index.ts) affirme "A student
--    can belong to only one class at a time" mais ne s'appuyait que sur
--    UNIQUE(class_id, student_id) — qui empêche seulement de rejoindre DEUX
--    FOIS la MÊME classe, pas d'être inscrit dans deux classes différentes.
-- 2. link-child-by-code vérifie "un lien existe déjà" avant d'insérer une
--    ligne parent_child_links, sans contrainte UNIQUE(parent_id, child_id)
--    derrière — deux requêtes de liaison concurrentes peuvent toutes deux
--    passer le contrôle et créer deux liens "pending" dupliqués.
--
-- On ajoute la contrainte UNIQUE manquante des deux côtés. Comme ces
-- contraintes n'ont jamais existé, on déduplique d'abord les lignes
-- existantes qui les violeraient (cas normalement rare puisque le code
-- applicatif tentait déjà d'empêcher les doublons) : pour class_students on
-- garde la plus ancienne inscription par élève ; pour parent_child_links on
-- garde en priorité une ligne "active" existante (sinon la plus ancienne),
-- pour ne jamais supprimer un lien parent-enfant déjà validé au profit d'un
-- doublon "pending".

WITH ranked_class_students AS (
  SELECT id, row_number() OVER (
    PARTITION BY student_id ORDER BY created_at ASC, id ASC
  ) AS rn
  FROM public.class_students
)
DELETE FROM public.class_students
WHERE id IN (SELECT id FROM ranked_class_students WHERE rn > 1);

ALTER TABLE public.class_students
  ADD CONSTRAINT class_students_student_id_key UNIQUE (student_id);

WITH ranked_parent_links AS (
  SELECT id, row_number() OVER (
    PARTITION BY parent_id, child_id
    ORDER BY (status = 'active') DESC, created_at ASC, id ASC
  ) AS rn
  FROM public.parent_child_links
)
DELETE FROM public.parent_child_links
WHERE id IN (SELECT id FROM ranked_parent_links WHERE rn > 1);

ALTER TABLE public.parent_child_links
  ADD CONSTRAINT parent_child_links_parent_child_key UNIQUE (parent_id, child_id);

NOTIFY pgrst, 'reload schema';
