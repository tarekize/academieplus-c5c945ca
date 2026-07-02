import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const resendKey = Deno.env.get("RESEND_API_KEY");
    let success = false;
    let errorMessage: string | null = null;

    if (!resendKey) {
      errorMessage = "RESEND_API_KEY non configurée";
    } else {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AcademiePlus <onboarding@resend.dev>",
          to: [targetProfile.email],
          subject,
          html,
        }),
      });
      success = emailRes.ok;
      if (!success) {
        const rawError = await emailRes.text();
        try {
          const parsed = JSON.parse(rawError);
          errorMessage = parsed.message || rawError;
        } catch {
          errorMessage = rawError;
        }
      }
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
