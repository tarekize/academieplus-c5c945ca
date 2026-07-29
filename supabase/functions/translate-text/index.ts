import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Traduction à la volée (affichage uniquement) des titres de chapitre/leçon
// qui n'existent que dans une seule langue en base — jamais écrite en base,
// utilisée seulement pour l'affichage côté client quand la langue
// d'interface choisie n'a pas de titre correspondant stocké. Utilise
// directement l'API Google Cloud Translation (pas de LLM/prompt).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXTS_PER_CALL = 50;

async function translateWithGoogle(texts: string[], source: "fr" | "ar", target: "fr" | "ar", apiKey: string): Promise<string[]> {
  const resp = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source, target, format: "text" }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    console.error("Google Translate API failed:", resp.status, errBody);
    throw new Error("Le service Google Translate est indisponible.");
  }

  const data = await resp.json();
  const translations = data?.data?.translations;
  if (!Array.isArray(translations)) {
    throw new Error("Réponse Google Translate inattendue.");
  }
  return translations.map((t: any) => t?.translatedText ?? "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const GOOGLE_TRANSLATE_API_KEY = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");

    if (!GOOGLE_TRANSLATE_API_KEY) {
      return new Response(JSON.stringify({ error: "GOOGLE_TRANSLATE_API_KEY n'est pas configurée." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // On ne traduit qu'entre fr et ar, dans un sens : la source est
    // toujours l'autre langue que la cible demandée.
    const source: "fr" | "ar" = targetLang === "fr" ? "ar" : "fr";

    let translations: string[];
    try {
      translations = await translateWithGoogle(texts, source, targetLang, GOOGLE_TRANSLATE_API_KEY);
    } catch (e) {
      console.error("translate-text: Google Translate error:", e);
      // Repli : si Google Translate échoue, on renvoie les textes d'origine
      // plutôt que d'échouer — l'appelant affichera alors le texte de repli
      // habituel (autre langue) au lieu d'une traduction.
      translations = texts;
    }

    if (!Array.isArray(translations) || translations.length !== texts.length) {
      translations = texts;
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
