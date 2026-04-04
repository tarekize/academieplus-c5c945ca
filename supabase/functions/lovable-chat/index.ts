import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n... (contenu tronqué)";
}

function buildSystemPrompt(
  subject: string,
  schoolLevel: string | null,
  chapterContext: { title: string; lessonsContent: string } | null,
  allChapters: { id: string; title: string; lessons: { id: string; title: string }[] }[] | null,
  maxPromptSize = 6000
): string {
  const chaptersListStr = allChapters && allChapters.length > 0
    ? allChapters.map((ch) => {
        const lessonsStr = ch.lessons.map((l) => `  - Leçon: "${l.title}" (ID: ${l.id})`).join("\n");
        return `- Chapitre: "${ch.title}" (ID: ${ch.id})\n${lessonsStr}`;
      }).join("\n")
    : "Aucun chapitre disponible.";

  const lessonsContent = chapterContext?.lessonsContent
    ? truncateText(chapterContext.lessonsContent, maxPromptSize)
    : "";

  const currentChapterInfo = chapterContext
    ? `\n\n## Chapitre actuel de l'élève\nL'élève se trouve actuellement dans le chapitre: "${chapterContext.title}"\nContenu des leçons de ce chapitre:\n${lessonsContent}`
    : "";

  return `Tu es un professeur de ${subject} expert et bienveillant sur la plateforme éducative AcadémiePlus.
Niveau scolaire de l'élève: ${schoolLevel || "non spécifié"}.

## Règles strictes

1. **Mathématiques uniquement**: Tu ne réponds qu'aux questions liées aux mathématiques. Si l'élève pose une question en dehors des mathématiques, réponds poliment: "Ce chatbot IA est dédié aux mathématiques 📐. Je ne peux pas t'aider sur ce sujet, mais n'hésite pas à me poser des questions de maths !"

2. **Question de maths dans un AUTRE chapitre**: Si l'élève pose une question de mathématiques dont le sujet appartient à un chapitre DIFFÉRENT de son chapitre actuel:
   - NE RÉPONDS PAS à la question mathématique, ne donne AUCUNE explication ni formule
   - Dis-lui simplement qu'il est dans le chapitre "${chapterContext?.title || ''}" et que sa question concerne un autre chapitre
   - Donne-lui UNIQUEMENT le lien vers le bon chapitre au format BREADCRUMB: [[BREADCRUMB:chapter_id|chapter_title|lesson_id|lesson_title]]
   - Exemple de réponse: "Tu es actuellement dans le chapitre **النهايات والاستمرارية**. Ta question concerne la dérivée, qui se trouve dans un autre chapitre.\n\nLa dérivée est abordée dans le chapitre : [[BREADCRUMB:...]]"
   - IMPORTANT: Ne donne JAMAIS la réponse mathématique, juste la redirection vers le bon chapitre

3. **Question de maths dans le BON chapitre**: Si l'élève pose une question de mathématiques dont le sujet correspond à son chapitre actuel, réponds en te basant sur le contenu du cours disponible. Donne une réponse complète et pédagogique.

4. **Navigation et emplacement**: Quand l'élève demande où se trouve un chapitre/cours/sujet:
   - Réponds DIRECTEMENT et simplement: "Le chapitre [nom] se trouve ici : [[BREADCRUMB:...]]"
   - Ne fais pas de long discours, donne juste l'emplacement avec le lien
   - Si le sujet correspond au chapitre actuel, dis-lui simplement: "Tu es déjà au bon endroit ! Tu es dans le chapitre **${chapterContext?.title || ''}**."

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

// ============ Provider 1: Google Gemini ============
async function callGemini(systemPrompt: string, messages: any[]): Promise<Response> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  // Build Gemini contents format
  const contents: any[] = [];
  
  // Add system instruction as first user message context
  const geminiMessages = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini error:", response.status, errText);
    throw new Error(`Gemini failed: ${response.status}`);
  }

  // Transform Gemini SSE to OpenAI-compatible SSE format
  const geminiStream = response.body!;
  const { readable, writable } = new TransformStream();
  
  (async () => {
    const writer = writable.getWriter();
    const reader = geminiStream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const openAiChunk = {
                choices: [{ delta: { content: text }, index: 0 }],
              };
              await writer.write(encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            }
          } catch { /* skip malformed */ }
        }
      }
      // Process remaining buffer
      if (buffer.startsWith("data: ")) {
        const jsonStr = buffer.slice(6).trim();
        if (jsonStr && jsonStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const openAiChunk = { choices: [{ delta: { content: text }, index: 0 }] };
              await writer.write(encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            }
          } catch { /* skip */ }
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (err) {
      console.error("Gemini stream transform error:", err);
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

// ============ Provider 2: Groq ============
async function callGroq(systemPrompt: string, messages: any[]): Promise<Response> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq error:", response.status, errText);
    throw new Error(`Groq failed: ${response.status}`);
  }

  // Groq uses OpenAI-compatible SSE format, pass through directly
  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

// ============ Provider 3: Cloudflare Workers AI ============
async function callCloudflare(systemPrompt: string, messages: any[]): Promise<Response> {
  const CF_API_KEY = Deno.env.get("CLOUDFLARE_AI_API_KEY");
  const CF_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
  if (!CF_API_KEY) throw new Error("CLOUDFLARE_AI_API_KEY not configured");
  if (!CF_ACCOUNT_ID) throw new Error("CLOUDFLARE_ACCOUNT_ID not configured");

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Cloudflare error:", response.status, errText);
    throw new Error(`Cloudflare failed: ${response.status}`);
  }

  // Transform Cloudflare SSE to OpenAI-compatible format
  const cfStream = response.body!;
  const { readable, writable } = new TransformStream();

  (async () => {
    const writer = writable.getWriter();
    const reader = cfStream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.response;
            if (text) {
              const openAiChunk = { choices: [{ delta: { content: text }, index: 0 }] };
              await writer.write(encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            }
          } catch { /* skip */ }
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (err) {
      console.error("Cloudflare stream transform error:", err);
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

// ============ Main handler with fallback ============
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, subject, schoolLevel, chapterContext, allChapters } = await req.json();

    const systemPrompt = buildSystemPrompt(
      subject || "mathématiques",
      schoolLevel,
      chapterContext,
      allChapters
    );

    // Provider 1: Gemini
    try {
      console.log("Trying Gemini...");
      return await callGemini(systemPrompt, messages);
    } catch (e) {
      console.error("Gemini failed, trying Groq...", e);
    }

    // Provider 2: Groq
    try {
      console.log("Trying Groq...");
      return await callGroq(systemPrompt, messages);
    } catch (e) {
      console.error("Groq failed, trying Cloudflare...", e);
    }

    // Provider 3: Cloudflare
    try {
      console.log("Trying Cloudflare...");
      return await callCloudflare(systemPrompt, messages);
    } catch (e) {
      console.error("Cloudflare also failed:", e);
    }

    // All providers failed
    return new Response(
      JSON.stringify({ error: "Tous les services IA sont actuellement indisponibles. Veuillez réessayer plus tard." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
