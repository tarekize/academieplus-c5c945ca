-- Corrige les title_ar générés avant le correctif du wizard IA / import de
-- document, qui écrivaient par erreur le même libellé français que `title`
-- (ex. "Examen — 1er Trimestre") dans title_ar, alors que ce champ est celui
-- affiché aux élèves (verrouillés en arabe).
-- Nécessite de contourner guard_exam_update() (RAISE sur les examens déjà
-- soumis/validés) : c'est exactement ce cas de figure ici.
SET LOCAL app.bypass_exam_lock = 'on';

UPDATE public.exams
SET title_ar = 'امتحان — ' || CASE trimester
  WHEN 1 THEN 'الفصل الأول'
  WHEN 2 THEN 'الفصل الثاني'
  WHEN 3 THEN 'الفصل الثالث'
  WHEN 4 THEN 'البكالوريا البيضاء'
  WHEN 5 THEN 'البكالوريا النهائية'
  ELSE title_ar
END
WHERE title_ar ~ '^Examen — (1er|2ème|3ème) Trimestre$|^Examen — Bac (Blanc|Finale)$';
