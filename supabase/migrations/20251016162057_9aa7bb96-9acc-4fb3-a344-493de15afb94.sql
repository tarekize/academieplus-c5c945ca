-- Corriger le problème de vue SECURITY DEFINER
-- La vue ne doit pas utiliser SECURITY DEFINER car elle n'a pas besoin de contourner RLS

DROP VIEW IF EXISTS public.quiz_questions_public;

-- Créer une vue standard (sans SECURITY DEFINER) qui exclut les réponses
CREATE VIEW public.quiz_questions_public WITH (security_invoker = true) AS
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

-- Permettre l'accès à la vue
GRANT SELECT ON public.quiz_questions_public TO anon, authenticated;