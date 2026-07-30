-- Enrichit le journal d'activité du pédago (pedago_activity_log) avec le
-- statut de validation ACTUEL de l'élément concerné par chaque entrée :
-- une même ligne "Ajout" peut être en attente, validée ou refusée selon
-- l'état courant du chapitre/de la leçon/de la version de contenu qu'elle
-- décrit. Consommé par /pedago/activite (badge de statut par ligne).
--
-- Cas par type d'entité :
--   - 'chapter'/'lesson', action='create' : statut = chapters/lessons.status
--     (pending/approved/rejected) ; si la ligne n'existe plus, 'deleted'.
--   - 'chapter'/'lesson', action='delete' : la ligne existe encore et
--     deletion_requested=true -> 'pending' ; existe encore et
--     deletion_requested=false -> la demande a été refusée -> 'rejected' ;
--     n'existe plus -> suppression confirmée -> 'deleted'.
--   - 'chapter'/'lesson', action='update' (titre/description, jamais gaté)
--     -> 'immediate' (rien à valider, toujours appliqué immédiatement).
--   - 'lesson_content' (toujours action='update', soumissions successives
--     de contenu de leçon) : chaque entrée de log est associée à SA version
--     dans lesson_versions par rang chronologique au sein de la leçon (les
--     deux sont créés dans le même appel à submit_lesson_version, donc dans
--     le même ordre) -> statut = lesson_versions.status (pending/approved/
--     rejected/superseded).
CREATE OR REPLACE FUNCTION public.pedago_activity_log_with_status()
RETURNS TABLE (
  id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  entity_title text,
  chapter_id uuid,
  chapter_title text,
  subject text,
  school_level public.school_level,
  created_at timestamptz,
  review_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH my_log AS (
    SELECT pal.*, ch.title AS ch_title, ch.title_ar AS ch_title_ar
    FROM public.pedago_activity_log pal
    LEFT JOIN public.chapters ch ON ch.id = pal.chapter_id
    WHERE pal.user_id = auth.uid()
  ),
  lesson_content_rank AS (
    SELECT id AS log_id, row_number() OVER (PARTITION BY entity_id ORDER BY created_at) AS rn
    FROM my_log
    WHERE entity_type = 'lesson_content'
  ),
  version_rank AS (
    SELECT lesson_id, status, row_number() OVER (PARTITION BY lesson_id ORDER BY created_at) AS rn
    FROM public.lesson_versions
  )
  SELECT
    l.id, l.action, l.entity_type, l.entity_id, l.entity_title,
    l.chapter_id, COALESCE(l.ch_title_ar, l.ch_title), l.subject, l.school_level, l.created_at,
    CASE
      WHEN l.entity_type = 'chapter' THEN
        CASE
          WHEN l.action = 'delete' THEN
            CASE WHEN ch2.id IS NULL THEN 'deleted'
                 WHEN ch2.deletion_requested THEN 'pending'
                 ELSE 'rejected' END
          WHEN l.action = 'update' THEN 'immediate'
          ELSE COALESCE(ch2.status, 'deleted')
        END
      WHEN l.entity_type = 'lesson' THEN
        CASE
          WHEN l.action = 'delete' THEN
            CASE WHEN ls2.id IS NULL THEN 'deleted'
                 WHEN ls2.deletion_requested THEN 'pending'
                 ELSE 'rejected' END
          WHEN l.action = 'update' THEN 'immediate'
          ELSE COALESCE(ls2.status, 'deleted')
        END
      WHEN l.entity_type = 'lesson_content' THEN vr.status
      ELSE NULL
    END AS review_status
  FROM my_log l
  LEFT JOIN public.chapters ch2 ON l.entity_type = 'chapter' AND ch2.id = l.entity_id
  LEFT JOIN public.lessons ls2 ON l.entity_type = 'lesson' AND ls2.id = l.entity_id
  LEFT JOIN lesson_content_rank lcr ON lcr.log_id = l.id
  LEFT JOIN version_rank vr ON l.entity_type = 'lesson_content' AND vr.lesson_id = l.entity_id AND vr.rn = lcr.rn
  ORDER BY l.created_at DESC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.pedago_activity_log_with_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pedago_activity_log_with_status() TO authenticated;

NOTIFY pgrst, 'reload schema';
