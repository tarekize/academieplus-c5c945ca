import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function tryOpenRouter(apiKey: string, messages: any[], stream: boolean) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://academieplus.app",
      "X-Title": "AcademiePlus",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      stream,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${t}`);
  }
  return response;
}

async function tryLovableAI(apiKey: string, messages: any[], stream: boolean) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      stream,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`LovableAI ${response.status}: ${t}`);
  }
  return response;
}

async function tryGemini(apiKey: string, messages: any[], stream: boolean) {
  // Use Gemini via OpenRouter with Gemini key as a direct call
  const contents = messages.map((m: any) => ({
    role: m.role === "system" ? "user" : m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:${stream ? "streamGenerateContent" : "generateContent"}?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini ${response.status}: ${t}`);
  }
  return response;
}

async function callAIWithFallback(messages: any[], stream: boolean): Promise<{ response: Response; provider: string; isGeminiDirect: boolean }> {
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  // Try OpenRouter first
  if (openrouterKey) {
    try {
      console.log("Trying OpenRouter...");
      const resp = await tryOpenRouter(openrouterKey, messages, stream);
      console.log("OpenRouter succeeded");
      return { response: resp, provider: "openrouter", isGeminiDirect: false };
    } catch (e) {
      console.error("OpenRouter failed:", (e as Error).message);
    }
  }

  // Fallback to Lovable AI
  if (lovableKey) {
    try {
      console.log("Trying Lovable AI...");
      const resp = await tryLovableAI(lovableKey, messages, stream);
      console.log("Lovable AI succeeded");
      return { response: resp, provider: "lovable", isGeminiDirect: false };
    } catch (e) {
      console.error("Lovable AI failed:", (e as Error).message);
    }
  }

  // Fallback to Gemini direct
  if (geminiKey) {
    try {
      console.log("Trying Gemini direct...");
      const resp = await tryGemini(geminiKey, messages, false); // Gemini direct doesn't use SSE format
      console.log("Gemini direct succeeded");
      return { response: resp, provider: "gemini", isGeminiDirect: true };
    } catch (e) {
      console.error("Gemini direct failed:", (e as Error).message);
    }
  }

  throw new Error("Tous les services IA sont indisponibles. Veuillez réessayer plus tard.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, subject, chapterContext } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialiser Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizeSubject = (subjectName: string): string => {
      if (!subjectName) return "";
      return subjectName.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/é/g, "e").replace(/è/g, "e").replace(/ê/g, "e")
        .replace(/à/g, "a").replace(/ç/g, "c");
    };

    const normalizedSubject = normalizeSubject(subject || "");

    // Récupérer le contenu du cours pour Histoire-Géographie
    let courseContent = "";
    if (normalizedSubject === "histoire-geographie") {
      const { data: chunks, error } = await supabase
        .from('course_content_chunks')
        .select('chapter_number, chapter_title, content')
        .eq('subject', 'histoire-geographie')
        .order('chapter_number', { ascending: true });

      if (!error && chunks && chunks.length > 0) {
        courseContent = "\n\n=== CONTENU DU COURS ===\n\n";
        chunks.forEach((chunk: any) => {
          courseContent += `\n## Chapitre ${chunk.chapter_number}: ${chunk.chapter_title}\n\n${chunk.content}\n\n`;
        });
      }
    }

    const subjectPrompts: Record<string, string> = {
      mathematiques: `Tu es un professeur de mathématiques pédagogue et bienveillant. 
RÈGLES IMPORTANTES :
1. Tu ne réponds QU'AUX QUESTIONS DE MATHÉMATIQUES
2. Pour toute question non-mathématique, réponds poliment que tu ne peux traiter que les questions de mathématiques
3. Détecte automatiquement la langue de la question et réponds dans cette MÊME langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. N'utilise JAMAIS de syntaxe LaTeX. Écris toutes les formules en texte clair
**FORMATAGE MARKDOWN OBLIGATOIRE** :
- Utilise des **titres** ## pour les sections
- Mets en **gras** les formules et concepts importants
- Utilise des *italiques* pour les astuces
- Utilise des listes à puces et > blockquotes
STRUCTURE : Comprendre → Concepts clés → Résolution → Réponse finale → Conseil → Exercice similaire`,

      anglais: `Tu es un professeur d'anglais expert. Tu ne réponds QU'AUX QUESTIONS D'ANGLAIS. Détecte la langue et réponds dans cette langue.`,
      "physique-chimie": `Tu es un professeur de physique-chimie expert. Tu ne réponds QU'AUX QUESTIONS DE PHYSIQUE ET CHIMIE. Détecte la langue et réponds dans cette langue.`,
      svt: `Tu es un professeur de SVT expert. Tu ne réponds QU'AUX QUESTIONS DE SVT. Détecte la langue et réponds dans cette langue.`,
      "histoire-geographie": `Tu es un professeur d'histoire-géographie expert. Tu ne réponds QU'AUX QUESTIONS D'HISTOIRE ET DE GÉOGRAPHIE. Détecte la langue et réponds dans cette langue.${courseContent}`,
      francais: `Tu es un professeur de français expert. Tu ne réponds QU'AUX QUESTIONS DE LANGUE FRANÇAISE. Détecte la langue et réponds dans cette langue.`,
      philosophie: `Tu es un professeur de philosophie expert. Tu ne réponds QU'AUX QUESTIONS DE PHILOSOPHIE. Détecte la langue et réponds dans cette langue.`,
    };

    const systemPrompt = subjectPrompts[normalizedSubject] ||
      `Tu es un professeur expert et bienveillant. Détecte la langue de la question et réponds dans cette MÊME langue. Sois pédagogue et encourageant.`;

    console.log("Subject:", normalizedSubject, "| Calling AI with fallback chain...");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const { response, provider, isGeminiDirect } = await callAIWithFallback(aiMessages, true);
    console.log("AI response from provider:", provider);

    // If Gemini direct, convert response to SSE format for client compatibility
    if (isGeminiDirect) {
      const geminiData = await response.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
      
      // Convert to SSE format
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
      
      return new Response(sseData, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

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
