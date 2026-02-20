-- Ajouter un numéro à la fin de chaque thème pour les cours de français
UPDATE course_chapters
SET theme = CASE 
  WHEN theme = 'La poésie du Moyen Âge au XVIIIe siècle' THEN 'La poésie du Moyen Âge au XVIIIe siècle 1'
  WHEN theme = 'Les outils d''analyse d''un texte littéraire' THEN 'Les outils d''analyse d''un texte littéraire 2'
  WHEN theme = 'Étude de la langue' THEN 'Étude de la langue 3'
  ELSE theme
END
WHERE course_id IN (
  SELECT id FROM courses WHERE subject_id = 'francais'
);