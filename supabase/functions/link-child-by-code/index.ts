import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { code } = await req.json();
    console.log("Received linking code request:", { code: code ? "***" : "empty" });

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Code de liaison requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate code format (8 hex characters)
    const trimmedCode = code.trim().toLowerCase();
    if (!/^[a-f0-9]{8}$/i.test(trimmedCode)) {
      console.log("Invalid code format:", trimmedCode);
      return new Response(
        JSON.stringify({ error: "Format de code invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's token (to get the parent's identity)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get parent identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parentId = user.id;
    console.log("Parent ID:", parentId);

    // Use service role client to bypass RLS and find child by code
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // --- Rate limiting: too many code guesses from this account recently ->
    // block. Prevents brute-forcing the 8-char linking code to gain access to
    // an arbitrary child's data. check_and_log_rate_limit counts + logs the
    // attempt atomically (per-user advisory lock, see migration
    // 20260723120200) so concurrent parallel guesses can't all slip through
    // on the same stale count before any of them is recorded — it gates on
    // every attempt (not just failures), which is also a tighter brute-force
    // bound than counting failures alone. ---
    const { data: allowed, error: rateLimitError } = await adminClient.rpc("check_and_log_rate_limit", {
      p_user_id: parentId,
      p_action: "link_code_attempt",
      p_window_seconds: WINDOW_MINUTES * 60,
      p_max_requests: MAX_ATTEMPTS,
    });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      console.log(`Rate limit hit for parent ${parentId}`);
      return new Response(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques minutes." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find the child profile by linking code (case-insensitive)
    const { data: childProfile, error: findError } = await adminClient
      .from("profiles")
      .select("id, first_name, last_name")
      .ilike("linking_code", trimmedCode)
      .maybeSingle();

    if (findError) {
      console.error("Error finding child:", findError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la recherche" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!childProfile) {
      console.log("No child found for code:", trimmedCode);
      return new Response(
        JSON.stringify({ error: "Code de liaison invalide" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const childId = childProfile.id;
    console.log("Found child ID:", childId);

    // Prevent self-linking
    if (childId === parentId) {
      return new Response(
        JSON.stringify({ error: "Vous ne pouvez pas vous lier à vous-même" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if the child is actually a student (has student role)
    const { data: childRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", childId)
      .eq("role", "student")
      .maybeSingle();

    if (!childRole) {
      console.log("Child is not a student");
      return new Response(
        JSON.stringify({ error: "Ce code n'appartient pas à un élève" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if link already exists
    const { data: existingLink } = await adminClient
      .from("parent_child_links")
      .select("id, status")
      .eq("parent_id", parentId)
      .eq("child_id", childId)
      .maybeSingle();

    if (existingLink) {
      console.log("Link already exists:", existingLink);
      return new Response(
        JSON.stringify({
          error:
            existingLink.status === "pending"
              ? "Une demande de liaison est déjà en attente"
              : existingLink.status === "active"
                ? "Ce lien existe déjà"
                : "Votre précédente demande a été refusée par l'élève",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create the parent-child link as a pending request — it only becomes
    // active once the child accepts it from their own account (see
    // respondToRequest in useProfile.ts). The child_id/status columns are
    // also enforced server-side by the force_pending_link_status trigger,
    // this INSERT just states the intent explicitly.
    const { error: insertError } = await adminClient
      .from("parent_child_links")
      .insert({
        parent_id: parentId,
        child_id: childId,
        status: "pending",
      });

    if (insertError) {
      // 23505 = violation de la contrainte UNIQUE(parent_id, child_id)
      // (garde-fou DB contre la course entre le contrôle "lien existant ?"
      // ci-dessus et cet insert — cf. migration 20260723120300).
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "Une demande de liaison existe déjà pour cet élève." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("Error creating link:", insertError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création du lien" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Pending link request created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demande envoyée : elle sera active dès que l'élève l'acceptera depuis son compte.",
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
