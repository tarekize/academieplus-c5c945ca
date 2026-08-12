import { createClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 30;

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

// Appelé par AdminContrats.tsx quand un admin envoie manuellement un rappel
// d'échéance d'abonnement/contrat à un utilisateur ciblé. Réservé aux admins
// (rôle vérifié côté serveur via user_roles, pas déduit du client) et limité
// en fréquence pour empêcher qu'un compte admin compromis, ou un script,
// n'utilise cet endpoint pour bombarder un même destinataire de rappels.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user: caller }, error: authError } = await userClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!callerRole) {
      return new Response(JSON.stringify({ error: "Accès non autorisé — rôle admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting : évite qu'un rappel de renouvellement soit renvoyé en
    // boucle vers les mêmes destinataires (spam), que ce soit par erreur
    // (double-clic, script d'automatisation admin) ou abus intentionnel.
    const { data: rateLimitAllowed, error: rateLimitError } = await adminClient.rpc("check_and_log_rate_limit", {
      p_user_id: caller.id,
      p_action: "send_renewal_reminder",
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitAllowed) {
      return new Response(JSON.stringify({ error: "Trop de rappels envoyés récemment. Merci de patienter." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("email, first_name, last_name, contract_end_date, subscription_end_date")
      .eq("id", userId)
      .maybeSingle();

    if (!targetProfile || !targetProfile.email) {
      return new Response(JSON.stringify({ error: "Utilisateur introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: targetRoleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    const isEtablissement = targetRoleRow?.role === "etablissement";
    const expiryDate = isEtablissement ? targetProfile.contract_end_date : targetProfile.subscription_end_date;
    const expiryLabel = expiryDate
      ? new Date(expiryDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null;

    const displayName = [targetProfile.first_name, targetProfile.last_name].filter(Boolean).join(" ") || "cher utilisateur";

    const subject = "Rappel — Votre abonnement AcadémiePlus arrive à échéance";
    const html = `
      <p>Bonjour ${displayName},</p>
      <p>Nous vous contactons au sujet de votre ${isEtablissement ? "contrat" : "abonnement"} AcadémiePlus${
      expiryLabel ? ` qui arrive à échéance le <strong>${expiryLabel}</strong>` : ""
    }.</p>
      <p>Pensez à le renouveler pour continuer à profiter de la plateforme sans interruption.</p>
      <p>Pour toute question, contactez l'administration.</p>
      <p>— L'équipe AcadémiePlus</p>
    `;

    const text = `Bonjour ${displayName}, votre ${isEtablissement ? "contrat" : "abonnement"} AcadémiePlus${
      expiryLabel ? ` arrive à échéance le ${expiryLabel}` : ""
    }. Pensez à le renouveler. — L'équipe AcadémiePlus`;

    let success = false;
    let errorMessage: string | null = null;
    try {
      await sendSmtpEmail(targetProfile.email, subject, html, text);
      success = true;
    } catch (smtpErr: any) {
      errorMessage = smtpErr.message ?? String(smtpErr);
    }

    await adminClient.from("renewal_reminders_log").insert({
      target_user_id: userId,
      sent_by: caller.id,
      channel: "email",
      success,
      error_message: errorMessage,
    });

    if (!success) {
      return new Response(JSON.stringify({ error: errorMessage || "Échec de l'envoi" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-renewal-reminder error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
