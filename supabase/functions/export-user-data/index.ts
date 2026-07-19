import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Droit à la portabilité (art. 20 RGPD) : chaque utilisateur peut exporter
// ses propres données. Utilise le client "user" (JWT de l'appelant) plutôt
// que le service_role, afin que la RLS de chaque table décide seule de ce
// qui est réellement accessible à cet utilisateur — aucune fuite possible
// vers les données d'un tiers.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uid = user.id;

    const queries: Record<string, Promise<{ data: unknown; error: unknown }>> = {
      profile: userClient.from("profiles").select("*").eq("id", uid).maybeSingle(),
      roles: userClient.from("user_roles").select("role").eq("user_id", uid).then((r) => r),
      parent_child_links: userClient
        .from("parent_child_links")
        .select("*")
        .or(`parent_id.eq.${uid},child_id.eq.${uid}`)
        .then((r) => r),
      subscriptions: userClient.from("student_subscriptions").select("*").eq("user_id", uid).then((r) => r),
      scores: userClient.from("student_scores").select("*").eq("user_id", uid).then((r) => r),
      chat_conversations: userClient.from("chat_conversations").select("*").eq("user_id", uid).then((r) => r),
      chat_usage: userClient.from("chat_usage").select("*").eq("user_id", uid).then((r) => r),
      ai_generated_content: userClient.from("ai_generated_content").select("*").eq("user_id", uid).then((r) => r),
      ai_lesson_comments: userClient.from("ai_lesson_comments").select("*").eq("user_id", uid).then((r) => r),
      activity_logs: userClient
        .from("activity_logs")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .then((r) => r),
      exam_attempts: userClient.from("exam_attempts").select("*").eq("student_id", uid).then((r) => r),
      teacher_content_attempts: userClient
        .from("teacher_content_attempts")
        .select("*")
        .eq("student_id", uid)
        .then((r) => r),
      parent_reports: userClient
        .from("parent_reports")
        .select("*")
        .or(`parent_id.eq.${uid},child_id.eq.${uid}`)
        .then((r) => r),
      payments: userClient.from("payments").select("*").eq("user_id", uid).then((r) => r),
      teacher_student_notes: userClient
        .from("teacher_student_notes")
        .select("*")
        .or(`teacher_id.eq.${uid},student_id.eq.${uid}`)
        .then((r) => r),
    };

    const entries = Object.entries(queries);
    const results = await Promise.all(entries.map(([, p]) => p));

    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_id: uid,
      email: user.email,
    };

    entries.forEach(([key], i) => {
      const { data, error } = results[i];
      exportData[key] = error ? [] : data ?? [];
    });

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("export-user-data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
