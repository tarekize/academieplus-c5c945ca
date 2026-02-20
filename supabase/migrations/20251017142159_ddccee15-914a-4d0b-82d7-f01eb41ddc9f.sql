-- Supprimer la vue qui dépend de la colonne school_level
DROP VIEW IF EXISTS public.quiz_questions_public;

-- Supprimer temporairement la contrainte unique sur class_subjects
ALTER TABLE public.class_subjects DROP CONSTRAINT IF EXISTS class_subjects_school_level_subject_id_key;

-- Convertir les colonnes en text
ALTER TABLE public.profiles ALTER COLUMN school_level TYPE text;
ALTER TABLE public.archived_accounts ALTER COLUMN school_level TYPE text;
ALTER TABLE public.class_subjects ALTER COLUMN school_level TYPE text;
ALTER TABLE public.courses ALTER COLUMN school_level TYPE text;
ALTER TABLE public.quiz_questions ALTER COLUMN school_level TYPE text;

-- Mettre à jour les valeurs NULL
UPDATE public.class_subjects SET school_level = 'sixieme' WHERE school_level IS NULL;

-- Supprimer l'ancien type enum
DROP TYPE IF EXISTS public.school_level;

-- Créer le nouveau type enum avec les bonnes valeurs
CREATE TYPE public.school_level AS ENUM (
  '6ème', '5ème', '4ème', '3ème',
  'Seconde', '1ère', 'Terminale'
);

-- Reconvertir les colonnes en utilisant le nouveau type enum avec mapping
ALTER TABLE public.profiles 
ALTER COLUMN school_level TYPE school_level 
USING CASE 
  WHEN school_level = 'sixieme' THEN '6ème'::school_level
  WHEN school_level = 'cinquieme' THEN '5ème'::school_level
  WHEN school_level = 'quatrieme' THEN '4ème'::school_level
  WHEN school_level = 'troisieme' THEN '3ème'::school_level
  WHEN school_level = 'seconde' THEN 'Seconde'::school_level
  WHEN school_level = 'premiere' THEN '1ère'::school_level
  WHEN school_level = 'terminale' THEN 'Terminale'::school_level
  ELSE NULL
END;

ALTER TABLE public.archived_accounts 
ALTER COLUMN school_level TYPE school_level 
USING CASE 
  WHEN school_level = 'sixieme' THEN '6ème'::school_level
  WHEN school_level = 'cinquieme' THEN '5ème'::school_level
  WHEN school_level = 'quatrieme' THEN '4ème'::school_level
  WHEN school_level = 'troisieme' THEN '3ème'::school_level
  WHEN school_level = 'seconde' THEN 'Seconde'::school_level
  WHEN school_level = 'premiere' THEN '1ère'::school_level
  WHEN school_level = 'terminale' THEN 'Terminale'::school_level
  ELSE NULL
END;

ALTER TABLE public.class_subjects 
ALTER COLUMN school_level TYPE school_level 
USING CASE 
  WHEN school_level = 'sixieme' THEN '6ème'::school_level
  WHEN school_level = 'cinquieme' THEN '5ème'::school_level
  WHEN school_level = 'quatrieme' THEN '4ème'::school_level
  WHEN school_level = 'troisieme' THEN '3ème'::school_level
  WHEN school_level = 'seconde' THEN 'Seconde'::school_level
  WHEN school_level = 'premiere' THEN '1ère'::school_level
  WHEN school_level = 'terminale' THEN 'Terminale'::school_level
  ELSE '6ème'::school_level
END;

ALTER TABLE public.courses 
ALTER COLUMN school_level TYPE school_level 
USING CASE 
  WHEN school_level = 'sixieme' THEN '6ème'::school_level
  WHEN school_level = 'cinquieme' THEN '5ème'::school_level
  WHEN school_level = 'quatrieme' THEN '4ème'::school_level
  WHEN school_level = 'troisieme' THEN '3ème'::school_level
  WHEN school_level = 'seconde' THEN 'Seconde'::school_level
  WHEN school_level = 'premiere' THEN '1ère'::school_level
  WHEN school_level = 'terminale' THEN 'Terminale'::school_level
  ELSE '6ème'::school_level
END;

ALTER TABLE public.quiz_questions 
ALTER COLUMN school_level TYPE school_level 
USING CASE 
  WHEN school_level = 'sixieme' THEN '6ème'::school_level
  WHEN school_level = 'cinquieme' THEN '5ème'::school_level
  WHEN school_level = 'quatrieme' THEN '4ème'::school_level
  WHEN school_level = 'troisieme' THEN '3ème'::school_level
  WHEN school_level = 'seconde' THEN 'Seconde'::school_level
  WHEN school_level = 'premiere' THEN '1ère'::school_level
  WHEN school_level = 'terminale' THEN 'Terminale'::school_level
  ELSE '6ème'::school_level
END;

-- Supprimer les doublons dans class_subjects en gardant le premier (utilisez ctid)
DELETE FROM public.class_subjects a 
USING public.class_subjects b
WHERE a.ctid < b.ctid 
AND a.school_level = b.school_level 
AND a.subject_id = b.subject_id;

-- Recréer la contrainte unique
ALTER TABLE public.class_subjects 
ADD CONSTRAINT class_subjects_school_level_subject_id_key 
UNIQUE (school_level, subject_id);

-- Recréer la vue quiz_questions_public sans la colonne correct_answer
CREATE VIEW public.quiz_questions_public AS
SELECT 
  id,
  question,
  options,
  difficulty,
  explanation,
  subject_id,
  school_level,
  created_at
FROM public.quiz_questions;