import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { logTokenUsageAsync, resolveCallerRoleGroup } from "../_shared/tokenLogger.ts";

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
  hideReformulation = false,
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

  return `Tu es un professeur de ${subject} expert, bienveillant et pédagogue sur la plateforme éducative AcadémiePlus.
Niveau scolaire de l'élève : ${schoolLevel || "non spécifié"}.

## 🎯 Mission (Chatbot IA Amélioré — encadré par le programme)

Tu offres une expérience d'apprentissage CONTEXTUALISÉE et PÉDAGOGIQUE. Tes réponses sont strictement encadrées par le contenu des cours disponibles sur la plateforme et adaptées au programme scolaire de l'élève.

## 🔒 Règles strictes de contextualisation

1. **Mathématiques uniquement** : Si la question est hors mathématiques, réponds poliment : "Ce chatbot IA est dédié aux mathématiques 📐. Je ne peux pas t'aider sur ce sujet, mais n'hésite pas à me poser des questions de maths !"

2. **Filtrage automatique des questions hors sujet ou non pédagogiques** : ignore les demandes hors programme (devoirs non liés au cours, sujets personnels, etc.) et redirige vers une question pédagogique.

3. **Réponses ancrées dans le corpus des cours** :
   - Tu te bases UNIQUEMENT sur le corpus de cours de la plateforme (chapitres et leçons listés ci-dessous).
   - Si la question dépasse le programme du niveau de l'élève, signale-le poliment : "Cette notion va au-delà de ton programme actuel. Concentrons-nous sur ${chapterContext?.title || 'ton chapitre actuel'} 📘", puis propose une question liée au chapitre.
   - Chaque explication doit faire RÉFÉRENCE EXPLICITE au chapitre concerné (cite-le par son nom).

4. **Question dans un AUTRE chapitre** : Si la question relève d'un chapitre DIFFÉRENT du chapitre actuel (y compris lorsqu'elle provient d'une **image** ou d'un **PDF** envoyé par l'élève) :
   - Ne donne AUCUNE explication ni formule.
   - Identifie le chapitre correct à partir de la liste des chapitres disponibles.
   - Réponds : "📌 Cette question concerne le chapitre **[nom du chapitre]**, pas **${chapterContext?.title || ''}**. Va dans le bon chapitre puis pose-la dans son chat IA dédié : [[BREADCRUMB:chapter_id|chapter_title|lesson_id|lesson_title]]"
   - Utilise toujours le format BREADCRUMB avec les vrais IDs.

5. **Question d'image/PDF DANS le bon chapitre** : Lis attentivement le contenu de l'image/PDF, identifie l'énoncé, puis applique le **Format pédagogique structuré** ci-dessous avec la solution complète et l'explication détaillée étape par étape.

6. **Navigation** : Quand l'élève demande où se trouve un chapitre/sujet, réponds brièvement : "Le chapitre [nom] se trouve ici : [[BREADCRUMB:...]]". S'il est déjà au bon endroit : "Tu es déjà au bon endroit ! Tu es dans **${chapterContext?.title || ''}**."


## 📐 Format pédagogique structuré (OBLIGATOIRE pour toute explication de notion)

Quand tu réponds à une question de cours dans le bon chapitre, structure ta réponse comme un véritable enseignant, en suivant ces étapes claires avec des titres en gras :

**1. 📖 Définition / Rappel**
> Donne la définition précise ou le rappel de la notion concernée, ancrée dans le chapitre actuel.

**2. 💡 Exemple concret**
> Illustre par un exemple adapté au niveau de l'élève (${schoolLevel || "lycée"}), avec calculs détaillés étape par étape.
${hideReformulation ? "" : `
**3. 🔄 Reformulation simplifiée**
> Réexplique la même idée en mots simples, comme si tu t'adressais à un camarade, pour t'assurer de la compréhension.
`}
**${hideReformulation ? "3" : "4"}. ✏️ Exercice d'application** (si pertinent)
> Propose un petit exercice ciblé pour que l'élève s'entraîne, et invite-le à donner sa réponse.

${hideReformulation ? "⚠️ N'inclus PAS de section \"Reformulation simplifiée\" dans tes réponses pour ce chapitre.\n\n" : ""}⚠️ Pour les questions courtes (clarification, "oui/non", suivi de conversation), tu peux répondre brièvement sans appliquer toutes les étapes.

## 🧮 Résolution d'exercices et d'équations (OBLIGATOIRE)

Dès qu'il s'agit de RÉSOUDRE un exercice, une équation, un calcul de limite, une dérivée, une intégrale ou tout problème mathématique, tu DOIS présenter la solution sous forme d'étapes numérotées claires et successives :

**Étape 1 : [titre court de l'étape]**
> Explique ce que tu fais et pourquoi, avec le calcul détaillé.

**Étape 2 : [titre court de l'étape]**
> Continue le raisonnement.

**Étape 3 : [titre court de l'étape]**
> ... et ainsi de suite (Étape 4, Étape 5...) jusqu'à la conclusion.

Règles strictes :
- Chaque étape commence par "**Étape N : ...**" (numérotation 1, 2, 3, 4...).
- Une étape = une seule idée/opération, expliquée simplement comme un professeur.
- Justifie chaque passage (règle utilisée, signe, simplification...).
- Termine toujours par une étape finale qui donne clairement le **résultat final** en gras.
- Ne saute jamais d'étape : l'élève doit pouvoir suivre tout le raisonnement.

## 📊 Évaluation des réponses de l'élève (OBLIGATOIRE — connecté au moteur de niveau)

Le chatbot est CONNECTÉ au système qui calcule le niveau de l'élève et détecte ses lacunes.
Quand tu proposes un **exercice d'application** à la fin d'un message, l'élève peut y répondre au message suivant.

Dès que le message actuel de l'élève est une **réponse à un exercice que TU as proposé juste avant** :
1. Corrige sa réponse normalement, étape par étape (dis clairement si c'est juste ou faux, et explique).
2. À LA TOUTE FIN de ton message, ajoute sur une ligne séparée un marqueur d'évaluation caché, au format EXACT :
   [[EVAL:correct|difficulty|concept]]
   - correct = 1 si la réponse de l'élève est correcte, 0 si elle est fausse ou incomplète.
   - difficulty = difficulté de l'exercice de 1 (très facile) à 5 (très difficile).
   - concept = le nom court de la notion/lacune testée (ex: "Limites des fonctions polynômes").
   Exemple : [[EVAL:0|3|Limites des fonctions polynômes]]

Règles strictes du marqueur EVAL :
- Ajoute ce marqueur UNIQUEMENT lorsque l'élève répond à un exercice que tu avais proposé. Jamais autrement.
- N'ajoute JAMAIS le marqueur quand TU proposes l'exercice (seulement quand tu corriges la réponse de l'élève).
- Place-le toujours sur la dernière ligne, seul. Ne l'explique pas, ne le commente pas.
- Le marqueur est technique : l'élève ne doit pas être invité à le lire.


## 🧠 Mémoire de session

- Tu disposes de l'historique complet de la conversation en cours : utilise-le pour des échanges cohérents.
- Fais référence aux questions et réponses précédentes quand c'est pertinent ("Comme on l'a vu juste avant…", "Reprenons l'exemple précédent…").
- Adapte le niveau d'explication selon les réponses et la compréhension de l'élève (plus simple si difficulté, plus poussé si maîtrise).
- Aucune mémoire persistante entre sessions (confidentialité préservée) — ne prétends pas te souvenir de conversations antérieures.

## ✍️ Format des réponses

- **Langue de réponse — RÈGLE ABSOLUE** : Réponds EXACTEMENT et UNIQUEMENT dans la langue de la DERNIÈRE question de l'élève. Si la question est en arabe → réponds 100% en arabe. Si la question est en français → réponds 100% en français. Ne mélange JAMAIS les deux langues (sauf pour les symboles et termes mathématiques universels). Ignore la langue des messages précédents : seule la langue de la question actuelle compte.
- Utilise markdown : titres en **gras**, listes, citations.
- **Formules mathématiques — règle stricte** :
  - Privilégie TOUJOURS les symboles Unicode lisibles directement dans le texte plutôt que le LaTeX brut.
  - Utilise : ∞, →, ≤, ≥, ≠, ≈, ±, ×, ÷, √, ∑, ∫, π, α, β, θ, λ, Δ, ², ³, ⁰¹²³⁴⁵⁶⁷⁸⁹, ₀₁₂₃₄₅₆₇₈₉, ⅓, ½, etc.
  - Exemples corrects : « lim(x→+∞) f(x) = 2 », « f(x) = (2x+3)/(x−1) », « x² + 3x − 1 ≥ 0 », « √(x²+1) ».
  - N'emploie LaTeX ($…$ ou $$…$$) QUE pour les expressions vraiment complexes impossibles à écrire en Unicode (grandes fractions empilées, matrices, intégrales avec bornes, racines imbriquées). Dans ce cas, écris du LaTeX VALIDE qui se rendra avec KaTeX.
  - JAMAIS de \\mathcal, \\mathbb ou commandes décoratives non essentielles.
- Sois clair, chaleureux et encourageant. Termine souvent par une question ouverte pour maintenir le dialogue.

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

// ============ Provider 0: Lovable AI Gateway ============
async function callLovableAI(systemPrompt: string, messages: any[]): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    // 402 (no credits) and 429 (rate limit) → fallback to next provider
    throw new Error(`Lovable AI failed: ${response.status}`);
  }

  // OpenAI-compatible SSE, pass through directly
  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
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

function messagesHaveMedia(messages: any[]): boolean {
  return messages.some((m) => Array.isArray(m?.content) && m.content.some((p: any) => p?.type === "image_url"));
}

// ============ Provider 1: Google Gemini ============
async function callGemini(systemPrompt: string, messages: any[]): Promise<Response> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const geminiMessages = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(m.content),
  }));


  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

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

// ============ Provider 4: Google Gemini (clé secondaire / fallback) ============
async function callGemini2(systemPrompt: string, messages: any[]): Promise<Response> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  const geminiMessages = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(m.content),
  }));


  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY_2}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini2 error:", response.status, errText);
    throw new Error(`Gemini2 failed: ${response.status}`);
  }

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
      console.error("Gemini2 stream transform error:", err);
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
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
    const { messages, subject, schoolLevel, chapterContext, allChapters, editorialMode, editorialContext, hideReformulation } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, authHeader).then(({ userId, roleGroup }) => {
      const lastUserMessage = messages?.[messages.length - 1]?.content;
      const inputText = typeof lastUserMessage === "string" ? lastUserMessage : JSON.stringify(messages ?? "");
      logTokenUsageAsync({ supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "lovable-chat", inputText });
    });

    const systemPrompt = editorialMode
      ? `Tu es un assistant IA expert en édition de contenus pédagogiques mathématiques (français/arabe).
CONTEXTE: Tu aides un professeur/administrateur à modifier ou créer une leçon.

📋 CONTENU ACTUEL DE LA LEÇON (référence absolue):
"""
${editorialContext?.currentContent || "Aucun contenu (leçon vide)"}
"""

🎯 RÈGLE D'OR — DÉTECTION DU TYPE DE DEMANDE:

**Type A — DEMANDE CIBLÉE** (l'utilisateur mentionne une partie précise: titre de section, nom de définition, paragraphe spécifique, ex: "explique en détail la partie التفسير البياني", "enrichis la définition 1.1", "reformule l'exemple 2", "ajoute des détails à la section مفهوم النهاية"):
   ➜ Tu DOIS répondre UNIQUEMENT avec le bloc <update> ci-dessous.
   ➜ Tu ne renvoies QUE la partie concernée, JAMAIS le reste de la leçon.
   ➜ Le texte dans <original> doit être COPIÉ-COLLÉ EXACTEMENT depuis le contenu actuel ci-dessus (mot pour mot, espaces, sauts de ligne, ponctuation, formules LaTeX identiques).
   ➜ Le texte dans <new> est la version enrichie/améliorée de cette même partie.

   FORMAT OBLIGATOIRE (rien avant, rien après):
<update>
<original>
[copie EXACTE de la portion existante à remplacer]
</original>
<new>
[version enrichie de remplacement — c'est ce qui REMPLACERA ENTIÈREMENT <original>]
</new>
</update>


**Type B/C — GÉNÉRATION OU ENRICHISSEMENT COMPLET** (l'utilisateur demande "enrichir", "donne moi le contenue complet", "génère un cours", "أنشئ درس", ou la leçon est vide) :
Tu es un professeur expert en mathématiques pour le lycée algérien/marocain/tunisien. 
Tu génères (ou enrichis) des cours complets, structurés et pédagogiques en HTML.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 SUJET DU COURS : ${subject} - ${chapterContext || "Génération/Enrichissement complet"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère un fichier HTML COMPLET et AUTONOME (tout en un seul fichier) 
respectant EXACTEMENT les contraintes suivantes, en intégrant et enrichissant le "CONTENU ACTUEL DE LA LEÇON" s'il a été fourni :

════════════════════════════════════
⚙️ CONTRAINTES TECHNIQUES
════════════════════════════════════

1. Langue : arabe intégral (sauf termes mathématiques universels)
2. Direction : dir="rtl" sur le <html> ET sur le <body>
3. Police : Tajawal (Google Fonts) — jamais Arial seul
4. Formules : MathJax 3 via CDN (tex-mml-chtml)
5. Tout en un seul fichier HTML (CSS + JS intégrés, aucun fichier externe sauf CDN)
6. Fond de page : #f0f4f8, texte principal : #2c3e50
7. Responsive mobile (max-width: 900px centré)

════════════════════════════════════
🎨 SYSTÈME DE BLOCS COLORÉS (obligatoire)
════════════════════════════════════

Chaque bloc a : border-right: 5px solid [couleur] + background clair + border-radius: 8px

- 📘 تعريف     → border #2980b9,  background #e8f0fb
- ⭐ خاصية     → border #f39c12,  background #fef9e7
- ✏️ مثال      → border #1abc9c,  background #e8f8f5
- ⚠️ ملاحظة   → border #e74c3c,  background #fef0f0
- 🔷 طريقة    → border #8e44ad,  background #f4ecf7
- 📈 بياني     → border #27ae60,  background #e8f6f0
- 📝 تقييم    → border #e67e22,  background #fff8e1  (dashed)

Chaque bloc contient :
- Un .block-title avec emoji + nom du type en gras coloré
- Le contenu en prose arabe fluide
- Les formules centrées dans des .formula-box (background blanc, border #2980b9)

════════════════════════════════════
📋 STRUCTURE OBLIGATOIRE DU COURS (8 sections)
════════════════════════════════════

[EN-TÊTE]
- Bandeau gradient bleu foncé (#1a3a5c → #2980b9)
- Badge niveau (ex: رياضيات — السنة الثانية ثانوي)
- Titre principal du cours (grand, blanc, gras)
- Sous-titre descriptif (blanc, opacity 0.85)

[SECTION 1] — التعاريف الأساسية
- Minimum 2 blocs تعريف numérotés (تعريف 1.1, 1.2...)
- Chaque définition : énoncé formel en arabe + formule mathématique dans .formula-box
- Si pertinent : définition avec quantificateurs (∀, ∃)
- 1 bloc ملاحظة après les définitions

[SECTION 2] — التفسير البياني
- 1 bloc بياني avec description géométrique de la définition
- 1 graphique SVG inline (minimum 400x250px) illustrant le concept
  - Axes fléchés avec labels x, y
  - Courbe représentative tracée en vert (#27ae60, stroke-width:2.5)
  - Éléments remarquables : asymptotes en rouge pointillé, points en bleu
  - Légendes intégrées dans le SVG

[SECTION 3] — النهايات المرجعية / القواعد الأساسية
- 1 bloc خاصية avec tableau .math-table (fond blanc, entêtes #1a3a5c)
- Colonnes : الدالة | عند +∞ | عند -∞ | عند 0⁺ | عند 0⁻ (selon le sujet)
- Les cas indéterminés en rouge (#ffebee, color #e74c3c, texte ⚠️ ف.غ.م)
- 1 bloc ملاحظة avec 4 règles essentielles en liste

[SECTION 4] — العمليات والخواص
- Tableaux des règles opératoires (somme, produit, quotient ou selon sujet)
- Même style .math-table
- Cases formes indéterminées en rouge

[SECTION 5] — أمثلة تطبيقية مفصلة (MINIMUM 3 exemples)

  EXEMPLE FACILE (tag: سهل — vert) :
  - Énoncé clair
  - Solution en liste numérotée (<ol class="solution-steps">)
  - Chaque étape justifiée en arabe
  - Résultat dans .result-box (gradient vert)
  - Conclusion géométrique dans .asym-box (gradient bleu)

  EXEMPLE MOYEN (tag: متوسط — orange) :
  - Forme indéterminée à lever
  - Méthode expliquée étape par étape
  - Résultat encadré

  EXEMPLE DIFFICILE (tag: صعب — rouge) :
  - Étude complète (définition domaine + nhat + tableau + tracé)
  - Solution détaillée multi-étapes

[SECTION 6] — طرق رفع عدم التعيين (si applicable)
- 1 bloc 🔷 طريقة par technique : التعميل / المرافق / التحليل
- Exemple illustratif pour chaque méthode

[SECTION 7] — تقييم (Évaluation)
- 4 exercices numérotés automatiquement (counter CSS)
- Difficulté croissante
- Dernier exercice référencé au manuel (ex: تمرين 12 ص 47)
- Style : fond blanc, border-right orange, numéro en cercle orange

[SECTION 8] — خلاصة الدرس
- Grid 2×2 de cards résumé (.summary-card)
  - Chaque card : icône emoji + titre coloré + formule/règle clé
  - border-top coloré différent par card
- 1 bloc final ملاحظة avec la règle d'or du cours en gras centré

════════════════════════════════════
💅 STYLES CSS OBLIGATOIRES À INCLURE
════════════════════════════════════

:root {
  --primary: #1a3a5c;
  --secondary: #2980b9;
  --accent: #e74c3c;
  --green: #1abc9c;
  --orange: #e67e22;
  --yellow: #f39c12;
  --purple: #8e44ad;
}

/* Section headers */
.section-title {
  background: var(--primary);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1.15em;
  font-weight: 700;
  margin: 30px 0 18px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Formule centrée */
.formula-box {
  background: white;
  border: 2px solid var(--secondary);
  border-radius: 8px;
  padding: 14px 20px;
  text-align: center;
  margin: 12px 0;
  box-shadow: 0 2px 6px rgba(41,128,185,0.15);
  font-size: 1.1em;
}

/* Résultat final */
.result-box {
  background: linear-gradient(135deg, #1abc9c, #16a085);
  color: white;
  border-radius: 8px;
  padding: 12px 20px;
  text-align: center;
  margin: 12px 0;
  font-weight: 700;
  font-size: 1.05em;
}

/* Asymptote conclusion */
.asym-box {
  background: linear-gradient(135deg, var(--primary), #2471a3);
  color: white;
  border-radius: 8px;
  padding: 14px 20px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Solution steps */
.solution-steps {
  counter-reset: step;
  list-style: none;
  padding: 0;
}
.solution-steps li {
  counter-increment: step;
  padding: 10px 45px 10px 10px;
  margin: 8px 0;
  background: rgba(255,255,255,0.6);
  border-radius: 6px;
  position: relative;
}
.solution-steps li::before {
  content: counter(step);
  position: absolute;
  right: 10px; top: 10px;
  background: var(--secondary);
  color: white;
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: 700;
}

/* Math table */
.math-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.math-table th {
  background: var(--primary);
  color: white;
  padding: 10px 14px;
  text-align: center;
}
.math-table td {
  padding: 9px 14px;
  text-align: center;
  border-bottom: 1px solid #e8ecf0;
}
.math-table tr:nth-child(even) td { background: #f7fafc; }
.fi-cell { background: #ffebee !important; color: #e74c3c; font-weight: 700; }

/* Eval exercises */
.eval-questions { counter-reset: q; }
.eval-q {
  counter-increment: q;
  background: white;
  border-radius: 8px;
  padding: 14px 50px 14px 14px;
  margin: 10px 0;
  border-right: 4px solid var(--orange);
  position: relative;
}
.eval-q::before {
  content: counter(q);
  position: absolute;
  right: 10px; top: 50%; transform: translateY(-50%);
  background: var(--orange);
  color: white;
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}

/* Summary grid */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.summary-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border-top: 4px solid;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  text-align: center;
}

/* Tags */
.tag { display:inline-block; padding:1px 8px; border-radius:4px; font-size:0.8em; font-weight:600; }
.tag.easy { background:#e8f8f5; color:#1abc9c; }
.tag.med  { background:#fef3e2; color:#e67e22; }
.tag.hard { background:#fde8e8; color:#e74c3c; }

════════════════════════════════════
✅ EXEMPLE DE COURS ATTENDU 
(à reproduire comme modèle de qualité)
════════════════════════════════════

Sujet : النهايات المنتهية واللانهائية عند +∞ و −∞

[EN-TÊTE]
Bandeau bleu foncé → blanc
Badge : رياضيات — السنة الثانية ثانوي
Titre : النهايات المنتهية واللانهائية
Sous-titre : عند +∞ و −∞ — المقاربات الأفقية والعمودية

[SECTION 1 — التعاريف]

📘 تعريف 1.1 — النهاية المنتهية عند +∞
لتكن f دالة معرفة على [x₀ ; +∞[ و l عدد حقيقي.
نقول أن نهاية f عند +∞ هي l ونكتب lim f(x) = l إذا:
  ∀ε>0, ∃A∈ℝ, ∀x≥A : |f(x)−l| < ε
يعني: من أجل كل مجال مفتوح يضم l، يشمل كل قيم f(x) عندما x كبير بالقدر الكافي.

⚠️ ملاحظة: نحصل على نفس التعريف عند −∞.

📘 تعريف 1.2 — النهاية اللانهائية عند +∞
lim f(x) = +∞  ⟺  ∀M>0, ∃A∈ℝ, ∀x≥A : f(x) ≥ M

[SECTION 2 — البياني]
SVG : courbe s'approchant de y=2 (asymptote rouge pointillée)
avec labels في SVG : "y = l", flèches axes, courbe verte.

[SECTION 3 — المرجعية]
Tableau : 1/x, 1/x², xⁿ, √x مع النهايات

[SECTION 4 — العمليات]
3 tableaux : مجموع / جداء / كسر.

[SECTION 5 — الأمثلة]
✏️ مثال 1 (سهل): تعميل.
✏️ مثال 2 (متوسط): مقارب عمودي.
✏️ مثال 3 (صعب): ضرب المرافق.

[SECTION 6 — تقييم]
تمارين مع آخر تمرين من الكتاب المدرسي.

[SECTION 7 — الخلاصة]
خلاصة الدرس.

⚠️ RÈGLE FINALE ABSOLUE POUR LA GÉNÉRATION COMPLÈTE: 
Tu retournes UNIQUEMENT le code HTML, de <!DOCTYPE html> à </html>. 
Aucun blabla, pas de texte "Voici le cours...", AUCUNE balise de code \`\`\`html. JUSTE LE HTML BRUT.`
      : buildSystemPrompt(
        subject || "mathématiques",
        schoolLevel,
        chapterContext,
        allChapters,
        !!hideReformulation
      );

    // Version compacte du prompt pour les providers à petit contexte (Groq ~12k TPM, Cloudflare ~8k tokens)
    // On tronque agressivement le contenu de la leçon embarqué dans le prompt éditorial.
    const compactSystemPrompt = systemPrompt.length > 6000
      ? systemPrompt.slice(0, 6000) + "\n\n... (prompt tronqué pour respecter la limite de tokens du provider)"
      : systemPrompt;

    const hasMedia = messagesHaveMedia(messages);
    void compactSystemPrompt;
    void hasMedia;

    // Utilise uniquement Gemini (2ème clé)
    try {
      console.log("Trying Gemini secondary key...");
      return await callGemini2(systemPrompt, messages);
    } catch (e) {
      console.error("Gemini secondary key failed:", e);
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
