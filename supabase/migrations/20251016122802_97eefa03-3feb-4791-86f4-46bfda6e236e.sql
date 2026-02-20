-- Supprimer les doublons de chapitres en gardant seulement le premier de chaque groupe
DELETE FROM course_chapters
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY course_id, title, theme 
             ORDER BY order_index ASC, created_at ASC
           ) as rn
    FROM course_chapters
    WHERE course_id IN (
      SELECT id FROM courses WHERE subject_id = 'francais'
    )
  ) t
  WHERE rn > 1
);