import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

function getDifficultyScale(level: number): number {
  if (level < 20) return 1;
  if (level < 40) return 2;
  if (level < 60) return 3;
  if (level < 80) return 4;
  return 5;
}

function getDifficultyLabel(level: number): string {
  if (level < 25) return "débutant (très facile)";
  if (level < 40) return "facile";
  if (level < 60) return "intermédiaire";
  if (level < 80) return "difficile";
  return "avancé (très difficile)";
}

function getWeakPointsText(accuracyRate: number, streak: number): string {
  const points: string[] = [];
  if (accuracyRate < 40) points.push("compréhension générale faible");
  else if (accuracyRate < 60) points.push("difficultés sur les exercices de raisonnement");
  if (streak === 0) points.push("erreurs consécutives récentes");
  return points.length > 0 ? points.join(", ") : "aucun point faible notable";
}

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

// ============ Provider 1: Google Gemini (non-streaming) ============
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.95, topP: 0.95, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini error:", response.status, errText);
    throw new Error(`Gemini failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ============ Provider 2: Groq (non-streaming) ============
async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
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
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq error:", response.status, errText);
    throw new Error(`Groq failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

// ============ Provider 3: Cloudflare Workers AI (non-streaming) ============
async function callCloudflare(systemPrompt: string, userPrompt: string): Promise<string> {
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
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Cloudflare error:", response.status, errText);
    throw new Error(`Cloudflare failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.result?.response || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { system, user } = buildPrompt(
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

    let rawContent = "";

    // Provider 1: Gemini
    try {
      console.log("Trying Gemini for content generation...");
      rawContent = await callGemini(system, user);
    } catch (e) {
      console.error("Gemini failed, trying Groq...", e);
      // Provider 2: Groq
      try {
        console.log("Trying Groq...");
        rawContent = await callGroq(system, user);
      } catch (e2) {
        console.error("Groq failed, trying Cloudflare...", e2);
        // Provider 3: Cloudflare
        try {
          console.log("Trying Cloudflare...");
          rawContent = await callCloudflare(system, user);
        } catch (e3) {
          console.error("All providers failed:", e3);
          return new Response(
            JSON.stringify({ error: "Tous les services IA sont actuellement indisponibles. Veuillez réessayer plus tard." }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    // Fix invalid JSON escapes: LaTeX \lim, \frac, \infty etc. need double backslash inside JSON strings.
    // Replace any \X where X is not a valid JSON escape char ("/bfnrtu\) with \\X.
    // Only treat \", \\, \/, and \uXXXX as real JSON escapes. Double every other backslash
    // so LaTeX commands like \to, \frac, \infty, \neq, \beta survive (they would otherwise
    // be parsed as tab, form-feed, etc. and corrupt the math).
    const sanitizeJsonEscapes = (s: string) =>
      s.replace(/\\(?!["\\/]|u[0-9a-fA-F]{4})/g, "\\\\");

    let content;
    try {
      content = JSON.parse(rawContent);
    } catch {
      try {
        content = JSON.parse(sanitizeJsonEscapes(rawContent));
      } catch {
        console.error("Failed to parse AI response:", rawContent.substring(0, 500));
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
