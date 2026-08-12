import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  code: z.string().trim().min(4).max(20),
});

const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;

// .ilike() traite % et _ comme des jokers SQL LIKE : sans échappement, un
// élève soumettant par exemple "____" (4 underscores) fait chercher "une
// classe dont le code fait exactement 4 caractères", au lieu du code exact
// qu'il est censé connaître — un moyen de deviner un code de classe sans le
// connaître. Échapper \, % et _ neutralise ces jokers (\ est l'échappement
// LIKE par défaut de Postgres).
function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// Appelé par JoinClassDialog.tsx et JoinClass.tsx quand un élève authentifié
// saisit le code de classe fourni par son enseignant. Vérifie côté serveur
// que l'appelant a bien le rôle "student" (pas seulement masqué côté UI),
// applique une limite de tentatives (voir check_and_log_rate_limit) pour
// empêcher de deviner un join_code par force brute, et n'autorise qu'une
// seule classe active par élève.
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

    // Client scoped to the caller (validates the JWT).
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Session invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const studentId = userData.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Code invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const code = parsed.data.code;

    // Admin client for privileged lookups.
    const admin = createClient(supabaseUrl, serviceKey);

    // Confirm the caller is a student.
    const { data: studentRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", studentId);
    const isStudent = (studentRoles || []).some((r: any) => r.role === "student");
    if (!isStudent) {
      return new Response(JSON.stringify({ error: "Seuls les élèves peuvent rejoindre une classe" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting: too many code guesses from this student recently -> block.
    // The join_code lookup is now joker-escaped (see escapeLikePattern above),
    // but without a frequency cap it's still brute-forceable by scripted
    // trial-and-error (cf. link-child-by-code, same pattern).
    const { data: allowed, error: rateLimitError } = await admin.rpc("check_and_log_rate_limit", {
      p_user_id: studentId,
      p_action: "join_class_attempt",
      p_window_seconds: WINDOW_MINUTES * 60,
      p_max_requests: MAX_ATTEMPTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Find the class by its join code.
    const { data: klass } = await admin
      .from("classes")
      .select("id, name")
      .ilike("join_code", escapeLikePattern(code))
      .maybeSingle();
    if (!klass) {
      return new Response(JSON.stringify({ error: "Aucune classe trouvée avec ce code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // A student can belong to only one class at a time.
    const { data: existing } = await admin
      .from("class_students")
      .select("id")
      .eq("student_id", studentId)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Vous êtes déjà membre d'une classe. Quittez-la avant d'en rejoindre une autre." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insert the membership (ignore duplicates).
    const { error: insertErr } = await admin
      .from("class_students")
      .insert({ class_id: klass.id, student_id: studentId });

    if (insertErr) {
      // 23505 = violation de la contrainte UNIQUE(student_id) (garde-fou DB
      // contre la course entre le contrôle ci-dessus et cet insert — cf.
      // migration 20260723120300) : le message reste générique car la classe
      // déjà rejointe entre-temps peut être différente de celle-ci.
      if (insertErr.code === "23505") {
        return new Response(JSON.stringify({ error: "Vous êtes déjà membre d'une classe. Quittez-la avant d'en rejoindre une autre." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insertErr;
    }

    return new Response(
      JSON.stringify({ success: true, class: { id: klass.id, name: klass.name } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message || "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
