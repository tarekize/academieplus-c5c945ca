-- Delete all existing exercises and quizzes for Terminale Sciences Expérimentales chapters
-- This will be replaced with newly generated content (10 exercises + 10 quizzes per lesson)

DELETE FROM public.chapter_exercises
WHERE chapter_id IN (
  SELECT id FROM public.chapters
  WHERE school_level = 'terminale'
    AND filiere_id = '9f9cea26-5b2c-4bb3-ab00-206abb7f43c5'
);

DELETE FROM public.chapter_quizzes
WHERE chapter_id IN (
  SELECT id FROM public.chapters
  WHERE school_level = 'terminale'
    AND filiere_id = '9f9cea26-5b2c-4bb3-ab00-206abb7f43c5'
);