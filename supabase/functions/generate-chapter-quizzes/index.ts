import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const levelMap: Record<string, string> = {
  "5eme_primaire": "الخامسة ابتدائي",
  "1ere_cem": "الأولى متوسط",
  "2eme_cem": "الثانية متوسط",
  "3eme_cem": "الثالثة متوسط",
  "4eme_cem": "الرابعة متوسط",
  "premiere": "الأولى ثانوي",
  "seconde": "الثانية ثانوي",
  "terminale": "الثالثة ثانوي (البكالوريا)",
};

async function generateQuizzes(chapterTitle: string, schoolLevel: string): Promise<any[]> {
  const levelAr = levelMap[schoolLevel] || schoolLevel;

  const prompt = `أنت أستاذ رياضيات جزائري. أنشئ 5 أسئلة اختيار من متعدد (QCM) باللغة العربية لمستوى ${levelAr}.

الفصل: ${chapterTitle}

لكل سؤال، أنشئ كائن JSON يحتوي على:
- "question": نص السؤال بالعربية
- "options": مصفوفة من 4 خيارات بالعربية
- "correct_answer": الإجابة الصحيحة (يجب أن تكون أحد الخيارات بالضبط)
- "explanation": شرح مختصر بالعربية

أجب فقط بمصفوفة JSON صالحة بدون أي نص إضافي.
مثال: [{"question":"...","options":["أ","ب","ج","د"],"correct_answer":"أ","explanation":"..."}]`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    }),
  });

  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  const data = await res.json();
  let content = data.choices?.[0]?.message?.content || "[]";
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(content);
}

async function generateExercises(chapterTitle: string, schoolLevel: string): Promise<any[]> {
  const levelAr = levelMap[schoolLevel] || schoolLevel;

  const prompt = `أنت أستاذ رياضيات جزائري. أنشئ 5 تمارين رياضية باللغة العربية لمستوى ${levelAr}.

الفصل: ${chapterTitle}

لكل تمرين، أنشئ كائن JSON يحتوي على:
- "title": عنوان التمرين بالعربية
- "statement": نص التمرين بالعربية (يمكن أن يكون متعدد الأسطر)
- "expected_answer": الإجابة المتوقعة بالعربية
- "accepted_answers": مصفوفة من الإجابات المقبولة (صيغ مختلفة)
- "solution": الحل المفصل خطوة بخطوة بالعربية

أجب فقط بمصفوفة JSON صالحة بدون أي نص إضافي.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    }),
  });

  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  const data = await res.json();
  let content = data.choices?.[0]?.message?.content || "[]";
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(content);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapter_id, school_level, batch_mode } = await req.json();

    // Single chapter mode
    if (chapter_id) {
      const { data: chapter, error: cErr } = await supabase
        .from("chapters")
        .select("id, title, title_ar, school_level")
        .eq("id", chapter_id)
        .single();
      if (cErr || !chapter) throw new Error(cErr?.message || "Chapter not found");

      const chapterTitle = chapter.title_ar || chapter.title;

      // Generate quizzes
      const quizzes = await generateQuizzes(chapterTitle, chapter.school_level);
      for (let i = 0; i < quizzes.length; i++) {
        const q = quizzes[i];
        await supabase.from("chapter_quizzes").insert({
          chapter_id: chapter.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || "",
          order_index: i,
        });
      }

      // Generate exercises
      const exercises = await generateExercises(chapterTitle, chapter.school_level);
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await supabase.from("chapter_exercises").insert({
          chapter_id: chapter.id,
          title: ex.title,
          statement: ex.statement,
          expected_answer: ex.expected_answer,
          accepted_answers: ex.accepted_answers || [],
          solution: ex.solution,
          order_index: i,
        });
      }

      return new Response(JSON.stringify({ success: true, quizzes: quizzes.length, exercises: exercises.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode: generate for all chapters that don't have quizzes yet
    let query = supabase.from("chapters").select("id, title, title_ar, school_level");
    if (school_level) {
      query = query.eq("school_level", school_level);
    }
    const { data: chapters, error } = await query.order("school_level").order("order_index");
    if (error) throw error;

    const results: { id: string; title: string; status: string }[] = [];

    for (const ch of chapters || []) {
      // Check if already has quizzes
      const { count } = await supabase
        .from("chapter_quizzes")
        .select("id", { count: "exact", head: true })
        .eq("chapter_id", ch.id);

      if ((count || 0) > 0) {
        results.push({ id: ch.id, title: ch.title, status: "skipped" });
        continue;
      }

      try {
        const chapterTitle = ch.title_ar || ch.title;
        
        const quizzes = await generateQuizzes(chapterTitle, ch.school_level);
        for (let i = 0; i < quizzes.length; i++) {
          await supabase.from("chapter_quizzes").insert({
            chapter_id: ch.id,
            question: quizzes[i].question,
            options: quizzes[i].options,
            correct_answer: quizzes[i].correct_answer,
            explanation: quizzes[i].explanation || "",
            order_index: i,
          });
        }

        const exercises = await generateExercises(chapterTitle, ch.school_level);
        for (let i = 0; i < exercises.length; i++) {
          await supabase.from("chapter_exercises").insert({
            chapter_id: ch.id,
            title: exercises[i].title,
            statement: exercises[i].statement,
            expected_answer: exercises[i].expected_answer,
            accepted_answers: exercises[i].accepted_answers || [],
            solution: exercises[i].solution,
            order_index: i,
          });
        }

        results.push({ id: ch.id, title: ch.title, status: "success" });
      } catch (err: any) {
        console.error(`Failed for chapter ${ch.id}:`, err.message);
        results.push({ id: ch.id, title: ch.title, status: `error: ${err.message}` });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
