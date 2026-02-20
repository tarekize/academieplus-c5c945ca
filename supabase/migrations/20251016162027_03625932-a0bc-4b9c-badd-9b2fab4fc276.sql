-- 1. Retirer l'accès public à quiz_questions
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;

-- 2. Créer une vue publique qui exclut les réponses correctes
CREATE OR REPLACE VIEW public.quiz_questions_public AS
SELECT 
  id,
  subject_id,
  school_level,
  question,
  options,
  difficulty,
  explanation,
  created_at
FROM public.quiz_questions;

-- 3. Permettre à tous de voir la vue publique (sans réponses)
GRANT SELECT ON public.quiz_questions_public TO anon, authenticated;

-- 4. Créer une politique pour que seuls les admins voient les réponses
CREATE POLICY "Only admins can view quiz questions with answers"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 5. Créer une table pour stocker les réponses soumises par les utilisateurs
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id, submitted_at)
);

-- 6. Activer RLS sur quiz_submissions
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- 7. Les utilisateurs peuvent voir leurs propres soumissions
CREATE POLICY "Users can view their own submissions"
ON public.quiz_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 8. Les utilisateurs peuvent créer leurs propres soumissions
CREATE POLICY "Users can create their own submissions"
ON public.quiz_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 9. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_question_id ON public.quiz_submissions(question_id);