import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { logTokenUsageAsync, extractGeminiUsage, extractOpenAiCompatUsage, type AiUsage, type RoleGroup } from "../_shared/tokenLogger.ts";

// Traduction à la volée (affichage uniquement) des titres de chapitre/leçon
// qui n'existent que dans une seule langue en base — jamais écrite en base,
// utilisée seulement pour l'affichage côté client quand la langue
// d'interface choisie n'a pas de titre correspondant stocké.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXTS_PER_CALL = 50;

async function callAIWithFallback(messages: any[]): Promise<{ text: string; usage: AiUsage | null }> {
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (openrouterKey) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://academieplus.app",
          "X-Title": "AcademiePlus",
        },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
      });
      if (resp.ok) {
        const result = await resp.json();
        return { text: result.choices?.[0]?.message?.content || "", usage: extractOpenAiCompatUsage(result) };
      }
      console.error("OpenRouter failed:", resp.status);
    } catch (e) { console.error("OpenRouter error:", e); }
  }

  if (lovableKey) {
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });
      if (resp.ok) {
        const result = await resp.json();
        return { text: result.choices?.[0]?.message?.content || "", usage: extractOpenAiCompatUsage(result) };
      }
      console.error("Lovable AI failed:", resp.status);
    } catch (e) { console.error("Lovable AI error:", e); }
  }

  if (geminiKey) {
    try {
      const contents = messages.map((m: any) => ({
        role: m.role === "system" ? "user" : m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", usage: extractGeminiUsage(data) };
      }
      console.error("Gemini direct failed:", resp.status);
    } catch (e) { console.error("Gemini error:", e); }
  }

  throw new Error("Tous les services IA sont indisponibles.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { texts, targetLang } = await req.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({ error: "texts doit être un tableau non vide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (targetLang !== "fr" && targetLang !== "ar") {
      return new Response(JSON.stringify({ error: "targetLang doit être 'fr' ou 'ar'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (texts.length > MAX_TEXTS_PER_CALL) {
      return new Response(JSON.stringify({ error: `Maximum ${MAX_TEXTS_PER_CALL} textes par appel` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetLabel = targetLang === "fr" ? "français" : "arabe";
    const prompt = `Traduis chacun des textes suivants vers le ${targetLabel}. Ce sont des titres de chapitres ou de leçons de mathématiques du programme scolaire algérien : garde le vocabulaire mathématique précis et le style concis d'un titre. Réponds UNIQUEMENT avec un tableau JSON de chaînes de caractères, dans le même ordre et de la même longueur que la liste fournie, sans aucun texte, explication ou balise de code autour.

Textes à traduire (JSON) :
${JSON.stringify(texts)}`;

    const messages = [
      {
        role: "system",
        content: "Tu es un traducteur professionnel français-arabe spécialisé dans le vocabulaire mathématique scolaire. Tu réponds uniquement avec un tableau JSON de chaînes, rien d'autre.",
      },
      { role: "user", content: prompt },
    ];

    const { text: raw, usage } = await callAIWithFallback(messages);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let translations: unknown;
    try {
      translations = JSON.parse(cleaned);
    } catch {
      translations = null;
    }

    if (!Array.isArray(translations) || translations.length !== texts.length || !translations.every((t) => typeof t === "string")) {
      // Repli : si l'IA n'a pas renvoyé un tableau exploitable, on renvoie les
      // textes d'origine plutôt que d'échouer — l'appelant affichera alors le
      // texte de repli habituel (autre langue) au lieu d'une traduction.
      translations = texts;
    }

    if (usage) {
      const { data: roleRows } = await userClient.from("user_roles").select("role").eq("user_id", user.id);
      const roleGroup = ((roleRows ?? [])[0]?.role || "other") as RoleGroup;
      logTokenUsageAsync({
        supabaseUrl: SUPABASE_URL,
        serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
        userId: user.id,
        roleGroup,
        functionName: "translate-text",
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      });
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("translate-text error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
