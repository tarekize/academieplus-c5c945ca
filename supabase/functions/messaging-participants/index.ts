import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  studentId: z.string().uuid(),
});

const fullName = (p: any) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() || "Utilisateur";

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
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Session invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Données invalides" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { studentId } = parsed.data;

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify the caller is either a teacher of, or a parent of, this student.
    const { data: isTeacher } = await admin.rpc("is_teacher_of", {
      _teacher_id: callerId,
      _student_id: studentId,
    });
    const { data: isParent } = await admin.rpc("is_parent_of", {
      _parent_id: callerId,
      _child_id: studentId,
    });

    if (!isTeacher && !isParent) {
      return new Response(JSON.stringify({ error: "Accès non autorisé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parents of the student.
    const { data: parentLinks } = await admin
      .from("parent_child_links")
      .select("parent_id")
      .eq("child_id", studentId)
      .eq("status", "active");
    const parentIds = (parentLinks || []).map((l: any) => l.parent_id);

    // Teachers of the student (via classes).
    const { data: memberships } = await admin
      .from("class_students")
      .select("class_id")
      .eq("student_id", studentId);
    const classIds = (memberships || []).map((m: any) => m.class_id);
    let teacherIds: string[] = [];
    if (classIds.length > 0) {
      const { data: classRows } = await admin
        .from("classes")
        .select("teacher_id")
        .in("id", classIds);
      teacherIds = Array.from(new Set((classRows || []).map((c: any) => c.teacher_id)));
    }

    const allIds = Array.from(new Set([...parentIds, ...teacherIds]));
    let profilesById: Record<string, any> = {};
    if (allIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", allIds);
      for (const p of profiles || []) profilesById[p.id] = p;
    }

    return new Response(
      JSON.stringify({
        parents: parentIds.map((id: string) => ({ id, name: fullName(profilesById[id]) })),
        teachers: teacherIds.map((id: string) => ({ id, name: fullName(profilesById[id]) })),
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
