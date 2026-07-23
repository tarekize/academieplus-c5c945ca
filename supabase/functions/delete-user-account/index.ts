import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error("Supabase secrets are not configured");
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [{ data: userData, error: userError }, body] = await Promise.all([
      userClient.auth.getUser(),
      req.json(),
    ]);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUserId = typeof body?.userId === "string" ? body.userId : null;
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let canDelete = userData.user.id === targetUserId;
    if (!canDelete) {
      const { data: isAdmin, error: roleError } = await adminClient.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });

      if (roleError) {
        throw roleError;
      }

      canDelete = Boolean(isAdmin);
    }

    if (!canDelete) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch readable info BEFORE deletion (admin/actor only — the target's
    // own PII is intentionally not read here, since the deletion log below
    // must not retain it once the account is erased).
    const { data: adminProfile } = await adminClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userData.user.id)
      .maybeSingle();

    const fullName = (p: any) =>
      p ? [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || null : null;

    const adminName = fullName(adminProfile) ?? (userData.user.email ?? "Admin");

    // --- Ordre important : on nettoie D'ABORD toutes les tables qui n'ont
    // pas de ON DELETE CASCADE depuis auth.users (ex: parent_reports, voir
    // migration 20260517115936), et on ne supprime le compte auth.users
    // qu'EN DERNIER, une fois ce nettoyage confirmé réussi. Dans l'ancien
    // ordre (auth.users supprimé en premier), un échec au milieu de la boucle
    // de nettoyage laissait des lignes orphelines (chat_usage, activity_logs,
    // teacher_content_attempts...) définitivement irrécupérables : le compte
    // n'existant plus, impossible de relancer la suppression pour les
    // nettoyer. Avec ce nouvel ordre, un échec de nettoyage échoue AVANT la
    // suppression du compte, qui reste donc intact et la suppression peut
    // être retentée sans données orphelines. ---
    const cleanupSteps = [
      () => adminClient.from("parent_child_links").delete().eq("child_id", targetUserId),
      () => adminClient.from("parent_child_links").delete().eq("parent_id", targetUserId),
      () => adminClient.from("student_subscriptions").delete().eq("user_id", targetUserId),
      () => adminClient.from("student_scores").delete().eq("user_id", targetUserId),

      () => adminClient.from("chat_usage").delete().eq("user_id", targetUserId),
      () => adminClient.from("chat_conversations").delete().eq("user_id", targetUserId),
      () => adminClient.from("ai_generated_content").delete().eq("user_id", targetUserId),
      () => adminClient.from("ai_lesson_comments").delete().eq("user_id", targetUserId),
      () => adminClient.from("class_students").delete().eq("student_id", targetUserId),
      () => adminClient.from("teacher_content_attempts").delete().eq("student_id", targetUserId),
      () => adminClient.from("parent_reports").delete().eq("child_id", targetUserId),
      () => adminClient.from("parent_reports").delete().eq("parent_id", targetUserId),
      () => adminClient.from("activity_logs").delete().eq("user_id", targetUserId),
      () => adminClient.from("user_roles").delete().eq("user_id", targetUserId),
      () => adminClient.from("profiles").delete().eq("id", targetUserId),
    ];

    for (const cleanup of cleanupSteps) {
      const { error } = await cleanup();
      if (error) {
        throw error;
      }
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (deleteAuthError) {
      throw deleteAuthError;
    }

    // Log the deletion action under the admin/actor user
    const { error: logError } = await adminClient.from("activity_logs").insert({
      user_id: userData.user.id,
      action: "user_deleted",
      details: {
        admin_name: adminName,
        admin_email: userData.user.email ?? null,
        target_user_id: targetUserId,
        self_delete: userData.user.id === targetUserId,
      },
    });
    if (logError) {
      console.error("Failed to log user_deleted activity:", logError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("delete-user-account error:", error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});