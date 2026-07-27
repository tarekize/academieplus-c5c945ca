// Vérifie le code envoyé par request-password-change, puis change réellement
// le mot de passe via l'API admin (service_role) — le nouveau mot de passe
// n'a jamais transité par la base, il vient directement du client à cette étape.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 8;

async function hashCode(code: string, userId: string): Promise<string> {
  const pepper = Deno.env.get("PASSWORD_CODE_PEPPER") || "academieplus-default-pepper";
  const data = new TextEncoder().encode(`${pepper}:${userId}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code, newPassword } = await req.json();
    if (!code || !newPassword) {
      return new Response(JSON.stringify({ error: "Code et nouveau mot de passe requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isValidPassword(newPassword)) {
      return new Response(JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: allowed, error: rateLimitError } = await admin.rpc("check_and_log_rate_limit", {
      p_user_id: user.id,
      p_action: "password_change_confirm",
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      return new Response(JSON.stringify({ error: "Trop de tentatives. Merci de patienter avant de réessayer." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codeHash = await hashCode(String(code).trim(), user.id);

    const { data: codeRow, error: codeError } = await admin
      .from("password_change_codes")
      .select("id, expires_at, used_at")
      .eq("user_id", user.id)
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) throw new Error(codeError.message);
    if (!codeRow || new Date(codeRow.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Code invalide ou expiré." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updateError) throw new Error(updateError.message);

    await admin.from("password_change_codes").update({ used_at: new Date().toISOString() }).eq("id", codeRow.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("confirm-password-change error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
