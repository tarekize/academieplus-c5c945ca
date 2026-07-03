// Runs daily (via pg_cron). For each active parent-child link:
// - Generates a periodic report if the last periodic report is >= 20 days old (or none exists)
// - Generates an "inactivity" alert if the child hasn't used the app in >= 5 days
//   AND no inactivity alert was already sent in the last 5 days.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERIODIC_DAYS = 20;
const INACTIVITY_DAYS = 5;

interface ChapterStat {
  chapter_id: string;
  chapter_title: string;
  level: number;
  accuracy: number;
  total_answers: number;
}

// Génère l'analyse via Google Gemini (2ème clé) uniquement.
async function callGemini2(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY_2");
  if (!key) throw new Error("GEMINI_API_KEY_2 not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 900 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini2 error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return String(text).trim();
}

async function buildPeriodicReport(supabase: any, parentId: string, childId: string) {
  const { data: child } = await supabase
    .from("profiles")
    .select("first_name, last_name, school_level")
    .eq("id", childId)
    .maybeSingle();

  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);

  const { data: scores } = await supabase
    .from("student_scores")
    .select("chapter_id, current_level, accuracy_rate, total_answers, correct_answers, reading_time_seconds, quiz_time_seconds, exercise_time_seconds")
    .eq("user_id", childId);

  const byChapter = new Map<string, { level_sum: number; weight: number; correct: number; total: number }>();
  for (const s of scores ?? []) {
    if (!s.chapter_id) continue;
    const cur = byChapter.get(s.chapter_id) || { level_sum: 0, weight: 0, correct: 0, total: 0 };
    const w = Number(s.total_answers || 0);
    cur.level_sum += Number(s.current_level || 0) * w;
    cur.weight += w;
    cur.correct += Number(s.correct_answers || 0);
    cur.total += Number(s.total_answers || 0);
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
  const summary = `Rapport automatique (tous les ${PERIODIC_DAYS} jours) : ${childName} a un taux de réussite global de ${totalCorrectPct}% et un niveau moyen de ${globalLevel}/100 sur les 30 derniers jours.`;

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
    report_type: "periodic",
  };

  return await supabase.from("parent_reports").insert({
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
    report_type: "periodic",
  });
}

async function buildInactivityReport(
  supabase: any,
  parentId: string,
  childId: string,
  lastActiveAt: Date | null,
) {
  const { data: child } = await supabase
    .from("profiles")
    .select("first_name, last_name, school_level")
    .eq("id", childId)
    .maybeSingle();

  const childName = `${child?.first_name || ""} ${child?.last_name || ""}`.trim() || "Votre enfant";
  const daysInactive = lastActiveAt
    ? Math.floor((Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const summary = lastActiveAt
    ? `Alerte d'inactivité : ${childName} n'a pas utilisé l'application depuis ${daysInactive} jours (dernière activité le ${lastActiveAt.toLocaleDateString("fr-FR")}).`
    : `Alerte d'inactivité : ${childName} n'a pas encore commencé à utiliser l'application.`;

  const recommendations = `Nous vous recommandons d'encourager ${childName} à reprendre ses révisions. Une régularité quotidienne, même 15 minutes, améliore fortement les résultats scolaires.`;

  const periodEnd = new Date();
  const periodStart = lastActiveAt || new Date(Date.now() - INACTIVITY_DAYS * 24 * 3600 * 1000);

  const report_data = {
    child_name: childName,
    school_level: child?.school_level || null,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    days_inactive: daysInactive,
    last_active_at: lastActiveAt?.toISOString() || null,
    summary,
    recommendations,
    chapters: [],
    strong_chapters: [],
    weak_chapters: [],
    ai_comments: [],
    global_success_rate: 0,
    global_level: 0,
    report_type: "inactivity",
  };

  return await supabase.from("parent_reports").insert({
    child_id: childId,
    parent_id: parentId,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    report_data,
    global_success_rate: null,
    global_level: null,
    strong_chapters: [],
    weak_chapters: [],
    ai_recommendations: recommendations,
    summary,
    report_type: "inactivity",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const stats = { processed: 0, periodic: 0, inactivity: 0, errors: 0 };

  try {
    const { data: links, error: linksErr } = await supabase
      .from("parent_child_links")
      .select("parent_id, child_id")
      .eq("status", "active");
    if (linksErr) throw linksErr;

    const now = Date.now();

    for (const link of links ?? []) {
      stats.processed++;
      try {
        // last activity: max(updated_at) from student_scores
        const { data: lastScore } = await supabase
          .from("student_scores")
          .select("updated_at")
          .eq("user_id", link.child_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const lastActive = lastScore?.updated_at ? new Date(lastScore.updated_at) : null;

        // last periodic report
        const { data: lastPeriodic } = await supabase
          .from("parent_reports")
          .select("generated_at")
          .eq("child_id", link.child_id)
          .eq("report_type", "periodic")
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const daysSincePeriodic = lastPeriodic
          ? (now - new Date(lastPeriodic.generated_at).getTime()) / 86400000
          : Infinity;

        if (daysSincePeriodic >= PERIODIC_DAYS) {
          const { error } = await buildPeriodicReport(supabase, link.parent_id, link.child_id);
          if (error) throw error;
          stats.periodic++;
        }

        // Inactivity check
        const inactive = !lastActive || (now - lastActive.getTime()) / 86400000 >= INACTIVITY_DAYS;
        if (inactive) {
          const { data: lastInactivity } = await supabase
            .from("parent_reports")
            .select("generated_at")
            .eq("child_id", link.child_id)
            .eq("report_type", "inactivity")
            .order("generated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const daysSinceInactivity = lastInactivity
            ? (now - new Date(lastInactivity.generated_at).getTime()) / 86400000
            : Infinity;

          if (daysSinceInactivity >= INACTIVITY_DAYS) {
            const { error } = await buildInactivityReport(supabase, link.parent_id, link.child_id, lastActive);
            if (error) throw error;
            stats.inactivity++;
          }
        }
      } catch (e) {
        console.error("link error", link, e);
        stats.errors++;
      }
    }

    return new Response(JSON.stringify({ ok: true, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("scheduled-parent-reports fatal", e);
    return new Response(JSON.stringify({ error: e.message || String(e), stats }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
