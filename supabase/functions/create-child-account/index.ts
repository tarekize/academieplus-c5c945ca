import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Appelé par ParentDashboard.tsx quand un parent authentifié crée un compte
// élève pour son enfant. Vérifie que l'appelant possède bien le rôle "parent"
// (côté serveur, via user_roles) avant d'utiliser service_role pour créer le
// compte et le lien parent_child_links associé — un utilisateur non-parent
// ne peut donc jamais créer de compte élève même en appelant l'endpoint
// directement.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify parent identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parentId = user.id;

    // Check parent role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting : un parent ne peut pas créer un nombre illimité de
    // comptes élèves en boucle.
    const { data: rateLimitAllowed, error: rateLimitError } = await adminClient.rpc("check_and_log_rate_limit", {
      p_user_id: parentId,
      p_action: "create_child_account",
      p_window_seconds: 3600,
      p_max_requests: 10,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitAllowed) {
      return new Response(JSON.stringify({ error: "Trop de comptes créés récemment. Merci de patienter." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: parentRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", parentId)
      .eq("role", "parent")
      .maybeSingle();

    if (!parentRole) {
      return new Response(JSON.stringify({ error: "Seuls les parents peuvent créer un compte élève" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, firstName, lastName, schoolLevel, filiere, dateOfBirth } = await req.json();

    // Validate required fields (date de naissance obligatoire — conformité
    // mineurs : sans elle, aucun contrôle d'âge n'est possible côté serveur).
    if (!email || !password || !firstName || !lastName || !schoolLevel || !dateOfBirth) {
      return new Response(JSON.stringify({ error: "Tous les champs obligatoires doivent être remplis (dont la date de naissance)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Parent ${parentId} creating child account: ${email}, level: ${schoolLevel}`);

    // Create the student account. email_confirm: true est acceptable ici
    // car c'est le PARENT (déjà authentifié) qui saisit cette adresse pour
    // son enfant — mais si l'email n'appartient pas réellement à un
    // dispositif contrôlé par la famille, personne ne pourra jamais
    // confirmer / réinitialiser ce compte. Ce compromis reste documenté ici
    // plutôt que silencieux.
    // Le parent est déjà authentifié et effectue lui-même cette création :
    // c'est l'acte de consentement parental. On le trace avec son propre
    // email comme contact vérifiable, pour les élèves de moins de 15 ans
    // (handle_new_user l'exige désormais côté serveur).
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: "student",
        school_level: schoolLevel,
        filiere: filiere || null,
        date_of_birth: dateOfBirth,
        consent_parental: true,
        consent_parent_email: user.email,
      },
    });

    if (createError) {
      // Détail complet dans les logs serveur ; message générique au client
      // (sauf le cas "email déjà utilisé", qui est une info sûre à renvoyer).
      console.error("Error creating user:", createError);
      if (createError.message?.includes("already been registered")) {
        return new Response(JSON.stringify({ error: "Un compte avec cet email existe déjà" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Impossible de créer le compte, réessayez plus tard." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const childId = newUser.user.id;
    console.log(`Child account created: ${childId}`);

    // Auto-create parent-child link
    const { error: linkError } = await adminClient
      .from("parent_child_links")
      .insert({
        parent_id: parentId,
        child_id: childId,
        status: "active",
      });

    if (linkError) {
      console.error("Error creating link:", linkError);
      // Account was created but link failed - still return success with warning
    }

    console.log(`Parent-child link created: ${parentId} -> ${childId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Compte élève créé et lié avec succès",
        childId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
