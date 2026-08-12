import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractGeminiUsage, type AiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 20;

interface GeneratedSubQuestion {
  question: string;
  expected_answer?: string;
}

interface GeneratedExamExercise {
  statement: string;
  solution: string;
  answer: string;
  sub_questions?: GeneratedSubQuestion[];
}

// Retire les balises ```json et le texte parasite autour du JSON renvoyé.
function cleanGeneratedJson(rawContent: string): string {
  let cleaned = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  return cleaned;
}

// Corrige les backslashes LaTeX non échappés dans les valeurs JSON générées
// par l'IA (\frac, \right, \neq, \boxed, \times... commencent tous par une
// lettre qui EST aussi une séquence d'échappement JSON valide — \f, \r, \n,
// \t, \b — donc un simple JSON.parse() les interprète à tort comme
// retour-arrière/saut de ligne/tabulation, ce qui tronque le LaTeX affiché
// ("\frac{...}" devient un caractère de contrôle invisible suivi de
// "rac{...}"). On ne peut pas savoir a priori si un "\n" donné est une vraie
// séquence JSON ou du LaTeX (ex: \nabla, \neq) : on ré-échappe tout backslash
// qui n'est PAS suivi d'un guillemet/backslash/slash, sauf s'il s'agit d'un
// des rares mots LaTeX commençant par "n" à préserver tels quels.
const LATEX_N_WORDS = ["nabla", "neq", "notin", "ncong", "nless", "ngtr", "nexists", "nmid"];
function looksLikeLatexNCommand(input: string, pos: number): boolean {
  return LATEX_N_WORDS.some((w) => input.startsWith(w, pos));
}

// Parcourt le JSON caractère par caractère pour ré-échapper tout backslash
// LaTeX invalide (\frac, \right, \neq...) sans casser les échappements JSON
// déjà valides — voir le commentaire détaillé au-dessus.
function fixJsonStringEscapes(input: string): string {
  let out = "";
  let inString = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!inString) {
      out += c;
      if (c === '"') inString = true;
      continue;
    }
    if (c === '"') { out += c; inString = false; continue; }
    if (c === "\n") { out += "\\n"; continue; }
    if (c === "\r") { out += "\\r"; continue; }
    if (c === "\t") { out += "\\t"; continue; }
    if (c !== "\\") { out += c; continue; }
    const next = input[i + 1];
    if (next === undefined) { out += "\\\\"; continue; }
    if (next === '"' || next === "\\" || next === "/") {
      out += "\\" + next; i++; continue;
    }
    if (next === "n" && !looksLikeLatexNCommand(input, i + 1)) {
      out += "\\n"; i++; continue;
    }
    if (next === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
      out += "\\u" + input.slice(i + 2, i + 6); i += 5; continue;
    }
    out += "\\\\";
  }
  return out;
}

// Convertit les "\n" littéraux en vrais sauts de ligne et trim.
function normalizeText(value: string | null | undefined): string {
  return (value || "").replace(/\\n/g, "\n").trim();
}

// Nettoie puis parse le JSON généré, en appliquant systématiquement le
// correctif d'échappement LaTeX (voir commentaire au-dessus).
function parseGeneratedObject(content: string): GeneratedExamExercise {
  const cleaned = cleanGeneratedJson(content);
  // Le correctif doit s'appliquer TOUJOURS, pas seulement quand JSON.parse()
  // échoue : \frac, \right, \neq, \boxed... commencent par b/f/n/r/t, qui sont
  // TOUS des séquences d'échappement JSON valides (backspace/formfeed/newline/
  // retour chariot/tabulation) — JSON.parse() réussit donc silencieusement en
  // tronquant le LaTeX au lieu de lever une erreur qu'on pourrait rattraper.
  try {
    return JSON.parse(fixJsonStringEscapes(cleaned)) as GeneratedExamExercise;
  } catch {
    return JSON.parse(cleaned) as GeneratedExamExercise;
  }
}

// Gemini "structured output" : force le modèle à ne produire que ces champs,
// sans texte ni markdown autour — moins de tokens de sortie, JSON toujours valide.
const EXAM_EXERCISE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    statement: { type: "STRING" },
    sub_questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          expected_answer: { type: "STRING" },
        },
        required: ["question"],
      },
    },
    solution: { type: "STRING" },
    answer: { type: "STRING" },
  },
  required: ["statement", "solution", "answer"],
};

// Génère UN exercice d'examen (avec solution détaillée) via Gemini (2ème
// clé), en essayant plusieurs modèles en repli si le premier échoue ou
// renvoie une réponse tronquée (finishReason != STOP).
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

// Génère UN exercice d'examen (énoncé + solution détaillée + réponse) pour un
// chapitre donné. Appelée par src/components/exams/ViaIAWizard.tsx,
// src/components/teacher/ExamAIBuilder.tsx et src/pages/ExamList.tsx (côté
// enseignant/pédago/admin, préparation d'examens). Authentification + rôle +
// rate limiting obligatoires ci-dessous.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapter_id, difficulty, instructions } = await req.json();

    if (!chapter_id) {
      return new Response(
        JSON.stringify({ error: "chapter_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase configuration");

    // --- Authentification + autorisation obligatoires : cette fonction
    // consomme un quota IA payant à chaque appel et n'a de sens que pour un
    // enseignant/pédagogue/admin qui prépare un examen — sans contrôle de
    // rôle, n'importe quel élève authentifié pouvait l'appeler directement
    // pour générer du contenu IA payant à volonté. ---
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

    const { data: callerRoles } = await supabase.from("user_roles").select("role").eq("user_id", caller.id);
    const isAuthorized = (callerRoles ?? []).some((r: any) => ["teacher", "pedago", "admin"].includes(r.role));
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Accès réservé aux enseignants et à l'équipe pédagogique" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: allowed, error: rateLimitError } = await supabase.rpc("check_and_log_rate_limit", {
      p_user_id: caller.id,
      p_action: "ia_exam_exercise_request",
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Merci de patienter quelques instants." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

تمرين بعدة أسئلة منفصلة (مهم جداً) :
إذا كان التمرين يتضمن طبيعياً عدة أسئلة مستقلة (مثال: "1. أحسب النهايات"، "2. أدرس قابلية الاشتقاق"، "3. استنتج...")، فلا تكتبها كلها داخل "statement" مع إجابة واحدة في "answer". استعمل بدل ذلك "sub_questions" : "statement" يصبح المعطيات/السياق المشترك فقط (دون تكرار الأسئلة)، و"answer" يبقى فارغاً "" :
{
  "statement": "معطيات/سياق التمرين المشترك فقط",
  "sub_questions": [
    {"question": "1. نص السؤال الأول", "expected_answer": "الإجابة المتوقعة لهذا السؤال بالضبط"},
    {"question": "2. نص السؤال الثاني", "expected_answer": "..."}
  ],
  "solution": "...",
  "answer": ""
}
لا تستعمل "sub_questions" إلا إذا كان التمرين يحتوي فعلاً على أسئلة منفصلة قابلة للفصل ؛ لتمرين بسؤال واحد فقط، اترك "sub_questions" فارغاً واستعمل "statement"/"answer" كالمعتاد.

شروط مهمة:
- جميع النصوص بالعربية.
- التمرين يجب أن يكون مناسباً لمستوى الصعوبة "${diffLabel}" ومطابقاً لبرنامج فصل "${chapterTitle}" فقط.
${typeof instructions === "string" && instructions.trim() ? `- تعليمات إضافية من الأستاذ (يجب إتباعها بدقة) : ${instructions.trim()}\n` : ""}

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
    const subQuestions = Array.isArray(parsed.sub_questions)
      ? parsed.sub_questions
          .map((q) => ({ question: normalizeText(q?.question), expected_answer: normalizeText(q?.expected_answer) }))
          .filter((q) => q.question)
      : [];
    const exercise: GeneratedExamExercise = {
      statement: normalizeText(parsed.statement),
      solution: normalizeText(parsed.solution),
      answer: normalizeText(parsed.answer),
      ...(subQuestions.length >= 2 ? { sub_questions: subQuestions } : {}),
    };

    if (!exercise.statement && !(exercise.sub_questions && exercise.sub_questions.length)) {
      throw new Error("Generated exercise missing statement");
    }

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
