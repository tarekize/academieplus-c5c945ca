-- Un établissement pouvait voir le lien enseignant, la classe et le nombre
-- d'élèves (comptés via class_students, déjà lisible), mais aucune policy RLS
-- n'autorisait la lecture de profiles/student_scores pour ces élèves — donc
-- ClassProgressView (filtre les membres dont le profil est introuvable)
-- affichait "Aucun élève dans cette classe" malgré des inscriptions réelles,
-- et la fiche élève ouverte depuis l'onglet "Élèves" affichait 0% partout et
-- "Aucun chapitre disponible" (les notes venant de student_scores, bloquées).
-- Même chose que "Teachers can view their students profiles/scores" côté
-- enseignant, étendue au compte établissement lié via is_establishment_teacher().
CREATE OR REPLACE FUNCTION public.is_establishment_student(_est_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.student_id = _student_id
      AND public.is_establishment_teacher(_est_id, c.teacher_id)
  )
$$;

CREATE POLICY "Establishments can view their students profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_establishment_student(auth.uid(), id));

CREATE POLICY "Establishments can view their students scores"
  ON public.student_scores FOR SELECT
  TO authenticated
  USING (public.is_establishment_student(auth.uid(), user_id));
