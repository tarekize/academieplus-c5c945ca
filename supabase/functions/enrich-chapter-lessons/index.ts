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
- استعمل جداول HTML <table> عند الحاجة.
- اشرح كل مفهوم خطوة بخطوة، مع أمثلة محلولة بالتفصيل.
- لا تختصر المحتوى الموجود، بل أثرِه: أضف تعريفات أوضح، خصائص، أمثلة جديدة، تطبيقات، ملاحظات هامة، أخطاء شائعة، وخلاصة في الأخير.
- لا تكتب CSS داخل style.
- ابدأ مباشرة بـ <div dir="rtl"> ... </div>.`;

// ===== Provider helpers =====
async function callGeminiKey(systemPrompt: string, userPrompt: string, model: string, key: string, label: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
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
    const err: any = new Error(`${label} (${model}) ${response.status}: ${t.slice(0, 150)}`);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text.trim()) throw new Error(`${label} empty response`);
  return text;
}

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) throw new Error("LOVABLE_API_KEY not set");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    const err: any = new Error(`Lovable ${r.status}: ${t.slice(0, 150)}`);
    err.status = r.status;
    throw err;
  }
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("Lovable empty response");
  return text;
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("GROQ_API_KEY");
  if (!KEY) throw new Error("GROQ_API_KEY not set");
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 8000,
      temperature: 0.6,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    const err: any = new Error(`Groq ${r.status}: ${t.slice(0, 150)}`);
    err.status = r.status;
    throw err;
  }
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("Groq empty response");
  return text;
}

// Gemini fallback chain (preferred: Gemini Key 2 only, as requested)
async function generateEnrichedHtml(systemPrompt: string, userPrompt: string): Promise<string> {
  const GEMINI_2 = Deno.env.get("GEMINI_API_KEY_2");
  const errors: string[] = [];

  if (!GEMINI_2) throw new Error("GEMINI_API_KEY_2 غير موجودة في إعدادات المشروع");

  type Step = () => Promise<string>;
  const steps: Array<{ name: string; run: Step }> = [];

  steps.push({ name: "Gemini2/2.5-flash-lite", run: () => callGeminiKey(systemPrompt, userPrompt, "gemini-2.5-flash-lite", GEMINI_2, "Gemini2") });
  steps.push({ name: "Gemini2/2.5-flash-lite retry", run: async () => { await new Promise(r => setTimeout(r, 1800)); return callGeminiKey(systemPrompt, userPrompt, "gemini-2.5-flash-lite", GEMINI_2, "Gemini2"); } });
  steps.push({ name: "Gemini2/2.5-flash", run: () => callGeminiKey(systemPrompt, userPrompt, "gemini-2.5-flash", GEMINI_2, "Gemini2") });

  for (const s of steps) {
    try {
      console.log(`→ Trying provider: ${s.name}`);
      const out = await s.run();
      console.log(`✓ Success with ${s.name}`);
      return out;
    } catch (e: any) {
      const msg = e?.message || String(e);
      console.warn(`✗ ${s.name} failed: ${msg}`);
      errors.push(`${s.name}: ${msg}`);
      // Continue to next provider
    }
  }
  throw new Error(`Gemini clé 2 a échoué. ${errors.join(" | ")}`);
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanGeneratedHtml(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "");
  return s.trim();
}

async function ensureCanManage(req: Request, supabase: ReturnType<typeof createClient>) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, error: "Authentification requise" };

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userError || !userId) return { ok: false, status: 401, error: "Session invalide" };

  const [adminCheck, pedagoCheck] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "pedago" }),
  ]);

  if (adminCheck.error || pedagoCheck.error) return { ok: false, status: 403, error: "Impossible de vérifier les droits" };
  if (!adminCheck.data && !pedagoCheck.data) return { ok: false, status: 403, error: "Accès réservé aux admins et pédagogues" };

  return { ok: true, userId };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { chapterId, lessonId } = await req.json().catch(() => ({}));
    if (!chapterId) {
      return new Response(
        JSON.stringify({ success: false, error: "chapterId required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase env not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const auth = await ensureCanManage(req, supabase);
    if (!auth.ok) {
      return new Response(
        JSON.stringify({ success: false, error: auth.error }),
        { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: chapter, error: chErr } = await supabase
      .from("chapters")
      .select("id, title, title_ar")
      .eq("id", chapterId)
      .maybeSingle();
    if (chErr) throw chErr;
    if (!chapter) {
      return new Response(
        JSON.stringify({ success: false, error: "Chapter not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: lessons, error: lErr } = await supabase
      .from("lessons")
      .select("id, title, title_ar, content, order_index")
      .eq("chapter_id", chapterId)
      .filter("id", lessonId ? "eq" : "neq", lessonId || "00000000-0000-0000-0000-000000000000")
      .order("order_index", { ascending: true });
    if (lErr) throw lErr;
    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "هذا الفصل لا يحتوي على أي درس." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ id: string; title: string; status: "ok" | "error"; error?: string }> = [];

    for (const lesson of lessons) {
      const lessonTitle = lesson.title_ar || lesson.title;
      const existing = stripHtml(lesson.content || "").slice(0, 3500);

      const userPrompt = `الفصل: ${chapter.title_ar || chapter.title}
الدرس: ${lessonTitle}

المحتوى الحالي للدرس (للاستئناس فقط، أعد بناءه وأثرِه بالكامل):
${existing || "(لا يوجد محتوى حالي - أنشئ درساً كاملاً من الصفر)"}

أنشئ الآن المحتوى المُثرى الكامل لهذا الدرس على شكل HTML جميل ومنظم حسب التعليمات.`;

      try {
        const raw = await generateEnrichedHtml(SYSTEM_PROMPT, userPrompt);
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

      await new Promise((r) => setTimeout(r, 1000));
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
    console.error("enrich-chapter-lessons fatal:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
