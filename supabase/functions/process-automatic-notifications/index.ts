// Appelée uniquement par pg_cron (job "process-automatic-notifications-daily"
// -> public.trigger_process_automatic_notifications(), qui lit le secret
// partagé depuis Supabase Vault — même mécanisme que gdpr-cleanup et
// scheduled-parent-reports, voir 20260803090005_cron_secret_via_vault.sql).
//
// Pour chaque modèle d'email marqué trigger_type='automatic' et actif,
// cherche les profils dont la date d'expiration (contract_end_date pour un
// établissement, sinon subscription_end_date — même logique que la RPC
// admin_list_notification_candidates) tombe dans la fenêtre
// [aujourd'hui ; aujourd'hui + trigger_days_before], filtrés par rôle et
// statut de profil (trigger_roles/trigger_profile_status, définis par
// l'admin dans l'onglet Modèles). Envoie l'email et journalise chaque envoi
// dans automatic_notification_log, avec la date d'expiration au moment de
// l'envoi : un renouvellement qui repousse l'échéance rend un nouveau
// rappel envoyable, mais la même échéance non renouvelée ne redéclenche
// jamais un second envoi les jours suivants.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const VALID_ROLES = ["student", "teacher", "pedago", "etablissement", "parent"];

// NB : dupliqué de send-bulk-notification plutôt que partagé via _shared/ —
// voir le commentaire équivalent là-bas (redéploiements mono-fonction de
// cette plateforme).
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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Contourne le service role (bypasse RLS) : seul le planificateur (cron)
  // peut appeler cette fonction, jamais un client public.
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: "Non autorisé." }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const summary: { templateId: string; templateName: string; sent: number; failed: number; skippedAlreadySent: number }[] = [];

  try {
    const { data: templates, error: templatesError } = await admin
      .from("email_templates")
      .select("id, name, subject, body_text, logo_url, trigger_roles, trigger_days_before, trigger_profile_status")
      .eq("trigger_type", "automatic")
      .eq("trigger_active", true);
    if (templatesError) throw new Error(templatesError.message);
    if (!templates || templates.length === 0) {
      return new Response(JSON.stringify({ success: true, templatesProcessed: 0, summary: [] }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hostname = Deno.env.get("SMTP_HOST");
    const port = Number(Deno.env.get("SMTP_PORT") || "465");
    const username = Deno.env.get("SMTP_USERNAME");
    const password = Deno.env.get("SMTP_PASSWORD");
    if (!hostname || !username || !password) {
      throw new Error("SMTP non configuré (secrets manquants)");
    }
    const smtpClient = new SMTPClient({
      connection: { hostname, port, tls: port === 465, auth: { username, password } },
    });

    try {
      for (const template of templates) {
        const targetRoles = (template.trigger_roles && template.trigger_roles.length > 0)
          ? template.trigger_roles.filter((r: string) => VALID_ROLES.includes(r))
          : VALID_ROLES;
        const daysBefore = template.trigger_days_before ?? 0;
        const windowEnd = addDaysIso(daysBefore);
        const today = todayIso();

        let sent = 0, failed = 0, skippedAlreadySent = 0;

        // Un profil par rôle ciblé (role IN targetRoles), actif/inactif selon
        // trigger_profile_status, avec la date d'expiration pertinente pour
        // son rôle (établissement -> contract_end_date, sinon
        // subscription_end_date — même logique que
        // admin_list_notification_candidates).
        const { data: roleRows, error: roleRowsError } = await admin
          .from("user_roles")
          .select("user_id, role")
          .in("role", targetRoles);
        if (roleRowsError) { console.error(`process-automatic-notifications: role query failed for template ${template.id}:`, roleRowsError); continue; }

        const userIds = (roleRows ?? []).map((r) => r.user_id);
        if (userIds.length === 0) { summary.push({ templateId: template.id, templateName: template.name, sent, failed, skippedAlreadySent }); continue; }
        const roleByUser = new Map<string, string>();
        for (const r of roleRows ?? []) roleByUser.set(r.user_id, r.role);

        let profileQuery = admin
          .from("profiles")
          .select("id, email, first_name, last_name, is_active, contract_end_date, subscription_end_date")
          .in("id", userIds)
          .not("email", "is", null);
        if (template.trigger_profile_status === "active") profileQuery = profileQuery.eq("is_active", true);
        else if (template.trigger_profile_status === "inactive") profileQuery = profileQuery.eq("is_active", false);
        const { data: profiles, error: profilesError } = await profileQuery;
        if (profilesError) { console.error(`process-automatic-notifications: profile query failed for template ${template.id}:`, profilesError); continue; }

        const candidates = (profiles ?? [])
          .map((p) => {
            const role = roleByUser.get(p.id);
            const expiry = role === "etablissement" ? p.contract_end_date : p.subscription_end_date;
            return { ...p, expiry: expiry as string | null };
          })
          .filter((p) => p.expiry !== null && p.expiry >= today && p.expiry <= windowEnd);

        for (const candidate of candidates) {
          // Déjà envoyé pour CETTE échéance précise : ne pas relancer tant
          // que la date d'expiration n'a pas changé (renouvellement).
          const { data: alreadySent } = await admin
            .from("automatic_notification_log")
            .select("id")
            .eq("template_id", template.id)
            .eq("target_user_id", candidate.id)
            .eq("expiry_date_snapshot", candidate.expiry)
            .maybeSingle();
          if (alreadySent) { skippedAlreadySent++; continue; }

          const vars = {
            prenom: candidate.first_name || "",
            nom: candidate.last_name || "",
            email: candidate.email || "",
          };
          const subject = applyPlaceholders(template.subject, vars);
          const bodyText = applyPlaceholders(template.body_text, vars);
          const html = buildEmailHtml({ logoUrl: template.logo_url, subject, bodyText });

          let success = true;
          let errorMessage: string | null = null;
          try {
            await sendSmtpEmail(smtpClient, candidate.email!, subject, html, bodyText);
            sent++;
          } catch (sendErr: any) {
            success = false;
            errorMessage = String(sendErr?.message ?? sendErr);
            failed++;
            console.error(`process-automatic-notifications: failed for ${candidate.email} (template ${template.id}):`, sendErr);
          }

          await admin.from("automatic_notification_log").insert({
            template_id: template.id,
            target_user_id: candidate.id,
            expiry_date_snapshot: candidate.expiry,
            success,
            error_message: errorMessage,
          });
        }

        summary.push({ templateId: template.id, templateName: template.name, sent, failed, skippedAlreadySent });
      }
    } finally {
      await smtpClient.close();
    }

    return new Response(JSON.stringify({ success: true, templatesProcessed: templates.length, summary }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("process-automatic-notifications error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne", summary }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
