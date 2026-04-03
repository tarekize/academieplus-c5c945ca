import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(
  subject: string,
  schoolLevel: string | null,
  chapterContext: { title: string; lessonsContent: string } | null,
  allChapters: { id: string; title: string; lessons: { id: string; title: string }[] }[] | null
): string {
  const chaptersListStr = allChapters && allChapters.length > 0
    ? allChapters.map((ch) => {
        const lessonsStr = ch.lessons.map((l) => `  - Leçon: "${l.title}" (ID: ${l.id})`).join("\n");
        return `- Chapitre: "${ch.title}" (ID: ${ch.id})\n${lessonsStr}`;
      }).join("\n")
    : "Aucun chapitre disponible.";

  const currentChapterInfo = chapterContext
    ? `\n\n## Chapitre actuel de l'élève\nL'élève se trouve actuellement dans le chapitre: "${chapterContext.title}"\nContenu des leçons de ce chapitre:\n${chapterContext.lessonsContent}`
    : "";

  return `Tu es un professeur de ${subject} expert et bienveillant sur la plateforme éducative AcadémiePlus.
Niveau scolaire de l'élève: ${schoolLevel || "non spécifié"}.

## Règles strictes

1. **Mathématiques uniquement**: Tu ne réponds qu'aux questions liées aux mathématiques. Si l'élève pose une question en dehors des mathématiques, réponds poliment: "Ce chatbot IA est dédié aux mathématiques 📐. Je ne peux pas t'aider sur ce sujet, mais n'hésite pas à me poser des questions de maths !"

2. **Question de maths dans un AUTRE chapitre**: Si l'élève pose une question de mathématiques dont le sujet appartient à un chapitre DIFFÉRENT de son chapitre actuel:
   - NE RÉPONDS PAS à la question mathématique
   - Dis-lui simplement qu'il est dans le chapitre "${chapterContext?.title || ''}" et que sa question concerne un autre chapitre
   - Donne-lui UNIQUEMENT le lien vers le bon chapitre au format BREADCRUMB: [[BREADCRUMB:chapter_id|chapter_title|lesson_id|lesson_title]]
   - Exemple de réponse: "Tu es actuellement dans le chapitre **Les Limites**. Ta question concerne la dérivée qui se trouve ici : [[BREADCRUMB:...]]"
   - Ne donne AUCUNE explication mathématique, juste la redirection

3. **Question de maths dans le BON chapitre**: Si l'élève pose une question de mathématiques dont le sujet correspond à son chapitre actuel, réponds en te basant sur le contenu du cours disponible. Donne une réponse complète et pédagogique.

4. **Navigation et emplacement**: Quand l'élève demande simplement où se trouve un chapitre/cours:
   - Cherche dans la liste des chapitres disponibles
   - Génère un lien cliquable au format BREADCRUMB
   - Si le sujet correspond au chapitre actuel, dis-lui qu'il est au bon endroit

5. **Format des réponses**:
   - Réponds dans la langue de l'élève (français ou arabe)
   - Utilise le format markdown pour les formules et la mise en forme
   - Sois concis et pédagogique
   - Pour les formules mathématiques, utilise la notation LaTeX entre $ ou $$

## Liste complète des chapitres disponibles
${chaptersListStr}
${currentChapterInfo}

## Format BREADCRUMB
Quand tu dois rediriger vers un chapitre ou une leçon, utilise EXACTEMENT ce format (sans espace superflu):
[[BREADCRUMB:CHAPTER_ID|CHAPTER_TITLE|LESSON_ID|LESSON_TITLE]]

Exemple: [[BREADCRUMB:abc-123|Dérivabilité|def-456|Définition de la dérivée]]

Si tu veux pointer vers un chapitre sans leçon spécifique, utilise la première leçon du chapitre.
IMPORTANT: Utilise les vrais IDs des chapitres et leçons de la liste ci-dessus. Ne génère JAMAIS de faux IDs.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, subject, schoolLevel, chapterContext, allChapters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(
      subject || "mathématiques",
      schoolLevel,
      chapterContext,
      allChapters
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
