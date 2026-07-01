import { createClient } from "npm:@supabase/supabase-js@2";

export type RoleGroup = "student" | "teacher" | "pedago" | "admin" | "other";

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil((text || "").length / 4));
}

// Fire-and-forget: never await this in the caller's response path, never throw.
export function logTokenUsageAsync(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string | null;
  roleGroup: RoleGroup;
  functionName: string;
  inputText: string;
  estimatedOutputTokens?: number;
}): void {
  try {
    const client = createClient(params.supabaseUrl, params.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const inputTokens = estimateTokens(params.inputText);
    client
      .from("ai_token_usage")
      .insert({
        user_id: params.userId,
        role_group: params.roleGroup,
        function_name: params.functionName,
        estimated_input_tokens: inputTokens,
        estimated_output_tokens: params.estimatedOutputTokens ?? 500,
      })
      .then(({ error }: any) => {
        if (error) console.error(`[tokenLogger] insert failed for ${params.functionName}:`, error.message);
      });
  } catch (e) {
    console.error(`[tokenLogger] unexpected error for ${params.functionName}:`, e);
  }
}

// Best-effort role resolution from the caller's JWT. Degrades to {userId:null, roleGroup:'other'} on any failure.
export async function resolveCallerRoleGroup(
  supabaseUrl: string,
  serviceRoleKey: string,
  authHeader: string | null
): Promise<{ userId: string | null; roleGroup: RoleGroup }> {
  if (!authHeader) return { userId: null, roleGroup: "other" };
  try {
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return { userId: null, roleGroup: "other" };

    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: roleRow } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    const role = roleRow?.role;
    const roleGroup: RoleGroup =
      role === "student" ? "student" :
      role === "teacher" ? "teacher" :
      role === "pedago" ? "pedago" :
      role === "admin" ? "admin" : "other";
    return { userId: user.id, roleGroup };
  } catch {
    return { userId: null, roleGroup: "other" };
  }
}
