import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ROLES = ["admin", "pedago", "parent", "student", "teacher", "etablissement"];

// Point d'entrée appelé par les pages d'administration (Admin.tsx et
// équivalents) pour créer un compte de n'importe quel rôle — y compris
// admin/pedago/etablissement, impossibles à s'auto-attribuer via signUp()
// normal (handle_new_user ne mappe que student/parent/teacher depuis les
// métadonnées). Revérifie systématiquement côté serveur que l'appelant est
// admin (jamais fait confiance au JWT seul) avant d'utiliser le service role
// key. Chaque étape qui échoue après la création du compte Auth déclenche un
// rollback (deleteUser) pour ne jamais laisser un compte orphelin sans rôle.
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

    // Client scoped to the caller — validates their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client with full privileges
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify the caller is an admin
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

    // Parse body
    const {
      email, password, firstName, lastName, role, schoolLevel, filiere,
      phone, dateOfBirth, wilaya, ville, ecole, subscriptionEndDate, subjects,
    } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "email, password et role sont obligatoires" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return new Response(JSON.stringify({ error: `Rôle invalide : ${role}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Un pédago doit enseigner au moins une matière, et une matière ne peut
    // être assignée qu'à un seul pédago à la fois (contrainte métier).
    let pedagoSubjects: string[] = [];
    if (role === "pedago") {
      pedagoSubjects = Array.isArray(subjects) ? subjects.filter((s: unknown) => typeof s === "string") : [];
      if (pedagoSubjects.length === 0) {
        return new Response(JSON.stringify({ error: "Sélectionnez au moins une matière enseignée par ce pédago." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: alreadyTaken, error: takenError } = await adminClient
        .from("pedago_subjects")
        .select("subject_id, profiles:user_id(first_name, last_name, email)")
        .in("subject_id", pedagoSubjects);
      if (takenError) throw takenError;

      if (alreadyTaken && alreadyTaken.length > 0) {
        const details = alreadyTaken
          .map((row: any) => {
            const p = row.profiles;
            const name = p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email : "un autre pédago";
            return `${row.subject_id} (déjà assignée à ${name})`;
          })
          .join(", ");
        return new Response(
          JSON.stringify({ error: `Matière(s) déjà assignée(s) à un autre pédago : ${details}` }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create the user in Supabase Auth
    const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName ?? "", last_name: lastName ?? "" },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = newUserData.user!.id;

    // Insert role
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: newUserId,
      role,
    });

    // Sans ce rollback, un échec ici (contrainte unique, erreur transitoire...)
    // laissait un compte Auth pleinement créé mais sans rôle ni profil, et
    // irrécupérable : ce même email ne peut plus être réutilisé ("déjà
    // enregistré") tant que personne ne supprime manuellement l'utilisateur
    // orphelin. Même pattern que le rollback déjà en place plus bas pour le
    // conflit de matière pédago.
    if (roleError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Establishment accounts get a unique enrollment code (used by teachers at sign-up).
    let establishmentCode: string | null = null;
    if (role === "etablissement") {
      const { data: codeData, error: codeError } = await adminClient.rpc(
        "generate_establishment_code"
      );
      if (codeError) {
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(JSON.stringify({ error: codeError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      establishmentCode = codeData as unknown as string;
    }

    // Upsert profile (the trigger may have already created it)
    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: newUserId,
        email,
        first_name: firstName ?? null,
        last_name: lastName ?? null,
        school_level: role === "student" && schoolLevel ? schoolLevel : null,
        filiere: role === "student" && filiere ? filiere : null,
        phone: phone ?? null,
        date_of_birth: dateOfBirth ?? null,
        wilaya: role === "student" ? (wilaya ?? null) : null,
        ville: role === "student" ? (ville ?? null) : null,
        ecole: role === "student" ? (ecole ?? null) : null,
        establishment_code: establishmentCode,
        is_active: true,
      },
      { onConflict: "id" }
    );
    if (profileError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Accorde immédiatement un accès premium jusqu'à la date choisie, sans
    // passer par un paiement — même modèle en jours-crédit que
    // admin_grant_subscription_days (RPC non réutilisable ici : elle vérifie
    // auth.uid(), qui est vide sous la clé service_role de cette fonction ;
    // le contrôle admin a déjà été fait plus haut par ce endpoint lui-même).
    if (role === "student" && subscriptionEndDate) {
      const endDate = new Date(`${subscriptionEndDate}T00:00:00Z`);
      const days = Math.ceil((endDate.getTime() - Date.now()) / 86_400_000);
      if (days > 0) {
        const { error: subError } = await adminClient.from("student_subscriptions").insert({
          user_id: newUserId,
          plan_type: "admin_grant",
          total_days: days,
          days_used: 0,
          is_paused: false,
          started_at: new Date().toISOString(),
          last_tick_at: new Date().toISOString(),
        });
        if (subError) {
          console.error("student_subscriptions insert failed:", subError);
        }
      }
    }

    // Assigne les matières au pédago. subject_id est la clé primaire de
    // pedago_subjects : un conflit ici signifie qu'une autre requête vient
    // d'assigner la même matière entre-temps (course rare) — dans ce cas on
    // annule la création du compte plutôt que de laisser un pédago sans
    // matière cohérente.
    if (role === "pedago" && pedagoSubjects.length > 0) {
      const { error: subjectsError } = await adminClient.from("pedago_subjects").insert(
        pedagoSubjects.map((subjectId) => ({ subject_id: subjectId, user_id: newUserId }))
      );
      if (subjectsError) {
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: "Une des matières sélectionnées vient d'être assignée à un autre pédago. Réessayez avec d'autres matières." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ success: true, userId: newUserId, establishmentCode }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-create-user error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
