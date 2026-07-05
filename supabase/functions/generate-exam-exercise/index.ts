import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractGeminiUsage, type AiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratedExamExercise {
  statement: string;
  solution: string;
  answer: string;
}

function cleanGeneratedJson(rawContent: string): string {
  let cleaned = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  return cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
}

function normalizeText(value: string | null | undefined): string {
  return (value || "").replace(/\\n/g, "\n").trim();
}

function parseGeneratedObject(content: string): GeneratedExamExercise {
  const cleaned = cleanGeneratedJson(content);
  try {
    return JSON.parse(cleaned) as GeneratedExamExercise;
  } catch {
    const withoutLatexBackslashes = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "");
    return JSON.parse(withoutLatexBackslashes) as GeneratedExamExercise;
  }
}

async function callGemini2(systemPrompt: string, userPrompt: string): Promise<{ text: string; usage: AiUsage | null }> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError = "Gemini2 unavailable";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY_2}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 8000 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";
      return { text, usage: extractGeminiUsage(data) };
    }
    const errText = await response.text();
    console.error(`Gemini2 ${model} error:`, response.status, errText);
    lastError = `Gemini2 API failed: ${response.status}`;
  }
  throw new Error(lastError);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapter_id, difficulty } = await req.json();

    if (!chapter_id) {
      return new Response(
        JSON.stringify({ error: "chapter_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase configuration");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("title, title_ar")
      .eq("id", chapter_id)
      .single();

    if (chapterError || !chapterData) throw new Error("Chapter not found");

    const chapterTitle = (chapterData as any).title_ar || (chapterData as any).title || "الفصل";
    const diffLabel = difficulty === 1 ? "سهل" : difficulty === 3 ? "صعب" : "متوسط";

    const systemPrompt = `أنت أستاذ رياضيات جزائري خبير. مهمتك توليد تمرين امتحان واحد باللغة العربية مع حل مفصل وإجابة نهائية. الرد فقط بكائن JSON صحيح، بدون أي نص خارج JSON.`;

    const userPrompt = `
ولّد تمرين امتحان واحد (مستوى ${diffLabel}) حول فصل "${chapterTitle}".

صيغة JSON المطلوبة (كائن واحد بالضبط):
{
  "statement": "نص التمرين (الإنشاء) بالعربية، يمكن استعمال LaTeX داخل $...$ أو $$...$$",
  "solution": "الحل المفصل خطوة بخطوة بالعربية مع الصيغ الرياضية (LaTeX)",
  "answer": "الإجابة النهائية المختصرة"
}

شروط مهمة:
- جميع النصوص بالعربية
- استعمل LaTeX للصيغ الرياضية: $\\lim_{x\\to 0}$, $\\frac{a}{b}$, $\\sqrt{x}$ ...
- الحل يجب أن يكون مفصلاً وواضحاً
- ⚠️ الرد JSON فقط (كائن واحد)، بدون \`\`\`json أو أي نص آخر`;

    const { text: rawContent, usage } = await callGemini2(systemPrompt, userPrompt);
    if (!rawContent.trim()) throw new Error("Empty AI response");

    const parsed = parseGeneratedObject(rawContent);
    const exercise: GeneratedExamExercise = {
      statement: normalizeText(parsed.statement),
      solution: normalizeText(parsed.solution),
      answer: normalizeText(parsed.answer),
    };

    if (!exercise.statement) throw new Error("Generated exercise missing statement");

    try {
      const { userId: callerUserId, roleGroup: callerRoleGroup } = await resolveCallerRoleGroup(
        supabaseUrl, supabaseKey, req.headers.get("Authorization")
      );
      logTokenUsageAsync(supabaseUrl, supabaseKey, {
        userId: callerUserId,
        roleGroup: callerRoleGroup,
        feature: "generate-exam-exercise",
        usage,
      });
    } catch (_) {
      // token logging is best-effort
    }

    return new Response(
      JSON.stringify({ exercise }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-exam-exercise error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
