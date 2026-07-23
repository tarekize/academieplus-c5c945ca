-- SÉCURITÉ — deux GRANTs trop larges accordés à "authenticated" :
--
-- 1. ai_token_usage : "GRANT INSERT ... TO authenticated" + la policy
--    WITH CHECK (auth.uid() = user_id OR user_id IS NULL) ne contraignent ni
--    role_group, ni function_name, ni les compteurs de tokens. Or tous les
--    inserts légitimes passent déjà par les edge functions via le client
--    service_role (qui contourne RLS/GRANT de toute façon) — ce GRANT ne sert
--    donc à rien de fonctionnel et permet à n'importe quel utilisateur
--    authentifié d'appeler PostgREST directement pour forger de fausses
--    lignes d'usage IA (ex: se déclarer role_group='admin'), polluant les
--    statistiques de coût/quota IA utilisées par les admins.
--
-- 2. teacher_parent_messages : "GRANT ... UPDATE ... TO authenticated" est un
--    GRANT non restreint aux colonnes, alors que la seule policy UPDATE
--    existante ("Recipient can mark messages read") n'est censée permettre
--    que de marquer un message comme lu. Sans restriction de colonnes au
--    niveau du GRANT, l'expéditeur ou le destinataire d'un message peut en
--    réécrire le "content" après coup (falsification a posteriori de
--    l'historique de conversation) — confirmé qu'aucun code applicatif
--    n'utilise UPDATE sur cette table aujourd'hui, donc restreindre au GRANT
--    à la seule colonne read_at ne casse rien d'existant.

REVOKE INSERT ON public.ai_token_usage FROM authenticated;
DROP POLICY IF EXISTS "Users can insert their own token usage" ON public.ai_token_usage;

REVOKE UPDATE ON public.teacher_parent_messages FROM authenticated;
GRANT UPDATE (read_at) ON public.teacher_parent_messages TO authenticated;

NOTIFY pgrst, 'reload schema';
