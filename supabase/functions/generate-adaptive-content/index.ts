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

function getDifficultyLabel(level: number): string {
  if (level < 25) return "débutant (très facile)";
  if (level < 40) return "facile";
  if (level < 60) return "intermédiaire";
  if (level < 80) return "difficile";
  return "avancé (très difficile)";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const {
      content_type,
      school_level,
      difficulty_level,
      lesson_title,
      chapter_title,
    } = body;

    if (!content_type || !school_level || !lesson_title || !chapter_title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const levelLabel = SCHOOL_LEVEL_LABELS[school_level] || school_level;
    const diffLabel = getDifficultyLabel(difficulty_level || 50);
    const diffLevel = difficulty_level || 50;

    let systemPrompt: string;
    let userPrompt: string;

    if (content_type === "quiz") {
      systemPrompt = `Tu es un professeur de mathématiques algérien expert. Tu génères des QCM (questions à choix multiples) adaptés au niveau de l'élève. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte ni markdown autour.`;
      userPrompt = `Génère exactement 5 questions QCM de mathématiques pour un élève de ${levelLabel}, chapitre "${chapter_title}", leçon "${lesson_title}".

Niveau de difficulté de l'élève : ${diffLevel}/100 (${diffLabel}).

Adapte la difficulté des questions au niveau de l'élève :
- Si le niveau est bas (<30), pose des questions simples et directes
- Si le niveau est moyen (30-60), mélange questions directes et raisonnement
- Si le niveau est élevé (>60), pose des questions nécessitant du raisonnement avancé

Format JSON attendu (tableau de 5 objets) :
[
  {
    "question": "question en arabe",
    "options": ["choix A", "choix B", "choix C", "choix D"],
    "correct_answer": "le choix correct (doit être identique à un des options)",
    "explanation": "explication en arabe"
  }
]

IMPORTANT: Les questions et réponses doivent être en ARABE. Les formules mathématiques peuvent rester en notation standard.`;
    } else if (content_type === "exercise") {
      systemPrompt = `Tu es un professeur de mathématiques algérien expert. Tu génères des exercices adaptés au niveau de l'élève. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte ni markdown autour.`;
      userPrompt = `Génère exactement 5 exercices de mathématiques pour un élève de ${levelLabel}, chapitre "${chapter_title}", leçon "${lesson_title}".

Niveau de difficulté de l'élève : ${diffLevel}/100 (${diffLabel}).

Adapte la difficulté :
- Niveau bas (<30) : exercices d'application directe du cours
- Niveau moyen (30-60) : exercices nécessitant 2-3 étapes
- Niveau élevé (>60) : problèmes complexes avec raisonnement

Format JSON attendu (tableau de 5 objets) :
[
  {
    "title": "titre court en arabe",
    "statement": "énoncé complet en arabe",
    "expected_answer": "réponse attendue (valeur numérique ou expression courte)",
    "hints": ["indice 1 en arabe", "indice 2 en arabe"],
    "solution": "solution détaillée étape par étape en arabe"
  }
]

IMPORTANT: Tout le contenu doit être en ARABE. Les formules mathématiques restent en notation standard.`;
    } else if (content_type === "revision") {
      systemPrompt = `Tu es un professeur de mathématiques algérien expert. Tu génères des fiches de révision. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte ni markdown autour.`;
      userPrompt = `Génère exactement 5 fiches de révision pour un élève de ${levelLabel}, chapitre "${chapter_title}", leçon "${lesson_title}".

Niveau de l'élève : ${diffLevel}/100 (${diffLabel}).

Format JSON attendu (tableau de 5 objets) :
[
  {
    "concept": "nom du concept en arabe",
    "explanation": "explication claire en arabe",
    "example": "exemple concret en arabe",
    "key_formula": "formule clé (si applicable)"
  }
]

IMPORTANT: Tout le contenu doit être en ARABE sauf les formules mathématiques.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid content_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques secondes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let content;
    try {
      content = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent.substring(0, 500));
      throw new Error("L'IA a retourné un format invalide. Réessayez.");
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
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
