// Bulk-generate exercises (10) and quizzes (10) for a single lesson and INSERT them into DB.
// Uses LOVABLE_API_KEY (Lovable AI Gateway, OpenAI-compatible). Caller must be admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `أنت معلم رياضيات خبير للسنة النهائية شعبة العلوم التجريبية في الجزائر.
مهمتك: توليد 10 تمارين و 10 أسئلة اختيار من متعدد لدرس معطى، باللغة العربية، بمستوى مناسب للبكالوريا.

قواعد صارمة:
- اكتب فقط بالعربية (التعليمات والحلول).
- استعمل LaTeX داخل $...$ للصيغ الرياضية القصيرة و $$...$$ للمعروضة.
- درجات الصعوبة من 1 (سهل جدا) إلى 5 (صعب جدا)، وزع بشكل متدرج.
- لا تستعمل أية markdown غير اللازم.
- أرجع JSON صالح فقط حسب الخطاطة المطلوبة.`;

function buildUserPrompt(chapterAr: string, lessonAr: string, lessonFr: string) {
  return `الفصل: ${chapterAr}
الدرس: ${lessonAr} (${lessonFr})

ولِّد بالضبط:
- 10 تمارين (exercises)
- 10 أسئلة اختيار من متعدد (quizzes)

كل تمرين يجب أن يحتوي:
- title: عنوان قصير
- statement: نص التمرين (يمكن استعمال LaTeX)
- expected_answer: الإجابة النهائية (نص قصير، صيغة قياسية)
- accepted_answers: مصفوفة 2-4 صيغ مكافئة مقبولة
- solution: حل مفصل بصيغة Markdown مع خطوات (### الخطوة 1: ...) وLaTeX، وينتهي بـ $$\\boxed{...}$$
- difficulty: عدد صحيح من 1 إلى 5
- hint: تلميح قصير يبدأ بـ 💡

كل سؤال quiz يحتوي:
- question: نص السؤال
- options: مصفوفة من 4 خيارات نصية
- correct_answer: نص الجواب الصحيح (يجب أن يطابق أحد options بالضبط)
- explanation: شرح موجز للجواب الصحيح
- difficulty: 1..5
- hint: تلميح قصير يبدأ بـ 💡

أرجع JSON بهذا الشكل بالضبط دون أي شرح خارجي:
{"exercises":[...10 عناصر...],"quizzes":[...10 عناصر...]}`;
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<any> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`AI Gateway ${resp.status}: ${txt.slice(0, 300)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty content");
  // strip code fences if any
  const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "auth failed" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (roleRow ?? []).map((r: any) => r.role);
    if (!roles.includes("admin") && !roles.includes("pedago")) {
      return new Response(JSON.stringify({ error: "forbidden: admin/pedago only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { lesson_id, chapter_id, lesson_title_ar, lesson_title_fr, chapter_title_ar, replace } = body;
    if (!lesson_id || !chapter_id || !lesson_title_ar) {
      return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userPrompt = buildUserPrompt(chapter_title_ar, lesson_title_ar, lesson_title_fr || "");

    // retry up to 3 times on parse / API errors
    let parsed: any = null;
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        parsed = await callGemini(SYSTEM_PROMPT, userPrompt);
        if (parsed?.exercises?.length && parsed?.quizzes?.length) break;
        lastErr = "parsed but missing fields";
      } catch (e: any) {
        lastErr = e.message;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    if (!parsed?.exercises || !parsed?.quizzes) {
      return new Response(JSON.stringify({ error: `generation failed: ${lastErr}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
      ok: true,
      lesson_id,
      inserted_exercises: exercisesToInsert.length,
      inserted_quizzes: quizzesToInsert.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
