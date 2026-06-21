import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  classId: z.string().uuid(),
  code: z.string().trim().min(4).max(20),
});

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
    const teacherId = userData.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Données invalides" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { classId, code } = parsed.data;

    // Admin client for privileged lookups.
    const admin = createClient(supabaseUrl, serviceKey);

    // Verify caller is a teacher.
    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", teacherId);
    const isTeacher = (roleRows || []).some((r: any) => r.role === "teacher" || r.role === "admin");
    if (!isTeacher) {
      return new Response(JSON.stringify({ error: "Accès réservé aux enseignants" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the class belongs to this teacher.
    const { data: klass } = await admin
      .from("classes")
      .select("id, teacher_id")
      .eq("id", classId)
      .maybeSingle();
    if (!klass || klass.teacher_id !== teacherId) {
      return new Response(JSON.stringify({ error: "Classe introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the student profile by linking code.
    const { data: student } = await admin
      .from("profiles")
      .select("id, first_name, last_name")
      .ilike("linking_code", code)
      .maybeSingle();
    if (!student) {
      return new Response(JSON.stringify({ error: "Aucun élève trouvé avec ce code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Confirm the target is a student.
    const { data: studentRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", student.id);
    const isStudent = (studentRoles || []).some((r: any) => r.role === "student");
    if (!isStudent) {
      return new Response(JSON.stringify({ error: "Ce code n'appartient pas à un élève" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert the membership (ignore duplicates).
    const { error: insertErr } = await admin
      .from("class_students")
      .insert({ class_id: classId, student_id: student.id });

    if (insertErr) {
      if (insertErr.code === "23505") {
        return new Response(JSON.stringify({ error: "Cet élève est déjà dans la classe" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insertErr;
    }

    return new Response(
      JSON.stringify({
        success: true,
        student: {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message || "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
