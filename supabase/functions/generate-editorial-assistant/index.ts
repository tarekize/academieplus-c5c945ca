// Assistant éditorial IA réservé aux enseignants / pédagogues / admins : aide à
// rédiger, enrichir ou corriger le contenu d'une leçon (panneau "Assistant
// éditorial" côté admin/pédago). Extrait de lovable-chat (qui reste dédié au
// chatbot élève) pour que les deux IA soient tracées séparément dans les logs
// (function_name distinct) et n'aient pas à partager leur rate-limit.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractGeminiUsage, type AiUsage, type RoleGroup } from "../_shared/tokenLogger.ts";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Assistant éditorial (panneau "Généré avec IA" du pédagogue) ---

const WIZARD_STRUCTURE_DESCRIPTIONS: Record<string, string> = {
  standard: "Rappels → Théorie & Théorèmes → Applications & Méthodes → Exercices",
  practice: "Exemple d'introduction → Formalisation théorique → Exercices",
};

const WIZARD_CONCEPT_DESCRIPTIONS: Record<string, string> = {
  definition: "Définitions et notations précises",
  properties: "Propriétés et théorèmes fondamentaux (avec justification si pertinent)",
  methodology: "Méthodologie de résolution (changement de variable, techniques de calcul...)",
  exercises: "Exercices d'application progressifs",
};

const WIZARD_STYLE_DESCRIPTIONS: Record<string, string> = {
  academic: "des exemples et exercices académiques et classiques, orientés examens et sujets types",
  visual: "des exemples visuels et concrets, avec des applications réelles quand c'est pertinent",
  progressive: "des exemples et exercices progressifs, du plus facile au plus difficile",
};

// Construit le bloc de plan pédagogique co-construit avec le flux guidé
// (structure / concepts clés / style d'exemples choisis pas à pas par le
// pédagogue). Absent quand la demande ne vient pas du flux guidé.
function buildWizardBlock(wizard: any): string {
  if (!wizard) return "";

  const structureDesc = wizard.structure === "custom"
    ? (wizard.customSections || "Structure personnalisée définie par l'enseignant")
    : (WIZARD_STRUCTURE_DESCRIPTIONS[wizard.structure] || "");

  const conceptsDesc = Array.isArray(wizard.concepts) && wizard.concepts.length > 0
    ? wizard.concepts.map((c: string) => `- ${WIZARD_CONCEPT_DESCRIPTIONS[c] || c}`).join("\n")
    : "- Aucune contrainte particulière";

  const styleDesc = WIZARD_STYLE_DESCRIPTIONS[wizard.exampleStyle] || "";

  return `
════════════════════════════════════
📋 PLAN CO-CONSTRUIT AVEC LE PÉDAGOGUE (À RESPECTER STRICTEMENT)
════════════════════════════════════
- Structure générale : ${structureDesc}
- Points clés à inclure impérativement :
${conceptsDesc}
- Style des exemples et exercices : ${styleDesc}
`;
}

// Prompt de l'assistant éditorial : détecte lui-même si la demande de
// l'utilisateur porte sur une partie précise (Type A → <update> ciblé) ou
// sur une génération/enrichissement complet (Type B/C). La génération
// complète produit du Markdown + LaTeX avec les blocs pédagogiques natifs
// ::: definition/theorem/remark/example/property/method/exercise (rendus en
// encadrés stylés côté client), jamais du HTML brut.
function buildEditorialPrompt(editorialContext: any, subject: string): string {
  const currentContent = editorialContext?.currentContent || "";
  const wizard = editorialContext?.wizard || null;
  const lessonTitle = editorialContext?.lessonTitle || wizard?.lessonTitle || "";
  const schoolLevel = editorialContext?.schoolLevel || wizard?.schoolLevel || "";

  return `Tu es un assistant IA expert en édition de contenus pédagogiques ${subject || "mathématiques"} (français/arabe).
CONTEXTE: Tu aides un professeur/administrateur à modifier ou créer une leçon${lessonTitle ? ` intitulée "${lessonTitle}"` : ""}${schoolLevel ? ` pour le niveau ${schoolLevel}` : ""}.

📋 CONTENU ACTUEL DE LA LEÇON (référence absolue):
"""
${currentContent || "Aucun contenu (leçon vide)"}
"""

🎯 RÈGLE D'OR — DÉTECTION DU TYPE DE DEMANDE:

**Type A — DEMANDE CIBLÉE** (l'utilisateur mentionne une partie précise: titre de section, nom de définition, paragraphe spécifique, ex: "explique en détail la partie التفسير البياني", "enrichis la définition 1.1", "reformule l'exemple 2", "ajoute des détails à la section مفهوم النهاية"):
   ➜ Tu DOIS répondre UNIQUEMENT avec le bloc <update> ci-dessous.
   ➜ Tu ne renvoies QUE la partie concernée, JAMAIS le reste de la leçon.
   ➜ Le texte dans <original> doit être COPIÉ-COLLÉ EXACTEMENT depuis le contenu actuel ci-dessus (mot pour mot, espaces, sauts de ligne, ponctuation, formules LaTeX identiques).
   ➜ Le texte dans <new> est la version enrichie/améliorée de cette même partie, dans le MÊME format que le contenu actuel (Markdown + LaTeX + blocs ::: si le contenu actuel les utilise).

   FORMAT OBLIGATOIRE (rien avant, rien après):
<update>
<original>
[copie EXACTE de la portion existante à remplacer]
</original>
<new>
[version enrichie de remplacement — c'est ce qui REMPLACERA ENTIÈREMENT <original>]
</new>
</update>


**Type B/C — GÉNÉRATION OU ENRICHISSEMENT COMPLET** (l'utilisateur demande "enrichir", "donne-moi le contenu complet", "génère un cours", "أنشئ درس", ou la leçon est vide) :
Tu es un professeur expert en mathématiques pour le lycée algérien/marocain/tunisien.
Tu rédiges des cours complets, structurés et pédagogiques en **Markdown + LaTeX** — JAMAIS en HTML.
${buildWizardBlock(wizard)}
════════════════════════════════════
⚙️ FORMAT DE SORTIE OBLIGATOIRE
════════════════════════════════════

1. Langue : arabe intégral (sauf termes mathématiques universels et symboles).
2. Structure Markdown :
   - Titre principal en première ligne : "# درس: ..."
   - Sections : "## 1. ...", "## 2. ..." (numérotées), une ligne "---" seule entre chaque section.
3. Formules mathématiques en LaTeX valide (rendu par KaTeX) : "$...$" pour les formules en ligne, "$$...$$" sur leur propre ligne pour les formules en bloc. N'utilise JAMAIS de symboles Unicode approximatifs pour une formule importante.
4. Blocs pédagogiques : encadre CHAQUE définition, théorème, remarque, exemple, propriété, méthode ou exercice avec la syntaxe suivante, EXACTEMENT :

::: TYPE
**Titre du bloc**
Contenu du bloc (peut contenir des listes, du gras, du LaTeX)...
:::

   où TYPE est l'un de : definition, theorem, proposition, property, remark, example, exercise, method.
   RÈGLE ABSOLUE : le ::: de fermeture doit TOUJOURS être seul sur sa propre ligne, jamais collé à la fin d'une phrase. N'imbrique jamais un bloc ::: dans un autre.
5. N'utilise JAMAIS de balises HTML (pas de <div>, <p>, <h1>, <span>...). Markdown pur uniquement, aucune balise de code \`\`\`.
6. Termine toujours la leçon par une section "## 🎯 خلاصة الدرس" contenant un bloc ::: remark qui résume les points clés à retenir.

⚠️ RÈGLE FINALE ABSOLUE POUR LA GÉNÉRATION COMPLÈTE :
Tu retournes UNIQUEMENT le contenu Markdown de la leçon, rien avant, rien après. Aucun blabla, pas de texte "Voici le cours...", AUCUNE balise de code \`\`\`markdown. JUSTE LE CONTENU BRUT.`;
}

// Convert OpenAI-style messages (string OR [{type:'text'|'image_url',...}]) to Gemini parts
function toGeminiParts(content: any): any[] {
  if (typeof content === "string") return [{ text: content }];
  if (!Array.isArray(content)) return [{ text: String(content ?? "") }];
  const parts: any[] = [];
  for (const p of content) {
    if (!p) continue;
    if (p.type === "text" && typeof p.text === "string") {
      parts.push({ text: p.text });
    } else if (p.type === "image_url" && p.image_url?.url) {
      const url: string = p.image_url.url;
      const m = url.match(/^data:([^;]+);base64,(.+)$/);
      if (m) {
        parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
      } else {
        // remote URL — Gemini accepts fileData for some; fall back to text mention
        parts.push({ text: `[Image jointe: ${url}]` });
      }
    }
  }
  if (parts.length === 0) parts.push({ text: "" });
  return parts;
}

// Modèles essayés dans l'ordre : gemini-flash-latest est le modèle habituel,
// les suivants ne servent que de repli quand Google renvoie une indispo
// temporaire (503 "high demand") ou un dépassement de quota (429) — jamais
// pour une erreur de requête (400 etc.) qui échouerait pareil ailleurs.
const GEMINI_MODEL_FALLBACKS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

async function callGemini(
  systemPrompt: string,
  messages: any[],
  tokenLogCtx?: { supabaseUrl: string; serviceRoleKey: string; userId: string | null; roleGroup: RoleGroup }
): Promise<Response> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  const geminiMessages = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(m.content),
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    // Une leçon complète en 8 sections avec formules LaTeX dépasse largement
    // 8192 tokens et se retrouvait tronquée en plein milieu. thinkingBudget:0
    // évite aussi que des tokens de "raisonnement" interne grignotent le
    // budget de sortie visible.
    generationConfig: { temperature: 0.7, maxOutputTokens: 32768, thinkingConfig: { thinkingBudget: 0 } },
  };

  let response: Response | null = null;
  let lastStatus = 0;

  for (const model of GEMINI_MODEL_FALLBACKS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY_2}`;
    const attempt = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (attempt.ok) {
      response = attempt;
      break;
    }

    lastStatus = attempt.status;
    const errText = await attempt.text();
    console.error(`Gemini error (${model}):`, attempt.status, errText);

    // Erreur de requête (mauvais prompt, clé invalide...) : réessayer avec un
    // autre modèle échouerait exactement pareil, inutile d'insister.
    if (attempt.status !== 503 && attempt.status !== 429) break;
  }

  if (!response) {
    throw new Error(`Gemini failed: ${lastStatus}`);
  }

  const geminiStream = response.body!;
  const { readable, writable } = new TransformStream();

  (async () => {
    const writer = writable.getWriter();
    const reader = geminiStream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    // Each SSE chunk from Gemini carries its own usageMetadata; the last one
    // received before the stream ends holds the final, complete token counts.
    let latestUsage: AiUsage | null = null;
    const captureUsage = (parsed: any) => {
      const u = extractGeminiUsage(parsed);
      if (u) latestUsage = u;
    };

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
            captureUsage(parsed);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const openAiChunk = { choices: [{ delta: { content: text }, index: 0 }] };
              await writer.write(encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            }
          } catch { /* skip */ }
        }
      }
      if (buffer.startsWith("data: ")) {
        const jsonStr = buffer.slice(6).trim();
        if (jsonStr && jsonStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(jsonStr);
            captureUsage(parsed);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const openAiChunk = { choices: [{ delta: { content: text }, index: 0 }] };
              await writer.write(encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            }
          } catch { /* skip */ }
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));

      // Log de consommation IA réelle une fois le flux terminé, seulement si Gemini a
      // effectivement renvoyé des métadonnées d'usage.
      if (latestUsage && tokenLogCtx) {
        logTokenUsageAsync({
          supabaseUrl: tokenLogCtx.supabaseUrl,
          serviceRoleKey: tokenLogCtx.serviceRoleKey,
          userId: tokenLogCtx.userId,
          roleGroup: tokenLogCtx.roleGroup,
          functionName: "generate-editorial-assistant",
          inputTokens: (latestUsage as AiUsage).inputTokens,
          outputTokens: (latestUsage as AiUsage).outputTokens,
        });
      }
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

// ============ Main handler ============
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, subject, editorialContext } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    // --- Authentification + autorisation obligatoires : cet assistant écrit
    // potentiellement du contenu de cours réel et consomme un quota IA payant.
    // Réservé aux enseignants / pédagogues / admins (jamais aux élèves). ---
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { userId: callerUserId, roleGroup: callerRoleGroup } = await resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, authHeader);
    if (!callerUserId) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["teacher", "pedago", "admin"].includes(callerRoleGroup)) {
      return new Response(JSON.stringify({ error: "Accès réservé aux enseignants et à l'équipe pédagogique" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate limiting : évite l'épuisement du quota IA payant, avec son
    // propre compteur (indépendant du chatbot élève) pour ne pas être
    // affecté par l'usage du chat élève et inversement. ---
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const rateLimitWindowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    const { count: recentRequests } = await adminClient
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", callerUserId)
      .eq("action", "ia_editorial_request")
      .gte("created_at", rateLimitWindowStart);

    if ((recentRequests ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Merci de patienter quelques instants." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    adminClient
      .from("activity_logs")
      .insert({ user_id: callerUserId, action: "ia_editorial_request" })
      .then(({ error }: any) => {
        if (error) console.error("Failed to log ia_editorial_request:", error);
      });

    const systemPrompt = buildEditorialPrompt(editorialContext, subject);

    try {
      return await callGemini(systemPrompt, messages, {
        supabaseUrl, serviceRoleKey, userId: callerUserId, roleGroup: callerRoleGroup,
      });
    } catch (e) {
      console.error("Gemini call failed:", e);
      return new Response(
        JSON.stringify({ error: "Le service IA est actuellement indisponible. Veuillez réessayer plus tard." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    console.error("editorial assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
