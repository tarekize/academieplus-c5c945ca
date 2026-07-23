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

// Gemini "structured output" : force le modèle à ne produire que ces champs,
// sans texte ni markdown autour — moins de tokens de sortie, JSON toujours valide.
const EXAM_EXERCISE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    statement: { type: "STRING" },
    solution: { type: "STRING" },
    answer: { type: "STRING" },
  },
  required: ["statement", "solution", "answer"],
};

async function callGemini2(systemPrompt: string, userPrompt: string): Promise<{ text: string; usage: AiUsage | null }> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"];
  let lastError = "Gemini2 unavailable";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY_2}`;
    // gemini-2.5 models "think" before answering by default, eating into maxOutputTokens.
    const generationConfig: Record<string, unknown> = { responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 12000, responseSchema: EXAM_EXERCISE_RESPONSE_SCHEMA };
    if (model.startsWith("gemini-2.5") || model.includes("flash-latest")) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const finishReason = data?.candidates?.[0]?.finishReason;
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";
      if (finishReason && finishReason !== "STOP") {
        console.error(`Gemini2 ${model} incomplete response: finishReason=${finishReason}, length=${text.length}`);
        lastError = `Gemini2 ${model} incomplete: ${finishReason}`;
        continue;
      }
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

    // --- Authentification obligatoire : cette fonction consomme un quota IA
    // payant à chaque appel. resolveCallerRoleGroup() plus bas ne fait que
    // catégoriser l'appelant pour les logs, il ne rejette rien. ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("title, title_ar")
      .eq("id", chapter_id)
      .single();

    if (chapterError || !chapterData) throw new Error("Chapter not found");

    const chapterTitle = (chapterData as any).title_ar || (chapterData as any).title || "الفصل";
    const diffLabel = difficulty === 1 ? "سهل" : difficulty === 3 ? "صعب" : "متوسط";

    const systemPrompt = `أنت أستاذ رياضيات جزائري خبير في إعداد مواضيع الامتحانات. مهمتك توليد تمرين امتحان واحد باللغة العربية مع حل مفصل خطوة بخطوة وإجابة نهائية. الرد فقط بكائن JSON صحيح، بدون أي نص خارج JSON.`;

    const userPrompt = `
ولّد تمرين امتحان واحد (مستوى ${diffLabel}) حول فصل "${chapterTitle}".

صيغة JSON المطلوبة (كائن واحد بالضبط):
{
  "statement": "نص التمرين (الإنشاء) بالعربية",
  "solution": "الحل المفصل خطوة بخطوة بالعربية (انظر تنسيق الحل الإلزامي أدناه)",
  "answer": "الإجابة النهائية المختصرة"
}

شروط مهمة:
- جميع النصوص بالعربية.
- التمرين يجب أن يكون مناسباً لمستوى الصعوبة "${diffLabel}" ومطابقاً لبرنامج فصل "${chapterTitle}" فقط.

FORMAT MATHÉMATIQUE OBLIGATOIRE : TOUTES les expressions mathématiques (variables, fonctions, fractions, puissances, indices, limites, racines, symboles ∞, ≤, ≥, ≠, ±, →, etc.) DOIVENT être écrites en LaTeX entre délimiteurs $...$ (ou $$...$$ pour les formules isolées) pour le rendu KaTeX.
- الكسور: \\frac{a}{b} (ممنوع كتابتها a/b).
- القوى: x^{n} (ممنوع x^n أو x**n). الأدلة: x_{n}. الجذور: \\sqrt{x}.
- الرموز: \\infty, \\to, \\lim_{x \\to +\\infty}, \\leq, \\geq, \\neq, \\pm, \\cdot, \\times.
- مثال صحيح: "$f(x) = \\frac{2x^{2} + 3x - 1}{x - 1}$" — ممنوع كتابتها كنص خام f(x) = (2x^2+3x-1)/(x-1).

تنسيق الحل ("solution") - إلزامي:
- حل غني ومفصل بعدة خطوات مرقّمة، أبداً سطر واحد فقط.
- استعمل بنية HTML بسيطة: <p><strong>الخطوة 1 :</strong> ...</p><p>$$ ... $$</p> لكل خطوة، ثم <p><strong>الاستنتاج :</strong> $$ \\boxed{...} $$</p> في النهاية.
- كل خطوة يجب أن تُبرّر الحساب (القاعدة أو المبرهنة أو الخاصية المستعملة)، ليس فقط النتيجة.
- 4 خطوات كحد أدنى للتمارين متوسطة/صعبة الصعوبة.

⚠️ الرد JSON فقط (كائن واحد)، بدون \`\`\`json أو أي نص آخر`;

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
      logTokenUsageAsync({
        supabaseUrl,
        serviceRoleKey: supabaseKey,
        userId: callerUserId,
        roleGroup: callerRoleGroup,
        functionName: "generate-exam-exercise",
        inputTokens: usage?.inputTokens,
        outputTokens: usage?.outputTokens,
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
