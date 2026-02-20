-- Cours de Mathématiques pour tous les niveaux
INSERT INTO courses (id, title, description, subject_id, school_level, difficulty, duration_minutes, order_index) VALUES
('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c1', 'Nombres et Calculs', 'Maîtrisez les opérations sur les nombres entiers, décimaux et fractions', 'mathematiques', '6ème', 'facile', 180, 1),
('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c2', 'Géométrie plane', 'Découvrez les figures géométriques : triangles, carrés, cercles et leurs propriétés', 'mathematiques', '6ème', 'facile', 180, 2),
('a2b3c4d5-e6f7-48a9-b0c1-d2e3f4a5b6c1', 'Calcul littéral', 'Introduction aux expressions algébriques et aux équations simples', 'mathematiques', '5ème', 'moyen', 200, 1),
('a2b3c4d5-e6f7-48a9-b0c1-d2e3f4a5b6c2', 'Proportionnalité', 'Comprendre et appliquer la proportionnalité dans différents contextes', 'mathematiques', '5ème', 'moyen', 180, 2),
('a3b4c5d6-e7f8-49aa-b1c2-d3e4f5a6b7c1', 'Équations et Inéquations', 'Résoudre des équations du premier degré et des inéquations', 'mathematiques', '4ème', 'moyen', 220, 1),
('a3b4c5d6-e7f8-49aa-b1c2-d3e4f5a6b7c2', 'Théorème de Pythagore', 'Appliquer le théorème de Pythagore dans des situations géométriques', 'mathematiques', '4ème', 'moyen', 200, 2),
('a4b5c6d7-e8f9-40ab-b2c3-d4e5f6a7b8c1', 'Fonctions affines et linéaires', 'Étudier les fonctions, leur représentation graphique et leurs applications', 'mathematiques', '3ème', 'difficile', 240, 1),
('a4b5c6d7-e8f9-40ab-b2c3-d4e5f6a7b8c2', 'Trigonométrie', 'Découvrir les relations trigonométriques dans le triangle rectangle', 'mathematiques', '3ème', 'difficile', 220, 2),
('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Fonctions et Études', 'Approfondir l''étude des fonctions : variations, extremums, asymptotes', 'mathematiques', 'Seconde', 'difficile', 300, 1),
('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c2', 'Géométrie dans l''espace', 'Explorer les solides, les volumes et les sections planes', 'mathematiques', 'Seconde', 'difficile', 280, 2);

-- Cours de Physique-Chimie pour tous les niveaux
INSERT INTO courses (id, title, description, subject_id, school_level, difficulty, duration_minutes, order_index) VALUES
('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d1', 'Les circuits électriques', 'Comprendre les notions de courant, tension et résistance électrique', 'physique', '5ème', 'moyen', 180, 1),
('b3c4d5e6-f7a8-49ba-c1d2-e3f4a5b6c7d1', 'La lumière et les lentilles', 'Étudier la propagation de la lumière et les phénomènes optiques', 'physique', '4ème', 'moyen', 200, 1),
('b3c4d5e6-f7a8-49ba-c1d2-e3f4a5b6c7d2', 'Les lois de l''électricité', 'Approfondir la loi d''Ohm et les circuits en série et en parallèle', 'physique', '4ème', 'moyen', 200, 2),
('b3c4d5e6-f7a8-49ba-c1d2-e3f4a5b6c7d3', 'Les atomes et les molécules', 'Comprendre la structure de la matière à l''échelle microscopique', 'physique', '4ème', 'moyen', 180, 3),
('b4c5d6e7-f8a9-40cb-c2d3-e4f5a6b7c8d1', 'Mécanique et mouvement', 'Découvrir les notions de vitesse, accélération et forces', 'physique', '3ème', 'moyen', 220, 1),
('b4c5d6e7-f8a9-40cb-c2d3-e4f5a6b7c8d2', 'Énergie et puissance', 'Comprendre les différentes formes d''énergie et leur conversion', 'physique', '3ème', 'moyen', 200, 2),
('b4c5d6e7-f8a9-40cb-c2d3-e4f5a6b7c8d3', 'Les ions et le pH', 'Découvrir les notions d''ions, d''acidité et de basicité', 'physique', '3ème', 'moyen', 200, 3),
('b5c6d7e8-f9a0-41dc-c3d4-e5f6a7b8c9d1', 'Cinématique et dynamique', 'Étudier les lois de Newton et les mouvements dans un référentiel', 'physique', 'Seconde', 'difficile', 280, 1),
('b5c6d7e8-f9a0-41dc-c3d4-e5f6a7b8c9d2', 'Ondes et signaux', 'Découvrir les ondes mécaniques et électromagnétiques', 'physique', 'Seconde', 'difficile', 260, 2),
('b5c6d7e8-f9a0-41dc-c3d4-e5f6a7b8c9d3', 'Configuration électronique', 'Étudier la structure électronique des atomes et la classification périodique', 'physique', 'Seconde', 'difficile', 240, 3);

-- Cours de SVT (Sciences de la Vie et de la Terre) pour tous les niveaux
INSERT INTO courses (id, title, description, subject_id, school_level, difficulty, duration_minutes, order_index) VALUES
('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f1', 'Le vivant et son environnement', 'Découvrir les êtres vivants, leur classification et leurs milieux de vie', 'svt', '6ème', 'facile', 180, 1),
('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f2', 'Le corps humain et la santé', 'Comprendre le fonctionnement du corps humain : digestion, respiration, circulation', 'svt', '6ème', 'facile', 180, 2),
('d5e6f7a8-b9c0-41d2-e3f4-a5b6c7d8e9f1', 'Nutrition et digestion', 'Étudier les besoins nutritionnels et le système digestif', 'svt', '5ème', 'moyen', 200, 1),
('d5e6f7a8-b9c0-41d2-e3f4-a5b6c7d8e9f2', 'La reproduction humaine', 'Découvrir les organes reproducteurs et le développement de l''embryon', 'svt', '5ème', 'moyen', 180, 2),
('d6e7f8a9-b0c1-42d3-e4f5-a6b7c8d9e0f1', 'Géologie et tectonique', 'Comprendre la structure de la Terre et les phénomènes géologiques', 'svt', '4ème', 'moyen', 200, 1),
('d6e7f8a9-b0c1-42d3-e4f5-a6b7c8d9e0f2', 'Le système nerveux', 'Étudier le système nerveux et la transmission des messages nerveux', 'svt', '4ème', 'moyen', 180, 2),
('d7e8f9a0-b1c2-43d4-e5f6-a7b8c9d0e1f1', 'Génétique et hérédité', 'Découvrir les lois de l''hérédité et la transmission des caractères', 'svt', '3ème', 'difficile', 220, 1),
('d7e8f9a0-b1c2-43d4-e5f6-a7b8c9d0e1f2', 'Évolution et biodiversité', 'Comprendre les mécanismes de l''évolution et la diversité du vivant', 'svt', '3ème', 'difficile', 220, 2),
('d8e9f0a1-b2c3-44d5-e6f7-a8b9c0d1e2f1', 'La cellule et le métabolisme', 'Approfondir l''étude de la cellule, de l''ADN et des processus métaboliques', 'svt', 'Seconde', 'difficile', 260, 1);

-- Cours d'Anglais pour tous les niveaux
INSERT INTO courses (id, title, description, subject_id, school_level, difficulty, duration_minutes, order_index) VALUES
('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a1', 'English Grammar Basics', 'Les bases de la grammaire anglaise : verbes, temps, pronoms', 'anglais', '6ème', 'facile', 180, 1),
('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a2', 'Everyday Vocabulary', 'Vocabulaire de la vie quotidienne : famille, école, loisirs', 'anglais', '6ème', 'facile', 160, 2),
('e6f7a8b9-c0d1-42e3-f4a5-b6c7d8e9f0a1', 'Present and Past Tenses', 'Maîtriser les temps présents et passés en anglais', 'anglais', '5ème', 'moyen', 200, 1),
('e6f7a8b9-c0d1-42e3-f4a5-b6c7d8e9f0a2', 'Reading Comprehension', 'Développer la compréhension écrite à travers des textes variés', 'anglais', '5ème', 'moyen', 180, 2),
('e7f8a9b0-c1d2-43e4-f5a6-b7c8d9e0f1a1', 'Modal Verbs and Conditionals', 'Étudier les verbes modaux et les phrases conditionnelles', 'anglais', '4ème', 'moyen', 200, 1),
('e7f8a9b0-c1d2-43e4-f5a6-b7c8d9e0f1a2', 'Writing Skills', 'Améliorer l''expression écrite : lettres, descriptions, récits', 'anglais', '4ème', 'moyen', 180, 2),
('e8f9a0b1-c2d3-44e5-f6a7-b8c9d0e1f2a1', 'Advanced Grammar', 'Approfondir la grammaire : relatives, passif, discours indirect', 'anglais', '3ème', 'difficile', 220, 1),
('e8f9a0b1-c2d3-44e5-f6a7-b8c9d0e1f2a2', 'Literature and Culture', 'Découvrir la littérature anglophone et les cultures anglophones', 'anglais', '3ème', 'difficile', 200, 2),
('e9f0a1b2-c3d4-45e6-f7a8-b9c0d1e2f3a1', 'Academic English', 'Perfectionner l''anglais académique : argumentation, analyse de texte', 'anglais', 'Seconde', 'difficile', 260, 1);

-- Cours d'Histoire-Géographie pour tous les niveaux
INSERT INTO courses (id, title, description, subject_id, school_level, difficulty, duration_minutes, order_index) VALUES
('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1', 'L''Orient ancien', 'Découvrir les premières civilisations : Mésopotamie, Égypte', 'histoire', '6ème', 'facile', 200, 1),
('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b2', 'Habiter la Terre', 'Comprendre comment les hommes habitent différents espaces', 'histoire', '6ème', 'facile', 180, 2),
('f7a8b9c0-d1e2-43f4-a5b6-c7d8e9f0a1b1', 'Le Moyen Âge', 'Étudier la société médiévale, l''Islam et les empires', 'histoire', '5ème', 'moyen', 220, 1),
('f7a8b9c0-d1e2-43f4-a5b6-c7d8e9f0a1b2', 'Les dynamiques de la population', 'Analyser la répartition et l''évolution de la population mondiale', 'histoire', '5ème', 'moyen', 180, 2),
('f8a9b0c1-d2e3-44f5-a6b7-c8d9e0f1a2b1', 'Les Temps modernes', 'Découvrir les grandes découvertes, la Renaissance et les monarchies', 'histoire', '4ème', 'moyen', 220, 1),
('f8a9b0c1-d2e3-44f5-a6b7-c8d9e0f1a2b2', 'Les espaces urbains', 'Comprendre l''urbanisation et les enjeux des villes', 'histoire', '4ème', 'moyen', 180, 2),
('f9a0b1c2-d3e4-45f6-a7b8-c9d0e1f2a3b1', 'La Révolution française', 'Étudier la Révolution de 1789 et ses conséquences', 'histoire', '3ème', 'difficile', 240, 1),
('f9a0b1c2-d3e4-45f6-a7b8-c9d0e1f2a3b2', 'Les territoires dans la mondialisation', 'Analyser les dynamiques de la mondialisation', 'histoire', '3ème', 'difficile', 200, 2),
('f0a1b2c3-d4e5-46f7-a8b9-c0d1e2f3a4b1', 'Le monde au XIXe siècle', 'Comprendre les révolutions industrielles et les transformations politiques', 'histoire', 'Seconde', 'difficile', 280, 1);

-- Cours de Philosophie (uniquement pour le lycée)
INSERT INTO courses (id, title, description, subject_id, school_level, difficulty, duration_minutes, order_index) VALUES
('a7b8c9d0-e1f2-43a4-b5c6-d7e8f9a0b1c1', 'La conscience et l''inconscient', 'Réfléchir sur la conscience de soi et les théories de l''inconscient', 'philosophie', 'Seconde', 'difficile', 240, 1),
('a7b8c9d0-e1f2-43a4-b5c6-d7e8f9a0b1c2', 'La culture et la nature', 'Interroger les rapports entre nature et culture dans la condition humaine', 'philosophie', 'Seconde', 'difficile', 240, 2);