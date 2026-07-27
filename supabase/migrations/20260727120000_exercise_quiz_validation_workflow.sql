-- Workflow de validation pédago -> admin pour les exercices/quiz générés par l'IA.
-- Jusqu'ici, la génération IA (bulk-gen-terminale-gemini) insérait directement
-- dans chapter_exercises/chapter_quizzes, visibles immédiatement par les élèves
-- (via get_student_exercises/get_student_quizzes). On introduit un statut :
--   - 'draft'    : généré par l'IA, visible seulement du pédago (édition libre),
--                  jamais visible des élèves.
--   - 'pending'  : le pédago a cliqué "Envoyer" -> en attente de décision admin.
--   - 'approved' : validé par l'admin -> visible des élèves. Comportement par
--                  défaut ('approved') pour tout ce qui existait déjà et pour
--                  la création manuelle pédago/admin (inchangée, publication
--                  immédiate comme avant).
--   - 'rejected' : refusé par l'admin (motif optionnel) -> affiché en rouge
--                  côté pédago, qui peut corriger puis renvoyer.

-- 1) Colonnes de statut + traçabilité sur les deux tables
ALTER TABLE public.chapter_exercises
  ADD COLUMN status text NOT NULL DEFAULT 'approved',
  ADD COLUMN submitted_by uuid REFERENCES public.profiles(id),
  ADD COLUMN submitted_by_name text,
  ADD COLUMN submitted_at timestamptz,
  ADD COLUMN reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN reviewed_by_name text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN rejection_reason text;

ALTER TABLE public.chapter_exercises
  ADD CONSTRAINT chapter_exercises_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

ALTER TABLE public.chapter_quizzes
  ADD COLUMN status text NOT NULL DEFAULT 'approved',
  ADD COLUMN submitted_by uuid REFERENCES public.profiles(id),
  ADD COLUMN submitted_by_name text,
  ADD COLUMN submitted_at timestamptz,
  ADD COLUMN reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN reviewed_by_name text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN rejection_reason text;

ALTER TABLE public.chapter_quizzes
  ADD CONSTRAINT chapter_quizzes_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

CREATE INDEX idx_chapter_exercises_status ON public.chapter_exercises (chapter_id, status);
CREATE INDEX idx_chapter_quizzes_status ON public.chapter_quizzes (chapter_id, status);

-- 2) get_student_* ne renvoient plus que le contenu validé
CREATE OR REPLACE FUNCTION public.get_student_quizzes(_chapter_id uuid, _lesson_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, chapter_id uuid, lesson_id uuid, question text, options jsonb, correct_answer text, explanation text, difficulty integer, order_index integer, hint text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT cq.id, cq.chapter_id, cq.lesson_id, cq.question, cq.options, cq.correct_answer, cq.explanation, cq.difficulty, cq.order_index, cq.hint
  FROM public.chapter_quizzes cq
  WHERE cq.chapter_id = _chapter_id AND (_lesson_id IS NULL OR cq.lesson_id = _lesson_id) AND cq.status = 'approved'
  ORDER BY cq.order_index;
$function$;

CREATE OR REPLACE FUNCTION public.get_student_exercises(_chapter_id uuid, _lesson_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, chapter_id uuid, lesson_id uuid, title text, statement text, expected_answer text, accepted_answers jsonb, solution text, difficulty integer, order_index integer, hint text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT ce.id, ce.chapter_id, ce.lesson_id, ce.title, ce.statement, ce.expected_answer, ce.accepted_answers::jsonb, ce.solution, ce.difficulty, ce.order_index, ce.hint
  FROM public.chapter_exercises ce
  WHERE ce.chapter_id = _chapter_id AND (_lesson_id IS NULL OR ce.lesson_id = _lesson_id) AND ce.status = 'approved'
  ORDER BY ce.order_index;
$function$;

-- 3) RPCs de transition d'état (génériques via p_item_type, comme le reste du
--    schéma distingue exercices/quiz par des fonctions parallèles, mais ici
--    factorisées pour éviter 6 fonctions quasi identiques).

-- Le pédago envoie un item (brouillon ou refusé, corrigé) en attente de validation admin.
CREATE OR REPLACE FUNCTION public.submit_chapter_item_for_review(p_item_type text, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz') THEN
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
  ELSE
    UPDATE public.chapter_quizzes
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE id = p_item_id AND status IN ('draft', 'rejected');
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà envoyé.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_chapter_item_for_review(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_chapter_item_for_review(text, uuid) TO authenticated;

-- Envoi groupé : tous les brouillons/refusés d'un chapitre (et, si fourni, d'une
-- leçon précise) en une fois. Retourne le nombre d'items envoyés.
CREATE OR REPLACE FUNCTION public.submit_chapter_items_for_review(p_item_type text, p_chapter_id uuid, p_lesson_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
  v_count integer;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz') THEN
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
    WHERE chapter_id = p_chapter_id AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id) AND status IN ('draft', 'rejected');
  ELSE
    UPDATE public.chapter_quizzes
    SET status = 'pending', submitted_by = auth.uid(), submitted_by_name = v_name, submitted_at = now(),
        reviewed_by = NULL, reviewed_by_name = NULL, reviewed_at = NULL, rejection_reason = NULL
    WHERE chapter_id = p_chapter_id AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id) AND status IN ('draft', 'rejected');
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_chapter_items_for_review(text, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_chapter_items_for_review(text, uuid, uuid) TO authenticated;

-- L'admin valide : l'item devient visible des élèves.
CREATE OR REPLACE FUNCTION public.approve_chapter_item(p_item_type text, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz') THEN
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
  ELSE
    UPDATE public.chapter_quizzes
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULL
    WHERE id = p_item_id AND status = 'pending';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà traité.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_chapter_item(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_chapter_item(text, uuid) TO authenticated;

-- L'admin refuse, avec un motif optionnel : l'item reste invisible des élèves,
-- affiché en rouge côté pédago, qui pourra corriger et renvoyer.
CREATE OR REPLACE FUNCTION public.reject_chapter_item(p_item_type text, p_item_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_item_type NOT IN ('exercise', 'quiz') THEN
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
  ELSE
    UPDATE public.chapter_quizzes
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_by_name = v_name, reviewed_at = now(), rejection_reason = NULLIF(trim(p_reason), '')
    WHERE id = p_item_id AND status = 'pending';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Élément introuvable ou déjà traité.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_chapter_item(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_chapter_item(text, uuid, text) TO authenticated;

-- 4) Liste, pour l'admin, de tout le contenu en attente avec son contexte
--    complet (matière, niveau, filière, chapitre, leçon) pour construire la
--    notification en cascade côté UI. Vide pour un non-admin (pas d'erreur,
--    juste aucune ligne), même principe que admin_get_last_sign_in_times.
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
  WHERE cq.status = 'pending' AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_pending_content_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_pending_content_items() TO authenticated;

-- 5) DURCISSEMENT DÉFENSIF — comme pour chapters/lessons (20260723140200),
--    chapter_exercises/chapter_quizzes sont antérieures à l'historique de
--    migrations suivi ici : impossible de confirmer leur RLS actuelle. Les
--    élèves ne doivent lire ces tables QUE via get_student_exercises/
--    get_student_quizzes (SECURITY DEFINER, filtrent déjà status='approved'
--    et contournent RLS) — un accès direct à la table exposerait les
--    brouillons/items en attente. On restreint donc la lecture directe à
--    l'admin et au pédago, qui en ont besoin pour l'édition.
ALTER TABLE public.chapter_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view chapter exercises" ON public.chapter_exercises;
DROP POLICY IF EXISTS "Admin and pedago view chapter exercises" ON public.chapter_exercises;
CREATE POLICY "Admin and pedago view chapter exercises"
  ON public.chapter_exercises FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

DROP POLICY IF EXISTS "Admin and pedago manage chapter exercises" ON public.chapter_exercises;
CREATE POLICY "Admin and pedago manage chapter exercises"
  ON public.chapter_exercises FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

DROP POLICY IF EXISTS "Authenticated users can view chapter quizzes" ON public.chapter_quizzes;
DROP POLICY IF EXISTS "Admin and pedago view chapter quizzes" ON public.chapter_quizzes;
CREATE POLICY "Admin and pedago view chapter quizzes"
  ON public.chapter_quizzes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

DROP POLICY IF EXISTS "Admin and pedago manage chapter quizzes" ON public.chapter_quizzes;
CREATE POLICY "Admin and pedago manage chapter quizzes"
  ON public.chapter_quizzes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

NOTIFY pgrst, 'reload schema';
