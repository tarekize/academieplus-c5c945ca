-- Anomalie #41 de l'audit UX : les simulations d'examen (Simulation.tsx)
-- n'étaient jamais enregistrées, empêchant tout historique ou comparaison
-- ("+3 vs ton dernier essai") avec les tentatives précédentes.

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  duration_seconds integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_attempts_student_subject
  ON public.exam_attempts (student_id, subject_id, created_at DESC);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own exam attempts"
  ON public.exam_attempts FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can record their own exam attempts"
  ON public.exam_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);
