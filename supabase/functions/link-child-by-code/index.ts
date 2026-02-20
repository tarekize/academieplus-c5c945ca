import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
              : "Ce lien existe déjà",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create the parent-child link
    const { error: insertError } = await adminClient
      .from("parent_child_links")
      .insert({
        parent_id: parentId,
        child_id: childId,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating link:", insertError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création du lien" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Link created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demande de liaison envoyée",
        child: {
          first_name: childProfile.first_name,
          last_name: childProfile.last_name,
        },
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
