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

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n... (contenu tronqué)";
}

// --- Optimisation des tokens (nettoyage du "bruit") ---
// Renvoie le texte du DERNIER message de l'élève.
function getLastUserText(messages: any[]): string {
  const lastUser = [...(messages || [])].reverse().find((m) => m?.role === "user");
  if (!lastUser) return "";
  const c = lastUser.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((p: any) => (p?.type === "text" ? p.text : "")).join(" ");
  return String(c ?? "");
}

// Détermine si le message nécessite VRAIMENT tout le contenu des cours.
// Les salutations / messages courts / méta-questions n'ont pas besoin du corpus
// complet : on économise ainsi des milliers de tokens inutiles.
function needsFullCourseContext(messages: any[]): boolean {
  const lastUser = [...(messages || [])].reverse().find((m) => m?.role === "user");
  // Une image / un PDF → contexte complet obligatoire.
  if (Array.isArray(lastUser?.content) && lastUser.content.some((p: any) => p?.type === "image_url")) {
    return true;
  }
  const text = getLastUserText(messages).trim();
  if (text.length === 0) return false;

  // Indices mathématiques ou pédagogiques → contexte complet.
  const mathIndicators =
    /[0-9=+\-*/^√∫∑π]|lim|d[ée]riv|int[ée]gr|[ée]quation|exercice|calcul|r[ée]sou|fonction|limite|th[ée]or[èe]me|d[ée]finition|chapitre|le[çc]on|تمرين|احسب|نهاية|مشتق|معادلة|حل|دالة|درس|مبرهنة|تعريف|اشتقاق|تكامل/i;
  if (mathIndicators.test(text)) return true;

  // Salutations / remerciements / acquiescements courts → prompt léger.
  const smallTalk =
    /^(salut|bonjour|bonsoir|coucou|hello|hi|hey|cc|yo|merci|ok|okay|d'accord|daccord|[çc]a va|comment (tu )?vas|qui es[- ]tu|tu es qui|au revoir|bye|سلام|السلام|مرحبا|شكرا|أهلا|صباح|مساء|كيف حالك|من انت|مع السلامة|وداعا)/i;
  if (text.length <= 60 && smallTalk.test(text)) return false;

  // Message très court sans indice math → léger.
  if (text.length <= 25) return false;

  // Par défaut : contexte complet (question probablement de fond).
  return true;
}

// Prompt allégé pour les échanges qui n'exigent pas le corpus complet.
function buildLeanSystemPrompt(
  subject: string,
  schoolLevel: string | null,
  chapterContext: { title: string; lessonsContent: string } | null,
): string {
  return `Tu es un professeur de ${subject} bienveillant et pédagogue sur la plateforme éducative AcadémiePlus.
Niveau scolaire de l'élève : ${schoolLevel || "non spécifié"}.${chapterContext ? `\nL'élève se trouve actuellement dans le chapitre "${chapterContext.title}".` : ""}

- Ce chatbot est dédié UNIQUEMENT aux mathématiques.
- **Langue** : réponds EXACTEMENT dans la langue de la dernière question de l'élève (arabe → 100% arabe, français → 100% français). Ne mélange jamais les deux.
- Pour une salutation ou un message court, réponds brièvement et chaleureusement, puis invite l'élève à poser sa question de maths (sans réciter tout le cours).
- Sois clair, encourageant, et termine par une question ouverte.`;
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

// ============ Google Gemini ============
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
    // budget de sortie visible (même fix que generate-adaptive-content).
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
          functionName: "lovable-chat",
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
    const { messages, subject, schoolLevel, chapterContext, allChapters, editorialMode, editorialContext, hideReformulation } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    // --- Authentification obligatoire : cette fonction consomme un quota IA
    // payant à chaque appel. resolveCallerRoleGroup() ne fait que catégoriser
    // l'appelant pour les logs, elle ne rejette rien par elle-même. ---
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
    if (editorialMode && !["teacher", "pedago", "admin"].includes(callerRoleGroup)) {
      return new Response(JSON.stringify({ error: "Accès réservé aux enseignants et à l'équipe pédagogique" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate limiting : évite l'épuisement du quota IA payant (script/bot,
    // ou compte compromis) en bornant le nombre d'appels par utilisateur.
    // Même pattern que link-child-by-code : compteur sur activity_logs. ---
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const rateLimitWindowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    const { count: recentRequests } = await adminClient
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", callerUserId)
      .eq("action", "ia_chat_request")
      .gte("created_at", rateLimitWindowStart);

    if ((recentRequests ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Merci de patienter quelques instants." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    adminClient
      .from("activity_logs")
      .insert({ user_id: callerUserId, action: "ia_chat_request" })
      .then(({ error }: any) => {
        if (error) console.error("Failed to log ia_chat_request:", error);
      });

    const systemPrompt = editorialMode
      ? buildEditorialPrompt(editorialContext, subject)
      : (needsFullCourseContext(messages)
        ? buildSystemPrompt(
          subject || "mathématiques",
          schoolLevel,
          chapterContext,
          allChapters,
          !!hideReformulation
        )
        // Message léger (salutation, message court, méta-question) : on n'envoie
        // PAS tout le corpus de cours → économie massive de tokens.
        : buildLeanSystemPrompt(
          subject || "mathématiques",
          schoolLevel,
          chapterContext
        ));


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
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
