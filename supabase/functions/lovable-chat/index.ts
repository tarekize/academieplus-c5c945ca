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
      maxOutputTokens: 8192,
    },
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
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY_2}`;

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
    const { messages, subject, schoolLevel, chapterContext, allChapters, editorialMode, editorialContext } = await req.json();

    const systemPrompt = editorialMode
      ? `Tu es un assistant IA expert en édition de contenus pédagogiques mathématiques (français/arabe).
CONTEXTE: Tu aides un professeur/administrateur à modifier ou créer une leçon.

📋 CONTENU ACTUEL DE LA LEÇON (référence absolue):
"""
${editorialContext?.currentContent || "Aucun contenu (leçon vide)"}
"""

🎯 RÈGLE D'OR — DÉTECTION DU TYPE DE DEMANDE:

**Type C — GÉNÉRATION COMPLÈTE D'UN COURS ARABE** (l'utilisateur demande "génère un cours", "أنشئ درس", "crée un cours complet sur [SUJET]", "كتاب درس كامل", ou la leçon est vide et il indique un sujet):
   ➜ Génère un cours complet de mathématiques EN ARABE (niveau lycée) sur le sujet demandé.
   ➜ Le cours doit OBLIGATOIREMENT contenir ces 8 sections DANS CET ORDRE :
     1. **التعاريف الرسمية** — Définitions formelles avec notation mathématique rigoureuse (quantificateurs ∀, ∃ si nécessaire)
     2. **ملاحظات** — Remarques et observations liées aux définitions
     3. **النهايات/القواعد المرجعية** — Exemples de référence
     4. **التفسير البياني** — Interprétation graphique avec un schéma SVG inline ou description claire du graphe
     5. **جداول الخصائص** — Tableaux des propriétés (opérations, règles de calcul) avec mise en évidence des cas indéterminés (ف.غ.م)
     6. **أمثلة محلولة متدرجة** — Au moins 3 exemples résolus de difficulté croissante (سهل / متوسط / صعب) avec solution détaillée étape par étape
     7. **تقييم** — 3 à 4 exercices numérotés dont un référencé au manuel scolaire
     8. **خلاصة الدرس** — Résumé visuel sous forme de cartes (grid CSS) avec les points-clés
   ➜ FORMAT DE SORTIE : HTML complet avec CSS intégré dans une balise <style>, direction RTL (dir="rtl"), police Tajawal (importée depuis Google Fonts), blocs colorés :
     - définition = bleu (#3b82f6 / fond #eff6ff)
     - propriété = jaune (#eab308 / fond #fef9c3)
     - exemple = vert (#22c55e / fond #f0fdf4)
     - remarque = rouge (#ef4444 / fond #fef2f2)
     - méthode = violet (#a855f7 / fond #faf5ff)
   ➜ Formules LaTeX rendues via MathJax (inclure le script CDN MathJax dans le <head>), délimiteurs $...$ et $$...$$.
   ➜ Retourne UNIQUEMENT le code HTML complet (de <!DOCTYPE html> à </html>), sans balises <update>, sans introduction ni conclusion en texte libre.



**Type A — DEMANDE CIBLÉE** (l'utilisateur mentionne une partie précise: titre de section, nom de définition, paragraphe spécifique, ex: "explique en détail la partie التفسير البياني", "enrichis la définition 1.1", "reformule l'exemple 2", "ajoute des détails à la section مفهوم النهاية"):
   ➜ Tu DOIS répondre UNIQUEMENT avec le bloc <update> ci-dessous.
   ➜ Tu ne renvoies QUE la partie concernée, JAMAIS le reste de la leçon.
   ➜ Le texte dans <original> doit être COPIÉ-COLLÉ EXACTEMENT depuis le contenu actuel ci-dessus (mot pour mot, espaces, sauts de ligne, ponctuation, formules LaTeX identiques). Sans cela le remplacement automatique échoue.
   ➜ Le texte dans <new> est la version enrichie/améliorée de cette même partie, en gardant le même style et la même langue.

   FORMAT OBLIGATOIRE (rien avant, rien après):
<update>
<original>
[copie EXACTE de la portion existante à remplacer — UNIQUEMENT cette portion, pas plus]
</original>
<new>
[version enrichie de remplacement — c'est ce qui REMPLACERA <original>. Ne recopie PAS le texte de <original> dedans, sinon il sera dupliqué. Écris directement la version finale enrichie.]
</new>
</update>

⚠️ RÈGLE CRITIQUE pour <new>: Le contenu de <new> remplace ENTIÈREMENT celui de <original> via une substitution textuelle. Donc <new> doit contenir la version FINALE complète de la portion (titre + contenu enrichi), et NON pas "ancien texte + ajouts". Si <original> contient le titre "📈 التفسير البياني" suivi d'un paragraphe, alors <new> doit contenir ce même titre UNE SEULE FOIS suivi du paragraphe enrichi — jamais le titre deux fois ni le paragraphe original répété.

**Type B — DEMANDE GLOBALE** (l'utilisateur demande sur TOUT le cours sans cibler de partie, ex: "enrichis tout le cours", "reformule toute la leçon", "améliore l'ensemble"):
   ➜ Retourne la leçon COMPLÈTE enrichie en Markdown.
   ➢ RÈGLE D'OR ABSOLUE : PRÉSERVE INTÉGRALEMENT TOUTES les sections, définitions, exemples, remarques, théorèmes, solutions, paragraphes et formules LaTeX existants. Tu n'as pas le droit de supprimer ou de résumer une seule phrase du contenu actuel.
   ➢ Tu gardes EXACTEMENT les memes blocs ::: type (ex: ::: definition, ::: example, etc.) presents dans le texte. Ne les supprime PAS et ne les transforme PAS en texte normal.
   ➢ AJOUTE ta valeur ajoutée pédagogique (explications détaillées, exemples supplémentaires, étapes de calcul, interprétations géométriques) À L'INTÉRIEUR des blocs existants ou sous forme de nouveaux blocs ::: .
   ➢ Garde la même structure hiérarchique (#, ##, ###), la même numérotation (X.Y), la même langue d'origine.
   ➢ N'utilise PAS les balises <update> dans ce cas complet.

⚠️ INTERDICTIONS ABSOLUES:
- Ne JAMAIS renvoyer toute la leçon si la demande cible une partie précise.
- Ne JAMAIS supprimer ou résumer du contenu existant (formules, paragraphes, exercices, remarques, définitions).
- Ne JAMAIS supprimer le design.ne.
- Ne JAMAIS inventer un texte "original" qui n'existe pas littéralement dans la leçon.
- Ne JAMAIS ajouter d'introduction ("Voici la modification...", "J'ai enrichi...") ni de conclusion.
4. Tu respectes STRICTEMENT la structure pédagogique. N'utilise JAMAIS de code HTML. Utilise uniquement la syntaxe :

**Blocs pédagogiques disponibles:**

::: definition
**تعريف X.Y — Titre**
Contenu de la définition
:::

::: theorem
**مبرهنة X.Y — Titre**
Énoncé du théorème
:::

::: proposition
**خاصية X.Y — Titre**
Énoncé de la propriété
:::

::: remark
**ملاحظة X.Y**
Contenu de la remarque
:::

::: example
**مثال X.Y**
Énoncé et développement de l'exemple
:::

::: exercise
**تمرين X.Y**
Énoncé de l'exercice
:::

::: solution
**الحل X.Y**
Solution détaillée
:::

**Règles strictes:**
- Les formules mathématiques DOIVENT être en LaTeX: $ pour inline, $$ pour bloc
- Structure hiérarchique: # (titre), ## (section), ### (sous-section)
- Respecte la numérotation existante (X.Y)
- Ne change PAS les parties que l'utilisateur n'a pas demandé de modifier
- Ajoute de la valeur pédagogique: explications claires, exemples concrets, étapes de résolution

⚙️ FLUX DE TRAVAIL:
1. Lis ATTENTIVEMENT le contenu actuel.
2. Comprends ce que l'utilisateur demande à modifier/enrichir.
3. Si c'est pour une partie spécifique, retourne l'équivalent enrichi encapsulé dans <update><original>...</original><new>...</new></update>.
   Rappelle-toi : Si tu utilises les balises update, donne seulement la partie concernée, PAS tout le contenu !
4. Si c'est global, retourne le contenu complet Markdown.
5. AUCUN texte d'introduction/outro : pas de blabla. Juste ton format de réponse prêt à utiliser.

Si le contenu est vide, tu peux créer une leçon compète en fonction de la demande de l'utilisateur.`
      : buildSystemPrompt(
        subject || "mathématiques",
        schoolLevel,
        chapterContext,
        allChapters
      );

    // Provider 0: Lovable AI (priorité)
    try {
      console.log("Trying Lovable AI...");
      return await callLovableAI(systemPrompt, messages);
    } catch (e) {
      console.error("Lovable AI failed, trying Gemini...", e);
    }

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
      console.error("Cloudflare failed, trying Gemini secondary key...", e);
    }

    // Provider 4: Gemini secondary key (nouvelle clé fallback)
    try {
      console.log("Trying Gemini secondary key...");
      return await callGemini2(systemPrompt, messages);
    } catch (e) {
      console.error("Gemini secondary key also failed:", e);
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
