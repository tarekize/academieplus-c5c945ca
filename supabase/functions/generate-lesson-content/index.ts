import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateForLesson(supabase: any, lessonId: string, API_KEY: string) {
  const { data: lesson } = await supabase.from("lessons").select("title, title_ar, chapter_id, content").eq("id", lessonId).single();
  if (!lesson) throw new Error("Lesson not found");

<<<<<<< HEAD
  try {
    const body = await req.json();
    const { lesson_id, content: directContent, bulk_updates } = body;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Mode 1: Bulk updates - array of {lesson_id, content}
    if (bulk_updates && Array.isArray(bulk_updates)) {
      const results = [];
      for (const item of bulk_updates) {
        const { error } = await supabase.from("lessons").update({ content: item.content }).eq("id", item.lesson_id);
        results.push({ lesson_id: item.lesson_id, success: !error, error: error?.message });
      }
      return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Mode 2: Direct content provided - just update
    if (directContent && lesson_id) {
      const { error } = await supabase.from("lessons").update({ content: directContent }).eq("id", lesson_id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true, mode: "direct" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Mode 3: AI generation (original behavior)
    if (!lesson_id) throw new Error("lesson_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { data: lesson } = await supabase.from("lessons").select("title, title_ar, chapter_id").eq("id", lesson_id).single();
    const { data: chapter } = await supabase.from("chapters").select("title_ar, school_level").eq("id", lesson?.chapter_id).single();

    const levelLabel = chapter?.school_level || "";
    const prompt = `أنت أستاذ رياضيات جزائري خبير. اكتب درساً مفصلاً وجميلاً باللغة العربية بصيغة HTML لدرس: "${lesson?.title_ar || lesson?.title}" للمستوى: ${levelLabel}.
=======
  const { data: chapter } = await supabase.from("chapters").select("title_ar, school_level").eq("id", lesson.chapter_id).single();

  const levelLabel = chapter?.school_level || "";
  const prompt = `أنت أستاذ رياضيات جزائري خبير. اكتب درساً مفصلاً وجميلاً باللغة العربية بصيغة HTML لدرس: "${lesson.title_ar || lesson.title}" للمستوى: ${levelLabel}.
>>>>>>> e97fa3f1f549c1d349bfdb04c4c9fda2c41e7ce6

قواعد التنسيق الإلزامية:
1. العناوين الرئيسية h2: استخدم style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;"
2. العناوين الفرعية h3: استخدم style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;"
3. التعريفات والخصائص: ضعها في div بـ style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;"
4. الأمثلة: ضعها في div بـ style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;" مع عنوان <strong style="color: #e67e22;">📝 مثال:</strong>
5. الملاحظات المهمة: ضعها في div بـ style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;" مع <strong style="color: #e74c3c;">⚠️ ملاحظة مهمة:</strong>
6. التمارين: ضعها في div بـ style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;" مع عنوان <strong style="color: #1abc9c;">✏️ تمرين:</strong>
7. الجداول: استخدم style="width: 100%; border-collapse: collapse; margin: 15px 0;" مع خلايا بـ style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;" والرأس بـ style="background: #2c3e50; color: white; padding: 12px;"
8. المصطلحات المهمة: استخدم <span style="color: #e74c3c; font-weight: bold;">
9. القوانين والصيغ: ضعها في div بـ style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;"
10. النص العادي بحجم مناسب وتباعد جيد

اكتب الدرس بشكل شامل مع: مقدمة، شرح المفاهيم، أمثلة محلولة، خصائص، تمارين تطبيقية.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert Algerian math teacher. Generate beautifully formatted, colorful HTML lessons in Arabic. Use inline styles. Do NOT use markdown, only HTML. Do NOT wrap in ```html tags." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Rate limit");
    if (response.status === 402) throw new Error("Credits exhausted");
    const t = await response.text();
    throw new Error(`AI error: ${response.status} ${t}`);
  }

  const result = await response.json();
  let content = result.choices?.[0]?.message?.content || "";
  content = content.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

  await supabase.from("lessons").update({ content }).eq("id", lessonId);
  return { id: lessonId, status: "success" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Single lesson mode
    if (body.lesson_id) {
      const result = await generateForLesson(supabase, body.lesson_id, API_KEY);
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode
    const batchSize = body.batch_size || 3;
    const schoolLevel = body.school_level;

    let query = supabase
      .from("lessons")
      .select("id, chapter_id")
      .or("content.is.null,content.eq.")
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (schoolLevel) {
      const { data: chapterIds } = await supabase
        .from("chapters")
        .select("id")
        .eq("school_level", schoolLevel);
      
      if (chapterIds && chapterIds.length > 0) {
        query = query.in("chapter_id", chapterIds.map((c: any) => c.id));
      } else {
        return new Response(JSON.stringify({ processed: 0, remaining: 0, results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: lessons, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    if (!lessons || lessons.length === 0) {
      return new Response(JSON.stringify({ processed: 0, remaining: 0, results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; status: string }[] = [];
    for (const lesson of lessons) {
      try {
        const r = await generateForLesson(supabase, lesson.id, API_KEY);
        results.push(r);
      } catch (err: any) {
        results.push({ id: lesson.id, status: `error: ${err.message}` });
        if (err.message === "Rate limit") break;
      }
    }

    // Count remaining
    let remainQuery = supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .or("content.is.null,content.eq.");

    if (schoolLevel) {
      const { data: chapterIds } = await supabase
        .from("chapters")
        .select("id")
        .eq("school_level", schoolLevel);
      if (chapterIds && chapterIds.length > 0) {
        remainQuery = remainQuery.in("chapter_id", chapterIds.map((c: any) => c.id));
      }
    }

    const { count: remaining } = await remainQuery;

    return new Response(JSON.stringify({
      processed: results.filter(r => r.status === "success").length,
      remaining: remaining || 0,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message, success: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
