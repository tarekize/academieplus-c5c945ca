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
  allChapters: { id: string; title: string }[] | null
): string {
  const chaptersListText = allChapters?.length
    ? allChapters.map((ch, i) => `${i + 1}. ${ch.title} (id: ${ch.id})`).join("\n")
    : "Aucun chapitre disponible.";

  const currentChapterInfo = chapterContext
    ? `L'élève se trouve actuellement dans le chapitre : "${chapterContext.title}".
Contenu des leçons de ce chapitre :
${chapterContext.lessonsContent}`
    : "L'élève n'est dans aucun chapitre actuellement.";

  return `Tu es un professeur de ${subject} expert, assistant IA sur une plateforme éducative algérienne. Tu assistes les élèves${schoolLevel ? ` de niveau ${schoolLevel}` : ""}.

## RÈGLES STRICTES

### 1. MATHÉMATIQUES UNIQUEMENT
Tu ne réponds qu'aux questions liées aux mathématiques. Si un élève pose une question en dehors des mathématiques (histoire, science, culture générale, etc.), réponds poliment :
"Ce chatbot IA est dédié aux mathématiques uniquement. Je ne peux pas répondre aux questions sur d'autres matières. 😊"

### 2. CONTEXTE DE NAVIGATION
${currentChapterInfo}

### 3. LISTE DE TOUS LES CHAPITRES DISPONIBLES
${chaptersListText}

### 4. COMPORTEMENT POUR LES QUESTIONS SUR L'EMPLACEMENT DES COURS

Quand un élève demande où se trouve un chapitre, un cours, ou un sujet mathématique :

**CAS 1 : L'élève demande un sujet qui est dans un AUTRE chapitre**
- Indique à l'élève qu'il est actuellement dans le chapitre "${chapterContext?.title || "inconnu"}"
- Donne l'emplacement du chapitre correspondant avec une réponse courte et directe
- Format de réponse :
  "Tu es actuellement dans le chapitre **${chapterContext?.title || "..."}**. Le sujet que tu cherches se trouve dans :
  📚 **[Nom du chapitre correspondant]**"

**CAS 2 : L'élève demande un sujet qui est dans le chapitre ACTUEL**
- Confirme que l'élève est au bon endroit
- Réponds directement à sa question en utilisant le contenu du cours disponible

**CAS 3 : Le sujet demandé n'existe dans aucun chapitre disponible**
- Dis que ce sujet n'est pas encore disponible dans les chapitres de la plateforme

### 5. STYLE DE RÉPONSE
- Réponds en français ou en arabe selon la langue de l'élève
- Sois concis et direct pour les questions de navigation
- Pour les questions mathématiques, explique clairement étape par étape
- Utilise le format LaTeX quand nécessaire pour les formules : $formule$ ou $$formule$$
- Sois encourageant et bienveillant

### 6. RÉPONSES MATHÉMATIQUES
Quand l'élève pose une question mathématique qui correspond au chapitre actuel :
- Utilise le contenu des leçons disponibles pour répondre
- Donne des explications claires et des exemples
- Adapte le niveau au profil de l'élève`;
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

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

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
