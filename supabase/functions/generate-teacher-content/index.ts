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

interface Body {
  contentType: "exercise" | "quiz" | "exam";
  schoolLevel?: string;
  chapterTitle?: string;
  lessonTitle?: string;
  count?: number;
  difficultyMin?: number;
  difficultyMax?: number;
  focusNote?: string; // optional context (e.g. weak points for class/student help)
}

function buildPrompt(b: Body) {
  const levelLabel = SCHOOL_LEVEL_LABELS[b.schoolLevel || ""] || b.schoolLevel || "";
  const count = Math.min(Math.max(b.count || 3, 1), 10);
  const dMin = Math.min(Math.max(b.difficultyMin ?? 1, 1), 5);
  const dMax = Math.min(Math.max(b.difficultyMax ?? 3, dMin), 5);

  const common = `Tu es un professeur de mathématiques algérien expert.
Niveau scolaire : ${levelLabel}
Chapitre : ${b.chapterTitle || "—"}
Leçon ciblée : ${b.lessonTitle || "—"}
Difficulté demandée : entre ${dMin}/5 et ${dMax}/5 (varie les difficultés dans cet intervalle).
${b.focusNote ? `Contexte pédagogique : ${b.focusNote}` : ""}
Reste STRICTEMENT sur la leçon "${b.lessonTitle || ""}". Rédige en français. Utilise la notation mathématique standard.`;

  if (b.contentType === "quiz") {
    return {
      system: common,
      user: `Génère ${count} questions de quiz à choix multiple (QCM) sur cette leçon.
Réponds UNIQUEMENT en JSON valide de la forme :
{"items":[{"question":"...","options":["A","B","C","D"],"correct_answer":"la bonne option exacte (texte identique à l'une des options)","hint":"indice utile sans donner la réponse","explanation":"explication de la correction","difficulty":1}]}`,
    };
  }
  // exercise or exam
  return {
    system: common,
    user: `Génère ${count} ${b.contentType === "exam" ? "exercices d'examen" : "exercices"} sur cette leçon.
Réponds UNIQUEMENT en JSON valide de la forme :
{"items":[{"title":"titre court","statement":"énoncé complet de l'exercice","hint":"indice utile sans donner la réponse","expected_answer":"réponse attendue concise","solution":"correction détaillée étape par étape","difficulty":2}]}`,
  };
}

async function callGateway(system: string, user: string): Promise<any> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY manquante");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : { items: [] };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.contentType) {
      return new Response(JSON.stringify({ error: "contentType requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { system, user } = buildPrompt(body);
    const parsed = await callGateway(system, user);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
