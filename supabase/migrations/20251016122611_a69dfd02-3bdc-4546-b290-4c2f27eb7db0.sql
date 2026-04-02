-- Supprimer les chapitres du thème général pour le cours de français
DELETE FROM course_chapters
WHERE course_id IN (
  SELECT id FROM courses WHERE subject_id = 'francais'
)
AND (theme IS NULL OR theme = 'Thème général');