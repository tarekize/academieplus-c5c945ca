import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callOpenRouterAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://academieplus.app",
      "X-Title": "AcademiePlus",
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
    if (response.status === 429) throw new Error("Rate limit exceeded");
    if (response.status === 402) throw new Error("Credits exhausted");
    throw new Error("AI error: " + response.status);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

function extractJSON(raw: string): Record<string, unknown> {
  let cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  try {
    return JSON.parse(cleaned);
  } catch {
    return { advice: cleaned };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { assessment_data, student_level, days_since_assessment, user_id } = body;

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");
    if (!assessment_data || !assessment_data.report) {
      throw new Error("assessment_data with report is required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const report = assessment_data.report;
    const score = assessment_data.score;
    const level = report.level_label;
    const weaknesses = report.improvements || [];

    // --- CONCISE ADVICE + EXERCISES PROMPT ---
    const prompt = `أنت معلم رياضيات جزائري. مرت ${days_since_assessment} أيام على آخر تقييم للطالب.
المستوى: ${level} | النتيجة: ${score.score}/${score.total}
نقاط الضعف: ${weaknesses.join("، ")}

المطلوب: أعطِ نصيحة مختصرة (جملتين فقط) ثم أنشئ 3 تمارين بسيطة مناسبة لمستوى الطالب تستهدف نقاط ضعفه.

أجب بـ JSON فقط:
{"advice": "نصيحة مختصرة جملتين", "weaknesses": ["نقطة1"], "exercises": [{"question": "السؤال", "answer": "الجواب", "hint": "تلميح"}]}`;

    const raw = await callOpenRouterAI(
      OPENROUTER_API_KEY,
      "أنت معلم خبير. أجب بـ JSON فقط. كن مختصراً.",
      prompt
    );

    const parsed = extractJSON(raw);

    const advice = (parsed.advice as string) || "استمر في المراجعة المنتظمة!";
    const adviceWeaknesses = (parsed.weaknesses as string[]) || weaknesses;
    const exercises = (parsed.exercises as any[]) || [];

    // --- CREATE NOTIFICATION WITH EXERCISES ---
    if (user_id && exercises.length > 0) {
      const exercisesText = exercises.map((ex: any, i: number) =>
        `تمرين ${i + 1}: ${ex.question}\n💡 تلميح: ${ex.hint || "فكّر جيداً"}\n✅ الجواب: ${ex.answer}`
      ).join("\n\n");

      await supabase.from("student_notifications").insert({
        user_id,
        notification_type: "periodic_exercises",
        title: "📝 تمارين مُعدّة لمستواك",
        message: `بناءً على تقييمك، إليك تمارين لتحسين مستواك:\n\n${exercisesText}`,
        diagnostic: `المستوى: ${level} | نقاط الضعف: ${adviceWeaknesses.join("، ")}`,
        advice: "أجب على التمارين ثم تحقق من الأجوبة لتقيّم نفسك"
      });
    }

    return new Response(
      JSON.stringify({
        advice,
        level,
        weaknesses: adviceWeaknesses,
        exercises,
        generated_at: new Date().toISOString(),
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-periodic-advice error:", message);
    return new Response(
      JSON.stringify({ error: message, success: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
