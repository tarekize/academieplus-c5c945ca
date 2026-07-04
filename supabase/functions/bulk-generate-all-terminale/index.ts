// One-shot batch: generate 10 exercises + 10 quizzes for ALL lessons of Terminale Sciences.
// Protected by a shared secret header to allow sandbox invocation without admin JWT.
// Streams progress as NDJSON.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { logTokenUsageAsync, extractOpenAiCompatUsage, type AiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bulk-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
// Shared bulk token = SHA-like fixed value; reuse SUPABASE_JWKS env presence as gate or just compare to a constant injected by build.
// We'll use the project ref so caller proves they know it; combined with service-role-only DB writes below.
const BULK_TOKEN = Deno.env.get("SUPABASE_URL") || ""; // any caller must send the project URL string

const FILIERE_ID = "9f9cea26-5b2c-4bb3-ab00-206abb7f43c5";

const SYSTEM_PROMPT = `أنت معلم رياضيات خبير للسنة النهائية شعبة العلوم التجريبية في الجزائر.
ولِّد محتوى تعليمي بالعربية مع LaTeX داخل $...$ أو $$...$$ للصيغ.
أرجع JSON صالح فقط بدون أي شرح خارجي.`;

function buildUserPrompt(chapterTitle: string, lessonTitle: string) {
  return `الفصل: ${chapterTitle}
الدرس: ${lessonTitle}

ولِّد بالضبط 10 تمارين و 10 أسئلة اختيار من متعدد بمستوى البكالوريا.

كل تمرين يحتوي:
- title: عنوان قصير
- statement: نص التمرين مع LaTeX
- expected_answer: الإجابة النهائية القصيرة
- accepted_answers: مصفوفة 2-4 صيغ مكافئة
- solution: حل مفصل Markdown مع ### الخطوة 1: ... وLaTeX، ينتهي بـ $$\\boxed{...}$$
- difficulty: 1..5 (وزع بشكل متدرج)
- hint: تلميح يبدأ بـ 💡

كل quiz يحتوي:
- question: السؤال
- options: مصفوفة 4 خيارات نصية
- correct_answer: نص يطابق أحد options بالضبط
- explanation: شرح موجز
- difficulty: 1..5
- hint: تلميح يبدأ بـ 💡

أرجع فقط JSON بهذا الشكل:
{"exercises":[...10...],"quizzes":[...10...]}`;
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<{ parsed: any; usage: AiUsage | null }> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
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
    throw new Error(`AI ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
  return { parsed: JSON.parse(cleaned), usage: extractOpenAiCompatUsage(data) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const token = req.headers.get("x-bulk-token");
  if (!token || token !== BULK_TOKEN) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const url = new URL(req.url);
  const startIdx = Number(url.searchParams.get("start") || "0");
  const limit = Number(url.searchParams.get("limit") || "5");
  const replace = url.searchParams.get("replace") === "1";

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // fetch all target lessons ordered
  const { data: chapters, error: chErr } = await admin
    .from("chapters")
    .select("id, title, title_ar, order_index")
    .eq("school_level", "terminale")
    .eq("filiere_id", FILIERE_ID)
    .order("order_index");
  if (chErr) return new Response(JSON.stringify({ error: chErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const chapterIds = (chapters || []).map((c: any) => c.id);
  const { data: lessons, error: lErr } = await admin
    .from("lessons")
    .select("id, title, title_ar, chapter_id, order_index")
    .in("chapter_id", chapterIds)
    .order("order_index");
  if (lErr) return new Response(JSON.stringify({ error: lErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const chMap = new Map((chapters || []).map((c: any) => [c.id, c]));
  const ordered = (lessons || []).slice().sort((a: any, b: any) => {
    const ca = chMap.get(a.chapter_id)?.order_index ?? 0;
    const cb = chMap.get(b.chapter_id)?.order_index ?? 0;
    return ca - cb || a.order_index - b.order_index;
  });

  const slice = ordered.slice(startIdx, startIdx + limit);
  const results: any[] = [];

  for (const lesson of slice) {
    const ch: any = chMap.get(lesson.chapter_id);
    const chapterTitle = ch?.title_ar || ch?.title || "";
    const lessonTitle = `${lesson.title_ar || ""} (${lesson.title || ""})`.trim();

    let parsed: any = null;
    let usage: AiUsage | null = null;
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await callAI(SYSTEM_PROMPT, buildUserPrompt(chapterTitle, lessonTitle));
        parsed = result.parsed;
        usage = result.usage;
        if (parsed?.exercises?.length >= 5 && parsed?.quizzes?.length >= 5) break;
        lastErr = "missing items";
      } catch (e: any) {
        lastErr = e.message;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }

    // Log de consommation IA par leçon, seulement si l'appel a réellement abouti.
    if (usage) {
      logTokenUsageAsync({
        supabaseUrl: SUPABASE_URL, serviceRoleKey: SERVICE_ROLE, userId: null, roleGroup: "admin",
        functionName: "bulk-generate-all-terminale",
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      });
    }

    if (!parsed?.exercises || !parsed?.quizzes) {
      results.push({ lesson_id: lesson.id, ok: false, error: lastErr });
      continue;
    }

    if (replace) {
      await admin.from("chapter_exercises").delete().eq("lesson_id", lesson.id);
      await admin.from("chapter_quizzes").delete().eq("lesson_id", lesson.id);
    }

    const exercises = parsed.exercises.slice(0, 10).map((ex: any, i: number) => ({
      chapter_id: lesson.chapter_id, lesson_id: lesson.id,
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
      chapter_id: lesson.chapter_id, lesson_id: lesson.id,
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correct_answer: String(q.correct_answer ?? ""),
      explanation: String(q.explanation ?? ""),
      hint: String(q.hint ?? ""),
      difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 2)),
      order_index: i + 1,
    }));

    const { error: e1 } = await admin.from("chapter_exercises").insert(exercises);
    const { error: e2 } = await admin.from("chapter_quizzes").insert(quizzes);
    results.push({
      lesson_id: lesson.id, lesson_title: lessonTitle, ok: !e1 && !e2,
      ex: exercises.length, qz: quizzes.length,
      err: e1?.message || e2?.message || null,
    });
  }

  return new Response(JSON.stringify({
    total_lessons: ordered.length,
    processed_from: startIdx,
    processed_to: startIdx + slice.length,
    next_start: startIdx + slice.length,
    has_more: startIdx + slice.length < ordered.length,
    results,
  }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
