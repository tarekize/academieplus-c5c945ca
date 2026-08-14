-- Persiste la progression d'un élève dans un examen (module Examens élève) :
-- avant cette table, le chrono et les réponses vivaient uniquement dans le
-- state React d'ExamViewer, donc quitter puis revenir sur l'examen remettait
-- le compte à rebours à zéro et perdait les réponses déjà saisies.
-- `started_at` est figé au tout premier accès : le temps restant est
-- recalculé côté client à partir de cet horodatage serveur, donc il continue
-- de s'écouler même hors de la page (pas de "pause").
CREATE TABLE public.exam_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  -- Réponses de l'élève : tableau (un par exercice) de tableaux de chaînes
  -- (une par sous-question, ou une seule case si l'exercice n'en a pas).
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Statut de correction par question, même forme que `answers` : chaque
  -- case vaut "unanswered" | "correct" | "incorrect". Une case "correct"
  -- verrouille définitivement la question côté UI (plus de resaisie).
  status jsonb NOT NULL DEFAULT '[]'::jsonb,
  submitted boolean NOT NULL DEFAULT false,
  submitted_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_exam_progress_student ON public.exam_progress (student_id);

ALTER TABLE public.exam_progress ENABLE ROW LEVEL SECURITY;

-- Un élève ne gère que sa propre progression (lecture/écriture) ; aucun
-- accès enseignant/pédago/admin nécessaire, cette table est un simple
-- "brouillon en cours" côté élève.
CREATE POLICY "Students manage their own exam progress"
  ON public.exam_progress FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE TRIGGER exam_progress_updated_at
  BEFORE UPDATE ON public.exam_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
