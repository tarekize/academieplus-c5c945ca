import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { logTokenUsageAsync, resolveCallerRoleGroup } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIProvider = {
  name: string;
  call: (systemPrompt: string, userPrompt: string) => Promise<string>;
};

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Lovable AI failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("GEMINI_API_KEY");
  if (!KEY) throw new Error("GEMINI_API_KEY not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 3000 },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("GROQ_API_KEY");
  if (!KEY) throw new Error("GROQ_API_KEY not configured");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Groq failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini2(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("GEMINI_API_KEY_2");
  if (!KEY) throw new Error("GEMINI_API_KEY_2 not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 3000 },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini2 failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateWithAI(systemPrompt: string, userPrompt: string): Promise<{ content: string; provider: string }> {
  const providers: AIProvider[] = [
    { name: "Lovable AI", call: callLovableAI },
    { name: "Gemini key 1", call: callGemini },
    { name: "Groq", call: callGroq },
    { name: "Gemini key 2", call: callGemini2 },
  ];
  const errors: string[] = [];
  for (const p of providers) {
    try {
      console.log(`Trying ${p.name}...`);
      const content = await p.call(systemPrompt, userPrompt);
      if (!content.trim()) throw new Error("Empty response");
      console.log(`${p.name} succeeded.`);
      return { content, provider: p.name };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${p.name}: ${msg}`);
      console.error(`${p.name} failed`, msg);
    }
  }
  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { chapterTitle, lessons } = await req.json();
    if (!chapterTitle || !Array.isArray(lessons)) {
      return new Response(
        JSON.stringify({ success: false, error: "chapterTitle and lessons[] required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonsBlock = lessons
      .map((l: any, i: number) => {
        const title = l.titleAr || l.title || `الدرس ${i + 1}`;
        const body = stripHtml(l.content || "").slice(0, 1500); // 1500 limit for Groq
        return `### ${i + 1}. ${title}\n${body || "(لا يوجد محتوى)"}`;
      })
      .join("\n\n");

    const systemPrompt = `أنت معلم رياضيات جزائري خبير. مهمتك إنشاء بطاقة مراجعة شاملة (fiche de révision) لفصل كامل، على شكل مخطط تخطيطي توضيحي (schéma explicatif) منظّم، باللغة العربية، يغطي كل دروس الفصل من البداية إلى النهاية.

قواعد الإخراج (مهم جدا):
- أخرج Markdown فقط (بدون \`\`\` ولا JSON).
- استعمل LaTeX داخل $...$ أو $$...$$ للصيغ الرياضية.
- استعمل العناوين والرموز التوضيحية: 🎯 📌 🔑 ⚡ ✅ 💡 ➡️ 📊
- ابدأ بعنوان رئيسي # ثم خريطة ذهنية مبسطة بين الدروس (مع أسهم ➡️).
- لكل درس: عنوان فرعي ## يحتوي على: المفاهيم الأساسية، الصيغ المهمة (في جدول أو قائمة)، خطوات الحل النموذجية، أخطاء شائعة، نصائح.
- في الأخير قسم "🔗 الروابط بين الدروس" يبيّن العلاقة بينها.
- اجعل المخطط واضحاً، متسلسلاً، وسهل الحفظ.
- لا تكتب أي شرح خارج البطاقة.`;

    const userPrompt = `الفصل: ${chapterTitle}

دروس الفصل:
${lessonsBlock}

أنشئ الآن بطاقة المراجعة التخطيطية الكاملة لهذا الفصل.`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, req.headers.get("Authorization")).then(({ userId, roleGroup }) => {
      logTokenUsageAsync({ supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "generate-chapter-revision", inputText: systemPrompt + "\n" + userPrompt });
    });

    const { content, provider } = await generateWithAI(systemPrompt, userPrompt);

    return new Response(
      JSON.stringify({ success: true, content, provider }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generate-chapter-revision error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
