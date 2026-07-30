-- Workflow de validation pédago -> admin pour la SUPPRESSION de chapitres et
-- de leçons. Jusqu'ici, DeleteChapterButton/DeleteLessonButton (PedagoCRUD.tsx)
-- supprimaient directement la ligne, qu'elle soit déjà publiée (visible des
-- élèves) ou non, quel que soit le rôle de l'auteur.
--
-- Nouveau comportement :
--   - un admin supprime toujours immédiatement (inchangé) ;
--   - un pédago qui supprime un chapitre/une leçon jamais publié (status
--     'pending' ou 'rejected', donc déjà invisible des élèves) supprime
--     aussi immédiatement : rien à protéger ;
--   - un pédago qui supprime un chapitre/une leçon actuellement publié
--     (status 'approved') ne supprime plus directement : la ligne reste
--     intacte et visible des élèves, seulement marquée
--     deletion_requested = true, en attente de décision admin ;
--   - l'admin confirme (suppression réelle, cascade leçons pour un
--     chapitre) ou annule (deletion_requested repasse à false, rien ne
--     change pour les élèves).
-- Colonne séparée de `status` (plutôt que d'y ajouter une valeur
-- 'pending_deletion') : la ligne reste ainsi 'approved' et visible pendant
-- toute la durée de la demande, sans toucher aux policies RLS existantes.

ALTER TABLE public.chapters
  ADD COLUMN deletion_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN deletion_requested_by uuid REFERENCES public.profiles(id),
  ADD COLUMN deletion_requested_by_name text,
  ADD COLUMN deletion_requested_at timestamptz;

ALTER TABLE public.lessons
  ADD COLUMN deletion_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN deletion_requested_by uuid REFERENCES public.profiles(id),
  ADD COLUMN deletion_requested_by_name text,
  ADD COLUMN deletion_requested_at timestamptz;

CREATE INDEX idx_chapters_deletion_requested ON public.chapters (deletion_requested) WHERE deletion_requested;
CREATE INDEX idx_lessons_deletion_requested ON public.lessons (deletion_requested) WHERE deletion_requested;

-- Étend les garde-fous existants : ces 4 colonnes ne sont modifiables que via
-- les RPC de confiance ci-dessous (mêmes drapeaux de transaction que pour le
-- statut de contenu), pas directement par le client.
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
       OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at THEN
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
       OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de validation d''une leçon.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Pédago : demande la suppression d'un chapitre/leçon publié (statut
-- 'approved'). Un chapitre/leçon jamais publié ('pending'/'rejected') est
-- supprimé immédiatement, ainsi que pour un admin (quel que soit le statut) —
-- rien à protéger dans ces cas, pas de ligne créée dans la file d'attente.
-- Retourne true si la ligne a été supprimée immédiatement, false si une
-- demande a été enregistrée en attente de décision admin.
CREATE OR REPLACE FUNCTION public.request_item_deletion(p_item_type text, p_item_id uuid)
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

  IF p_item_type = 'chapter' THEN
    PERFORM set_config('app.bypass_chapter_status_lock', 'on', true);
    UPDATE public.chapters
    SET deletion_requested = true, deletion_requested_by = auth.uid(), deletion_requested_by_name = v_name, deletion_requested_at = now()
    WHERE id = p_item_id AND deletion_requested = false;
  ELSE
    PERFORM set_config('app.bypass_lesson_status_lock', 'on', true);
    UPDATE public.lessons
    SET deletion_requested = true, deletion_requested_by = auth.uid(), deletion_requested_by_name = v_name, deletion_requested_at = now()
    WHERE id = p_item_id AND deletion_requested = false;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Une demande de suppression est déjà en attente pour cet élément.';
  END IF;
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.request_item_deletion(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_item_deletion(text, uuid) TO authenticated;

-- Admin : confirme la suppression demandée par le pédago (suppression réelle).
CREATE OR REPLACE FUNCTION public.approve_item_deletion(p_item_type text, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_item_type NOT IN ('chapter', 'lesson') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  IF p_item_type = 'chapter' THEN
    IF NOT EXISTS (SELECT 1 FROM public.chapters WHERE id = p_item_id AND deletion_requested = true) THEN
      RAISE EXCEPTION 'Aucune demande de suppression en attente pour ce chapitre.';
    END IF;
    DELETE FROM public.lessons WHERE chapter_id = p_item_id;
    DELETE FROM public.chapters WHERE id = p_item_id;
  ELSE
    DELETE FROM public.lessons WHERE id = p_item_id AND deletion_requested = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Aucune demande de suppression en attente pour cette leçon.';
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_item_deletion(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_item_deletion(text, uuid) TO authenticated;

-- Admin : refuse la suppression demandée — la ligne reste intacte, visible
-- des élèves comme avant, deletion_requested repasse à false.
CREATE OR REPLACE FUNCTION public.reject_item_deletion(p_item_type text, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_item_type NOT IN ('chapter', 'lesson') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  IF p_item_type = 'chapter' THEN
    UPDATE public.chapters
    SET deletion_requested = false, deletion_requested_by = NULL, deletion_requested_by_name = NULL, deletion_requested_at = NULL
    WHERE id = p_item_id AND deletion_requested = true;
  ELSE
    UPDATE public.lessons
    SET deletion_requested = false, deletion_requested_by = NULL, deletion_requested_by_name = NULL, deletion_requested_at = NULL
    WHERE id = p_item_id AND deletion_requested = true;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucune demande de suppression en attente pour cet élément.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_item_deletion(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_item_deletion(text, uuid) TO authenticated;

-- admin_pending_content_items() : ajoute les demandes de suppression de
-- chapitres/leçons à la liste unifiée consommée par /admin/validation.
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
  submitted_at timestamptz
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
    ce.submitted_by_name, ce.submitted_at
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
    cq.submitted_by_name, cq.submitted_at
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
    lv.created_by_name, lv.created_at
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
    ch.submitted_by_name, ch.submitted_at
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_creation'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.submitted_by_name, l.submitted_at
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
    ch.deletion_requested_by_name, ch.deletion_requested_at
  FROM public.chapters ch
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE ch.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role)
  UNION ALL
  SELECT
    l.id, 'lesson_deletion'::text, COALESCE(l.title_ar, l.title), NULL::integer,
    ch.id, COALESCE(ch.title_ar, ch.title), ch.subject, ch.school_level,
    ch.filiere_id, f.code, f.name,
    l.id, COALESCE(l.title_ar, l.title),
    l.deletion_requested_by_name, l.deletion_requested_at
  FROM public.lessons l
  JOIN public.chapters ch ON ch.id = l.chapter_id
  LEFT JOIN public.filieres f ON f.id = ch.filiere_id
  WHERE l.deletion_requested = true AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

NOTIFY pgrst, 'reload schema';
