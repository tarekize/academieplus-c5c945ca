import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini error:", response.status, errText);
    throw new Error(`Gemini API failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY_2}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini2 error:", response.status, errText);
    throw new Error(`Gemini2 API failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ============ Unified AI generation with fallback ============
async function generateWithAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // Provider 0: Lovable AI
  try {
    console.log("Trying Lovable AI for content generation...");
    return await callLovableAI(systemPrompt, userPrompt);
  } catch (e) {
    console.error("Lovable AI failed, trying Gemini...", e);
  }

  // Provider 1: Gemini (1ère clé)
  try {
    console.log("Trying Gemini (key 1)...");
    return await callGemini(systemPrompt, userPrompt);
  } catch (e) {
    console.error("Gemini failed, trying Groq...", e);
  }

  // Provider 2: Groq
  try {
    console.log("Trying Groq...");
    return await callGroq(systemPrompt, userPrompt);
  } catch (e) {
    console.error("Groq failed, trying Gemini (key 2)...", e);
  }

  // Provider 3: Gemini (2e clé) - last resort
  let lastError: any = null;
  try {
    console.log("Trying Gemini (key 2)...");
    return await callGemini2(systemPrompt, userPrompt);
  } catch (e) {
    console.error("Gemini2 failed:", e);
    lastError = e;
  }

  const msg = lastError?.message || "";
  if (msg.includes("402") || msg.toLowerCase().includes("credit")) {
    throw new Error("⚠️ رصيد Lovable AI نفد. يرجى إضافة رصيد من إعدادات المساحة (Workspace > Usage) أو الانتظار قليلاً.");
  }
  if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
    throw new Error("⚠️ تم تجاوز الحد المسموح به للطلبات. يرجى الانتظار دقيقة والمحاولة مرة أخرى.");
  }
  throw new Error("⚠️ جميع خدمات الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً.");
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

  const rawContent = await generateWithAI(systemPrompt, userPrompt);
  
  let cleanedContent = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const jsonMatch = cleanedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) {
    cleanedContent = jsonMatch[0];
  }

  try {
    const quizzes = JSON.parse(cleanedContent) as GeneratedQuiz[];
    return quizzes.filter(q => 
      q.question && q.options && Array.isArray(q.options) && 
      q.correct_answer && q.explanation && typeof q.difficulty === 'number'
    ).slice(0, 5);
  } catch (parseError) {
    console.error("Failed to parse quizzes JSON:", parseError, "Raw:", rawContent.substring(0, 500));
    throw new Error(`Failed to parse generated quizzes: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
  }
}

async function generateExercises(
  chapterTitle: string,
  lessonTitle: string
): Promise<GeneratedExercise[]> {
  const systemPrompt = `أنت معلم رياضيات جزائري خبير. توليد تمارين رياضية باللغة العربية. الرد فقط بجدول JSON صحيح، بدون نص أو markdown حول.`;

  const userPrompt = `
توليد 5 تمارين حول درس "${lessonTitle}" من فصل "${chapterTitle}".

صيغة JSON المتوقعة (مصفوفة بـ 5 كائنات):
[
  {
    "title": "عنوان قصير باللغة العربية",
    "statement": "نص التمرين الكامل باللغة العربية",
    "expected_answer": "الإجابة المتوقعة (قيمة عددية أو تعبير قصير)",
    "hint": "💡 تلميح باللغة العربية",
    "solution": "الحل المفصل خطوة بخطوة باللغة العربية بصيغة markdown",
    "difficulty": 2
  }
]

صيغة الحل المتوقعة:
## 🎯 الحل المفصل

### 📌 الخطوة 1: وصف الخطوة
شرح الخطوة الأولى

### 📌 الخطوة 2: وصف الخطوة
شرح الخطوة الثانية

### ✅ النتيجة
$$\\boxed{النتيجة النهائية}$$

نقاط مهمة:
- كل "difficulty" هي قيمة من 1 إلى 5 (1=سهل جداً، 5=صعب جداً)
- جميع النصوص يجب أن تكون بالعربية
- التمارين يجب أن تكون حصراً حول "${lessonTitle}"
- متنوع الصعوبة بين التمارين الخمسة`;

  const rawContent = await generateWithAI(systemPrompt, userPrompt);
  
  // Clean up markdown code fences if present
  let cleanedContent = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // Try to extract JSON from text if it's wrapped
  const jsonMatch = cleanedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) {
    cleanedContent = jsonMatch[0];
  }

  try {
    const exercises = JSON.parse(cleanedContent) as GeneratedExercise[];
    
    // Validate exercises have required fields
    return exercises.filter(e => 
      e.title && e.statement && e.expected_answer && 
      e.hint && e.solution && typeof e.difficulty === 'number'
    ).slice(0, 5);
  } catch (parseError) {
    console.error("Failed to parse exercises JSON:", parseError);
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

    // Generate quizzes and exercises
    const [quizzes, exercises] = await Promise.all([
      generateQuizzes(chapterTitle, lessonTitle),
      generateExercises(chapterTitle, lessonTitle),
    ]);

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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
