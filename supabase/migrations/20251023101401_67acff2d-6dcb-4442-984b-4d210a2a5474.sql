-- Ajouter les cours manquants pour tous les niveaux

-- Philosophie pour 1ère
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'philosophie', '1ère', 'Introduction à la philosophie', 'Découvrir les grandes questions philosophiques et les méthodes de réflexion', 'moyen', 180, 1),
(gen_random_uuid(), 'philosophie', '1ère', 'La vérité et la raison', 'Étudier les concepts de vérité, de démonstration et de raisonnement', 'moyen', 200, 2);

-- Philosophie pour Terminale (niveau principal pour cette matière)
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'philosophie', 'Terminale', 'La conscience et l''inconscient', 'Approfondir les théories de la conscience et de l''inconscient', 'difficile', 240, 1),
(gen_random_uuid(), 'philosophie', 'Terminale', 'Le désir et l''existence', 'Réfléchir sur la nature du désir et son rôle dans l''existence humaine', 'difficile', 240, 2),
(gen_random_uuid(), 'philosophie', 'Terminale', 'La morale et l''éthique', 'Étudier les fondements de la morale et les grandes théories éthiques', 'difficile', 260, 3),
(gen_random_uuid(), 'philosophie', 'Terminale', 'La justice et le droit', 'Analyser les concepts de justice, de droit et d''État', 'difficile', 240, 4);

-- Mathématiques pour 1ère et Terminale
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'mathematiques', '1ère', 'Suites numériques', 'Étude des suites arithmétiques et géométriques', 'moyen', 200, 1),
(gen_random_uuid(), 'mathematiques', '1ère', 'Dérivation', 'Introduction à la dérivation et ses applications', 'moyen', 220, 2),
(gen_random_uuid(), 'mathematiques', 'Terminale', 'Fonctions exponentielles', 'Étude approfondie de la fonction exponentielle', 'difficile', 240, 1),
(gen_random_uuid(), 'mathematiques', 'Terminale', 'Intégrales', 'Calcul intégral et applications', 'difficile', 260, 2);

-- Physique-Chimie pour 1ère et Terminale  
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'physique', '1ère', 'Ondes et signaux', 'Étude des ondes mécaniques et électromagnétiques', 'moyen', 200, 1),
(gen_random_uuid(), 'physique', '1ère', 'Énergie et conversions', 'Conservation et transformation de l''énergie', 'moyen', 180, 2),
(gen_random_uuid(), 'physique', 'Terminale', 'Mécanique de Newton', 'Étude approfondie des lois de Newton', 'difficile', 240, 1),
(gen_random_uuid(), 'physique', 'Terminale', 'Électromagnétisme', 'Champs électriques et magnétiques', 'difficile', 260, 2);

-- SVT pour 1ère et Terminale
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'svt', '1ère', 'Génétique et évolution', 'Mécanismes de l''hérédité et théorie de l''évolution', 'moyen', 200, 1),
(gen_random_uuid(), 'svt', '1ère', 'Le système immunitaire', 'Défenses de l''organisme contre les pathogènes', 'moyen', 180, 2),
(gen_random_uuid(), 'svt', 'Terminale', 'Génétique moléculaire', 'ADN, ARN et expression des gènes', 'difficile', 240, 1),
(gen_random_uuid(), 'svt', 'Terminale', 'Écosystèmes et biodiversité', 'Dynamique des écosystèmes et enjeux environnementaux', 'difficile', 220, 2);

-- Histoire-Géographie pour 1ère et Terminale
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'histoire', '1ère', 'La Première Guerre mondiale', 'Causes, déroulement et conséquences de la Grande Guerre', 'moyen', 200, 1),
(gen_random_uuid(), 'histoire', '1ère', 'L''entre-deux-guerres', 'Crises économiques et montée des totalitarismes', 'moyen', 180, 2),
(gen_random_uuid(), 'histoire', 'Terminale', 'La Seconde Guerre mondiale', 'Un conflit total et l''anéantissement des populations', 'difficile', 240, 1),
(gen_random_uuid(), 'histoire', 'Terminale', 'La Guerre froide', 'Affrontement des blocs et décolonisation', 'difficile', 220, 2);

-- Anglais pour 1ère et Terminale
INSERT INTO courses (id, subject_id, school_level, title, description, difficulty, duration_minutes, order_index) VALUES
(gen_random_uuid(), 'anglais', '1ère', 'Advanced Grammar', 'Maîtriser les structures grammaticales complexes', 'moyen', 180, 1),
(gen_random_uuid(), 'anglais', '1ère', 'Literature and Society', 'Analyser des œuvres littéraires anglophones', 'moyen', 200, 2),
(gen_random_uuid(), 'anglais', 'Terminale', 'Academic Writing', 'Rédaction académique et argumentation', 'difficile', 220, 1),
(gen_random_uuid(), 'anglais', 'Terminale', 'Cultural Studies', 'Civilisation et culture des pays anglophones', 'difficile', 200, 2);