// Generates 10 exercises + 10 quizzes for ONE lesson using Google Gemini API directly (GEMINI_API_KEY_2).
// No auth required: uses a shared secret token to prevent abuse.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { logTokenUsageAsync, extractGeminiUsage, type GeminiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shared-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
const GEMINI_KEYS = [Deno.env.get("GEMINI_API_KEY_2"), Deno.env.get("GEMINI_API_KEY")].filter(Boolean) as string[];
const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];

const SYSTEM_PROMPT = `أنت معلم رياضيات خبير للسنة النهائية شعبة العلوم التجريبية في الجزائر.
مهمتك: توليد تمارين وأسئلة اختيار من متعدد لدرس معطى، باللغة العربية، بمستوى مناسب للبكالوريا.
قواعد صارمة:
- اكتب فقط بالعربية (التعليمات والحلول).
- استعمل LaTeX داخل $...$ للصيغ القصيرة و $$...$$ للمعروضة.
- احترم بدقة توزيع مستويات الصعوبة المطلوب لكل مجموعة.
- أرجع JSON صالح فقط حسب الخطاطة المطلوبة.`;

// Un "batch" décrit une tranche demandée : N éléments dans une bande de difficulté donnée
// (bande = emplacement Découvrir [1-2] ou Comprendre [3-5], recoupée avec le niveau min/max choisi).
interface DifficultyBatch { count: number; min: number; max: number; }

function describeBatches(batches: DifficultyBatch[], label: string): string {
  return batches
    .map((b, i) => `- ${b.count} ${label} بمستوى صعوبة بين ${b.min} و ${b.max}`)
    .join("\n");
}

function buildUserPrompt(
  chapterAr: string,
  lessonAr: string,
  lessonFr: string,
  exerciseBatches: DifficultyBatch[],
  quizBatches: DifficultyBatch[],
) {
  const totalExercises = exerciseBatches.reduce((s, b) => s + b.count, 0);
  const totalQuizzes = quizBatches.reduce((s, b) => s + b.count, 0);

  const parts: string[] = [`الفصل: ${chapterAr}`, `الدرس: ${lessonAr} (${lessonFr})`, ""];

  if (totalExercises > 0) {
    parts.push(`ولِّد بالضبط ${totalExercises} تمرين (exercises) موزعة كالتالي:`);
    parts.push(describeBatches(exerciseBatches, "تمارين"));
    parts.push(`كل تمرين: title, statement (LaTeX), expected_answer, accepted_answers (مصفوفة 2-4), solution (Markdown مع ### الخطوة 1: وينتهي بـ $$\\boxed{...}$$), difficulty (رقم ضمن البند المطلوب), hint (يبدأ بـ 💡).`);
    parts.push("");
  }
  if (totalQuizzes > 0) {
    parts.push(`ولِّد بالضبط ${totalQuizzes} سؤال اختيار من متعدد (quizzes) موزعة كالتالي:`);
    parts.push(describeBatches(quizBatches, "أسئلة"));
    parts.push(`كل quiz: question, options (4 نصوص), correct_answer (يطابق أحد options بالضبط), explanation, difficulty (رقم ضمن البند المطلوب), hint (يبدأ بـ 💡).`);
    parts.push("");
  }

  parts.push("أرجع JSON بهذا الشكل بالضبط دون أي شرح خارجي:");
  parts.push(`{"exercises":[...${totalExercises}...],"quizzes":[...${totalQuizzes}...]}`);
  return parts.join("\n");
}

const SECTION_BANDS: Record<"discover" | "understand", [number, number]> = {
  discover: [1, 2],
  understand: [3, 5],
};

// Répartit `count` éléments sur les sections sélectionnées, le plus équitablement possible.
function buildBatches(sections: ("discover" | "understand")[], count: number, reqMin: number, reqMax: number): DifficultyBatch[] {
  if (sections.length === 0 || count <= 0) return [];
  const per = Math.floor(count / sections.length);
  let remainder = count - per * sections.length;
  return sections.map((section) => {
    const [bandMin, bandMax] = SECTION_BANDS[section];
    // Recoupe le niveau min/max demandé par le pédago avec la bande de la section ;
    // si l'intersection est vide, on retombe sur la bande de la section pour rester cohérent.
    let min = Math.max(reqMin, bandMin);
    let max = Math.min(reqMax, bandMax);
    if (min > max) { min = bandMin; max = bandMax; }
    const c = per + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { count: c, min, max };
  }).filter((b) => b.count > 0);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// NB : dupliqué (plutôt que partagé via _shared/) car les redéploiements
// mono-fonction de cette plateforme ne repèrent pas toujours un nouveau
// fichier _shared/ ajouté après coup ("Module not found" au déploiement) —
// chaque function reste donc volontairement autonome pour ce point.
function cleanGeneratedJson(rawContent: string): string {
  let cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) cleaned = objectMatch[0];
  return cleaned;
}

// Walk the JSON character-by-character; inside string literals, escape any
// backslash that isn't followed by a valid JSON escape char. This handles
// LaTeX commands (\frac, \alpha, \sqrt, \mathbb, \begin, \\) without
// breaking already-valid escapes like \n, \t, \", \\, \uXXXX.
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
    // inside a string
    if (c === '"') { out += c; inString = false; continue; }
    if (c === "\n") { out += "\\n"; continue; }
    if (c === "\r") { out += "\\r"; continue; }
    if (c === "\t") { out += "\\t"; continue; }
    if (c !== "\\") { out += c; continue; }
    // current is backslash — look at next
    const next = input[i + 1];
    if (next === undefined) { out += "\\\\"; continue; }
    if (next === '"' || next === "\\" || next === "/" ||
        next === "b" || next === "f" || next === "n" || next === "r" || next === "t") {
      out += "\\" + next; i++; continue;
    }
    if (next === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
      out += "\\u" + input.slice(i + 2, i + 6); i += 5; continue;
    }
    // invalid escape (LaTeX command, lone backslash, \\\\ pair, etc.) — double it
    out += "\\\\";
  }
  return out;
}

function parseGeneratedObject(rawContent: string): any {
  const cleaned = cleanGeneratedJson(rawContent);
  try { return JSON.parse(cleaned); } catch { /* fallthrough */ }
  const fixed = fixJsonStringEscapes(cleaned);
  try { return JSON.parse(fixed); } catch (e) {
    console.error("[parse] failed:", (e as Error).message, "snippet:", fixed.slice(0, 400));
    throw e;
  }
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<{ parsed: any; usage: GeminiUsage | null }> {
  if (!GEMINI_KEYS.length) throw new Error("GEMINI_API_KEY_2 not configured");

  let lastError = "Gemini unavailable";
  for (const key of GEMINI_KEYS) {
    for (const model of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
          const generationConfig: any = {
            responseMimeType: "application/json",
            temperature: 0.55,
            maxOutputTokens: 32768,
          };
          // Disable "thinking" budget on 2.5 models so all tokens go to the actual answer
          if (model.startsWith("gemini-2.5") || model.includes("flash-latest")) {
            generationConfig.thinkingConfig = { thinkingBudget: 0 };
          }
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              generationConfig,
            }),
          });

          if (!resp.ok) {
            const txt = await resp.text();
            lastError = `${model} ${resp.status}: ${txt.slice(0, 220)}`;
            console.error("[gemini]", lastError);
            if ([429, 500, 503, 504].includes(resp.status)) await sleep(1500 * (attempt + 1));
            continue;
          }

          const data = await resp.json();
          const finishReason = data?.candidates?.[0]?.finishReason;
          const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n").trim();
          if (!text) {
            lastError = `${model}: empty response (finishReason=${finishReason || "unknown"})`;
            console.error("[gemini]", lastError);
            continue;
          }
          return { parsed: parseGeneratedObject(text), usage: extractGeminiUsage(data) };
        } catch (e: any) {
          lastError = `${model}: ${e?.message || String(e)}`;
          await sleep(1200 * (attempt + 1));
        }
      }
    }
  }

  throw new Error(lastError);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { lesson_id, chapter_id, lesson_title_ar, lesson_title_fr, chapter_title_ar, replace, shared_token } = body;

    // Nouveaux paramètres du flux de génération guidée (emplacement, nombre, niveau, type).
    // Valeurs par défaut = comportement historique (10+10, toute difficulté, les deux sections).
    const sections: ("discover" | "understand")[] = Array.isArray(body.sections) && body.sections.length
      ? body.sections.filter((s: string) => s === "discover" || s === "understand")
      : ["discover", "understand"];
    const contentTypes: ("exercises" | "quizzes")[] = Array.isArray(body.content_types) && body.content_types.length
      ? body.content_types.filter((t: string) => t === "exercises" || t === "quizzes")
      : ["exercises", "quizzes"];
    const requestedCount = Math.min(20, Math.max(1, Number(body.count) || 10));
    const difficultyMin = Math.min(5, Math.max(1, Number(body.difficulty_min) || 1));
    const difficultyMax = Math.min(5, Math.max(1, Number(body.difficulty_max) || 5));
    const wantExercises = contentTypes.includes("exercises");
    const wantQuizzes = contentTypes.includes("quizzes");

    // shared-token gate for batch scripts, otherwise require a logged-in pedago/admin user.
    // No insecure fallback: if BULK_GEN_TOKEN isn't set, the token path is disabled and
    // every caller must go through the JWT + role check below.
    const expectedToken = Deno.env.get("BULK_GEN_TOKEN") || "";
    if (!lesson_id || !chapter_id) {
      return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SERVICE_ROLE, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    let callerUserId: string | null = null;
    let callerRoleGroup: "admin" | "pedago" = "admin";

    if (!expectedToken || !shared_token || shared_token !== expectedToken) {
      const { data: authData } = await publicClient.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: isAllowed, error: roleError } = await admin.rpc("has_role", { _user_id: userId, _role: "pedago" });
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (roleError || (!isAllowed && !isAdmin)) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      callerUserId = userId;
      callerRoleGroup = isAdmin ? "admin" : "pedago";
    }

    let chapterTitle = chapter_title_ar || "الفصل";
    let lessonTitleAr = lesson_title_ar;
    let lessonTitleFr = lesson_title_fr || "";
    if (!lessonTitleAr || !chapter_title_ar) {
      const [{ data: chapterData }, { data: lessonData }] = await Promise.all([
        admin.from("chapters").select("title, title_ar").eq("id", chapter_id).maybeSingle(),
        admin.from("lessons").select("title, title_ar").eq("id", lesson_id).maybeSingle(),
      ]);
      chapterTitle = chapter_title_ar || (chapterData as any)?.title_ar || (chapterData as any)?.title || "الفصل";
      lessonTitleAr = lessonTitleAr || (lessonData as any)?.title_ar || (lessonData as any)?.title || "الدرس";
      lessonTitleFr = lessonTitleFr || (lessonData as any)?.title || "";
    }

    const exerciseBatches = wantExercises ? buildBatches(sections, requestedCount, difficultyMin, difficultyMax) : [];
    const quizBatches = wantQuizzes ? buildBatches(sections, requestedCount, difficultyMin, difficultyMax) : [];
    const totalExercisesWanted = exerciseBatches.reduce((s, b) => s + b.count, 0);
    const totalQuizzesWanted = quizBatches.reduce((s, b) => s + b.count, 0);

    const userPrompt = buildUserPrompt(chapterTitle, lessonTitleAr, lessonTitleFr, exerciseBatches, quizBatches);

    let parsed: any = null;
    let usage: GeminiUsage | null = null;
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await callGemini(SYSTEM_PROMPT, userPrompt);
        parsed = result.parsed;
        usage = result.usage;
        const exOk = !wantExercises || parsed?.exercises?.length;
        const qzOk = !wantQuizzes || parsed?.quizzes?.length;
        if (exOk && qzOk) break;
        lastErr = "missing fields";
      } catch (e: any) {
        lastErr = e.message;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }

    // Log de consommation IA seulement si l'appel Gemini a réellement abouti.
    if (usage) {
      logTokenUsageAsync({
        supabaseUrl: SUPABASE_URL, serviceRoleKey: SERVICE_ROLE, userId: callerUserId, roleGroup: callerRoleGroup,
        functionName: "bulk-gen-terminale-gemini",
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      });
    }

    if ((wantExercises && !parsed?.exercises) || (wantQuizzes && !parsed?.quizzes)) {
      return new Response(JSON.stringify({ error: `generation failed: ${lastErr}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // "Remplacer" ne supprime que les types de contenu réellement demandés
    // (générer seulement des exercices ne doit pas effacer les quiz existants).
    if (replace) {
      if (wantExercises) await admin.from("chapter_exercises").delete().eq("lesson_id", lesson_id);
      if (wantQuizzes) await admin.from("chapter_quizzes").delete().eq("lesson_id", lesson_id);
    }

    let startExerciseOrder = 1;
    let startQuizOrder = 1;
    if (!replace) {
      const [{ data: lastExercise }, { data: lastQuiz }] = await Promise.all([
        admin.from("chapter_exercises").select("order_index").eq("lesson_id", lesson_id).order("order_index", { ascending: false }).limit(1).maybeSingle(),
        admin.from("chapter_quizzes").select("order_index").eq("lesson_id", lesson_id).order("order_index", { ascending: false }).limit(1).maybeSingle(),
      ]);
      startExerciseOrder = Number((lastExercise as any)?.order_index || 0) + 1;
      startQuizOrder = Number((lastQuiz as any)?.order_index || 0) + 1;
    }

    const exercisesToInsert = wantExercises ? (parsed.exercises || []).slice(0, totalExercisesWanted).map((ex: any, i: number) => ({
      chapter_id, lesson_id,
      title: String(ex.title ?? `تمرين ${i + 1}`).slice(0, 300),
      statement: String(ex.statement ?? ""),
      expected_answer: String(ex.expected_answer ?? ""),
      accepted_answers: Array.isArray(ex.accepted_answers) ? ex.accepted_answers.map(String) : [],
      solution: String(ex.solution ?? ""),
      hint: String(ex.hint ?? ""),
      difficulty: Math.min(5, Math.max(1, Number(ex.difficulty) || 2)),
      order_index: startExerciseOrder + i,
    })) : [];

    const quizzesToInsert = wantQuizzes ? (parsed.quizzes || []).slice(0, totalQuizzesWanted).map((q: any, i: number) => ({
      chapter_id, lesson_id,
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correct_answer: String(q.correct_answer ?? ""),
      explanation: String(q.explanation ?? ""),
      hint: String(q.hint ?? ""),
      difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 2)),
      order_index: startQuizOrder + i,
    })) : [];

    if (exercisesToInsert.length) {
      const { error: exErr } = await admin.from("chapter_exercises").insert(exercisesToInsert);
      if (exErr) throw new Error(`insert exercises: ${exErr.message}`);
    }
    if (quizzesToInsert.length) {
      const { error: qzErr } = await admin.from("chapter_quizzes").insert(quizzesToInsert);
      if (qzErr) throw new Error(`insert quizzes: ${qzErr.message}`);
    }

    return new Response(JSON.stringify({
      ok: true, lesson_id,
      inserted_exercises: exercisesToInsert.length,
      inserted_quizzes: quizzesToInsert.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
