// Envoie par email (SMTP) un code de vérification à 6 chiffres, requis avant
// de pouvoir changer son mot de passe (voir confirm-password-change).
// L'utilisateur doit déjà être authentifié ET avoir reconfirmé son mot de
// passe actuel côté client (ChangePasswordButton.tsx) avant d'appeler ceci.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CODE_TTL_SECONDS = 10 * 60;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

async function hashCode(code: string, userId: string): Promise<string> {
  const pepper = Deno.env.get("PASSWORD_CODE_PEPPER") || "academieplus-default-pepper";
  const data = new TextEncoder().encode(`${pepper}:${userId}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + (bytes[0] % 900000));
}

// NB : dupliqué (plutôt que partagé via _shared/) car les redéploiements
// mono-fonction de cette plateforme ne repèrent pas toujours un nouveau
// fichier _shared/ ajouté après coup ("Module not found" au déploiement) —
// chaque function reste donc volontairement autonome pour ce point.
async function sendSmtpEmail(to: string, subject: string, html: string, text: string) {
  const hostname = Deno.env.get("SMTP_HOST");
  const port = Number(Deno.env.get("SMTP_PORT") || "465");
  const username = Deno.env.get("SMTP_USERNAME");
  const password = Deno.env.get("SMTP_PASSWORD");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || username;
  const fromName = Deno.env.get("SMTP_FROM_NAME") || "AcademiePlus";

  if (!hostname || !username || !password) {
    throw new Error("SMTP non configuré (SMTP_HOST/SMTP_USERNAME/SMTP_PASSWORD manquants dans les secrets)");
  }

  const client = new SMTPClient({
    connection: {
      hostname,
      port,
      tls: port === 465,
      auth: { username, password },
    },
  });

  try {
    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      content: text,
      html,
    });
  } finally {
    await client.close();
  }
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user || !user.email) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: allowed, error: rateLimitError } = await admin.rpc("check_and_log_rate_limit", {
      p_user_id: user.id,
      p_action: "password_change_request",
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      return new Response(JSON.stringify({ error: "Trop de demandes. Merci de patienter avant de réessayer." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const code = generateCode();
    const codeHash = await hashCode(code, user.id);
    const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000).toISOString();

    // Invalide les codes précédents encore actifs pour cet utilisateur, un seul reste valable à la fois.
    await admin.from("password_change_codes").update({ used_at: new Date().toISOString() })
      .eq("user_id", user.id).is("used_at", null);

    const { error: insertError } = await admin.from("password_change_codes").insert({
      user_id: user.id, code_hash: codeHash, expires_at: expiresAt,
    });
    if (insertError) throw new Error(insertError.message);

    const html = `
      <p>Bonjour,</p>
      <p>Voici votre code de vérification pour changer votre mot de passe AcademiePlus :</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${code}</p>
      <p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p>— L'équipe AcademiePlus</p>
    `;
    const text = `Votre code de vérification AcademiePlus : ${code} (valable 10 minutes).`;

    await sendSmtpEmail(user.email, "Code de vérification — changement de mot de passe", html, text);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("request-password-change error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
