-- Renomme l'action de log historique "lovable_chat_request" (nom de marque
-- de l'outil qui a servi à générer une partie du code) en "ia_chat_request",
-- pour que l'audit /analytics reste cohérent avec le nouveau nom utilisé
-- côté edge function (supabase/functions/lovable-chat/index.ts).
UPDATE public.activity_logs
SET action = 'ia_chat_request'
WHERE action = 'lovable_chat_request';
