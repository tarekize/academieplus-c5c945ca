-- SÉCURITÉ — "Teachers manage their own assignments" (20260623134357) ne
-- vérifiait que auth.uid() = assigned_by, jamais que le contenu assigné
-- (content_id) appartient bien à cet enseignant, ni que la classe/l'élève
-- ciblé lui appartient. Un compte enseignant pouvait donc insérer une ligne
-- d'assignation reliant le teacher_content d'UN AUTRE enseignant à sa PROPRE
-- classe : la policy "Students view content assigned to them" (même
-- migration) donne alors accès en lecture à ce contenu à tous les élèves de
-- cette classe, via une simple jointure EXISTS sur teacher_content_assignments
-- — une fuite de contenu entre enseignants qui ne dépend d'aucun bug RLS côté
-- lecture, seulement de l'absence de vérification côté écriture.
DROP POLICY IF EXISTS "Teachers manage their own assignments" ON public.teacher_content_assignments;

CREATE POLICY "Teachers manage their own assignments"
  ON public.teacher_content_assignments FOR ALL TO authenticated
  USING (auth.uid() = assigned_by)
  WITH CHECK (
    auth.uid() = assigned_by
    AND EXISTS (
      SELECT 1 FROM public.teacher_content tc
      WHERE tc.id = teacher_content_assignments.content_id AND tc.teacher_id = auth.uid()
    )
    AND (
      class_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.classes c
        WHERE c.id = teacher_content_assignments.class_id AND c.teacher_id = auth.uid()
      )
    )
    AND (
      student_id IS NULL
      OR public.is_teacher_of(auth.uid(), student_id)
    )
  );

NOTIFY pgrst, 'reload schema';
