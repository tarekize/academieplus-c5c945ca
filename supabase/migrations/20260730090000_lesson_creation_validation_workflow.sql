-- Workflow de validation pédago -> admin pour la CRÉATION de leçons (le
-- conteneur lui-même : titre + existence), distinct du contenu de la leçon
-- déjà couvert par 20260726120000 (lessons.content / lesson_versions).
--
-- Jusqu'ici, une leçon créée par un pédago (LessonFormDialog, PedagoCRUD.tsx)
-- était insérée directement dans `lessons`, visible immédiatement des élèves
-- dans la liste des leçons d'un chapitre déjà approuvé (RLS sur `lessons`
-- était `USING (true)` sans condition de statut). Un chapitre créé par un
-- pédago est déjà masqué tant qu'il n'est pas approuvé (20260729090000),
-- mais ce n'était pas le cas d'une leçon ajoutée à un chapitre déjà publié.
-- On aligne ce comportement sur celui des chapitres :
--   - une leçon créée par un pédago est insérée avec status='pending', non
--     visible des élèves, en attente de décision admin ;
--   - une leçon créée par un admin reste publiée immédiatement
--     (status='approved', comportement inchangé) ;
--   - l'admin valide (visible des élèves) ou refuse (motif optionnel ; le
--     pédago peut alors renvoyer via submit_chapter_item_for_review) ;
--   - réutilise le même vocabulaire que chapters/chapter_exercises/
--     chapter_quizzes (submit_chapter_item_for_review / approve_chapter_item /
--     reject_chapter_item), étendu ici pour accepter p_item_type =
--     'lesson_creation' (distinct du type 'lesson' déjà utilisé par
--     admin_pending_content_items pour désigner une VERSION de contenu en
--     attente, dont l'id pointe vers lesson_versions et non vers lessons).

-- 1) Colonnes de statut + traçabilité (mêmes noms que chapters)
ALTER TABLE public.lessons
  ADD COLUMN status text NOT NULL DEFAULT 'approved',
  ADD COLUMN submitted_by uuid REFERENCES public.profiles(id),
  ADD COLUMN submitted_by_name text,
  ADD COLUMN submitted_at timestamptz,
  ADD COLUMN reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN reviewed_by_name text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN rejection_reason text;

ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

CREATE INDEX idx_lessons_status ON public.lessons (status);

-- 2) Seules les leçons approuvées sont visibles des élèves/enseignants/
--    parents ; admin et pédago voient tout (y compris leurs propres
--    soumissions en attente ou refusées), comme pour chapters.
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;
CREATE POLICY "Authenticated users can view lessons"
  ON public.lessons FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago'))
  );

-- 3) Garde-fous serveur, même principe que guard_chapter_insert/guard_chapter_update.
CREATE OR REPLACE FUNCTION public.guard_lesson_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  v_name := public.profile_display_name(auth.uid());
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.status := 'approved';
    NEW.submitted_by := NULL;
    NEW.submitted_by_name := NULL;
    NEW.submitted_at := NULL;
    NEW.reviewed_by := NULL;
    NEW.reviewed_by_name := NULL;
    NEW.reviewed_at := NULL;
    NEW.rejection_reason := NULL;
  ELSE
    NEW.status := 'pending';
    NEW.submitted_by := auth.uid();
    NEW.submitted_by_name := v_name;
    NEW.submitted_at := now();
    NEW.reviewed_by := NULL;
    NEW.reviewed_by_name := NULL;
    NEW.reviewed_at := NULL;
    NEW.rejection_reason := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_lesson_insert ON public.lessons;
CREATE TRIGGER trg_guard_lesson_insert
  BEFORE INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_lesson_insert();

-- Distinct du trigger existant trg_guard_lesson_content (qui protège déjà la
-- colonne `content`) : celui-ci protège le statut/la traçabilité de la
-- création de la leçon. Échappatoire (app.bypass_lesson_status_lock) pour
-- submit_chapter_item_for_review, qui renvoie lui-même une leçon refusée
-- vers 'pending' au nom du pédago.
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
       OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de validation d''une leçon.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_lesson_status_update ON public.lessons;
CREATE TRIGGER trg_guard_lesson_status_update
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_lesson_status_update();

-- 4) Étend les 3 fonctions de transition d'état existantes pour accepter
--    aussi 'lesson_creation' (création/existence de la leçon, par opposition
--    à 'lesson' qui désigne une version de contenu dans admin_pending_content_items).

CREATE OR REPLACE FUNCTION public.submit_chapter_item_for_review(p_item_type text, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz', 'chapter', 'lesson_creation') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role)) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs et pédagogues.';
  END IF;

  v_name := public.profile_display_name(auth.uid());

  IF p_item_type = 'exercise' THEN
    UPDATE public.chapter_exercises
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status IN ('draft', 'rejected');
  ELSIF p_item_type = 'quiz' THEN
    UPDATE public.chapter_quizzes
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status IN ('draft', 'rejected');
  ELSIF p_item_type = 'chapter' THEN
    PERFORM set_config('app.bypass_chapter_status_lock', 'on', true);
    UPDATE public.chapters
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status = 'rejected';
  ELSE
    PERFORM set_config('app.bypass_lesson_status_lock', 'on', true);
    UPDATE public.lessons
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status = 'rejected';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà envoyé.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_chapter_item(p_item_type text, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz', 'chapter', 'lesson_creation') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  v_name := public.profile_display_name(auth.uid());

  IF p_item_type = 'exercise' THEN
    UPDATE public.chapter_exercises
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
    WHERE id = p_item_id AND status = 'pending';
  ELSIF p_item_type = 'quiz' THEN
    UPDATE public.chapter_quizzes
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
    WHERE id = p_item_id AND status = 'pending';
  ELSIF p_item_type = 'chapter' THEN
    UPDATE public.chapters
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
    WHERE id = p_item_id AND status = 'pending';
  ELSE
    UPDATE public.lessons
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
    WHERE id = p_item_id AND status = 'pending';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà traité.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_chapter_item(p_item_type text, p_item_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz', 'chapter', 'lesson_creation') THEN
    RAISE EXCEPTION 'Type invalide.';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.';
  END IF;

  v_name := public.profile_display_name(auth.uid());

  IF p_item_type = 'exercise' THEN
    UPDATE public.chapter_exercises
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULLIF(trim(p_reason), '')
    WHERE id = p_item_id AND status = 'pending';
  ELSIF p_item_type = 'quiz' THEN
    UPDATE public.chapter_quizzes
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULLIF(trim(p_reason), '')
    WHERE id = p_item_id AND status = 'pending';
  ELSIF p_item_type = 'chapter' THEN
    UPDATE public.chapters
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULLIF(trim(p_reason), '')
    WHERE id = p_item_id AND status = 'pending';
  ELSE
    UPDATE public.lessons
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULLIF(trim(p_reason), '')
    WHERE id = p_item_id AND status = 'pending';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà traité.';
  END IF;
END;
$$;

-- 5) admin_pending_content_items() : ajoute les leçons en attente de création
--    ('lesson_creation', id = lessons.id) à la liste unifiée. Le type 'lesson'
--    existant (id = lesson_versions.id, contenu en attente) reste inchangé.
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
  WHERE l.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

NOTIFY pgrst, 'reload schema';
