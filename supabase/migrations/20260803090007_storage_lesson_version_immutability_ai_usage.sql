-- ÉLEVÉ : les 3 buckets publics (avatars, email-assets, lesson-media) avaient
-- une policy SELECT USING(true) qui autorise aussi le LISTING complet du
-- bucket (pas seulement la lecture par URL), permettant l'énumération de
-- tous les fichiers (dont des photos de mineurs dans "avatars") par un
-- client anonyme. Un bucket public sert déjà les objets par URL directe
-- SANS avoir besoin d'une policy SELECT sur storage.objects.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to email assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to lesson media" ON storage.objects;

-- MAJEUR : immuabilité des snapshots de leçons. lesson_versions avait une
-- policy UPDATE pour l'admin permettant de réécrire directement une version
-- déjà approuvée (contrairement à exam_versions, qui n'a aucune policy
-- UPDATE). On aligne : plus aucune UPDATE directe côté client, seules
-- approve_lesson_version/reject_lesson_version (SECURITY DEFINER, qui
-- contournent RLS) peuvent modifier une version.
DROP POLICY IF EXISTS "Admin can update lesson versions" ON public.lesson_versions;

-- guard_lesson_content_update() exemptait purement et simplement les admins
-- de tout contrôle sur lessons.content : un admin pouvait modifier le
-- contenu livré aux élèves sans jamais créer de lesson_versions (donc sans
-- laisser de trace), en dehors de submit_lesson_version/approve_lesson_version.
-- Vérifié : submit_lesson_version gère déjà correctement le cas admin (statut
-- 'approved' immédiat + écriture de lessons.content via le bypass), donc
-- retirer cette exemption ne casse aucun parcours existant.
CREATE OR REPLACE FUNCTION public.guard_lesson_content_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content
     AND current_setting('app.bypass_lesson_content_lock', true) IS DISTINCT FROM 'on'
     AND auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Le contenu d''une leçon ne peut être modifié que via une validation admin.';
  END IF;
  RETURN NEW;
END;
$function$;

-- MOYEN : ai_token_usage n'est journalisée que par logTokenUsageAsync(),
-- qui utilise toujours un client service_role (donc hors RLS). La policy
-- INSERT pour "authenticated" (qui acceptait en plus user_id IS NULL) n'a
-- aucun appelant légitime côté client et permettait de polluer la seule
-- source de mesure de coût IA avec des lignes arbitraires.
DROP POLICY IF EXISTS "Users can insert their own token usage" ON public.ai_token_usage;

-- Dédoublonnage de policies strictement identiques (même rôle, même
-- condition) détectées par l'advisor multiple_permissive_policies.
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.student_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.student_subscriptions;
DROP POLICY IF EXISTS "Pedagos can manage exercises" ON public.chapter_exercises;
DROP POLICY IF EXISTS "Admins can manage exercises" ON public.chapter_exercises;
DROP POLICY IF EXISTS "Only admin/pedago can view exercises" ON public.chapter_exercises;
DROP POLICY IF EXISTS "Pedagos can manage quizzes" ON public.chapter_quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.chapter_quizzes;
DROP POLICY IF EXISTS "Only admin/pedago can view quizzes" ON public.chapter_quizzes;
