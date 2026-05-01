// Generates 10 exercises + 10 quizzes for ONE lesson using Google Gemini API directly (GEMINI_API_KEY_2).
// No auth required: uses a shared secret token to prevent abuse.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shared-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY_2") || Deno.env.get("GEMINI_API_KEY")!;

const SYSTEM_PROMPT = `أنت معلم رياضيات خبير للسنة النهائية شعبة العلوم التجريبية في الجزائر.
مهمتك: توليد 10 تمارين و 10 أسئلة اختيار من متعدد لدرس معطى، باللغة العربية، بمستوى مناسب للبكالوريا.
قواعد صارمة:
- اكتب فقط بالعربية (التعليمات والحلول).
- استعمل LaTeX داخل $...$ للصيغ القصيرة و $$...$$ للمعروضة.
- درجات الصعوبة من 1 (سهل جدا) إلى 5 (صعب جدا)، وزع بشكل متدرج.
- أرجع JSON صالح فقط حسب الخطاطة المطلوبة.`;

function buildUserPrompt(chapterAr: string, lessonAr: string, lessonFr: string) {
  return `الفصل: ${chapterAr}
الدرس: ${lessonAr} (${lessonFr})

ولِّد بالضبط:
- 10 تمارين (exercises)
- 10 أسئلة اختيار من متعدد (quizzes)

كل تمرين: title, statement (LaTeX), expected_answer, accepted_answers (مصفوفة 2-4), solution (Markdown مع ### الخطوة 1: وينتهي بـ $$\\boxed{...}$$), difficulty (1-5), hint (يبدأ بـ 💡).
كل quiz: question, options (4 نصوص), correct_answer (يطابق أحد options بالضبط), explanation, difficulty (1-5), hint (يبدأ بـ 💡).

أرجع JSON بهذا الشكل بالضبط دون أي شرح خارجي:
{"exercises":[...10...],"quizzes":[...10...]}`;
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 16384,
      },
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${txt.slice(0, 400)}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini empty response: " + JSON.stringify(data).slice(0, 300));
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { lesson_id, chapter_id, lesson_title_ar, lesson_title_fr, chapter_title_ar, replace, shared_token } = body;

    // simple shared-token gate (prevents random callers)
    const expectedToken = Deno.env.get("BULK_GEN_TOKEN") || "tx_terminale_2026_bulk_xY9";
    if (shared_token !== expectedToken) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!lesson_id || !chapter_id || !lesson_title_ar) {
      return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userPrompt = buildUserPrompt(chapter_title_ar, lesson_title_ar, lesson_title_fr || "");

    let parsed: any = null;
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        parsed = await callGemini(SYSTEM_PROMPT, userPrompt);
        if (parsed?.exercises?.length && parsed?.quizzes?.length) break;
        lastErr = "missing fields";
      } catch (e: any) {
        lastErr = e.message;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
    if (!parsed?.exercises || !parsed?.quizzes) {
      return new Response(JSON.stringify({ error: `generation failed: ${lastErr}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    if (replace) {
      await admin.from("chapter_exercises").delete().eq("lesson_id", lesson_id);
      await admin.from("chapter_quizzes").delete().eq("lesson_id", lesson_id);
    }

    const exercisesToInsert = parsed.exercises.slice(0, 10).map((ex: any, i: number) => ({
      chapter_id, lesson_id,
      title: String(ex.title ?? `تمرين ${i + 1}`).slice(0, 300),
      statement: String(ex.statement ?? ""),
      expected_answer: String(ex.expected_answer ?? ""),
      accepted_answers: Array.isArray(ex.accepted_answers) ? ex.accepted_answers.map(String) : [],
      solution: String(ex.solution ?? ""),
      hint: String(ex.hint ?? ""),
      difficulty: Math.min(5, Math.max(1, Number(ex.difficulty) || 2)),
      order_index: i + 1,
    }));

    const quizzesToInsert = parsed.quizzes.slice(0, 10).map((q: any, i: number) => ({
      chapter_id, lesson_id,
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correct_answer: String(q.correct_answer ?? ""),
      explanation: String(q.explanation ?? ""),
      hint: String(q.hint ?? ""),
      difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 2)),
      order_index: i + 1,
    }));

    const { error: exErr } = await admin.from("chapter_exercises").insert(exercisesToInsert);
    if (exErr) throw new Error(`insert exercises: ${exErr.message}`);
    const { error: qzErr } = await admin.from("chapter_quizzes").insert(quizzesToInsert);
    if (qzErr) throw new Error(`insert quizzes: ${qzErr.message}`);

    return new Response(JSON.stringify({
      ok: true, lesson_id,
      inserted_exercises: exercisesToInsert.length,
      inserted_quizzes: quizzesToInsert.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
