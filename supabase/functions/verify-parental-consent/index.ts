// Vérifie le jeton envoyé par email au parent/tuteur (send-parental-consent-email)
// et marque le consentement comme vérifié. Public et non authentifié par
// nature : c'est le parent, pas l'élève, qui clique sur le lien reçu par
// email — la sécurité repose sur l'entropie du jeton (24 octets aléatoires),
// pas sur une session utilisateur.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let token: string | null = null;
    if (req.method === "GET") {
      token = new URL(req.url).searchParams.get("token");
    } else {
      const body = await req.json().catch(() => ({}));
      token = body?.token ?? null;
    }

    if (!token) {
      return new Response(JSON.stringify({ error: "Jeton manquant" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: consent, error: findError } = await supabase
      .from("parental_consents")
      .select("id, verified, expires_at")
      .eq("token", token)
      .maybeSingle();
    if (findError) throw findError;

    if (!consent) {
      return new Response(JSON.stringify({ error: "Jeton invalide." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (consent.verified) {
      return new Response(JSON.stringify({ ok: true, already_verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(consent.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Ce lien a expiré. Contactez le support." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("parental_consents")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", consent.id);
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("verify-parental-consent error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
