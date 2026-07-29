-- Corrige une mauvaise traduction du titre de chapitre affichée dans le fil
-- d'ariane français : "النهايات" (limites, au sens mathématique) avait été
-- traduit par "fins" au lieu de "limites". Le titre arabe est déjà correct
-- et n'est pas modifié ; seul le titre français est corrigé, et seulement
-- s'il contient encore l'ancienne traduction erronée (idempotent).
UPDATE public.chapters
SET title = 'Limites et continuité'
WHERE title_ar = 'النهايات والاستمرارية'
  AND title ILIKE '%fins%continuit%';
