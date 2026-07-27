// Envoie un modèle d'email (centre de notifications admin) à un segment
// d'utilisateurs filtré par rôle + statut contrat/abonnement. Réservé aux
// admins. Chaque destinataire est traité indépendamment (une erreur SMTP sur
// l'un n'interrompt pas les autres), et le résultat est journalisé dans
// email_campaigns pour l'historique affiché côté admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_RECIPIENTS = 300;
const EXPIRING_SOON_DAYS = 30;

const VALID_ROLES = ["student", "teacher", "pedago", "etablissement", "parent"];
const VALID_CONTRACT_STATUSES = ["all", "no_contract", "has_contract", "expiring_soon", "expired"];

// NB : dupliqué (plutôt que partagé via _shared/) car les redéploiements
// mono-fonction de cette plateforme ne repèrent pas toujours un nouveau
// fichier _shared/ ajouté après coup ("Module not found" au déploiement) —
// chaque function reste donc volontairement autonome pour ce point.
async function sendSmtpEmail(client: SMTPClient, to: string, subject: string, html: string, text: string) {
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || Deno.env.get("SMTP_USERNAME");
  const fromName = Deno.env.get("SMTP_FROM_NAME") || "AcademiePlus";
  await client.send({ from: `${fromName} <${fromEmail}>`, to, subject, content: text, html });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function applyPlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (key in vars ? vars[key] : match));
}

function buildEmailHtml(opts: { logoUrl: string | null; subject: string; bodyText: string }): string {
  const paragraphs = opts.bodyText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 16px 0; line-height:1.6; color:#1f2937;">${escapeHtml(line)}</p>`)
    .join("\n");

  const logoBlock = opts.logoUrl
    ? `<img src="${escapeHtml(opts.logoUrl)}" alt="AcademiePlus" style="max-height:56px; max-width:220px; object-fit:contain;" />`
    : `<span style="font-size:20px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">AcademiePlus</span>`;

  return `
    <div style="background:#f3f4f6; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="background:#4f46e5; padding:24px 32px; text-align:center;">
          ${logoBlock}
        </div>
        <div style="padding:32px;">
          <h1 style="margin:0 0 20px 0; font-size:19px; color:#111827;">${escapeHtml(opts.subject)}</h1>
          ${paragraphs}
        </div>
        <div style="padding:20px 32px; background:#f9fafb; border-top:1px solid #e5e7eb; text-align:center;">
          <p style="margin:0; font-size:12px; color:#6b7280;">— L'équipe AcademiePlus</p>
        </div>
      </div>
    </div>
  `;
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
    const { data: { user: caller }, error: authError } = await userClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!callerRole) {
      return new Response(JSON.stringify({ error: "Accès non autorisé — rôle admin requis" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: allowed, error: rateLimitError } = await admin.rpc("check_and_log_rate_limit", {
      p_user_id: caller.id,
      p_action: "send_bulk_notification",
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      return new Response(JSON.stringify({ error: "Trop de campagnes envoyées récemment. Merci de patienter avant de réessayer." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { templateId, filterRoles, filterContractStatus } = await req.json();

    if (!templateId) {
      return new Response(JSON.stringify({ error: "Modèle d'email requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const roles: string[] = Array.isArray(filterRoles) ? filterRoles.filter((r) => VALID_ROLES.includes(r)) : [];
    if (roles.length === 0) {
      return new Response(JSON.stringify({ error: "Sélectionnez au moins un rôle destinataire" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const contractStatus: string = VALID_CONTRACT_STATUSES.includes(filterContractStatus) ? filterContractStatus : "all";

    const { data: template, error: templateError } = await admin
      .from("email_templates")
      .select("id, name, subject, body_text, logo_url")
      .eq("id", templateId)
      .maybeSingle();
    if (templateError || !template) {
      return new Response(JSON.stringify({ error: "Modèle d'email introuvable" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRows, error: roleRowsError } = await admin
      .from("user_roles")
      .select("user_id, role")
      .in("role", roles);
    if (roleRowsError) throw new Error(roleRowsError.message);

    const userIdToRole = new Map<string, string>();
    for (const row of roleRows ?? []) userIdToRole.set(row.user_id, row.role);
    const candidateIds = Array.from(userIdToRole.keys());

    if (candidateIds.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun destinataire ne correspond à ce filtre" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profileRows, error: profileError } = await admin
      .from("profiles")
      .select("id, email, first_name, last_name, is_active, contract_end_date, subscription_end_date")
      .in("id", candidateIds);
    if (profileError) throw new Error(profileError.message);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiringCutoff = new Date(today);
    expiringCutoff.setDate(expiringCutoff.getDate() + EXPIRING_SOON_DAYS);

    const recipients = (profileRows ?? []).filter((p) => {
      if (!p.email || p.is_active === false) return false;
      if (contractStatus === "all") return true;

      const role = userIdToRole.get(p.id);
      const expiryRaw = role === "etablissement" ? p.contract_end_date : p.subscription_end_date;
      const expiry = expiryRaw ? new Date(expiryRaw) : null;

      if (contractStatus === "no_contract") return !expiry;
      if (!expiry) return false;
      if (contractStatus === "has_contract") return true;
      if (contractStatus === "expiring_soon") return expiry >= today && expiry <= expiringCutoff;
      if (contractStatus === "expired") return expiry < today;
      return true;
    });

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun destinataire ne correspond à ce filtre" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (recipients.length > MAX_RECIPIENTS) {
      return new Response(JSON.stringify({
        error: `Ce filtre correspond à ${recipients.length} destinataires, ce qui dépasse la limite de ${MAX_RECIPIENTS} par envoi. Affinez le filtre.`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hostname = Deno.env.get("SMTP_HOST");
    const port = Number(Deno.env.get("SMTP_PORT") || "465");
    const username = Deno.env.get("SMTP_USERNAME");
    const password = Deno.env.get("SMTP_PASSWORD");
    if (!hostname || !username || !password) {
      return new Response(JSON.stringify({ error: "SMTP non configuré (secrets manquants)" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const smtpClient = new SMTPClient({
      connection: { hostname, port, tls: port === 465, auth: { username, password } },
    });

    let successCount = 0;
    const failedEmails: string[] = [];

    try {
      for (const recipient of recipients) {
        const vars = {
          prenom: recipient.first_name || "",
          nom: recipient.last_name || "",
          email: recipient.email || "",
        };
        const subject = applyPlaceholders(template.subject, vars);
        const bodyText = applyPlaceholders(template.body_text, vars);
        const html = buildEmailHtml({ logoUrl: template.logo_url, subject, bodyText });

        try {
          await sendSmtpEmail(smtpClient, recipient.email!, subject, html, bodyText);
          successCount++;
        } catch (sendErr: any) {
          console.error(`send-bulk-notification: failed for ${recipient.email}:`, sendErr);
          failedEmails.push(recipient.email!);
        }
      }
    } finally {
      await smtpClient.close();
    }

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", caller.id)
      .maybeSingle();
    const callerName = [callerProfile?.first_name, callerProfile?.last_name].filter(Boolean).join(" ") || null;

    await admin.from("email_campaigns").insert({
      template_id: template.id,
      template_name_snapshot: template.name,
      subject_snapshot: template.subject,
      filter_roles: roles,
      filter_contract_status: contractStatus,
      recipient_count: recipients.length,
      success_count: successCount,
      failure_count: failedEmails.length,
      failed_emails: failedEmails,
      sent_by: caller.id,
      sent_by_name: callerName,
    });

    return new Response(JSON.stringify({
      success: true,
      recipientCount: recipients.length,
      successCount,
      failureCount: failedEmails.length,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("send-bulk-notification error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
