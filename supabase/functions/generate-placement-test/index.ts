import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PREVIOUS_LEVEL_MAP: Record<string, string> = {
  "1ere_cem": "5eme_primaire",
  "2eme_cem": "1ere_cem",
  "3eme_cem": "2eme_cem",
  "4eme_cem": "3eme_cem",
  "premiere": "4eme_cem",
  "seconde": "premiere",
  "terminale": "seconde",
};

async function callLovableAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429) throw new Error("Limite de requêtes dépassée.");
    if (response.status === 402) throw new Error("Crédits épuisés.");
    throw new Error(`AI error: ${response.status} — ${text}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

function extractJSON(raw: string): any {
  let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { school_level, action, answers, student_name } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY n'est pas configurée");
    if (!school_level) throw new Error("school_level est requis");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── GENERATE ──
    if (action === "generate") {
      const previousLevel = PREVIOUS_LEVEL_MAP[school_level];
      let chaptersContext = "";

      if (school_level === "5eme_primaire") {
        chaptersContext = "برنامج الرياضيات للمستوى الابتدائي (العمليات الأساسية، الأعداد، الهندسة)";
      } else if (previousLevel) {
        const { data: chapters } = await supabase
          .from("chapters")
          .select("title_ar, lessons(title_ar)")
          .eq("school_level", previousLevel)
          .eq("subject", "math");
        if (chapters && chapters.length > 0) {
          chaptersContext = chapters
            .map((ch: any) => `${ch.title_ar}: ${(ch.lessons as any[] || []).map((l: any) => l.title_ar).join("، ")}`)
            .join("\n");
        }
      }

      if (!chaptersContext) {
        chaptersContext = "الرياضيات العامة";
      }

      const prompt = `أنت معلم رياضيات جزائري.
أنشئ 5 أسئلة QCM بالعربية لتقييم طالب ينتقل إلى: ${school_level}.
البرنامج المرجعي:
${chaptersContext}

قواعد: 4 خيارات، خيار صحيح واحد، correct_index من 0 إلى 3.
أجب بـ JSON فقط:
{"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "chapter_ref": "...", "explanation": "..."}]}`;

      const raw = await callLovableAI(
        LOVABLE_API_KEY,
        "أجب بـ JSON فقط. لا شرح خارج JSON.",
        prompt
      );

      const parsed = extractJSON(raw);
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("L'IA n'a pas retourné de questions valides.");
      }

      return new Response(
        JSON.stringify({ questions: parsed.questions, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── EVALUATE (concise) ──
    if (action === "evaluate") {
      if (!answers || !Array.isArray(answers)) {
        throw new Error("Les réponses sont requises.");
      }

      const correctCount = answers.filter((a: any) => a.correct).length;
      const total = answers.length;
      const percentage = Math.round((correctCount / total) * 100);

      const answersText = answers
        .map((a: any, i: number) =>
          `س${i + 1}: ${a.correct ? "✓" : "✗"} (${a.chapter_ref})`
        )
        .join(" | ");

      const prompt = `أنت معلم رياضيات. الطالب أجاب ${correctCount}/${total} (${percentage}%).
${answersText}

أنشئ تقرير مختصر. أجب بـ JSON فقط:
{"level_label": "مبتدئ/متوسط/متقدم", "summary": "جملة واحدة فقط", "strengths": ["نقطة واحدة"], "improvements": ["نقطة واحدة"], "advice": "نصيحة في جملة واحدة"}`;

      const raw = await callLovableAI(
        LOVABLE_API_KEY,
        "أجب بـ JSON مختصر فقط. لا تكتب أكثر من جملة واحدة لكل حقل.",
        prompt
      );

      const report = extractJSON(raw);

      return new Response(
        JSON.stringify({ report, score: correctCount, total, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Action non supportée: "${action}"` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-placement-test error:", message);
    return new Response(
      JSON.stringify({ error: message, success: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
