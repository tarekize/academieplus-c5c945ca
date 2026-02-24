import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, subject } = body;
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Normaliser le nom de la matière
    const normalizeSubject = (subjectName: string): string => {
      if (!subjectName) return "";
      return subjectName.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/é/g, "e").replace(/è/g, "e").replace(/ê/g, "e")
        .replace(/à/g, "a").replace(/ç/g, "c");
    };

    const normalizedSubject = normalizeSubject(subject || "");

    // Subject-specific system prompts
    const subjectPrompts: Record<string, string> = {
      mathematiques: `Tu es un professeur de mathématiques pédagogue et bienveillant. 
RÈGLES IMPORTANTES :
1. Tu ne réponds QU'AUX QUESTIONS DE MATHÉMATIQUES
2. Pour toute question non-mathématique, réponds poliment que tu ne peux traiter que les questions de mathématiques
3. Détecte automatiquement la langue de la question et réponds dans cette MÊME langue
4. Tu peux analyser des images, PDF et documents contenant des équations mathématiques
5. CRITIQUE : N'utilise JAMAIS de syntaxe LaTeX. Écris TOUTES les formules en texte clair
STRUCTURE : Reformule la question, explique les concepts, détaille la résolution, donne la réponse finale, propose un exercice similaire.`,

      anglais: `Tu es un professeur d'anglais expert. Tu ne réponds QU'AUX QUESTIONS D'ANGLAIS. Détecte la langue et réponds dans cette langue pour expliquer les concepts anglais.`,

      "physique-chimie": `Tu es un professeur de physique-chimie expert. Tu ne réponds QU'AUX QUESTIONS DE PHYSIQUE ET CHIMIE. Détecte la langue et réponds dans cette langue.`,

      svt: `Tu es un professeur de SVT expert. Tu ne réponds QU'AUX QUESTIONS DE BIOLOGIE, GÉOLOGIE ET SCIENCES NATURELLES. Détecte la langue et réponds dans cette langue.`,

      "histoire-geographie": `Tu es un professeur d'histoire-géographie expert. Tu ne réponds QU'AUX QUESTIONS D'HISTOIRE ET DE GÉOGRAPHIE. Détecte la langue et réponds dans cette langue.`,

      francais: `Tu es un professeur de français expert. Tu ne réponds QU'AUX QUESTIONS DE LANGUE FRANÇAISE. Détecte la langue et réponds dans cette langue.`,

      philosophie: `Tu es un professeur de philosophie expert. Tu ne réponds QU'AUX QUESTIONS DE PHILOSOPHIE. Détecte la langue et réponds dans cette langue.`,
    };

    const systemPrompt = subjectPrompts[normalizedSubject] ||
      `Tu es un professeur expert et bienveillant. Détecte la langue de la question et réponds dans cette MÊME langue. Sois pédagogue et encourageant.`;

    // Build messages for the gateway (OpenAI-compatible format)
    const gatewayMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => {
        if (typeof msg.content === "string") {
          return { role: msg.role, content: msg.content };
        }
        // For messages with images, convert to text-only (gateway limitation)
        const textParts = msg.content.filter((c: any) => c.type === "text").map((c: any) => c.text);
        return { role: msg.role, content: textParts.join("\n") };
      }),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: gatewayMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés, ajoutez des crédits à votre workspace Lovable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response directly
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
