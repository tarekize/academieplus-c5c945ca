// DÉSACTIVÉE (audit sécurité) : cette fonction référençait des tables
// (quiz_questions, quiz_submissions) qui n'existent plus dans le schéma
// actuel — elle a été remplacée depuis par les RPC check_quiz_answer /
// check_exercise_answer (public, authenticated, protégées par RLS), qui
// sont la seule source de vérité pour la validation des réponses. Cette
// fonction était déployée en production sans être versionnée dans le
// dépôt. On la neutralise plutôt que de la supprimer directement (pas
// d'outil de suppression disponible dans cette passe), pour qu'un appel
// résiduel échoue proprement au lieu de lever une erreur SQL opaque.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Endpoint neutralisé : aucun appelant frontend trouvé (grep négatif sur
// src/) ni trigger DB. Répond 410 à tout appel résiduel au lieu d'exécuter
// une logique obsolète référençant des tables supprimées — voir le
// commentaire d'audit en tête de fichier pour le détail.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "Cette fonction a été retirée. Utilisez les RPC check_quiz_answer / check_exercise_answer.",
    }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
