import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Traduction à la volée (affichage uniquement) des titres de chapitre/leçon
// qui n'existent que dans une seule langue en base — jamais écrite en base,
// utilisée seulement pour l'affichage côté client quand la langue
// d'interface choisie n'a pas de titre correspondant stocké.
//
// Utilise MyMemory Translation API (api.mymemory.translated.net) : gratuit,
// sans clé, sans compte de facturation, pas d'IA — juste un appel HTTP.
// Limite ~5000 mots/jour par IP en anonyme, largement suffisant pour des
// titres de chapitres/leçons.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXTS_PER_CALL = 50;

async function translateOne(text: string, source: "fr" | "ar", target: "fr" | "ar"): Promise<string> {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error("MyMemory request failed:", resp.status);
    return text;
  }
  const data = await resp.json();
  const translated = data?.responseData?.translatedText;
  // MyMemory renvoie parfois un message d'erreur textuel (quota dépassé, etc.)
  // à la place d'une vraie traduction : dans ce cas on garde le texte d'origine.
  if (typeof translated !== "string" || !translated.trim() || /MYMEMORY WARNING/i.test(translated)) {
    return text;
  }
  return translated;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const translations = await Promise.all(
      texts.map((text: string) => translateOne(text, source, targetLang).catch(() => text))
    );

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
