-- Correction manuelle par l'enseignant des réponses d'exercice envoyées sans
-- réponse attendue/corrigé fournis à l'avance : l'élève soumet, la réponse
-- reste "en attente" (is_correct = null) jusqu'à ce que l'enseignant la
-- corrige lui-même depuis "Suivi de la classe". Il ne pouvait jusqu'ici que
-- consulter (SELECT) les tentatives, jamais les corriger.
CREATE POLICY "Teachers grade attempts on their content"
  ON public.teacher_content_attempts FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teacher_content tc
    WHERE tc.id = teacher_content_attempts.content_id AND tc.teacher_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.teacher_content tc
    WHERE tc.id = teacher_content_attempts.content_id AND tc.teacher_id = auth.uid()
  ));

-- Realtime : l'élève voit la correction de l'enseignant apparaître sans
-- recharger la page (bascule automatique "en attente" -> "correct"/"incorrect").
ALTER TABLE public.teacher_content_attempts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_content_attempts;
