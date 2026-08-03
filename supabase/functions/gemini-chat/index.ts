// DÉSACTIVÉE (audit sécurité) : endpoint de chat IA complet (OpenRouter /
// Lovable / Gemini direct) déployé en production mais jamais versionné dans
// le dépôt, jamais appelé par le frontend (grep négatif sur src/), sans
// rate-limiting ni quota chat_usage ni journalisation ai_token_usage — un
// compte authentifié pouvait l'utiliser pour contourner intégralement le
// dispositif de quota IA de lovable-chat (qui, lui, implémente
// correctement rate-limit + quota + logging). Le chat élève réel vit dans
// supabase/functions/lovable-chat. On neutralise ce doublon plutôt que de
// le supprimer directement (pas d'outil de suppression disponible dans
// cette passe).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "Cette fonction a été retirée. Utilisez lovable-chat.",
    }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
