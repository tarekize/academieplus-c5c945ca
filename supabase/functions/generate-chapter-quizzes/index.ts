import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { logTokenUsageAsync, resolveCallerRoleGroup } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratedQuiz {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  hint: string;
  difficulty: number;
}

interface GeneratedExercise {
  title: string;
  statement: string;
  expected_answer: string;
  hint: string;
  solution: string;
  difficulty: number;
}

type AIProvider = {
  name: string;
  call: (systemPrompt: string, userPrompt: string) => Promise<string>;
};

function cleanGeneratedJson(rawContent: string): string {
  let cleanedContent = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const jsonMatch = cleanedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) cleanedContent = jsonMatch[0];

  // AI providers often return LaTeX with single backslashes inside JSON strings
  // (e.g. "\lim", "\frac", "\{", "\uparrow"), which is invalid JSON.
  return cleanedContent.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
}

function normalizeText(value: string | null | undefined): string {
  return (value || "").replace(/\\n/g, "\n").trim();
}

function parseGeneratedArray<T>(content: string): T[] {
  const cleaned = cleanGeneratedJson(content);
  try {
    return JSON.parse(cleaned) as T[];
  } catch {
    const withoutLatexBackslashes = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "");
    return JSON.parse(withoutLatexBackslashes) as T[];
  }
}

// ============ Provider 0: Lovable AI ============
async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    throw new Error(`Lovable AI failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

// ============ Provider 1: Google Gemini (1ère clé) ============
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  return callGeminiWithKey(GEMINI_API_KEY, "Gemini", systemPrompt, userPrompt);
}

// ============ Provider 2: Groq ============
async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq error:", response.status, errText);
    throw new Error(`Groq failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

// ============ Provider 3: Google Gemini (2e clé / fallback) ============
async function callGemini2(systemPrompt: string, userPrompt: string): Promise<string> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  return callGeminiWithKey(GEMINI_API_KEY_2, "Gemini2", systemPrompt, userPrompt);
}

async function callGeminiWithKey(apiKey: string, label: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError = `${label} unavailable`;
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.55, maxOutputTokens: 12000 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";
    }
    const errText = await response.text();
    console.error(`${label} ${model} error:`, response.status, errText);
    lastError = `${label} API failed: ${response.status}`;
  }
  throw new Error(lastError);
}

// ============ Unified AI generation with fallback ============
async function generateWithAI(
  systemPrompt: string,
  userPrompt: string,
  validateJson?: (content: string) => void
): Promise<string> {
  const providers: AIProvider[] = [
    { name: "Gemini key 2", call: callGemini2 },
  ];
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name} for content generation...`);
      const content = await provider.call(systemPrompt, userPrompt);
      if (!content.trim()) throw new Error("Empty AI response");
      if (validateJson) validateJson(content);
      console.log(`${provider.name} succeeded.`);
      return content;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${provider.name}: ${message}`);
      console.error(`${provider.name} failed, trying next provider...`, e);
    }
  }

  throw new Error(`⚠️ جميع خدمات الذكاء الاصطناعي غير متاحة أو أعطت JSON غير صالح. التفاصيل: ${errors.join(" | ")}`);
}

async function generateQuizzes(
  chapterTitle: string,
  lessonTitle: string
): Promise<GeneratedQuiz[]> {
  const systemPrompt = `أنت معلم رياضيات جزائري خبير لشعبة العلوم في الثانوية. مهمتك توليد أسئلة اختبار ذكية (QCM) باللغة العربية مع تلميحات (hints) مفيدة. الرد فقط بمصفوفة JSON صحيحة، بدون أي نص خارج JSON.`;

  const userPrompt = `
ولّد 5 أسئلة اختبار متعددة الاختيار حول درس "${lessonTitle}" من فصل "${chapterTitle}".

صيغة JSON المطلوبة (مصفوفة بـ 5 كائنات بالضبط):
[
  {
    "question": "نص السؤال بالعربية (يمكن استعمال LaTeX داخل $...$ أو $$...$$)",
    "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
    "correct_answer": "النص الكامل للخيار الصحيح (مطابق تماماً لأحد options)",
    "explanation": "شرح مفصل للحل الصحيح بالعربية، مع خطوات رياضية واضحة (LaTeX)",
    "hint": "💡 تلميح ذكي يوجّه الطالب نحو الحل دون كشفه (1-2 جملة بالعربية)",
    "difficulty": 2
  }
]

شروط مهمة:
- "difficulty" قيمة من 1 إلى 5
- جميع النصوص بالعربية فقط
- استعمل LaTeX للصيغ الرياضية: $\\lim_{x\\to 0}$, $\\frac{a}{b}$, $\\sqrt{x}$ ...
- "hint" يجب أن يعطي توجيهاً (مثلاً: "فكّر في تحليل البسط كفرق مربعين") وليس الإجابة
- نوّع الصعوبة بين الأسئلة الـ5
- ⚠️ الرد JSON فقط، بدون \`\`\`json أو أي نص آخر`;

  const validateQuizzes = (content: string) => {
    const parsed = parseGeneratedArray<GeneratedQuiz>(content);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid quizzes array");
  };

  const rawContent = await generateWithAI(systemPrompt, userPrompt, validateQuizzes);

  try {
    const quizzes = parseGeneratedArray<GeneratedQuiz>(rawContent);
    return quizzes.filter(q => 
      q.question && q.options && Array.isArray(q.options) && 
      q.correct_answer && q.explanation && typeof q.difficulty === 'number'
    ).slice(0, 5).map(q => ({
      ...q,
      question: normalizeText(q.question),
      options: q.options.map(option => normalizeText(option)),
      correct_answer: normalizeText(q.correct_answer),
      explanation: normalizeText(q.explanation),
      hint: normalizeText(q.hint),
    }));
  } catch (parseError) {
    console.error("Failed to parse quizzes JSON after all providers:", parseError, "Raw:", rawContent.substring(0, 500));
    throw new Error(`Failed to parse generated quizzes: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
  }
}

async function generateExercises(
  chapterTitle: string,
  lessonTitle: string
): Promise<GeneratedExercise[]> {
  const systemPrompt = `أنت معلم رياضيات جزائري خبير لشعبة العلوم في الثانوية. مهمتك توليد تمارين رياضية باللغة العربية مع حلول مفصلة جداً وتلميحات. الرد فقط بمصفوفة JSON صحيحة، بدون أي نص خارج JSON.`;

  const userPrompt = `
ولّد 5 تمارين حول درس "${lessonTitle}" من فصل "${chapterTitle}".

صيغة JSON المطلوبة (مصفوفة بـ 5 كائنات بالضبط):
[
  {
    "title": "عنوان قصير جذاب بالعربية",
    "statement": "نص التمرين كامل بالعربية مع LaTeX للصيغ ($...$ أو $$...$$)",
    "expected_answer": "الإجابة النهائية (قيمة أو تعبير قصير)",
    "hint": "💡 تلميح ذكي يوجّه الطالب نحو الطريقة الصحيحة دون كشف الحل (1-2 جملة)",
    "solution": "حل مفصل جداً بصيغة Markdown + LaTeX (انظر الصيغة أدناه)",
    "difficulty": 2
  }
]

📐 صيغة الحل المطلوبة (يجب احترامها بدقة - استعمل \\\\n للأسطر الجديدة في JSON):

## 🎯 الحل المفصل

### 📌 الخطوة 1: تحليل المعطيات
شرح واضح للمعطيات والمطلوب.

### 📌 الخطوة 2: اختيار الطريقة المناسبة
لماذا هذه الطريقة وكيف نطبقها مع الصيغة الرياضية:
$$\\\\text{الصيغة} = ...$$

### 📌 الخطوة 3: الحساب التفصيلي
كل عملية حسابية مع شرحها:
$$\\\\lim_{x \\\\to a} f(x) = ...$$

### 📌 الخطوة 4: التحقق
نتأكد من النتيجة بطريقة بديلة أو منطقياً.

### ✅ النتيجة النهائية
$$\\\\boxed{\\\\text{النتيجة}}$$

> 💡 **ملاحظة:** نصيحة أو تذكير بقاعدة مفيدة.

⚠️ شروط إلزامية:
- "difficulty" قيمة من 1 إلى 5
- جميع النصوص بالعربية
- استعمل \\\\boxed{} وليس boxed{} (الـ backslash مهم!)
- LaTeX داخل $$...$$ للصيغ المنفصلة و $...$ للصيغ داخل النص
- الحل يجب أن يحتوي على 3 خطوات على الأقل + نتيجة في \\\\boxed{}
- التمارين متنوعة الصعوبة وحصراً حول "${lessonTitle}"
- ⚠️ الرد JSON فقط، بدون \`\`\`json أو أي نص آخر`;

  const validateExercises = (content: string) => {
    const parsed = parseGeneratedArray<GeneratedExercise>(content);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid exercises array");
  };

  const rawContent = await generateWithAI(systemPrompt, userPrompt, validateExercises);

  try {
    const exercises = parseGeneratedArray<GeneratedExercise>(rawContent);
    
    // Validate exercises have required fields
    return exercises.filter(e => 
      e.title && e.statement && e.expected_answer && 
      e.hint && e.solution && typeof e.difficulty === 'number'
    ).slice(0, 5).map(e => ({
      ...e,
      title: normalizeText(e.title),
      statement: normalizeText(e.statement),
      expected_answer: normalizeText(e.expected_answer),
      hint: normalizeText(e.hint),
      solution: normalizeText(e.solution),
    }));
  } catch (parseError) {
    console.error("Failed to parse exercises JSON after all providers:", parseError);
    throw new Error(`Failed to parse generated exercises: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapter_id, lesson_id } = await req.json();

    if (!chapter_id) {
      return new Response(
        JSON.stringify({ error: "chapter_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch chapter and lesson information
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("title")
      .eq("id", chapter_id)
      .single();

    if (chapterError || !chapterData) {
      throw new Error("Chapter not found");
    }

    const chapterTitle = (chapterData as any).title || "الفصل";

    // If lesson_id is provided, fetch lesson title
    let lessonTitle = "الدرس";
    if (lesson_id) {
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("title_ar, title")
        .eq("id", lesson_id)
        .single();

      if (!lessonError && lessonData) {
        lessonTitle = (lessonData as any).title_ar || (lessonData as any).title || "الدرس";
      }
    }

    console.log(`Generating for chapter: ${chapterTitle}, lesson: ${lessonTitle}`);

    const tokenSupabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const tokenServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    resolveCallerRoleGroup(tokenSupabaseUrl, tokenServiceRoleKey, req.headers.get("Authorization")).then(({ userId, roleGroup }) => {
      logTokenUsageAsync({ supabaseUrl: tokenSupabaseUrl, serviceRoleKey: tokenServiceRoleKey, userId, roleGroup, functionName: "generate-chapter-quizzes", inputText: `${chapterTitle}\n${lessonTitle}` });
    });

    // Generate sequentially to avoid provider rate limits (especially Groq/Gemini) when fallbacks are used
    const quizzes = await generateQuizzes(chapterTitle, lessonTitle);
    const exercises = await generateExercises(chapterTitle, lessonTitle);

    // Calculate current max order_index for quizzes
    let startQuizOrder = 1;
    let quizQuery = supabase.from("chapter_quizzes").select("order_index").eq("chapter_id", chapter_id);
    
    // Modification ici : on gère le cas lesson_id précisément
    if (lesson_id) {
      quizQuery = quizQuery.eq("lesson_id", lesson_id);
    } else {
      quizQuery = quizQuery.is("lesson_id", null);
    }
    
    const { data: quizData, error: maxQuizError } = await quizQuery.order("order_index", { ascending: false }).limit(1);
    
    if (maxQuizError) {
      console.error("Error fetching max quiz order:", maxQuizError);
    }
    
    const maxQuiz = quizData?.[0];
    if (maxQuiz && typeof maxQuiz.order_index === "number") {
      startQuizOrder = maxQuiz.order_index + 1;
    }

    console.log(`Starting quiz order from: ${startQuizOrder}`);

    // Insert quizzes into database
    let quizCount = 0;
    if (quizzes && quizzes.length > 0) {
      const quizInsertData = quizzes.map((quiz, index) => ({
        chapter_id,
        lesson_id: lesson_id || null,
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.correct_answer,
        explanation: quiz.explanation,
        hint: quiz.hint || null,
        difficulty: quiz.difficulty || 2,
        order_index: startQuizOrder + index,
      }));

      const { error: quizError, data: insertedQuizzes } = await supabase
        .from("chapter_quizzes")
        .insert(quizInsertData)
        .select();

      if (quizError) {
        console.error("Quiz insert error details:", JSON.stringify(quizError));
        throw new Error(`Failed to insert quizzes: ${quizError.message}`);
      }

      quizCount = insertedQuizzes?.length || 0;
    }

    // Calculate current max order_index for exercises
    let startExerciseOrder = 1;
    let exerciseQuery = supabase.from("chapter_exercises").select("order_index").eq("chapter_id", chapter_id);
    
    if (lesson_id) {
      exerciseQuery = exerciseQuery.eq("lesson_id", lesson_id);
    } else {
      exerciseQuery = exerciseQuery.is("lesson_id", null);
    }
    
    const { data: exData, error: maxExError } = await exerciseQuery.order("order_index", { ascending: false }).limit(1);
    
    if (maxExError) {
      console.error("Error fetching max exercise order:", maxExError);
    }

    const maxExercise = exData?.[0];
    if (maxExercise && typeof maxExercise.order_index === "number") {
      startExerciseOrder = maxExercise.order_index + 1;
    }
    
    console.log(`Starting exercise order from: ${startExerciseOrder}`);

    // Insert exercises into database
    let exerciseCount = 0;
    if (exercises && exercises.length > 0) {
      const exerciseInsertData = exercises.map((exercise, index) => ({
        chapter_id,
        lesson_id: lesson_id || null,
        title: exercise.title,
        statement: exercise.statement,
        expected_answer: exercise.expected_answer,
        accepted_answers: [], 
        solution: exercise.solution,
        difficulty: exercise.difficulty || 2,
        hint: exercise.hint,
        order_index: startExerciseOrder + index,
      }));

      const { error: exerciseError, data: insertedExercises } = await supabase
        .from("chapter_exercises")
        .insert(exerciseInsertData)
        .select();

      if (exerciseError) {
        console.error("Exercise insert error details:", JSON.stringify(exerciseError));
        throw new Error(`Failed to insert exercises: ${exerciseError.message}`);
      }

      exerciseCount = insertedExercises?.length || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        quizzes: quizCount,
        exercises: exerciseCount,
        message: `تم إنشاء ${quizCount} أسئلة و ${exerciseCount} تمارين بنجاح`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
