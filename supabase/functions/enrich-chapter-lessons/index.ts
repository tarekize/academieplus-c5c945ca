import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت معلم رياضيات جزائري خبير ومُصمم محتوى تعليمي احترافي. مهمتك إثراء (enrichir) محتوى درس رياضيات وإخراجه على شكل HTML جميل، منظّم وملوّن، يتبع تصميم الكتب المدرسية الجزائرية الحديثة (RTL).

قواعد الإخراج (مهم جداً جداً):
- أخرج HTML خام فقط (بدون \`\`\`html ولا أي تعليق خارجي).
- اللغة: العربية الفصحى. الاتجاه RTL: ضع dir="rtl" على العنصر الجذر.
- استعمل LaTeX للصيغ الرياضية بين \\( ... \\) للسطر الواحد، و \\[ ... \\] للصيغ المنفصلة.
- استعمل بطاقات (cards) ملوّنة لكل نوع من المحتوى، حسب هذا التصميم:
  • <div class="lesson-card lesson-definition"> → 📘 تعريف (إطار أزرق)
  • <div class="lesson-card lesson-property"> → 🔑 خاصية / مبرهنة (إطار بنفسجي)
  • <div class="lesson-card lesson-note"> → ⚠️ ملاحظة هامة (إطار أصفر)
  • <div class="lesson-card lesson-example"> → 💡 مثال (إطار رمادي فاتح)
  • <div class="lesson-card lesson-application"> → 🧮 تطبيق (إطار أخضر)
  • <div class="lesson-card lesson-method"> → 🛠️ طريقة الحل (إطار برتقالي)
  • <div class="lesson-card lesson-summary"> → 📌 خلاصة (إطار وردي)
- لكل بطاقة: <div class="lesson-card-title">العنوان مع الإيموجي</div> ثم <div class="lesson-card-body">المحتوى</div>.
- استعمل عناوين <h2> و <h3> مرقمة (1. ، 1.1 ...).
- استعمل جداول HTML <table> عند الحاجة (للنهايات المرجعية، حالات عدم التعيين، إلخ).
- اشرح كل مفهوم خطوة بخطوة، مع أمثلة محلولة بالتفصيل.
- لا تختصر المحتوى الموجود، بل أثرِه: أضف تعريفات أوضح، خصائص، أمثلة جديدة، تطبيقات، ملاحظات هامة، أخطاء شائعة، وخلاصة في الأخير.
- لا تكتب CSS داخل style: الكلاسات (lesson-card, lesson-definition...) معرّفة في الـ frontend.
- ابدأ مباشرة بـ <div dir="rtl"> ... </div>.`;

async function callGemini2Once(systemPrompt: string, userPrompt: string, model: string): Promise<string> {
  const KEY = Deno.env.get("GEMINI_API_KEY_2");
  if (!KEY) throw new Error("GEMINI_API_KEY_2 not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 8000 },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    const err: any = new Error(`Gemini2 (${model}) failed: ${response.status} ${t.slice(0, 200)}`);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text.trim()) throw new Error("Empty response from Gemini2");
  return text;
}

async function callGemini2(systemPrompt: string, userPrompt: string): Promise<string> {
  // Retry chain: gemini-2.5-flash (3 attempts with backoff) → gemini-2.5-flash-lite (1 attempt)
  const attempts: Array<{ model: string; delayMs: number }> = [
    { model: "gemini-2.5-flash", delayMs: 0 },
    { model: "gemini-2.5-flash", delayMs: 2000 },
    { model: "gemini-2.5-flash", delayMs: 4000 },
    { model: "gemini-2.5-flash-lite", delayMs: 1500 },
  ];
  let lastErr: any;
  for (const a of attempts) {
    if (a.delayMs) await new Promise((r) => setTimeout(r, a.delayMs));
    try {
      return await callGemini2Once(systemPrompt, userPrompt, a.model);
    } catch (e: any) {
      lastErr = e;
      const status = e?.status;
      // Only retry on 503/429/500/502/504
      if (![429, 500, 502, 503, 504].includes(status)) throw e;
      console.warn(`Gemini2 attempt failed (${a.model}, status=${status}), retrying...`);
    }
  }
  throw lastErr;
}


function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanGeneratedHtml(raw: string): string {
  let s = raw.trim();
  // Remove markdown code fences if present
  s = s.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "");
  return s.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { chapterId } = await req.json();
    if (!chapterId) {
      return new Response(
        JSON.stringify({ success: false, error: "chapterId required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch chapter
    const { data: chapter, error: chErr } = await supabase
      .from("chapters")
      .select("id, title, title_ar")
      .eq("id", chapterId)
      .maybeSingle();
    if (chErr) throw chErr;
    if (!chapter) throw new Error("Chapter not found");

    // Fetch lessons
    const { data: lessons, error: lErr } = await supabase
      .from("lessons")
      .select("id, title, title_ar, content, order_index")
      .eq("chapter_id", chapterId)
      .order("order_index", { ascending: true });
    if (lErr) throw lErr;
    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "هذا الفصل لا يحتوي على أي درس." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ id: string; title: string; status: "ok" | "error"; error?: string }> = [];

    // Sequential to avoid hitting rate limits
    for (const lesson of lessons) {
      const lessonTitle = lesson.title_ar || lesson.title;
      const existing = stripHtml(lesson.content || "").slice(0, 4000);

      const userPrompt = `الفصل: ${chapter.title_ar || chapter.title}
الدرس: ${lessonTitle}

المحتوى الحالي للدرس (للاستئناس فقط، أعد بناءه وأثرِه بالكامل):
${existing || "(لا يوجد محتوى حالي - أنشئ درساً كاملاً من الصفر بناءً على عنوان الدرس)"}

أنشئ الآن المحتوى المُثرى الكامل لهذا الدرس على شكل HTML جميل ومنظم حسب التعليمات.`;

      try {
        const raw = await callGemini2(SYSTEM_PROMPT, userPrompt);
        const html = cleanGeneratedHtml(raw);

        const { error: upErr } = await supabase
          .from("lessons")
          .update({ content: html, updated_at: new Date().toISOString() })
          .eq("id", lesson.id);
        if (upErr) throw upErr;

        results.push({ id: lesson.id, title: lessonTitle, status: "ok" });
        console.log(`✅ Enriched lesson: ${lessonTitle}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`❌ Failed lesson ${lessonTitle}:`, msg);
        results.push({ id: lesson.id, title: lessonTitle, status: "error", error: msg });
      }

      // Small delay between calls to be gentle with rate limits
      await new Promise((r) => setTimeout(r, 800));
    }

    const okCount = results.filter((r) => r.status === "ok").length;
    return new Response(
      JSON.stringify({
        success: okCount > 0,
        total: results.length,
        enriched: okCount,
        failed: results.length - okCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("enrich-chapter-lessons error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
