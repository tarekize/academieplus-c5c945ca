import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractGeminiUsage, type AiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  "5eme_primaire": "5ème année primaire",
  "1ere_cem": "1ère année CEM",
  "2eme_cem": "2ème année CEM",
  "3eme_cem": "3ème année CEM",
  "4eme_cem": "4ème année CEM (BEM)",
  "premiere": "1ère année secondaire",
  "seconde": "2ème année secondaire",
  "terminale": "3ème année secondaire (BAC)",
};

// Convertit le score de niveau composite de l'élève (0-100) en une échelle
// de difficulté 1-5 utilisée pour calibrer le prompt de génération.
function getDifficultyScale(level: number): number {
  if (level < 20) return 1;
  if (level < 40) return 2;
  if (level < 60) return 3;
  if (level < 80) return 4;
  return 5;
}

// Libellé humain (FR) de la difficulté, injecté dans le prompt pour guider le ton.
function getDifficultyLabel(level: number): string {
  if (level < 25) return "débutant (très facile)";
  if (level < 40) return "facile";
  if (level < 60) return "intermédiaire";
  if (level < 80) return "difficile";
  return "avancé (très difficile)";
}

// Résume en texte libre les points faibles détectés à partir du taux de
// réussite et de la série de bonnes réponses, injecté dans le prompt IA.
function getWeakPointsText(accuracyRate: number, streak: number): string {
  const points: string[] = [];
  if (accuracyRate < 40) points.push("compréhension générale faible");
  else if (accuracyRate < 60) points.push("difficultés sur les exercices de raisonnement");
  if (streak === 0) points.push("erreurs consécutives récentes");
  return points.length > 0 ? points.join(", ") : "aucun point faible notable";
}

// Construit le prompt système + utilisateur pour générer 5 items (quiz,
// exercice ou fiche de révision) calibrés sur le profil de l'élève (niveau,
// taux de réussite, série, questions déjà posées à éviter).
function buildPrompt(
  contentType: string,
  schoolLevel: string,
  difficultyLevel: number,
  lessonTitle: string,
  chapterTitle: string,
  accuracyRate: number,
  streak: number,
  avoidList: string[] = [],
  seed: number = 0,
  quizAccuracy: number = 0,
  exerciseAccuracy: number = 0,
): { system: string; user: string } {
  const levelLabel = SCHOOL_LEVEL_LABELS[schoolLevel] || schoolLevel;
  const diffScale = getDifficultyScale(difficultyLevel);
  const diffLabel = getDifficultyLabel(difficultyLevel);
  const weakPoints = getWeakPointsText(accuracyRate, streak);

  const avoidBlock = avoidList.length > 0
    ? `\n\nQUESTIONS / EXERCICES DÉJÀ POSÉS (À ÉVITER ABSOLUMENT, propose des variantes différentes) :\n${avoidList.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join("\n")}`
    : "";

  const contextBlock = `
CONTEXTE DE LA LEÇON :
- Chapitre : ${chapterTitle}
- Leçon actuelle : ${lessonTitle}

PROFIL DE L'ÉLÈVE (KPI pondérés selon spec adaptative) :
- Niveau scolaire : ${levelLabel}
- Score de niveau composite : ${difficultyLevel}/100 → difficulté cible ${diffScale}/5 (${diffLabel})
- Taux de réussite exercices (poids 35%) : ${Math.round(exerciseAccuracy)}%
- Taux de réussite quiz (poids 15%) : ${Math.round(quizAccuracy)}%
- Taux de réussite global : ${Math.round(accuracyRate)}%
- Série actuelle : ${streak} bonnes réponses consécutives
- Points faibles détectés : ${weakPoints}
- Seed de variation : ${seed}

DIRECTIVES PÉDAGOGIQUES ADAPTATIVES :
- Ciblage strict : Reste UNIQUEMENT sur la leçon "${lessonTitle}". Aucune question hors-sujet.
- Calibration : Cible difficulté ${diffScale}/5. Varie : 1 facile (warm-up), 2-3 au niveau cible, 1 plus difficile (challenge).
- Si réussite < 50% : simplifie, applications directes, énoncés courts, valeurs entières.
- Si réussite 50-75% : niveau cible avec raisonnement intermédiaire.
- Si réussite > 75% : pousse vers du raisonnement avancé, valeurs non triviales, plusieurs étapes.
- Variation OBLIGATOIRE : utilise des valeurs numériques, contextes et formulations DIFFÉRENTS à chaque génération (utilise le seed ${seed} pour varier).
- Feedback : explication concise qui cible l'erreur typique.${avoidBlock}`;

  let system: string;
  let user: string;

  if (contentType === "quiz") {
    system = `Tu es un professeur de mathématiques algérien expert. Tu génères des QCM (questions à choix multiples) adaptés au niveau de l'élève. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte ni markdown autour.`;
    user = `${contextBlock}

MISSION : Génère exactement 5 questions QCM exclusivement sur la leçon "${lessonTitle}" du chapitre "${chapterTitle}".

Format JSON attendu (tableau de 5 objets) :
[
  {
    "question": "question en arabe liée exclusivement à ${lessonTitle}",
    "options": ["choix A", "choix B", "choix C", "choix D"],
    "correct_answer": "le choix correct (doit être identique à un des options)",
    "explanation": "explication courte en arabe qui aide l'élève à comprendre son erreur",
    "difficulty": 3
  }
]

IMPORTANT:
- "difficulty" est un entier de 1 à 5 (1=très facile, 2=facile, 3=moyen, 4=difficile, 5=très difficile). Varie la difficulté des 5 questions autour du niveau ${diffScale}/5 de l'élève.
- Les questions et réponses doivent être en ARABE. NE GÉNÈRE AUCUNE question en dehors du sujet "${lessonTitle}".
- FORMAT MATHÉMATIQUE OBLIGATOIRE : TOUTES les expressions mathématiques (variables, fonctions, fractions, puissances, indices, limites, racines, symboles ∞, ≤, ≥, ≠, ±, →, etc.) DOIVENT être écrites en LaTeX entre délimiteurs $...$ pour le rendu KaTeX.
  * Utilise \\frac{a}{b} pour les fractions (JAMAIS a/b en texte brut).
  * Utilise x^{n} pour les puissances (JAMAIS x^n ou x**n).
  * Utilise x_{n} pour les indices.
  * Utilise \\sqrt{x}, \\infty, \\to, \\lim_{x \\to +\\infty}, \\leq, \\geq, \\neq, \\pm, \\cdot, \\times.
  * Exemple correct : "ما هي $\\lim_{x \\to +\\infty} \\frac{3x^{5} + 2x^{4} - x^{3}}{x^{4} - x^{3} + 1}$ ؟"
  * INTERDIT : écrire f(x) = (3x^5 + 2x^4) / (x^4 + 1) en texte brut. À la place : $f(x) = \\frac{3x^{5} + 2x^{4}}{x^{4} + 1}$.
- Les "options" et "correct_answer" DOIVENT aussi utiliser LaTeX entre $...$ quand elles contiennent des maths (ex: "$+\\infty$", "$3$", "$\\frac{1}{2}$").`;
  } else if (contentType === "exercise") {
    system = `Tu es un professeur de mathématiques algérien expert. Tu génères des exercices adaptés au niveau de l'élève. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte ni markdown autour.`;
    user = `${contextBlock}

MISSION : Génère exactement 5 exercices exclusivement sur la leçon "${lessonTitle}" du chapitre "${chapterTitle}".

Format JSON attendu (tableau de 5 objets) :
[
  {
    "title": "titre court en arabe lié à ${lessonTitle}",
    "statement": "énoncé complet en arabe",
    "expected_answer": "réponse attendue (valeur numérique ou expression courte)",
    "hints": ["indice 1 en arabe", "indice 2 en arabe"],
    "solution": "solution HTML détaillée multi-étapes en arabe (voir format ci-dessous)",
    "difficulty": 3
  }
]

IMPORTANT:
- "difficulty" est un entier de 1 à 5 (1=très facile, 2=facile, 3=moyen, 4=difficile, 5=très difficile). Varie la difficulté des 5 exercices autour du niveau ${diffScale}/5 de l'élève.
- Tout le contenu doit être en ARABE. NE GÉNÈRE AUCUN exercice en dehors du sujet "${lessonTitle}".
- FORMAT MATHÉMATIQUE OBLIGATOIRE : TOUTES les expressions mathématiques DOIVENT être en LaTeX entre $...$ pour le rendu KaTeX.
  * Fractions : \\frac{a}{b} (JAMAIS a/b).
  * Puissances : x^{n} (JAMAIS x^n ni x**n).
  * Indices : x_{n}. Racine : \\sqrt{x}.
  * Symboles : \\infty, \\to, \\lim_{x \\to +\\infty}, \\leq, \\geq, \\neq, \\pm, \\cdot.
  * Exemple correct (statement) : "احسب $\\lim_{x \\to +\\infty} (2x^{2} + 3x - 1)$."
  * INTERDIT d'écrire f(x) = 2x^2 + 3x - 1 en texte brut. À la place : $f(x) = 2x^{2} + 3x - 1$.
- "expected_answer" et "hints" DOIVENT aussi utiliser LaTeX entre $...$ quand ils contiennent des maths.
- FORMAT DE LA SOLUTION ("solution") - OBLIGATOIRE :
  * Solution RICHE et DÉTAILLÉE en HTML avec plusieurs étapes numérotées, JAMAIS une seule ligne.
  * Structure HTML attendue :
    <p><strong>المعطيات :</strong> ... (rappel de l'énoncé / données)</p>
    <p><strong>الخطوة 1 :</strong> ... explication courte ...</p>
    <p>$$ formule mathématique en display $$</p>
    <p><strong>الخطوة 2 :</strong> ...</p>
    <p>$$ ... $$</p>
    <p><strong>الخطوة 3 :</strong> ... (autant que nécessaire)</p>
    <p><strong>الاستنتاج :</strong> $$ \\boxed{réponse finale} $$</p>
  * Utilise $$...$$ (display block) pour les formules importantes et $...$ (inline) dans le texte.
  * Chaque étape doit JUSTIFIER le calcul (règle, théorème, propriété utilisée), pas seulement le résultat.
  * Vise minimum 4 étapes claires. Termine TOUJOURS par <strong>الاستنتاج :</strong> avec la réponse encadrée \\boxed{...}.
  * NE PAS écrire la solution comme un seul paragraphe. Utilise vraiment <p>, <strong>, et $$...$$.`;
  } else {
    system = `Tu es un professeur de mathématiques algérien expert. Tu génères des fiches de révision. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte ni markdown autour.`;
    user = `${contextBlock}

MISSION : Génère exactement 5 fiches de révision exclusivement sur la leçon "${lessonTitle}" du chapitre "${chapterTitle}".

Format JSON attendu (tableau de 5 objets) :
[
  {
    "concept": "nom du concept en arabe lié à ${lessonTitle}",
    "explanation": "explication claire en arabe",
    "example": "exemple concret en arabe",
    "key_formula": "formule clé (si applicable)"
  }
]

IMPORTANT: Tout le contenu doit être en ARABE sauf les formules mathématiques. NE GÉNÈRE AUCUNE fiche en dehors du sujet "${lessonTitle}".`;
  }

  return { system, user };
}

// Gemini "structured output" : force le modèle à ne produire que ces champs,
// sans texte ni markdown autour — moins de tokens de sortie, JSON toujours
// valide (le modèle n'a plus à "deviner" le format demandé dans le prompt).
function buildResponseSchema(contentType: string): Record<string, unknown> {
  if (contentType === "quiz") {
    return {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          correct_answer: { type: "STRING" },
          explanation: { type: "STRING" },
          difficulty: { type: "INTEGER" },
        },
        required: ["question", "options", "correct_answer", "explanation", "difficulty"],
      },
    };
  }
  if (contentType === "exercise") {
    return {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          statement: { type: "STRING" },
          expected_answer: { type: "STRING" },
          hints: { type: "ARRAY", items: { type: "STRING" } },
          solution: { type: "STRING" },
          difficulty: { type: "INTEGER" },
        },
        required: ["title", "statement", "expected_answer", "hints", "solution", "difficulty"],
      },
    };
  }
  return {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        concept: { type: "STRING" },
        explanation: { type: "STRING" },
        example: { type: "STRING" },
        key_formula: { type: "STRING" },
      },
      required: ["concept", "explanation", "example"],
    },
  };
}

// ============ Google Gemini (Key 2) — seul provider réellement utilisé.
// (Les anciens providers Lovable AI / Gemini clé 1 étaient définis mais
// jamais appelés depuis le handler ci-dessous : code mort supprimé.)
// gemini-2.0-flash was retired by Google (404 "no longer available"); try current
// models in order instead of a single hardcoded one so a single retirement doesn't
// take the whole feature down again.
const GEMINI2_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"];

async function callGemini2(systemPrompt: string, userPrompt: string, responseSchema: Record<string, unknown>): Promise<{ text: string; usage: AiUsage | null }> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  let lastError = "Gemini 2 unavailable";
  for (const model of GEMINI2_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY_2}`;
    // gemini-2.5 models "think" before answering by default, which eats into
    // maxOutputTokens and was truncating the JSON mid-response — disable it and
    // give enough budget for 5 detailed Arabic/LaTeX items. responseSchema forces
    // the model to only emit the requested fields (no filler text), which also
    // cuts down on output tokens.
    const generationConfig: Record<string, unknown> = {
      temperature: 0.95,
      topP: 0.95,
      maxOutputTokens: 16384,
      responseMimeType: "application/json",
      responseSchema,
    };
    if (model.startsWith("gemini-2.5") || model.includes("flash-latest")) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const finishReason = data?.candidates?.[0]?.finishReason;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (finishReason && finishReason !== "STOP") {
        // MAX_TOKENS means the JSON was cut off mid-response — retry the next
        // model instead of returning an unparsable half-response.
        console.error(`Gemini 2 (${model}) incomplete response: finishReason=${finishReason}, length=${text.length}`);
        lastError = `Gemini 2 (${model}) incomplete: ${finishReason}`;
        continue;
      }
      return { text, usage: extractGeminiUsage(data) };
    }

    const errText = await response.text();
    console.error(`Gemini 2 (${model}) error:`, response.status, errText);
    lastError = `Gemini 2 (${model}) failed: ${response.status}`;
  }

  throw new Error(lastError);
}

// Génère 5 items (quiz/exercice/fiche de révision) adaptés en temps réel au
// niveau et aux performances de l'élève sur la leçon en cours. Appelée par
// src/hooks/useAdaptiveContent.ts (élève, à chaque nouvelle série d'exercices/
// quiz proposée). Authentification + rate limiting obligatoires ci-dessous.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentification obligatoire : cette fonction consomme un quota
    // Gemini payant à chaque appel. resolveCallerRoleGroup() (utilisé plus
    // bas pour le logging) ne rejette PAS les appels anonymes, elle les
    // classe juste comme "other" — ce n'est pas un garde-fou d'accès. ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate limiting : cette fonction consomme un quota Gemini payant.
    // Sans cela, un compte authentifié pouvait boucler dessus sans limite. ---
    const rateLimitClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: rateLimitAllowed, error: rateLimitError } = await rateLimitClient.rpc("check_and_log_rate_limit", {
      p_user_id: user.id,
      p_action: "generate_adaptive_content",
      p_window_seconds: 60,
      p_max_requests: 15,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitAllowed) {
      return new Response(JSON.stringify({ error: "Trop de requêtes. Merci de patienter quelques instants." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      content_type,
      school_level,
      difficulty_level,
      lesson_title,
      chapter_title,
      accuracy_rate,
      streak,
      avoid_list,
      seed,
      quiz_accuracy,
      exercise_accuracy,
    } = body;

    if (!content_type || !school_level || !lesson_title || !chapter_title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["quiz", "exercise", "revision"].includes(content_type)) {
      return new Response(JSON.stringify({ error: "Invalid content_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { system, user: userPrompt } = buildPrompt(
      content_type,
      school_level,
      difficulty_level || 50,
      lesson_title,
      chapter_title,
      accuracy_rate ?? 0,
      streak ?? 0,
      Array.isArray(avoid_list) ? avoid_list : [],
      typeof seed === "number" ? seed : Math.floor(Math.random() * 1_000_000),
      quiz_accuracy ?? 0,
      exercise_accuracy ?? 0,
    );

    const responseSchema = buildResponseSchema(content_type);
    let rawContent = "";

    try {
      console.log("Trying Gemini (Key 2)...");
      const result = await callGemini2(system, userPrompt, responseSchema);
      rawContent = result.text;
      // Log de consommation IA seulement si l'appel Gemini a réellement abouti.
      if (result.usage) {
        resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, authHeader).then(({ userId, roleGroup }) => {
          logTokenUsageAsync({
            supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "generate-adaptive-content",
            inputTokens: result.usage!.inputTokens, outputTokens: result.usage!.outputTokens,
          });
        });
      }
    } catch (e3) {
      console.error("Gemini (Key 2) failed:", e3);
      return new Response(
        JSON.stringify({ error: "Tous les services IA sont actuellement indisponibles. Veuillez réessayer plus tard." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    const sanitizeJsonEscapes = (s: string) =>
      s.replace(/\\(?!["\\/]|u[0-9a-fA-F]{4})/g, "\\\\");

    let content;
    try {
      content = JSON.parse(rawContent);
    } catch {
      try {
        content = JSON.parse(sanitizeJsonEscapes(rawContent));
      } catch {
        console.error(
          `Failed to parse AI response (length=${rawContent.length}). Start:`, rawContent.substring(0, 300),
          "End:", rawContent.substring(Math.max(0, rawContent.length - 300)),
        );
        throw new Error("L'IA a retourné un format invalide. Réessayez.");
      }
    }

    if (!Array.isArray(content)) {
      throw new Error("L'IA n'a pas retourné un tableau. Réessayez.");
    }

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-adaptive-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
