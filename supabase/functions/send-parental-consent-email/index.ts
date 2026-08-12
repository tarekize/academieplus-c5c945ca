// Envoie un email de vérification au parent/tuteur d'un élève de moins de
// 15 ans, déclenchée par le trigger trg_send_parental_consent_email
// (AFTER INSERT sur parental_consents), jamais appelable par un client
// public. Réutilise le pattern SMTP déjà en place (request-password-change).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

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
    connection: { hostname, port, tls: port === 465, auth: { username, password } },
  });

  try {
    await client.send({ from: `${fromName} <${fromEmail}>`, to, subject, content: text, html });
  } finally {
    await client.close();
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: "Non autorisé." }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { consent_id } = await req.json();
    if (!consent_id) {
      return new Response(JSON.stringify({ error: "consent_id requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: consent, error: consentError } = await supabase
      .from("parental_consents")
      .select("id, parent_email, token, child_id, verified")
      .eq("id", consent_id)
      .maybeSingle();
    if (consentError) throw consentError;
    if (!consent) {
      return new Response(JSON.stringify({ error: "Consentement introuvable" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (consent.verified) {
      return new Response(JSON.stringify({ ok: true, skipped: "already verified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: child } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", consent.child_id)
      .maybeSingle();
    const childName = `${child?.first_name || ""} ${child?.last_name || ""}`.trim() || "votre enfant";

    const origin = Deno.env.get("APP_ORIGIN") || "https://academieplus.app";
    const verifyUrl = `${origin}/verify-parental-consent?token=${encodeURIComponent(consent.token)}`;

    const html = `
      <p>Bonjour,</p>
      <p><strong>${childName}</strong> vient de créer un compte élève sur AcademiePlus et a indiqué votre adresse email comme parent/tuteur légal.</p>
      <p>Conformément à la réglementation sur la protection des données des mineurs, nous vous demandons de confirmer que vous autorisez la création de ce compte et le traitement des données de votre enfant :</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">Je confirme mon consentement</a></p>
      <p>Si vous n'êtes pas à l'origine de cette inscription ou ne souhaitez pas l'autoriser, ignorez simplement cet email : le compte restera en attente de vérification.</p>
      <p>— L'équipe AcademiePlus</p>
    `;
    const text = `${childName} a créé un compte élève sur AcademiePlus et a indiqué votre email comme parent/tuteur. Pour confirmer votre consentement, ouvrez ce lien : ${verifyUrl}`;

    await sendSmtpEmail(consent.parent_email, "Confirmation de consentement parental — AcademiePlus", html, text);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-parental-consent-email error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
