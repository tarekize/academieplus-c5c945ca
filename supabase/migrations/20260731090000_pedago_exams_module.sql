-- Module "Examens" pour le profil Pédago : grille matière x niveau/filière,
-- création via IA ou import de document, workflow de validation admin
-- (brouillon -> soumis -> validé/refusé) avec versioning, sur le modèle déjà
-- en place pour chapitres/leçons/exercices/quiz.
--
-- Complète aussi deux écarts identifiés dans le workflow existant :
--   - la suppression de chapitre/leçon par un pédago n'exigeait aucun motif ;
--   - la table `exams` n'avait aucune notion de statut/validation (un pédago
--     ou un admin publiait un examen directement, visible immédiatement des
--     élèves) et sa contrainte sur `trimester` interdisait déjà en pratique
--     les valeurs 4/5 (Bac Blanc/Bac Finale) utilisées par le frontend.

-- =====================================================================
-- 1) Motif obligatoire pour une demande de suppression (chapitre/leçon)
-- =====================================================================

ALTER TABLE public.chapters ADD COLUMN deletion_reason text;
ALTER TABLE public.lessons ADD COLUMN deletion_reason text;

CREATE OR REPLACE FUNCTION public.guard_chapter_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     AND current_setting('app.bypass_chapter_status_lock', true) IS DISTINCT FROM 'on' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_by_name IS DISTINCT FROM OLD.reviewed_by_name
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
       OR NEW.deletion_requested IS DISTINCT FROM OLD.deletion_requested
       OR NEW.deletion_requested_by IS DISTINCT FROM OLD.deletion_requested_by
       OR NEW.deletion_requested_by_name IS DISTINCT FROM OLD.deletion_requested_by_name
       OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at
       OR NEW.deletion_reason IS DISTINCT FROM OLD.deletion_reason THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de validation d''un chapitre.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_lesson_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     AND current_setting('app.bypass_lesson_status_lock', true) IS DISTINCT FROM 'on' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
       OR NEW.reviewed_by_name IS DISTINCT FROM OLD.reviewed_by_name
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
       OR NEW.deletion_requested IS DISTINCT FROM OLD.deletion_requested
       OR NEW.deletion_requested_by IS DISTINCT FROM OLD.deletion_requested_by
       OR NEW.deletion_requested_by_name IS DISTINCT FROM OLD.deletion_requested_by_name
       OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at
       OR NEW.deletion_reason IS DISTINCT FROM OLD.deletion_reason THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de validation d''une leçon.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Remplace request_item_deletion(text, uuid) : exige désormais un motif
-- (p_reason) quand la suppression n'est pas immédiate (élément publié
-- supprimé par un pédago -> file d'attente admin). Une suppression
-- immédiate (admin, ou élément jamais publié) n'a rien à motiver.
DROP FUNCTION IF EXISTS public.request_item_deletion(text, uuid);

CREATE OR REPLACE FUNCTION public.request_item_deletion(p_item_type text, p_item_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
  v_is_admin boolean;
  v_status text;
BEGIN
  IF p_item_type NOT IN ('chapter', 'lesson') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  v_is_admin := public.has_role(auth.uid(), 'admin'::public.app_role);
  v_name := public.profile_display_name(auth.uid());

  IF p_item_type = 'chapter' THEN
    SELECT status INTO v_status FROM public.chapters WHERE id = p_item_id;
  ELSE
    SELECT status INTO v_status FROM public.lessons WHERE id = p_item_id;
  END IF;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Élément introuvable.';
  END IF;

  IF v_is_admin OR v_status <> 'approved' THEN
    IF p_item_type = 'chapter' THEN
      DELETE FROM public.lessons WHERE chapter_id = p_item_id;
      DELETE FROM public.chapters WHERE id = p_item_id;
    ELSE
      DELETE FROM public.lessons WHERE id = p_item_id;
    END IF;
    RETURN true;
  END IF;

  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Merci de préciser un motif de suppression.';
  END IF;

  IF p_item_type = 'chapter' THEN
    PERFORM set_config('app.bypass_chapter_status_lock', 'on', true);
    UPDATE public.chapters
    SET deletion_requested = true, deletion_requested_by = auth.uid(), deletion_requested_by_name = v_name, deletion_requested_at = now(), deletion_reason = p_reason
    WHERE id = p_item_id AND deletion_requested = false;
  ELSE
    PERFORM set_config('app.bypass_lesson_status_lock', 'on', true);
    UPDATE public.lessons
    SET deletion_requested = true, deletion_requested_by = auth.uid(), deletion_requested_by_name = v_name, deletion_requested_at = now(), deletion_reason = p_reason
    WHERE id = p_item_id AND deletion_requested = false;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Une demande de suppression est déjà en attente pour cet élément.';
  END IF;
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.request_item_deletion(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_item_deletion(text, uuid, text) TO authenticated;

-- =====================================================================
-- 2) Table exams : versioning + statuts (brouillon/soumis/validé/refusé)
-- =====================================================================

ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_trimester_check;
ALTER TABLE public.exams ADD CONSTRAINT exams_trimester_check CHECK (trimester IN (1, 2, 3, 4, 5));

ALTER TABLE public.exams
  ADD COLUMN filiere_id uuid REFERENCES public.filieres(id) ON DELETE SET NULL,
  ADD COLUMN status text NOT NULL DEFAULT 'approved',
  ADD COLUMN version_number integer NOT NULL DEFAULT 1,
  ADD COLUMN chapter_ids uuid[],
  ADD COLUMN source text NOT NULL DEFAULT 'manual',
  ADD COLUMN submitted_by uuid REFERENCES public.profiles(id),
  ADD COLUMN submitted_by_name text,
  ADD COLUMN submitted_at timestamptz,
  ADD COLUMN reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN reviewed_by_name text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN rejection_reason text;

ALTER TABLE public.exams
  ADD CONSTRAINT exams_status_check CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  ADD CONSTRAINT exams_source_check CHECK (source IN ('manual', 'ai', 'import'));

CREATE INDEX idx_exams_subject_level_filiere ON public.exams (subject, school_level, filiere_id);
CREATE INDEX idx_exams_status ON public.exams (status);

-- Historique des versions soumises (une ligne par soumission), sur le
-- modèle de lesson_versions : conserve le contenu tel qu'il était au moment
-- de l'envoi, indépendamment des modifications ultérieures du brouillon.
CREATE TABLE public.exam_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title text,
  title_ar text,
  duration_minutes integer,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES public.profiles(id),
  submitted_by_name text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_by_name text,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_versions_exam ON public.exam_versions (exam_id, version_number DESC);

ALTER TABLE public.exam_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and pedago can view exam versions"
  ON public.exam_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role));

-- Écriture uniquement via les fonctions SECURITY DEFINER ci-dessous : pas de
-- policy INSERT/UPDATE/DELETE pour les rôles applicatifs.

-- Étudiants/parents : seuls les examens validés sont visibles. Admin et
-- pédago voient tout (brouillons, en attente, refusés, validés) pour
-- pouvoir gérer/valider le contenu.
DROP POLICY IF EXISTS "Authenticated users can view exams" ON public.exams;
CREATE POLICY "Approved exams visible to all; staff sees everything"
  ON public.exams FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'pedago'::public.app_role)
  );

-- Garde-fou : les colonnes de workflow (status, soumission, revue) ne sont
-- modifiables que via les fonctions RPC ci-dessous (drapeau de transaction
-- app.bypass_exam_lock, même mécanique que pour lessons/chapters). Un
-- examen soumis ('pending') ou validé ('approved') ne peut plus être
-- modifié directement par un pédago : seul un nouveau cycle brouillon (après
-- refus) ou l'admin peut le faire.
CREATE OR REPLACE FUNCTION public.guard_exam_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR current_setting('app.bypass_exam_lock', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.version_number IS DISTINCT FROM OLD.version_number
     OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
     OR NEW.submitted_by_name IS DISTINCT FROM OLD.submitted_by_name
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.reviewed_by_name IS DISTINCT FROM OLD.reviewed_by_name
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason THEN
    RAISE EXCEPTION 'Ce champ ne peut être modifié que via le workflow de validation.';
  END IF;

  IF OLD.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'Un examen soumis ou validé ne peut pas être modifié directement.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_exam_update ON public.exams;
CREATE TRIGGER trg_guard_exam_update
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.guard_exam_update();

-- Enregistre/actualise un brouillon d'examen (créé par la grille Pédago,
-- via IA ou import de document). p_exam_id NULL -> création. Modifier un
-- examen refusé le fait automatiquement repasser en brouillon éditable.
CREATE OR REPLACE FUNCTION public.save_exam_draft(
  p_exam_id uuid,
  p_subject text,
  p_school_level public.school_level,
  p_filiere_id uuid,
  p_trimester integer,
  p_title text,
  p_title_ar text,
  p_duration_minutes integer,
  p_content jsonb,
  p_chapter_ids uuid[],
  p_source text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
  v_status text;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  PERFORM set_config('app.bypass_exam_lock', 'on', true);

  IF p_exam_id IS NULL THEN
    INSERT INTO public.exams (
      subject, school_level, filiere_id, trimester, title, title_ar,
      duration_minutes, content, chapter_ids, source, status, created_by
    ) VALUES (
      p_subject, p_school_level, p_filiere_id, p_trimester, COALESCE(NULLIF(btrim(p_title), ''), 'Examen'), p_title_ar,
      COALESCE(p_duration_minutes, 60), COALESCE(p_content, '[]'::jsonb), p_chapter_ids, COALESCE(p_source, 'manual'), 'draft', auth.uid()
    )
    RETURNING id INTO v_id;
  ELSE
    SELECT status INTO v_status FROM public.exams WHERE id = p_exam_id;
    IF v_status IS NULL THEN
      RAISE EXCEPTION 'Examen introuvable.';
    END IF;
    IF v_status NOT IN ('draft', 'rejected') AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Cet examen est en cours de validation ou déjà validé ; il ne peut pas être modifié directement.';
    END IF;
    UPDATE public.exams SET
      title = COALESCE(NULLIF(btrim(p_title), ''), title),
      title_ar = p_title_ar,
      duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
      content = COALESCE(p_content, content),
      chapter_ids = COALESCE(p_chapter_ids, chapter_ids),
      trimester = COALESCE(p_trimester, trimester),
      filiere_id = p_filiere_id,
      status = 'draft',
      updated_at = now()
    WHERE id = p_exam_id;
    v_id := p_exam_id;
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_exam_draft(uuid, text, public.school_level, uuid, integer, text, text, integer, jsonb, uuid[], text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_exam_draft(uuid, text, public.school_level, uuid, integer, text, text, integer, jsonb, uuid[], text) TO authenticated;

-- Soumission à validation : pédago uniquement (l'admin ne crée pas
-- d'examen, voir spec). Archive une snapshot dans exam_versions.
CREATE OR REPLACE FUNCTION public.submit_exam_for_review(p_exam_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
  v_exam record;
  v_next_version integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'pedago'::public.app_role) THEN
    RAISE EXCEPTION 'Seul un pédagogue peut soumettre un examen à validation.';
  END IF;

  SELECT * INTO v_exam FROM public.exams WHERE id = p_exam_id;
  IF v_exam.id IS NULL THEN
    RAISE EXCEPTION 'Examen introuvable.';
  END IF;
  IF v_exam.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'Cet examen est déjà soumis ou validé.';
  END IF;
  IF v_exam.content IS NULL OR jsonb_array_length(v_exam.content) = 0 THEN
    RAISE EXCEPTION 'Ajoutez au moins un exercice avant de soumettre.';
  END IF;

  v_name := public.profile_display_name(auth.uid());
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version FROM public.exam_versions WHERE exam_id = p_exam_id;

  PERFORM set_config('app.bypass_exam_lock', 'on', true);
  UPDATE public.exams SET
    status = 'pending',
    version_number = v_next_version,
    submitted_by = auth.uid(),
    submitted_by_name = v_name,
    submitted_at = now(),
    rejection_reason = NULL
  WHERE id = p_exam_id;

  INSERT INTO public.exam_versions (
    exam_id, version_number, title, title_ar, duration_minutes, content, status, submitted_by, submitted_by_name
  ) VALUES (
    p_exam_id, v_next_version, v_exam.title, v_exam.title_ar, v_exam.duration_minutes, v_exam.content, 'pending', auth.uid(), v_name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exam_for_review(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_exam_for_review(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_exam(p_exam_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;
  v_name := public.profile_display_name(auth.uid());

  UPDATE public.exams SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
  WHERE id = p_exam_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucun examen en attente avec cet identifiant.';
  END IF;

  UPDATE public.exam_versions SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now()
  WHERE exam_id = p_exam_id AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.approve_exam(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_exam(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_exam(p_exam_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Merci de préciser un motif de refus.';
  END IF;
  v_name := public.profile_display_name(auth.uid());

  UPDATE public.exams SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = p_reason
  WHERE id = p_exam_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucun examen en attente avec cet identifiant.';
  END IF;

  UPDATE public.exam_versions SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = p_reason
  WHERE exam_id = p_exam_id AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.reject_exam(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_exam(uuid, text) TO authenticated;

-- =====================================================================
-- 3) File d'attente et historique admin : ajoute le type 'exam'
-- =====================================================================

DROP FUNCTION IF EXISTS public.admin_pending_content_items();

CREATE OR REPLACE FUNCTION public.admin_pending_content_items()
RETURNS TABLE (
  id uuid,
  item_type text,
  title text,
  difficulty integer,
  chapter_id uuid,
  chapter_title text,
  subject text,
  school_level public.school_level,
  filiere_id uuid,
  filiere_code text,
  filiere_name text,
  lesson_id uuid,
  lesson_title text,
  submitted_by_name text,
  submitted_at timestamptz,
  deletion_reason text,
  trimester integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ce.id, 'exercise'::text, ce.title, ce.difficulty,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    ce.submitted_by_name, ce.submitted_at, NULL::text, NULL::integer
  FROM public.chapter_exercises ce
  JOIN public.chapters ch ON ch.id = ce.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = ce.lesson_id
  WHERE ce.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    cq.id, 'quiz'::text, cq.question, cq.difficulty,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    cq.submitted_by_name, cq.submitted_at, NULL::text, NULL::integer
  FROM public.chapter_quizzes cq
  JOIN public.chapters ch ON ch.id = cq.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = cq.lesson_id
  WHERE cq.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    lv.id, 'lesson'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    lv.created_by_name, lv.created_at, NULL::text, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lesson_versions lv ON lv.id = l.pending_version_id
  WHERE l.pending_version_id IS NOT NULL AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    ch.id, 'chapter'::text, COALESCE(ch.title_ar, ch.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    ch.submitted_by_name, ch.submitted_at, NULL::text, NULL::integer
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_creation'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.submitted_by_name, l.submitted_at, NULL::text, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    ch.id, 'chapter_deletion'::text, COALESCE(ch.title_ar, ch.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    ch.deletion_requested_by_name, ch.deletion_requested_at, ch.deletion_reason, NULL::integer
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_deletion'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.deletion_requested_by_name, l.deletion_requested_at, l.deletion_reason, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    e.id, 'exam'::text, e.title, NULL::integer,
    NULL::uuid, NULL::text, e.subject, e.school_level,
    e.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    e.submitted_by_name, e.submitted_at, NULL::text, e.trimester
  FROM public.exams e
  LEFT JOIN public.filieres f ON f.id = e.filiere_id
  WHERE e.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_pending_content_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_pending_content_items() TO authenticated;

DROP FUNCTION IF EXISTS public.admin_content_review_history();

CREATE OR REPLACE FUNCTION public.admin_content_review_history()
RETURNS TABLE (
  id uuid,
  item_type text,
  title text,
  chapter_id uuid,
  chapter_title text,
  subject text,
  school_level public.school_level,
  filiere_id uuid,
  filiere_code text,
  filiere_name text,
  lesson_id uuid,
  lesson_title text,
  status text,
  rejection_reason text,
  submitted_by_name text,
  reviewed_by_name text,
  reviewed_at timestamptz,
  trimester integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ce.id, 'exercise'::text, ce.title,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    ce.status, ce.rejection_reason, ce.submitted_by_name, ce.reviewed_by_name, ce.reviewed_at, NULL::integer
  FROM public.chapter_exercises ce
  JOIN public.chapters ch ON ch.id = ce.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = ce.lesson_id
  WHERE ce.status IN ('approved', 'rejected') AND ce.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    cq.id, 'quiz'::text, cq.question,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    cq.status, cq.rejection_reason, cq.submitted_by_name, cq.reviewed_by_name, cq.reviewed_at, NULL::integer
  FROM public.chapter_quizzes cq
  JOIN public.chapters ch ON ch.id = cq.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  LEFT JOIN public.lessons l ON l.id = cq.lesson_id
  WHERE cq.status IN ('approved', 'rejected') AND cq.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    lv.id, 'lesson'::text, COALESCE(l.title_ar, l.title),
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    lv.status, lv.rejection_reason, lv.created_by_name, lv.reviewed_by_name, lv.reviewed_at, NULL::integer
  FROM public.lesson_versions lv
  JOIN public.lessons l ON l.id = lv.lesson_id
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE lv.status IN ('approved', 'rejected') AND lv.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    ch.id, 'chapter'::text, COALESCE(ch.title_ar, ch.title),
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    ch.status, ch.rejection_reason, ch.submitted_by_name, ch.reviewed_by_name, ch.reviewed_at, NULL::integer
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.status IN ('approved', 'rejected') AND ch.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_creation'::text, COALESCE(l.title_ar, l.title),
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.status, l.rejection_reason, l.submitted_by_name, l.reviewed_by_name, l.reviewed_at, NULL::integer
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.status IN ('approved', 'rejected') AND l.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    e.id, 'exam'::text, e.title,
    NULL::uuid, NULL::text, e.subject, e.school_level,
    e.filiere_id, f.code, f.name,
    NULL::uuid, NULL::text,
    e.status, e.rejection_reason, e.submitted_by_name, e.reviewed_by_name, e.reviewed_at, e.trimester
  FROM public.exams e
  LEFT JOIN public.filieres f ON f.id = e.filiere_id
  WHERE e.status IN ('approved', 'rejected') AND e.reviewed_by = auth.uid()
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY reviewed_at DESC NULLS LAST
  LIMIT 300;
$$;

REVOKE ALL ON FUNCTION public.admin_content_review_history() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_content_review_history() TO authenticated;

-- =====================================================================
-- 4) Journal d'activité pédago : ajoute le type 'exam'
-- =====================================================================

ALTER TABLE public.pedago_activity_log DROP CONSTRAINT pedago_activity_log_entity_type_check;
ALTER TABLE public.pedago_activity_log
  ADD CONSTRAINT pedago_activity_log_entity_type_check
  CHECK (entity_type IN ('chapter', 'lesson', 'lesson_content', 'exam'));

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
      WHEN l.entity_type = 'exam' THEN COALESCE(ex2.status, 'deleted')
      ELSE NULL
    END AS review_status
  FROM my_log l
  LEFT JOIN public.chapters ch2 ON l.entity_type = 'chapter' AND ch2.id = l.entity_id
  LEFT JOIN public.lessons ls2 ON l.entity_type = 'lesson' AND ls2.id = l.entity_id
  LEFT JOIN public.exams ex2 ON l.entity_type = 'exam' AND ex2.id = l.entity_id
  LEFT JOIN lesson_content_rank lcr ON lcr.log_id = l.id
  LEFT JOIN version_rank vr ON l.entity_type = 'lesson_content' AND vr.lesson_id = l.entity_id AND vr.rn = lcr.rn
  ORDER BY l.created_at DESC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.pedago_activity_log_with_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pedago_activity_log_with_status() TO authenticated;

NOTIFY pgrst, 'reload schema';
