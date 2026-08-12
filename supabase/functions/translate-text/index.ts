import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Traduction à la volée (affichage uniquement) du contenu pédagogique qui
// n'existe qu'en une seule langue en base (arabe) — titres de
// chapitre/leçon, contenu de leçon, énoncés/solutions/aides d'exercices,
// questions/options/explications de quiz. Jamais écrit dans les tables de
// contenu ; seulement mis en cache dans `translation_cache` pour éviter de
// retraduire le même texte à chaque vue (le quota du service gratuit est
// partagé par toute l'application, pas par utilisateur).
//
// Utilise MyMemory Translation API (api.mymemory.translated.net) : gratuit,
// sans clé, sans compte de facturation, pas d'IA — juste un appel HTTP.
// Limite ~500 caractères par requête individuelle et ~5000 mots/jour par IP
// en anonyme : on découpe donc les textes longs (contenu de leçon) en
// morceaux, et on protège les balises HTML pour ne jamais les envoyer au
// service de traduction (elles reviendraient déformées).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXTS_PER_CALL = 30;
const CHUNK_MAX_CHARS = 450;

// Hache "targetLang:text" en SHA-256 pour servir de clé de cache stable et
// courte dans `translation_cache` (évite de stocker/indexer le texte source
// brut, potentiellement long, comme clé primaire).
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Remplace les balises HTML et les segments LaTeX par des jetons opaques
// avant traduction, pour que le service de traduction ne voie jamais de
// balisage (il le déformerait systématiquement).
function protect(text: string): { protectedText: string; restore: (t: string) => string } {
  const tokens: string[] = [];
  const patterns = [
    /<[^>]+>/g, // balises HTML
    /\$\$[\s\S]*?\$\$/g, // bloc LaTeX $$...$$
    /\\\[[\s\S]*?\\\]/g, // bloc LaTeX \[...\]
    /\$[^$\n]+\$/g, // LaTeX inline $...$
    /\\\([\s\S]*?\\\)/g, // LaTeX inline \(...\)
  ];

  let working = text;
  for (const pattern of patterns) {
    working = working.replace(pattern, (match) => {
      const idx = tokens.length;
      tokens.push(match);
      // Jeton en lettres/chiffres uniquement : un jeton fait de symboles
      // répétés (ex: §§0§§) était retourné par MyMemory avec un espace
      // inséré entre chaque §, cassant le regex de restauration et laissant
      // des "§ §16 § §" bruts et non traduits dans le contenu affiché.
      return ` tkzq${idx}zqkt `;
    });
  }

  return {
    protectedText: working,
    restore: (translated: string) => {
      let out = translated.replace(/t\s*k\s*z\s*q\s*(\d+)\s*z\s*q\s*k\s*t/gi, (_m, idxStr) => tokens[Number(idxStr)] ?? "");
      // Filet de sécurité : si un jeton a malgré tout survécu déformé (mot
      // coupé/retraduit par le service), mieux vaut l'effacer que d'afficher
      // du charabia à l'utilisateur.
      out = out.replace(/t\s*k\s*z\s*q\s*\d+\s*z\s*q\s*k\s*t/gi, "");
      return out;
    },
  };
}

// Découpe un texte en morceaux ≤ CHUNK_MAX_CHARS, en coupant de préférence
// sur des frontières de phrase/paragraphe pour ne pas casser le sens.
function chunkText(text: string): string[] {
  if (text.length <= CHUNK_MAX_CHARS) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > CHUNK_MAX_CHARS) {
    let cut = remaining.lastIndexOf("\n", CHUNK_MAX_CHARS);
    if (cut < CHUNK_MAX_CHARS * 0.4) cut = remaining.lastIndexOf(". ", CHUNK_MAX_CHARS);
    if (cut < CHUNK_MAX_CHARS * 0.4) cut = remaining.lastIndexOf(" ", CHUNK_MAX_CHARS);
    if (cut < CHUNK_MAX_CHARS * 0.4) cut = CHUNK_MAX_CHARS;
    chunks.push(remaining.slice(0, cut + 1));
    remaining = remaining.slice(cut + 1);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

// Traduit un seul morceau de texte (≤ CHUNK_MAX_CHARS) via l'API MyMemory.
// En cas d'échec réseau ou de réponse invalide/avertissement du service,
// retourne le texte original tel quel plutôt que de faire échouer tout
// l'appel : une traduction partiellement ratée reste préférable à une page
// blanche pour l'élève/l'enseignant qui consulte le contenu.
async function translateChunk(text: string, source: "fr" | "ar", target: "fr" | "ar"): Promise<string> {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error("MyMemory request failed:", resp.status);
    return text;
  }
  const data = await resp.json();
  const translated = data?.responseData?.translatedText;
  if (typeof translated !== "string" || !translated.trim() || /MYMEMORY WARNING/i.test(translated)) {
    return text;
  }
  return translated;
}

// Traduit un texte complet (potentiellement long) en le protégeant (balises
// HTML/LaTeX), le découpant en morceaux, traduisant chaque morceau, puis en
// restaurant le balisage protégé dans le résultat.
async function translateFull(text: string, source: "fr" | "ar", target: "fr" | "ar"): Promise<string> {
  if (!text.trim()) return text;
  const { protectedText, restore } = protect(text);
  const chunks = chunkText(protectedText);
  const translatedChunks: string[] = [];
  // Séquentiel (pas Promise.all) pour rester raisonnable vis-à-vis du quota
  // partagé du service gratuit.
  for (const chunk of chunks) {
    translatedChunks.push(await translateChunk(chunk, source, target));
  }
  return restore(translatedChunks.join(""));
}

// Traduit à la volée un lot de textes (max MAX_TEXTS_PER_CALL) vers 'fr' ou
// 'ar' via l'API gratuite MyMemory, avec cache partagé dans
// `translation_cache`. Appelé par src/lib/autoTranslate.ts (utilisé par les
// pages de cours/exercices/quiz pour afficher le contenu dans la langue
// choisie par l'utilisateur). Authentification obligatoire (pas de coût IA
// ici, mais le quota MyMemory est partagé par toute l'application — voir
// commentaire en tête de fichier) ; rate-limiting par utilisateur ci-dessous
// pour qu'un seul compte ne puisse pas épuiser à lui seul ce quota partagé
// (ce qui dégraderait la traduction pour tous les autres utilisateurs).
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

    // --- Rate limiting : le quota gratuit MyMemory (~5000 mots/jour) est
    // PARTAGÉ par toute l'application (pas par utilisateur, cf. commentaire
    // en tête de fichier). Sans throttle, un seul compte authentifié pouvait
    // boucler sur cet endpoint avec des textes jamais mis en cache et épuiser
    // le quota du service pour TOUS les autres utilisateurs de la plateforme.
    const adminClientForRateLimit = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: rateLimitAllowed, error: rateLimitError } = await adminClientForRateLimit.rpc("check_and_log_rate_limit", {
      p_user_id: user.id,
      p_action: "translate_text",
      p_window_seconds: 60,
      p_max_requests: 30,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitAllowed) {
      return new Response(JSON.stringify({ error: "Trop de requêtes. Merci de patienter quelques instants." }), {
        status: 429,
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

    const source: "fr" | "ar" = targetLang === "fr" ? "ar" : "fr";
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const items: { text: string; key: string }[] = await Promise.all(
      texts.map(async (text: string) => ({ text, key: await sha256Hex(`${targetLang}:${text}`) }))
    );

    const keys = items.map((it) => it.key);
    const { data: cachedRows } = await adminClient
      .from("translation_cache")
      .select("cache_key, translated_text")
      .in("cache_key", keys);

    const cacheMap = new Map<string, string>();
    for (const row of cachedRows || []) {
      cacheMap.set(row.cache_key, row.translated_text);
    }

    const toInsert: { cache_key: string; target_lang: string; source_text: string; translated_text: string }[] = [];

    const translations = await Promise.all(
      items.map(async ({ text, key }) => {
        if (!text.trim()) return text;
        const cached = cacheMap.get(key);
        if (cached !== undefined) return cached;
        try {
          const translated = await translateFull(text, source, targetLang);
          if (translated && translated !== text) {
            toInsert.push({ cache_key: key, target_lang: targetLang, source_text: text, translated_text: translated });
          }
          return translated;
        } catch (e) {
          console.error("translateFull failed:", e);
          return text;
        }
      })
    );

    if (toInsert.length > 0) {
      adminClient.from("translation_cache").upsert(toInsert, { onConflict: "cache_key" }).then(
        ({ error }) => { if (error) console.error("cache upsert failed:", error); }
      );
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
