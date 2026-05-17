import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChapterStat {
  chapter_id: string;
  chapter_title: string;
  level: number;
  accuracy: number;
  total_answers: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const parentId = userData?.user?.id;
    if (!parentId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const childId: string | undefined = body?.child_id;
    if (!childId) {
      return new Response(JSON.stringify({ error: "child_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // verify parent link
    const { data: link } = await supabase
      .from("parent_child_links")
      .select("id")
      .eq("parent_id", parentId)
      .eq("child_id", childId)
      .eq("status", "active")
      .maybeSingle();
    if (!link) {
      return new Response(JSON.stringify({ error: "Not linked" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch child profile
    const { data: child } = await supabase
      .from("profiles")
      .select("first_name, last_name, school_level")
      .eq("id", childId)
      .maybeSingle();

    // Period: last 30 days
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    // Fetch student scores
    const { data: scores } = await supabase
      .from("student_scores")
      .select("chapter_id, lesson_id, current_level, accuracy_rate, total_answers, correct_answers, reading_time_seconds, quiz_time_seconds, exercise_time_seconds, updated_at")
      .eq("user_id", childId);

    // Aggregate per chapter
    const byChapter = new Map<string, { level_sum: number; weight: number; correct: number; total: number; time: number }>();
    for (const s of scores ?? []) {
      if (!s.chapter_id) continue;
      const cur = byChapter.get(s.chapter_id) || { level_sum: 0, weight: 0, correct: 0, total: 0, time: 0 };
      const w = Number(s.total_answers || 0);
      cur.level_sum += Number(s.current_level || 0) * w;
      cur.weight += w;
      cur.correct += Number(s.correct_answers || 0);
      cur.total += Number(s.total_answers || 0);
      cur.time += Number(s.reading_time_seconds || 0) + Number(s.quiz_time_seconds || 0) + Number(s.exercise_time_seconds || 0);
      byChapter.set(s.chapter_id, cur);
    }

    const chapterIds = Array.from(byChapter.keys());
    const { data: chapters } = chapterIds.length
      ? await supabase.from("chapters").select("id, title, title_ar").in("id", chapterIds)
      : { data: [] as any[] };

    const chapterStats: ChapterStat[] = [];
    for (const [cid, v] of byChapter.entries()) {
      const ch = chapters?.find((c: any) => c.id === cid);
      chapterStats.push({
        chapter_id: cid,
        chapter_title: ch?.title_ar || ch?.title || "—",
        level: v.weight > 0 ? Math.round(v.level_sum / v.weight) : 50,
        accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
        total_answers: v.total,
      });
    }

    const totalAnswers = chapterStats.reduce((a, c) => a + c.total_answers, 0);
    const totalCorrectPct = totalAnswers > 0
      ? Math.round(chapterStats.reduce((a, c) => a + c.accuracy * c.total_answers, 0) / totalAnswers)
      : 0;
    const globalLevel = totalAnswers > 0
      ? Math.round(chapterStats.reduce((a, c) => a + c.level * c.total_answers, 0) / totalAnswers)
      : 50;

    const sorted = [...chapterStats].sort((a, b) => b.level - a.level);
    const strong = sorted.slice(0, 3).filter((c) => c.level >= 60);
    const weak = sorted.slice(-3).reverse().filter((c) => c.level < 60);

    // Recent AI comments
    const { data: aiComments } = await supabase
      .from("ai_lesson_comments")
      .select("message, lesson_title, chapter_title, level_after, created_at")
      .eq("user_id", childId)
      .gte("created_at", periodStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    const recommendations = (aiComments ?? [])
      .map((c: any) => `• ${c.chapter_title || ""} — ${c.message}`)
      .join("\n") || "Continuer le rythme actuel et travailler les chapitres faibles ci-dessus.";

    const childName = `${child?.first_name || ""} ${child?.last_name || ""}`.trim() || "Élève";
    const summary = `Au cours des 30 derniers jours, ${childName} a un taux de réussite global de ${totalCorrectPct}% et un niveau moyen de ${globalLevel}/100.`;

    const report_data = {
      child_name: childName,
      school_level: child?.school_level || null,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      global_success_rate: totalCorrectPct,
      global_level: globalLevel,
      chapters: chapterStats,
      strong_chapters: strong,
      weak_chapters: weak,
      ai_comments: aiComments ?? [],
      recommendations,
      summary,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("parent_reports")
      .insert({
        child_id: childId,
        parent_id: parentId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        report_data,
        global_success_rate: totalCorrectPct,
        global_level: globalLevel,
        strong_chapters: strong,
        weak_chapters: weak,
        ai_recommendations: recommendations,
        summary,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ report: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-parent-report error", e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
