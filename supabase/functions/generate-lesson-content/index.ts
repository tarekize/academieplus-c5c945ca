import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateContent(lessonTitle: string, chapterTitle: string, schoolLevel: string): Promise<string> {
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

  const levelAr = levelMap[schoolLevel] || schoolLevel;

  const prompt = `أنت أستاذ رياضيات جزائري. اكتب محتوى درس رياضيات باللغة العربية بصيغة HTML لمستوى ${levelAr}.

الفصل: ${chapterTitle}
الدرس: ${lessonTitle}

اكتب درسًا كاملًا يتضمن:
1. <h2> عنوان الدرس </h2>
2. <h3>التعريف</h3> مع شرح واضح للمفهوم
3. <h3>القاعدة</h3> مع القواعد الرياضية الأساسية
4. <h3>أمثلة محلولة</h3> مع 2-3 أمثلة مفصلة خطوة بخطوة
5. <h3>تمارين تطبيقية</h3> مع 2-3 تمارين للتدريب

القواعد:
- استخدم HTML فقط (h2, h3, p, ul, li, ol, strong, em)
- اكتب بلغة عربية فصحى واضحة ومبسطة تناسب المستوى الدراسي
- المحتوى يجب أن يكون دقيقًا علميًا ومتوافقًا مع المنهاج الجزائري
- لا تستخدم LaTeX، اكتب الصيغ الرياضية بنص عادي
- أضف dir="rtl" للعنصر الأول فقط
- لا تضف أي نص تقديمي أو تعليق خارج HTML

ابدأ مباشرة بـ <div dir="rtl">`;

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content || "";
  
  // Clean up markdown code blocks if present
  content = content.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
  
  return content;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batch_size = 10, offset = 0, school_level, lesson_id } = await req.json();

    // Single lesson mode
    if (lesson_id) {
      const { data: lesson, error: lErr } = await supabase
        .from("lessons")
        .select("id, title, title_ar, chapters!inner(title, title_ar, school_level)")
        .eq("id", lesson_id)
        .single();
      if (lErr || !lesson) throw new Error(lErr?.message || "Lesson not found");

      const chapter = lesson.chapters as any;
      const content = await generateContent(
        lesson.title_ar || lesson.title,
        chapter.title_ar || chapter.title,
        chapter.school_level
      );

      const { error: uErr } = await supabase.from("lessons").update({ content }).eq("id", lesson_id);
      if (uErr) throw uErr;

      return new Response(JSON.stringify({ success: true, lesson_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode - Get lessons without content
    let query = supabase
      .from("lessons")
      .select(`
        id, title, title_ar, content,
        chapters!inner(title, title_ar, school_level)
      `)
      .or("content.is.null,content.eq.")
      .range(offset, offset + batch_size - 1)
      .order("id");

    if (school_level) {
      query = query.eq("chapters.school_level", school_level);
    }

    const { data: lessons, error } = await query;
    if (error) throw error;

    if (!lessons || lessons.length === 0) {
      return new Response(JSON.stringify({ message: "No more lessons to process", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; status: string }[] = [];

    for (const lesson of lessons) {
      const chapter = lesson.chapters as any;
      try {
        const content = await generateContent(
          lesson.title_ar || lesson.title,
          chapter.title_ar || chapter.title,
          chapter.school_level
        );

        const { error: updateError } = await supabase
          .from("lessons")
          .update({ content })
          .eq("id", lesson.id);

        if (updateError) throw updateError;
        results.push({ id: lesson.id, status: "success" });
      } catch (err: any) {
        console.error(`Failed for lesson ${lesson.id}:`, err.message);
        results.push({ id: lesson.id, status: `error: ${err.message}` });
      }
    }

    // Count remaining
    const { count } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .or("content.is.null,content.eq.");

    return new Response(JSON.stringify({ 
      processed: results.length, 
      results,
      remaining: count || 0,
      next_offset: offset + batch_size 
    }), {
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
