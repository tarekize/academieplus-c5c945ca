-- Simplifier les titres des thèmes en "Thème 1", "Thème 2", "Thème 3"
UPDATE course_chapters
SET theme = CASE 
  WHEN theme = 'La poésie du Moyen Âge au XVIIIe siècle 1' THEN 'Thème 1'
  WHEN theme = 'Les outils d''analyse d''un texte littéraire 2' THEN 'Thème 2'
  WHEN theme = 'Étude de la langue 3' THEN 'Thème 3'
  ELSE theme
END
WHERE course_id IN (
  SELECT id FROM courses WHERE subject_id = 'francais'
);