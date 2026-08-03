-- Constat (nouvel audit) : de nombreuses migrations de durcissement passées
-- (ex. 20260713120000, 20260803160001) suivaient le motif
--   REVOKE ALL ON FUNCTION ... FROM PUBLIC;
--   GRANT EXECUTE ON FUNCTION ... TO authenticated;
-- en pensant retirer l'accès à `anon`. Ça ne fonctionne pas sur ce projet :
-- le schéma `public` a un ALTER DEFAULT PRIVILEGES qui accorde EXECUTE à
-- `anon` (en plus de `authenticated`/`service_role`) sur toute fonction créée
-- dans le schéma. Ce grant est explicite (attribué au rôle `anon` au moment
-- du CREATE FUNCTION), donc un REVOKE FROM PUBLIC ne le touche pas :
-- `anon` gardait EXECUTE sur ces fonctions en base malgré l'intention des
-- migrations précédentes.
--
-- Impact réel : toutes les fonctions listées ci-dessous valident déjà
-- auth.uid() (non NULL) ou un rôle métier en tout premier, donc un appel
-- anonyme échoue systématiquement avec une exception — ce n'est pas une
-- faille exploitable en l'état. C'est cependant une violation du moindre
-- privilège / de la défense en profondeur : si une de ces gardes venait à
-- être retirée ou contournée par erreur plus tard, `anon` pourrait
-- l'invoquer directement. On corrige en révoquant explicitement `anon`.
--
-- Résolution par OID (et non par signature figée dans le SQL) pour couvrir
-- tous les surcharges existants sans risquer une erreur "function does not
-- exist" si une signature a changé entre deux migrations.
DO $$
DECLARE
  v_fn record;
BEGIN
  FOR v_fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'admin_grant_subscription_days',
        'approve_chapter_item',
        'approve_exam',
        'approve_exam_deletion',
        'approve_item_deletion',
        'approve_lesson_version',
        'increment_chat_usage',
        'pause_my_subscription',
        'pedago_activity_log_with_status',
        'redeem_activation_code',
        'reject_chapter_item',
        'reject_exam',
        'reject_exam_deletion',
        'reject_item_deletion',
        'reject_lesson_version',
        'request_exam_deletion',
        'request_item_deletion',
        'resume_my_subscription',
        'save_exam_draft',
        'save_lesson_draft',
        'student_unread_teacher_content',
        'submit_chapter_item_for_review',
        'submit_chapter_items_for_review',
        'submit_exam_for_review',
        'submit_lesson_version'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', v_fn.sig);
  END LOOP;
END $$;
