-- Pour le seul chapitre sans title_ar, le title est déjà en arabe → copier vers title_ar
UPDATE public.chapters
SET title_ar = title
WHERE title_ar IS NULL OR title_ar = '';

-- Remplacer le titre français par le titre arabe (chapitres)
UPDATE public.chapters
SET title = title_ar
WHERE title_ar IS NOT NULL AND title_ar <> '';

-- Remplacer le titre français par le titre arabe (leçons)
UPDATE public.lessons
SET title = title_ar
WHERE title_ar IS NOT NULL AND title_ar <> '';