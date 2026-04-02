import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

async function callOpenRouterAI(prompt: string, systemPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://academieplus.app",
      "X-Title": "AcademiePlus",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Limite de requêtes dépassée, réessayez plus tard.");
    if (response.status === 402) throw new Error("Crédits épuisés.");
    const t = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${t}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

async function generateQuizzes(chapterTitle: string, schoolLevel: string, apiKey: string): Promise<any[]> {
  const levelAr = levelMap[schoolLevel] || schoolLevel;
  const prompt = `أنت أستاذ رياضيات جزائري. أنشئ 5 أسئلة اختيار من متعدد (QCM) باللغة العربية لمستوى ${levelAr}.
الفصل: ${chapterTitle}
أجب فقط بمصفوفة JSON صالحة:
[{"question":"...","options":["أ","ب","ج","د"],"correct_answer":"الإجابة","explanation":"..."}]`;

  let content = await callOpenRouterAI(prompt, "You are an expert Algerian math teacher. Always respond with valid JSON arrays only.", apiKey);
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

async function generateExercises(chapterTitle: string, schoolLevel: string, apiKey: string): Promise<any[]> {
  const levelAr = levelMap[schoolLevel] || schoolLevel;
  const prompt = `أنت أستاذ رياضيات جزائري. أنشئ 5 تمارين رياضية باللغة العربية لمستوى ${levelAr}.
الفصل: ${chapterTitle}
أجب بمصفوفة JSON صالحة تحتوي على: title, statement, expected_answer, accepted_answers, solution.`;

  let content = await callOpenRouterAI(prompt, "You are an expert Algerian math teacher. Always respond with valid JSON arrays only.", apiKey);
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { chapter_id, lesson_id } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (chapter_id) {
      const { data: chapter } = await supabase.from("chapters").select("*").eq("id", chapter_id).single();
      if (!chapter) throw new Error("Chapter not found");

      let generationTitle = chapter.title_ar || chapter.title;
      if (lesson_id) {
        const { data: lesson } = await supabase
          .from("lessons")
          .select("id, title, title_ar")
          .eq("id", lesson_id)
          .eq("chapter_id", chapter_id)
          .maybeSingle();

        if (!lesson) {
          throw new Error("Lesson not found in chapter");
        }

        generationTitle = lesson.title_ar || lesson.title;
      }

      const quizzes = await generateQuizzes(generationTitle, chapter.school_level, OPENROUTER_API_KEY);

      const quizInserts = quizzes.map((q, i) => ({
        chapter_id,
        lesson_id: lesson_id || null,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || "",
        order_index: i
      }));
      await supabase.from("chapter_quizzes").insert(quizInserts);

      const exercises = await generateExercises(generationTitle, chapter.school_level, OPENROUTER_API_KEY);
      const exInserts = exercises.map((ex, i) => ({
        chapter_id,
        lesson_id: lesson_id || null,
        title: ex.title,
        statement: ex.statement,
        expected_answer: ex.expected_answer,
        accepted_answers: ex.accepted_answers || [],
        solution: ex.solution,
        order_index: i
      }));
      await supabase.from("chapter_exercises").insert(exInserts);

      return new Response(
        JSON.stringify({ success: true, quizzes: quizInserts.length, exercises: exInserts.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Missing chapter_id" }), { status: 400, headers: corsHeaders });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
