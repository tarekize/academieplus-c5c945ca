-- Insérer des matières de test
INSERT INTO matieres (nom, slug, icone, ordre, active) VALUES
('Mathématiques', 'mathematiques', '➕', 1, true),
('Physique', 'physique', '⚛️', 2, true),
('Chimie', 'chimie', '🧪', 3, true),
('Sciences Naturelles', 'sciences-naturelles', '🌿', 4, true),
('Français', 'francais', '📖', 5, true),
('Anglais', 'anglais', '🇬🇧', 6, true),
('Histoire-Géographie', 'histoire-geographie', '🌍', 7, true),
('Philosophie', 'philosophie', '💭', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Insérer des niveaux scolaires
INSERT INTO niveaux (nom, cycle, ordre) VALUES
('1ère Année Moyenne', 'Moyen', 1),
('2ème Année Moyenne', 'Moyen', 2),
('3ème Année Moyenne', 'Moyen', 3),
('4ème Année Moyenne', 'Moyen', 4),
('1ère Année Secondaire', 'Secondaire', 5),
('2ème Année Secondaire', 'Secondaire', 6),
('3ème Année Secondaire', 'Secondaire', 7)
ON CONFLICT DO NOTHING;

-- Insérer des cours exemples
INSERT INTO cours (titre, slug, description, matiere_id, niveau_id, difficulte, duree_lecture, statut, meta_title, meta_description)
SELECT 
  'Introduction aux équations du premier degré',
  'introduction-equations-premier-degre',
  'Découvrez les bases des équations du premier degré avec des exemples pratiques et des exercices.',
  m.id,
  n.id,
  2,
  45,
  'publié',
  'Équations du 1er degré - Cours complet',
  'Cours complet sur les équations du premier degré pour les élèves du collège avec exercices corrigés.'
FROM matieres m, niveaux n
WHERE m.slug = 'mathematiques' AND n.nom = '3ème Année Moyenne'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cours (titre, slug, description, matiere_id, niveau_id, difficulte, duree_lecture, statut, meta_title, meta_description)
SELECT 
  'Les lois de Newton',
  'les-lois-de-newton',
  'Comprendre les trois lois fondamentales de la mécanique classique.',
  m.id,
  n.id,
  3,
  60,
  'brouillon',
  'Les 3 lois de Newton - Physique',
  'Cours détaillé sur les lois de Newton avec applications et expériences.'
FROM matieres m, niveaux n
WHERE m.slug = 'physique' AND n.nom = '1ère Année Secondaire'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cours (titre, slug, description, matiere_id, niveau_id, difficulte, duree_lecture, statut, meta_title, meta_description)
SELECT 
  'La photosynthèse',
  'la-photosynthese',
  'Le processus de photosynthèse chez les plantes vertes.',
  m.id,
  n.id,
  2,
  50,
  'en_revision',
  'La photosynthèse - Sciences Naturelles',
  'Tout savoir sur la photosynthèse : mécanisme, étapes et importance.'
FROM matieres m, niveaux n
WHERE m.slug = 'sciences-naturelles' AND n.nom = '4ème Année Moyenne'
ON CONFLICT (slug) DO NOTHING;