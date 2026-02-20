-- Créer le cours de Français "Étude de la langue" pour tous les niveaux
INSERT INTO public.courses (subject_id, school_level, title, description, difficulty, duration_minutes, order_index)
VALUES 
  ('francais', 'sixieme', 'Étude de la langue', 'Maîtrisez les fondamentaux de la langue française : grammaire, conjugaison, vocabulaire et syntaxe', 'moyen', 240, 1),
  ('francais', 'cinquieme', 'Étude de la langue', 'Maîtrisez les fondamentaux de la langue française : grammaire, conjugaison, vocabulaire et syntaxe', 'moyen', 240, 1),
  ('francais', 'quatrieme', 'Étude de la langue', 'Maîtrisez les fondamentaux de la langue française : grammaire, conjugaison, vocabulaire et syntaxe', 'moyen', 240, 1),
  ('francais', 'troisieme', 'Étude de la langue', 'Maîtrisez les fondamentaux de la langue française : grammaire, conjugaison, vocabulaire et syntaxe', 'moyen', 240, 1),
  ('francais', 'seconde', 'Étude de la langue', 'Approfondissez votre maîtrise de la langue française : grammaire avancée, stylistique et analyse linguistique', 'difficile', 300, 1),
  ('francais', 'premiere', 'Étude de la langue', 'Perfectionnez votre maîtrise de la langue française : analyse stylistique, rhétorique et argumentation', 'difficile', 300, 1),
  ('francais', 'terminale', 'Étude de la langue', 'Excellence en langue française : maîtrise complète de la grammaire, stylistique et analyse littéraire', 'difficile', 300, 1);