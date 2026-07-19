import { createClient } from "npm:@supabase/supabase-js@2";
import { describeError } from "../_shared/errors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FAILED_ATTEMPTS = 10;
const FAILED_ATTEMPTS_WINDOW_MINUTES = 10;

async function hashCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre majuscule.";
  }
  if (!/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre.";
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
    const [{ data: { user }, error: userError }, body] = await Promise.all([
      userClient.auth.getUser(),
      req.json(),
    ]);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: "Code invalide." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return new Response(JSON.stringify({ error: passwordError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Anti brute-force sur le code à 6 chiffres.
    const attemptsWindowStart = new Date(Date.now() - FAILED_ATTEMPTS_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count: recentFailures } = await adminClient
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "password_change_code_failed")
      .gte("created_at", attemptsWindowStart);

    if ((recentFailures ?? 0) >= MAX_FAILED_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: "Trop de tentatives. Demandez un nouveau code plus tard." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const codeHash = await hashCode(code);
    const { data: codeRow, error: codeError } = await adminClient
      .from("password_change_codes")
      .select("id, code_hash, expires_at, used_at")
      .eq("user_id", user.id)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const logFailure = () =>
      adminClient.from("activity_logs").insert({ user_id: user.id, action: "password_change_code_failed" });

    if (codeError || !codeRow) {
      await logFailure();
      return new Response(JSON.stringify({ error: "Aucun code en attente. Demandez-en un nouveau." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(codeRow.expires_at).getTime() < Date.now()) {
      await logFailure();
      return new Response(JSON.stringify({ error: "Code expiré. Demandez-en un nouveau." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (codeRow.code_hash !== codeHash) {
      await logFailure();
      return new Response(JSON.stringify({ error: "Code invalide." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: markUsedError } = await adminClient
      .from("password_change_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", codeRow.id)
      .is("used_at", null);
    if (markUsedError) throw markUsedError;

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    await adminClient
      .from("activity_logs")
      .insert({ user_id: user.id, action: "password_changed" });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("confirm-password-change error:", error);
    return new Response(
      JSON.stringify({ error: describeError(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
