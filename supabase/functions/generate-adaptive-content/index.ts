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

function getDifficultyLabel(level: number): string {
  if (level < 25) return "سهل جدًا (مبتدئ)";
  if (level < 40) return "سهل";
  if (level < 60) return "متوسط";
  if (level < 80) return "صعب";
  return "صعب جدًا (متقدم)";
}

async function callAI(prompt: string, systemPrompt: string, apiKey: string): Promise<string> {
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
    if (response.status === 429) throw new Error("Rate limit exceeded");
    if (response.status === 402) throw new Error("Credits exhausted");
    const t = await response.text();
    throw new Error(`AI error: ${response.status} ${t}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

function parseJSON(content: string): any[] {
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lesson_id, chapter_id, content_type, school_level, difficulty_level, lesson_title, chapter_title } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const levelAr = levelMap[school_level] || school_level;
    const diffLabel = getDifficultyLabel(difficulty_level || 50);
    const systemPrompt = "أنت أستاذ رياضيات جزائري خبير. أجب دائمًا بمصفوفة JSON صالحة فقط. لا تضف أي نص خارج JSON.";

    let prompt = "";
    
    if (content_type === "quiz") {
      prompt = `أنشئ 5 أسئلة اختيار من متعدد (QCM) باللغة العربية لمستوى ${levelAr}.
الدرس: ${lesson_title}
الفصل: ${chapter_title}
مستوى الصعوبة: ${diffLabel} (${difficulty_level}/100)

يجب أن تكون الأسئلة متناسبة مع مستوى الصعوبة المحدد.
إذا كان المستوى منخفضًا، اجعل الأسئلة أبسط مع شرح مفصل.
إذا كان المستوى عاليًا، اجعل الأسئلة أكثر تعقيدًا وتحديًا.

أجب بمصفوفة JSON فقط:
[{"question":"...","options":["أ","ب","ج","د"],"correct_answer":"الإجابة الصحيحة","explanation":"شرح مفصل"}]`;
    } else if (content_type === "exercise") {
      prompt = `أنشئ 5 تمارين رياضية باللغة العربية لمستوى ${levelAr}.
الدرس: ${lesson_title}
الفصل: ${chapter_title}
مستوى الصعوبة: ${diffLabel} (${difficulty_level}/100)

يجب أن تكون التمارين متناسبة مع مستوى الصعوبة.
إذا كان المستوى منخفضًا، استخدم تمارين تطبيقية مباشرة مع خطوات حل مفصلة.
إذا كان المستوى عاليًا، استخدم مسائل تحتاج تفكير وتحليل.

أجب بمصفوفة JSON فقط:
[{"title":"عنوان التمرين","statement":"نص التمرين","expected_answer":"الإجابة المتوقعة","hints":["تلميح 1","تلميح 2"],"solution":"الحل المفصل خطوة بخطوة"}]`;
    } else if (content_type === "revision") {
      prompt = `أنشئ 5 بطاقات مراجعة باللغة العربية لمستوى ${levelAr}.
الدرس: ${lesson_title}
الفصل: ${chapter_title}
مستوى الصعوبة: ${diffLabel} (${difficulty_level}/100)

كل بطاقة يجب أن تحتوي على مفهوم رئيسي وشرح مبسط ومثال.
إذا كان المستوى منخفضًا، ركز على المفاهيم الأساسية مع أمثلة بسيطة.
إذا كان المستوى عاليًا، أضف تفاصيل متقدمة وأمثلة معقدة.

أجب بمصفوفة JSON فقط:
[{"concept":"المفهوم","explanation":"شرح مفصل","example":"مثال توضيحي","key_formula":"الصيغة الرئيسية (إن وجدت)"}]`;
    }

    const content = await callAI(prompt, systemPrompt, OPENROUTER_API_KEY);
    const parsed = parseJSON(content);

    return new Response(JSON.stringify({ success: true, content: parsed, content_type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-adaptive-content error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
