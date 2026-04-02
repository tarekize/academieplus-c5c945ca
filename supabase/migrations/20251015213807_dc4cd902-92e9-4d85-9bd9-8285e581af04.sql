-- Supprimer tous les doublons de chapitres en gardant le plus ancien (créé en premier) pour chaque combinaison (course_id, title, order_index)
DELETE FROM public.course_chapters
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY course_id, title, order_index ORDER BY created_at) as rn
    FROM public.course_chapters
    WHERE course_id IN (
      SELECT id FROM public.courses 
      WHERE subject_id = 'francais' AND title = 'Étude de la langue'
    )
  ) t
  WHERE rn > 1
);