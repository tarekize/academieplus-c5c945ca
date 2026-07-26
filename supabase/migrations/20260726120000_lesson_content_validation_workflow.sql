-- Workflow de validation pédago -> admin pour le contenu des leçons.
-- Jusqu'ici, "Envoyer les modifications" (LessonEditor.tsx) écrivait
-- directement dans lessons.content, visible immédiatement par les élèves,
-- que l'auteur soit admin ou pédago. On introduit un état intermédiaire :
--   - le pédago peut enregistrer un brouillon (draft_content, non visible
--     par personne d'autre) puis soumettre une nouvelle version : elle est
--     archivée dans lesson_versions avec le statut 'pending' et référencée
--     par lessons.pending_version_id, mais lessons.content (ce que voient
--     les élèves) ne change pas encore ;
--   - l'admin valide (approve_lesson_version) ou refuse
--     (reject_lesson_version) cette version ; seule une validation copie
--     enfin le contenu dans lessons.content ;
--   - l'admin reste l'autorité de validation : quand c'est lui qui soumet,
--     sa version est auto-approuvée (comportement de publication directe
--     inchangé pour lui).
-- Un trigger sur lessons empêche toute écriture directe de `content` par un
-- non-admin en dehors des fonctions RPC ci-dessous, pour que la règle soit
-- imposée côté base et pas seulement par l'UI.

-- 1) Colonnes de suivi sur lessons
ALTER TABLE public.lessons
  ADD COLUMN draft_content text,
  ADD COLUMN draft_updated_at timestamptz,
  ADD COLUMN pending_version_id uuid REFERENCES public.lesson_versions(id) ON DELETE SET NULL;

-- 2) lesson_versions devient un historique de validation : numéro de
--    version, statut, qui a revu et quand.
ALTER TABLE public.lesson_versions
  ADD COLUMN version_number integer,
  ADD COLUMN status text NOT NULL DEFAULT 'approved',
  ADD COLUMN reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN reviewed_by_name text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN rejection_reason text;

ALTER TABLE public.lesson_versions
  ADD CONSTRAINT lesson_versions_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'superseded'));

-- Backfill : les versions déjà archivées correspondent à l'ancien
-- comportement (publication immédiate) -> 'approved', numérotées par ordre
-- chronologique au sein de chaque leçon.
WITH numbered AS (
  SELECT id, row_number() OVER (PARTITION BY lesson_id ORDER BY created_at) AS rn
  FROM public.lesson_versions
)
UPDATE public.lesson_versions lv
SET version_number = numbered.rn
FROM numbered
WHERE lv.id = numbered.id;

ALTER TABLE public.lesson_versions ALTER COLUMN version_number SET NOT NULL;

CREATE INDEX idx_lesson_versions_status ON public.lesson_versions (lesson_id, status);

-- 3) Garde-fou : lessons.content ne peut être modifié directement que par
--    un admin (ou par les fonctions RPC ci-dessous, qui lèvent un drapeau de
--    transaction le temps de leur propre écriture). Les appels service_role
--    (edge functions generate-lesson-content, enrich-chapter-lessons,
--    bulk-generate-*, etc., qui contournent déjà RLS par conception — voir
--    20260723140200) restent inchangés : ce sont des flux internes de
--    confiance, pas le flux pédago/admin qu'on encadre ici.
CREATE OR REPLACE FUNCTION public.guard_lesson_content_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content
     AND current_setting('app.bypass_lesson_content_lock', true) IS DISTINCT FROM 'on'
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Le contenu d''une leçon ne peut être modifié que via une validation admin.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_lesson_content ON public.lessons;
CREATE TRIGGER trg_guard_lesson_content
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_lesson_content_update();

-- 4) RPCs

-- Nom affichable d'un profil, utilisé par les fonctions ci-dessous pour
-- tracer qui a soumis / revu une version.
CREATE OR REPLACE FUNCTION public.profile_display_name(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(NULLIF(trim(concat_ws(' ', first_name, last_name)), ''), email, 'مستخدم')
  FROM public.profiles WHERE id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.profile_display_name(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_display_name(uuid) TO authenticated;

-- Enregistrer un brouillon (jamais visible par les élèves, pas d'archive de
-- version, pas de notification à l'admin).
CREATE OR REPLACE FUNCTION public.save_lesson_draft(p_lesson_id uuid, p_content text)
RETURNS public.lessons
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.lessons;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  UPDATE public.lessons
  SET draft_content = p_content,
      draft_updated_at = now()
  WHERE id = p_lesson_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Leçon introuvable.';
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.save_lesson_draft(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_lesson_draft(uuid, text) TO authenticated;

-- Soumettre une nouvelle version : en attente de validation pour un
-- pédago, auto-approuvée (publication immédiate) pour un admin.
CREATE OR REPLACE FUNCTION public.submit_lesson_version(p_lesson_id uuid, p_content text)
RETURNS public.lesson_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_admin boolean;
  v_name text;
  v_next_version integer;
  v_version public.lesson_versions;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id) THEN
    RAISE EXCEPTION 'Leçon introuvable.';
  END IF;

  v_is_admin := public.has_role(auth.uid(), 'admin'::public.app_role);
  v_name := public.profile_display_name(auth.uid());

  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
  FROM public.lesson_versions WHERE lesson_id = p_lesson_id;

  -- Une nouvelle soumission remplace toute version encore en attente pour
  -- cette leçon (évite d'avoir plusieurs versions 'pending' simultanées).
  UPDATE public.lesson_versions
  SET status = 'superseded'
  WHERE lesson_id = p_lesson_id AND status = 'pending';

  INSERT INTO public.lesson_versions (
    lesson_id, content, created_by, created_by_name, version_number, status,
    reviewed_by, reviewed_by_name, reviewed_at
  ) VALUES (
    p_lesson_id, p_content, auth.uid(), v_name, v_next_version,
    CASE WHEN v_is_admin THEN 'approved' ELSE 'pending' END,
    CASE WHEN v_is_admin THEN auth.uid() ELSE NULL END,
    CASE WHEN v_is_admin THEN v_name ELSE NULL END,
    CASE WHEN v_is_admin THEN now() ELSE NULL END
  ) RETURNING * INTO v_version;

  IF v_is_admin THEN
    PERFORM set_config('app.bypass_lesson_content_lock', 'on', true);
    UPDATE public.lessons
    SET content = p_content, draft_content = NULL, draft_updated_at = NULL, pending_version_id = NULL
    WHERE id = p_lesson_id;
  ELSE
    UPDATE public.lessons
    SET pending_version_id = v_version.id, draft_content = NULL, draft_updated_at = NULL
    WHERE id = p_lesson_id;
  END IF;

  RETURN v_version;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_lesson_version(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_lesson_version(uuid, text) TO authenticated;

-- Valider une version en attente : elle devient le contenu visible par les
-- élèves.
CREATE OR REPLACE FUNCTION public.approve_lesson_version(p_version_id uuid)
RETURNS public.lesson_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_version public.lesson_versions;
  v_name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  SELECT * INTO v_version FROM public.lesson_versions WHERE id = p_version_id FOR UPDATE;
  IF v_version.id IS NULL THEN
    RAISE EXCEPTION 'Version introuvable.';
  END IF;
  IF v_version.status <> 'pending' THEN
    RAISE EXCEPTION 'Cette version n''est plus en attente de validation.';
  END IF;

  v_name := public.profile_display_name(auth.uid());

  UPDATE public.lesson_versions
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
  WHERE id = p_version_id
  RETURNING * INTO v_version;

  PERFORM set_config('app.bypass_lesson_content_lock', 'on', true);
  UPDATE public.lessons
  SET content = v_version.content, pending_version_id = NULL
  WHERE id = v_version.lesson_id AND pending_version_id = p_version_id;

  RETURN v_version;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_lesson_version(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_lesson_version(uuid) TO authenticated;

-- Refuser une version en attente, avec un motif optionnel : lessons.content
-- ne change pas, le pédago pourra soumettre une correction.
CREATE OR REPLACE FUNCTION public.reject_lesson_version(p_version_id uuid, p_reason text DEFAULT NULL)
RETURNS public.lesson_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_version public.lesson_versions;
  v_name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  SELECT * INTO v_version FROM public.lesson_versions WHERE id = p_version_id FOR UPDATE;
  IF v_version.id IS NULL THEN
    RAISE EXCEPTION 'Version introuvable.';
  END IF;
  IF v_version.status <> 'pending' THEN
    RAISE EXCEPTION 'Cette version n''est plus en attente de validation.';
  END IF;

  v_name := public.profile_display_name(auth.uid());

  UPDATE public.lesson_versions
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULLIF(trim(p_reason), '')
  WHERE id = p_version_id
  RETURNING * INTO v_version;

  UPDATE public.lessons
  SET pending_version_id = NULL
  WHERE id = v_version.lesson_id AND pending_version_id = p_version_id;

  RETURN v_version;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_lesson_version(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_lesson_version(uuid, text) TO authenticated;

-- 5) RLS lesson_versions : les écritures directes (hors RPC ci-dessus, qui
--    s'exécutent avec les privilèges du propriétaire des fonctions et
--    contournent RLS) sont réservées à l'admin, pour empêcher un pédago
--    d'insérer directement une version au statut 'approved'.
DROP POLICY IF EXISTS "Pedago and admin can insert lesson versions" ON public.lesson_versions;
CREATE POLICY "Admin can insert lesson versions"
  ON public.lesson_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin can update lesson versions"
  ON public.lesson_versions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

NOTIFY pgrst, 'reload schema';
