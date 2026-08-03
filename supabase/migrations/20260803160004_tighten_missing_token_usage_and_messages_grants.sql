-- Réconciliation du registre de migrations (audit externe) : le fichier
-- 20260723120400_tighten_token_usage_and_messages_grants.sql existait déjà
-- dans le dépôt mais n'avait en réalité jamais été appliqué en base —
-- "authenticated" avait encore un GRANT INSERT non restreint sur
-- ai_token_usage (forge possible de fausses lignes d'usage IA côté
-- PostgREST, hors edge functions) et un GRANT UPDATE non restreint aux
-- colonnes sur teacher_parent_messages (permettant de réécrire le "content"
-- d'un message déjà envoyé). Application fidèle au fichier local d'origine.
REVOKE INSERT ON public.ai_token_usage FROM authenticated;
DROP POLICY IF EXISTS "Users can insert their own token usage" ON public.ai_token_usage;

REVOKE UPDATE ON public.teacher_parent_messages FROM authenticated;
GRANT UPDATE (read_at) ON public.teacher_parent_messages TO authenticated;
