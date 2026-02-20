-- Ajouter la colonne theme à la table course_chapters
ALTER TABLE course_chapters ADD COLUMN IF NOT EXISTS theme TEXT;

-- Ajouter les nouveaux chapitres thématiques pour le cours de français
DO $$
DECLARE
  course_record RECORD;
  base_order_index INTEGER;
BEGIN
  -- Pour chaque cours de français (tous les niveaux scolaires)
  FOR course_record IN 
    SELECT id, school_level 
    FROM courses 
    WHERE subject_id = 'francais'
  LOOP
    -- Trouver le prochain order_index disponible
    SELECT COALESCE(MAX(order_index), -1) + 1 INTO base_order_index
    FROM course_chapters
    WHERE course_id = course_record.id;

    -- Thème 1 : La poésie du Moyen Âge au XVIIIe siècle
    INSERT INTO course_chapters (course_id, title, content, order_index, theme) VALUES
    (course_record.id, 'L''histoire de la poésie du Moyen Âge au XVIIIe siècle', 'Contenu du chapitre sur l''histoire de la poésie...', base_order_index, 'La poésie du Moyen Âge au XVIIIe siècle'),
    (course_record.id, 'L''évolution de la poésie du Moyen Âge au XVIIIe siècle', 'Contenu du chapitre sur l''évolution de la poésie...', base_order_index + 1, 'La poésie du Moyen Âge au XVIIIe siècle'),
    (course_record.id, 'Les caractéristiques du texte poétique', 'Contenu du chapitre sur les caractéristiques du texte poétique...', base_order_index + 2, 'La poésie du Moyen Âge au XVIIIe siècle'),

    -- Thème 2 : Les outils d'analyse d'un texte littéraire
    (course_record.id, 'Les figures de style', 'Contenu du chapitre sur les figures de style...', base_order_index + 3, 'Les outils d''analyse d''un texte littéraire'),
    (course_record.id, 'L''énonciation', 'Contenu du chapitre sur l''énonciation...', base_order_index + 4, 'Les outils d''analyse d''un texte littéraire'),
    (course_record.id, 'Les fonctions du langage', 'Contenu du chapitre sur les fonctions du langage...', base_order_index + 5, 'Les outils d''analyse d''un texte littéraire'),
    (course_record.id, 'Les registres et les tonalités', 'Contenu du chapitre sur les registres et tonalités...', base_order_index + 6, 'Les outils d''analyse d''un texte littéraire'),

    -- Thème 3 : Étude de la langue
    (course_record.id, 'Les accords', 'Contenu du chapitre sur les accords...', base_order_index + 7, 'Étude de la langue'),
    (course_record.id, 'Les classes et les fonctions grammaticales', 'Contenu du chapitre sur les classes et fonctions grammaticales...', base_order_index + 8, 'Étude de la langue'),
    (course_record.id, 'Les relations au sein de la phrase complexe', 'Contenu du chapitre sur les relations dans la phrase complexe...', base_order_index + 9, 'Étude de la langue'),
    (course_record.id, 'Le verbe : emplois et valeurs', 'Contenu du chapitre sur le verbe...', base_order_index + 10, 'Étude de la langue'),
    (course_record.id, 'Les propositions subordonnées relatives', 'Contenu du chapitre sur les propositions subordonnées relatives...', base_order_index + 11, 'Étude de la langue');

  END LOOP;
END $$;