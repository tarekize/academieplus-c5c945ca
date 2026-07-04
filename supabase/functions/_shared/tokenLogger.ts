import { createClient } from "npm:@supabase/supabase-js@2";

export type RoleGroup = "student" | "teacher" | "pedago" | "admin" | "parent" | "other";

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil((text || "").length / 4));
}

// Real token counts as reported by the AI provider's own usage field.
export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

/** @deprecated kept as an alias for AiUsage — prefer AiUsage in new code. */
export type GeminiUsage = AiUsage;

// Extracts real usage from a direct Gemini generateContent response body
// (`data.usageMetadata`). Returns null if the response doesn't carry usage
// metadata, so callers can fall back to an estimate rather than log a wrong zero.
export function extractGeminiUsage(data: any): AiUsage | null {
  const usage = data?.usageMetadata;
  if (!usage) return null;
  const inputTokens = Number(usage.promptTokenCount ?? 0);
  const outputTokens = Number(usage.candidatesTokenCount ?? 0);
  if (!inputTokens && !outputTokens) return null;
  return { inputTokens, outputTokens };
}

// Extracts real usage from an OpenAI-compatible chat/completions response
// (e.g. the Lovable AI Gateway), which reports `data.usage.prompt_tokens` /
// `completion_tokens`. Returns null if usage isn't present.
export function extractOpenAiCompatUsage(data: any): AiUsage | null {
  const usage = data?.usage;
  if (!usage) return null;
  const inputTokens = Number(usage.prompt_tokens ?? 0);
  const outputTokens = Number(usage.completion_tokens ?? 0);
  if (!inputTokens && !outputTokens) return null;
  return { inputTokens, outputTokens };
}

// Fire-and-forget: never await this in the caller's response path, never throw.
// Prefer passing real `inputTokens`/`outputTokens` (e.g. from extractGeminiUsage).
// Only fall back to `inputText`-based estimation when real usage isn't available.
export function logTokenUsageAsync(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string | null;
  roleGroup: RoleGroup;
  functionName: string;
  inputTokens?: number;
  outputTokens?: number;
  inputText?: string;
  estimatedOutputTokens?: number;
}): void {
  try {
    const client = createClient(params.supabaseUrl, params.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const isEstimated = params.inputTokens === undefined || params.outputTokens === undefined;
    const inputTokens = params.inputTokens ?? estimateTokens(params.inputText ?? "");
    const outputTokens = params.outputTokens ?? params.estimatedOutputTokens ?? 500;
    client
      .from("ai_token_usage")
      .insert({
        user_id: params.userId,
        role_group: params.roleGroup,
        function_name: params.functionName,
        estimated_input_tokens: inputTokens,
        estimated_output_tokens: outputTokens,
        is_estimated: isEstimated,
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
      role === "parent" ? "parent" :
      role === "admin" ? "admin" : "other";
    return { userId: user.id, roleGroup };
  } catch {
    return { userId: null, roleGroup: "other" };
  }
}
