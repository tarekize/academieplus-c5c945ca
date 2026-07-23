import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { logTokenUsageAsync, extractGeminiUsage, extractOpenAiCompatUsage, type AiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAIWithFallback(messages: any[]): Promise<{ text: string; usage: AiUsage | null }> {
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  // Try OpenRouter
  if (openrouterKey) {
    try {
      console.log("Trying OpenRouter for content generation...");
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://academieplus.app",
          "X-Title": "AcademiePlus",
        },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
      });
      if (resp.ok) {
        const result = await resp.json();
        return { text: result.choices?.[0]?.message?.content || "", usage: extractOpenAiCompatUsage(result) };
      }
      console.error("OpenRouter failed:", resp.status);
    } catch (e) { console.error("OpenRouter error:", e); }
  }

  // Try Lovable AI
  if (lovableKey) {
    try {
      console.log("Trying Lovable AI for content generation...");
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });
      if (resp.ok) {
        const result = await resp.json();
        return { text: result.choices?.[0]?.message?.content || "", usage: extractOpenAiCompatUsage(result) };
      }
      console.error("Lovable AI failed:", resp.status);
    } catch (e) { console.error("Lovable AI error:", e); }
  }

  // Try Gemini direct
  if (geminiKey) {
    try {
      console.log("Trying Gemini direct for content generation...");
      const contents = messages.map((m: any) => ({
        role: m.role === "system" ? "user" : m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", usage: extractGeminiUsage(data) };
      }
      console.error("Gemini direct failed:", resp.status);
    } catch (e) { console.error("Gemini error:", e); }
  }

  throw new Error("Tous les services IA sont indisponibles.");
}

async function generateForLesson(
  supabase: any,
  lessonId: string,
  tokenLogCtx?: { supabaseUrl: string; serviceRoleKey: string; userId: string; roleGroup: "admin" | "pedago" },
) {
  const { data: lesson } = await supabase.from("lessons").select("title, title_ar, chapter_id, content").eq("id", lessonId).single();
  if (!lesson) throw new Error("Lesson not found");

  const { data: chapter } = await supabase.from("chapters").select("title_ar, school_level").eq("id", lesson.chapter_id).single();
  const levelLabel = chapter?.school_level || "";

  const prompt = `أنت أستاذ رياضيات جزائري خبير. اكتب درساً مفصلاً وجميلاً باللغة العربية بصيغة HTML لدرس: "${lesson.title_ar || lesson.title}" للمستوى: ${levelLabel}.

قواعد التنسيق الإلزامية:
1. العناوين الرئيسية h2: استخدم style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;"
2. العناوين الفرعية h3: استخدم style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;"
3. التعريفات: div بـ style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;"
4. الأمثلة: div بـ style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;"
5. الملاحظات: div بـ style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;"
6. القوانين: div بـ style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;"

اكتب الدرس بشكل شامل مع: مقدمة، شرح المفاهيم، أمثلة محلولة، خصائص، تمارين تطبيقية.`;

  const messages = [
    { role: "system", content: "You are an expert Algerian math teacher. Generate beautifully formatted HTML lessons in Arabic. Use inline styles. Do NOT use markdown, only HTML. Do NOT wrap in ```html tags." },
    { role: "user", content: prompt },
  ];

  const { text: rawContent, usage } = await callAIWithFallback(messages);
  const content = rawContent.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

  if (usage && tokenLogCtx) {
    logTokenUsageAsync({
      supabaseUrl: tokenLogCtx.supabaseUrl, serviceRoleKey: tokenLogCtx.serviceRoleKey,
      userId: tokenLogCtx.userId, roleGroup: tokenLogCtx.roleGroup,
      functionName: "generate-lesson-content",
      inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
    });
  }

  await supabase.from("lessons").update({ content }).eq("id", lessonId);
  return { id: lessonId, status: "success" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentification + autorisation obligatoires : cette fonction
    // écrit directement le contenu de cours réel des élèves avec la
    // service_role key. Sans ce contrôle, n'importe qui sur Internet peut
    // appeler l'URL de la fonction directement (le garde-fou React
    // <ProtectedRoute> ne protège que l'interface, pas l'API). ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    if (!roles.includes("admin") && !roles.includes("pedago")) {
      return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs et pédagogues" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenLogCtx = {
      supabaseUrl: SUPABASE_URL,
      serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
      userId: user.id,
      roleGroup: (roles.includes("admin") ? "admin" : "pedago") as "admin" | "pedago",
    };

    const body = await req.json();

    if (body.lesson_id) {
      const result = await generateForLesson(supabase, body.lesson_id, tokenLogCtx);
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const batchSize = body.batch_size || 3;
    const schoolLevel = body.school_level;

    let query = supabase
      .from("lessons")
      .select("id, chapter_id")
      .or("content.is.null,content.eq.")
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (schoolLevel) {
      const { data: chapterIds } = await supabase.from("chapters").select("id").eq("school_level", schoolLevel);
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
        const r = await generateForLesson(supabase, lesson.id, tokenLogCtx);
        results.push(r);
      } catch (err: any) {
        results.push({ id: lesson.id, status: `error: ${err.message}` });
      }
    }

    let remainQuery = supabase.from("lessons").select("id", { count: "exact", head: true }).or("content.is.null,content.eq.");
    if (schoolLevel) {
      const { data: chapterIds } = await supabase.from("chapters").select("id").eq("school_level", schoolLevel);
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
