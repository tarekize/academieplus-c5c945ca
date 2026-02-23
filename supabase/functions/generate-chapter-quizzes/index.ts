import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
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

async function callGemini(prompt: string, apiKey: string) {
  const model = "gemini-1.5-flash-8b"; // Modèle qui a fonctionné pour l'utilisateur
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini API: ${data.error?.message}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateQuizzes(chapterTitle: string, schoolLevel: string): Promise<any[]> {
  const levelAr = levelMap[schoolLevel] || schoolLevel;
  const prompt = `أنت أستاذ رياضيات جزائري. أنشئ 5 أسئلة اختيار من متعدد (QCM) باللغة العربية لمستوى ${levelAr}.
الفصل: ${chapterTitle}
أجب فقط بمصفوفة JSON صالحة:
[{"question":"...","options":["أ","ب","ج","د"],"correct_answer":"الإجابة","explanation":"..."}]`;

  let content = await callGemini(prompt, GEMINI_API_KEY!);
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

async function generateExercises(chapterTitle: string, schoolLevel: string): Promise<any[]> {
  const levelAr = levelMap[schoolLevel] || schoolLevel;
  const prompt = `أنت أستاذ رياضيات جزائري. أنشئ 5 تمارين رياضية باللغة العربية لمستوى ${levelAr}.
الفصل: ${chapterTitle}
أجب بمصفوفة JSON صالحة تحتوي على: title, statement, expected_answer, accepted_answers, solution.`;

  let content = await callGemini(prompt, GEMINI_API_KEY!);
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { chapter_id, school_level } = await req.json();
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    if (chapter_id) {
      const { data: chapter } = await supabase.from("chapters").select("*").eq("id", chapter_id).single();
      if (!chapter) throw new Error("Chapter not found");

      const chapterTitle = chapter.title_ar || chapter.title;
      const quizzes = await generateQuizzes(chapterTitle, chapter.school_level);

      // On insère par lots
      const quizInserts = quizzes.map((q, i) => ({
        chapter_id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || "",
        order_index: i
      }));
      await supabase.from("chapter_quizzes").insert(quizInserts);

      const exercises = await generateExercises(chapterTitle, chapter.school_level);
      const exInserts = exercises.map((ex, i) => ({
        chapter_id,
        title: ex.title,
        statement: ex.statement,
        expected_answer: ex.expected_answer,
        accepted_answers: ex.accepted_answers || [],
        solution: ex.solution,
        order_index: i
      }));
      await supabase.from("chapter_exercises").insert(exInserts);

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Missing chapter_id" }), { status: 400, headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
