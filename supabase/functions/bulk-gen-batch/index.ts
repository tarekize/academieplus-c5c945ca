// Batch-generate exercises (10) + quizzes (10) for a list of lessons.
// Auth: admin or pedago user (Authorization: Bearer <user JWT>).
// Processes lessons sequentially. Designed for small batches (3-5) to stay within timeout.
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
- استعمل LaTeX داخل $...$ للصيغ القصيرة و $$...$$ للمعروضة.
- درجات الصعوبة من 1 إلى 5، وزع تدريجيا.
- أرجع JSON صالح فقط حسب الخطاطة.`;

function buildUserPrompt(chapterAr: string, lessonAr: string, lessonFr: string) {
  return `الفصل: ${chapterAr}
الدرس: ${lessonAr} (${lessonFr})

ولِّد بالضبط:
- 10 تمارين (exercises)
- 10 أسئلة اختيار من متعدد (quizzes)

كل تمرين:
- title
- statement (LaTeX مسموح)
- expected_answer
- accepted_answers: مصفوفة 2-4
- solution: Markdown مع خطوات و LaTeX، ينتهي بـ $$\\boxed{...}$$
- difficulty: 1..5
- hint: 💡...

كل quiz:
- question
- options: مصفوفة 4
- correct_answer (يطابق أحد options)
- explanation
- difficulty: 1..5
- hint: 💡...

أرجع JSON: {"exercises":[...10...],"quizzes":[...10...]}`;
}

async function callGemini(userPrompt: string): Promise<any> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`AI ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty content");
  const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned);
}

async function processLesson(admin: any, lesson: any): Promise<{ ok: boolean; error?: string; ex?: number; qz?: number }> {
  const userPrompt = buildUserPrompt(
    lesson.chapter_title_ar || lesson.chapter_title || "",
    lesson.lesson_title_ar || lesson.lesson_title || "",
    lesson.lesson_title_fr || lesson.lesson_title || "",
  );
  let parsed: any = null;
  let lastErr = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      parsed = await callGemini(userPrompt);
      if (parsed?.exercises?.length && parsed?.quizzes?.length) break;
      lastErr = "missing fields";
    } catch (e: any) {
      lastErr = e.message;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  if (!parsed?.exercises || !parsed?.quizzes) return { ok: false, error: lastErr };

  await admin.from("chapter_exercises").delete().eq("lesson_id", lesson.lesson_id);
  await admin.from("chapter_quizzes").delete().eq("lesson_id", lesson.lesson_id);

  const exercises = parsed.exercises.slice(0, 10).map((ex: any, i: number) => ({
    chapter_id: lesson.chapter_id,
    lesson_id: lesson.lesson_id,
    title: String(ex.title ?? `تمرين ${i + 1}`).slice(0, 300),
    statement: String(ex.statement ?? ""),
    expected_answer: String(ex.expected_answer ?? ""),
    accepted_answers: Array.isArray(ex.accepted_answers) ? ex.accepted_answers.map(String) : [],
    solution: String(ex.solution ?? ""),
    hint: String(ex.hint ?? ""),
    difficulty: Math.min(5, Math.max(1, Number(ex.difficulty) || 2)),
    order_index: i + 1,
  }));
  const quizzes = parsed.quizzes.slice(0, 10).map((q: any, i: number) => ({
    chapter_id: lesson.chapter_id,
    lesson_id: lesson.lesson_id,
    question: String(q.question ?? ""),
    options: Array.isArray(q.options) ? q.options.map(String) : [],
    correct_answer: String(q.correct_answer ?? ""),
    explanation: String(q.explanation ?? ""),
    hint: String(q.hint ?? ""),
    difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 2)),
    order_index: i + 1,
  }));

  const { error: e1 } = await admin.from("chapter_exercises").insert(exercises);
  if (e1) return { ok: false, error: `ex insert: ${e1.message}` };
  const { error: e2 } = await admin.from("chapter_quizzes").insert(quizzes);
  if (e2) return { ok: false, error: `qz insert: ${e2.message}` };
  return { ok: true, ex: exercises.length, qz: quizzes.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "auth failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    if (!roles.includes("admin") && !roles.includes("pedago")) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const lessons: any[] = body.lessons ?? [];
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return new Response(JSON.stringify({ error: "no lessons" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (lessons.length > 5) {
      return new Response(JSON.stringify({ error: "max 5 lessons per call" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const results: any[] = [];
    for (const lesson of lessons) {
      const r = await processLesson(admin, lesson);
      results.push({ lesson_id: lesson.lesson_id, lesson_title: lesson.lesson_title, ...r });
      await new Promise((res) => setTimeout(res, 400));
    }
    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
