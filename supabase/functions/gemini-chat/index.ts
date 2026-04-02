import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function tryOpenRouter(apiKey: string, messages: any[]) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://academieplus.app",
      "X-Title": "AcademiePlus",
    },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, stream: true }),
  });
  if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
  return response;
}

async function tryLovableAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, stream: true }),
  });
  if (!response.ok) throw new Error(`LovableAI ${response.status}`);
  return response;
}

async function tryGeminiDirect(apiKey: string, messages: any[]) {
  const contents = messages.map((m: any) => ({
    role: m.role === "system" ? "user" : m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  return response;
}

async function callWithFallback(messages: any[]): Promise<{ response: Response; isGeminiDirect: boolean }> {
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (openrouterKey) {
    try {
      console.log("Trying OpenRouter...");
      return { response: await tryOpenRouter(openrouterKey, messages), isGeminiDirect: false };
    } catch (e) { console.error("OpenRouter failed:", (e as Error).message); }
  }
  if (lovableKey) {
    try {
      console.log("Trying Lovable AI...");
      return { response: await tryLovableAI(lovableKey, messages), isGeminiDirect: false };
    } catch (e) { console.error("Lovable AI failed:", (e as Error).message); }
  }
  if (geminiKey) {
    try {
      console.log("Trying Gemini direct...");
      return { response: await tryGeminiDirect(geminiKey, messages), isGeminiDirect: true };
    } catch (e) { console.error("Gemini failed:", (e as Error).message); }
  }
  throw new Error("Tous les services IA sont indisponibles.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages, subject } = body;
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizeSubject = (s: string) => s ? s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[éèê]/g, "e").replace(/à/g, "a").replace(/ç/g, "c") : "";
    const normalizedSubject = normalizeSubject(subject || "");

    const subjectPrompts: Record<string, string> = {
      mathematiques: `Tu es un professeur de mathématiques pédagogue. Tu ne réponds QU'AUX QUESTIONS DE MATHÉMATIQUES. Détecte la langue et réponds dans cette MÊME langue. N'utilise JAMAIS de syntaxe LaTeX.`,
      anglais: `Tu es un professeur d'anglais expert. Tu ne réponds QU'AUX QUESTIONS D'ANGLAIS.`,
      "physique-chimie": `Tu es un professeur de physique-chimie expert. Tu ne réponds QU'AUX QUESTIONS DE PHYSIQUE ET CHIMIE.`,
      svt: `Tu es un professeur de SVT expert. Tu ne réponds QU'AUX QUESTIONS DE SVT.`,
      "histoire-geographie": `Tu es un professeur d'histoire-géographie expert. Tu ne réponds QU'AUX QUESTIONS D'HISTOIRE ET DE GÉOGRAPHIE.`,
      francais: `Tu es un professeur de français expert. Tu ne réponds QU'AUX QUESTIONS DE LANGUE FRANÇAISE.`,
      philosophie: `Tu es un professeur de philosophie expert. Tu ne réponds QU'AUX QUESTIONS DE PHILOSOPHIE.`,
    };

    const systemPrompt = subjectPrompts[normalizedSubject] || `Tu es un professeur expert et bienveillant. Détecte la langue et réponds dans cette MÊME langue.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => {
        if (typeof msg.content === "string") return { role: msg.role, content: msg.content };
        const textParts = msg.content.filter((c: any) => c.type === "text").map((c: any) => c.text);
        return { role: msg.role, content: textParts.join("\n") };
      }),
    ];

    console.log("Subject:", normalizedSubject, "| Calling AI with fallback...");
    const { response, isGeminiDirect } = await callWithFallback(aiMessages);

    if (isGeminiDirect) {
      const geminiData = await response.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(sseData, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
