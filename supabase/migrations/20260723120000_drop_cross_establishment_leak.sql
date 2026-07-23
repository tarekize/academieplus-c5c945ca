-- SÉCURITÉ — fuite inter-établissements : la migration 20260629120000 avait créé
-- 4 policies RLS scopées uniquement par le rôle 'etablissement' (pas par
-- l'établissement lui-même) : "Etablissement view all profiles/classes/class
-- students/user roles". Des migrations ultérieures (20260630112908,
-- 20260721160000, 20260721190000) ont ajouté les équivalents correctement
-- scopés via is_establishment_teacher()/is_establishment_student(), et le
-- commentaire de 20260721200000 indique explicitement que ces policies larges
-- ne devaient plus être reprises — mais elles n'ont jamais été DROP: comme les
-- policies RLS d'un même FOR SELECT s'additionnent en OR, n'importe quel compte
-- 'etablissement' pouvait toujours lire les profils, classes, effectifs et
-- rôles de TOUTE la plateforme, pas seulement de son propre établissement.
--
-- Les policies scopées équivalentes (déjà actives, vérifiées avant ce DROP) :
-- - profiles      : "Establishments can view their teachers profiles" (20260721160000)
--                    + "Establishments can view their students profiles" (20260721190000)
-- - user_roles    : "Establishments can view their teachers roles" (20260630112908)
-- - classes       : "Establishments can view their teachers classes" (20260630112908)
-- - class_students: "Establishments can view their teachers class students" (20260630112908)

DROP POLICY IF EXISTS "Etablissement view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Etablissement view all classes" ON public.classes;
DROP POLICY IF EXISTS "Etablissement view all class students" ON public.class_students;
DROP POLICY IF EXISTS "Etablissement view all user roles" ON public.user_roles;

NOTIFY pgrst, 'reload schema';
