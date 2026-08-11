import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inlined from _shared/tokenLogger.ts : le déploiement via l'outil MCP ne
// résout pas les imports relatifs hors du dossier de la fonction.
type RoleGroup = "student" | "teacher" | "pedago" | "admin" | "parent" | "other";
interface AiUsage { inputTokens: number; outputTokens: number; }

function extractGeminiUsage(data: any): AiUsage | null {
  const usage = data?.usageMetadata;
  if (!usage) return null;
  const inputTokens = Number(usage.promptTokenCount ?? 0);
  const outputTokens = Number(usage.candidatesTokenCount ?? 0);
  if (!inputTokens && !outputTokens) return null;
  return { inputTokens, outputTokens };
}

function logTokenUsageAsync(params: {
  supabaseUrl: string; serviceRoleKey: string; userId: string | null; roleGroup: RoleGroup;
  functionName: string; inputTokens?: number; outputTokens?: number; inputText?: string; estimatedOutputTokens?: number;
}): void {
  try {
    const client = createClient(params.supabaseUrl, params.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const isEstimated = params.inputTokens === undefined || params.outputTokens === undefined;
    const inputTokens = params.inputTokens ?? Math.max(1, Math.ceil((params.inputText ?? "").length / 4));
    const outputTokens = params.outputTokens ?? params.estimatedOutputTokens ?? 500;
    client.from("ai_token_usage").insert({
      user_id: params.userId, role_group: params.roleGroup, function_name: params.functionName,
      estimated_input_tokens: inputTokens, estimated_output_tokens: outputTokens, is_estimated: isEstimated,
    }).then(({ error }: any) => { if (error) console.error(`[tokenLogger] insert failed for ${params.functionName}:`, error.message); });
  } catch (e) {
    console.error(`[tokenLogger] unexpected error for ${params.functionName}:`, e);
  }
}

async function resolveCallerRoleGroup(supabaseUrl: string, serviceRoleKey: string, authHeader: string | null): Promise<{ userId: string | null; roleGroup: RoleGroup }> {
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIProvider = {
  name: string;
  call: (systemPrompt: string, userPrompt: string) => Promise<{ text: string; usage: AiUsage | null }>;
};

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Lovable AI failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("GEMINI_API_KEY");
  if (!KEY) throw new Error("GEMINI_API_KEY not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 3000 },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const KEY = Deno.env.get("GROQ_API_KEY");
  if (!KEY) throw new Error("GROQ_API_KEY not configured");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Groq failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini2(systemPrompt: string, userPrompt: string): Promise<{ text: string; usage: AiUsage | null }> {
  const KEY = Deno.env.get("GEMINI_API_KEY_2");
  if (!KEY) throw new Error("GEMINI_API_KEY_2 not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 3000 },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini2 failed: ${response.status} ${t}`);
  }
  const data = await response.json();
  return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", usage: extractGeminiUsage(data) };
}

async function generateWithAI(systemPrompt: string, userPrompt: string): Promise<{ content: string; provider: string; usage: AiUsage | null }> {
  const providers: AIProvider[] = [
    { name: "Gemini key 2", call: callGemini2 },
  ];
  const errors: string[] = [];
  for (const p of providers) {
    try {
      console.log(`Trying ${p.name}...`);
      const { text: content, usage } = await p.call(systemPrompt, userPrompt);
      if (!content.trim()) throw new Error("Empty response");
      console.log(`${p.name} succeeded.`);
      return { content, provider: p.name, usage };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${p.name}: ${msg}`);
      console.error(`${p.name} failed`, msg);
    }
  }
  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // --- Authentification obligatoire : cette fonction consomme un quota
    // IA payant à chaque appel. resolveCallerRoleGroup() plus bas ne fait
    // que catégoriser l'appelant pour les logs, il ne rejette rien. ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseUrlAuth = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const userClient = createClient(supabaseUrlAuth, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Rate limiting : cette fonction consomme un quota IA payant.
    const rateLimitClient = createClient(supabaseUrlAuth, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // --- La fiche de révision est un contenu PARTAGÉ publié par le
    // pédagogue (cf. migration chapter_revision_shared_pedago_only) : seuls
    // admin/pédago peuvent en générer une, sinon chaque élève créerait sa
    // propre copie privée payante en IA.
    const { data: callerRoles } = await rateLimitClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);
    const isAllowed = (callerRoles || []).some((r: any) => r.role === "admin" || r.role === "pedago");
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ success: false, error: "Réservé aux pédagogues et administrateurs." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: rateLimitAllowed, error: rateLimitError } = await rateLimitClient.rpc("check_and_log_rate_limit", {
      p_user_id: caller.id,
      p_action: "generate_chapter_revision",
      p_window_seconds: 60,
      p_max_requests: 15,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitAllowed) {
      return new Response(
        JSON.stringify({ success: false, error: "Trop de requêtes. Merci de patienter quelques instants." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { chapterTitle, lessons } = await req.json();
    if (!chapterTitle || !Array.isArray(lessons)) {
      return new Response(
        JSON.stringify({ success: false, error: "chapterTitle and lessons[] required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonsBlock = lessons
      .map((l: any, i: number) => {
        const title = l.titleAr || l.title || `الدرس ${i + 1}`;
        const body = stripHtml(l.content || "").slice(0, 1500); // 1500 limit for Groq
        return `### ${i + 1}. ${title}\n${body || "(لا يوجد محتوى)"}`;
      })
      .join("\n\n");

    const systemPrompt = `أنت معلم رياضيات جزائري خبير. مهمتك إنشاء بطاقة مراجعة شاملة (fiche de révision) لفصل كامل، على شكل مخطط تخطيطي توضيحي (schéma explicatif) منظّم، باللغة العربية، يغطي كل دروس الفصل من البداية إلى النهاية.

قواعد الإخراج (مهم جدا):
- أخرج Markdown فقط (بدون blocs de code ولا JSON).
- استعمل LaTeX داخل $...$ أو $$...$$ للصيغ الرياضية.
- استعمل العناوين والرموز التوضيحية: 🎯 📌 🔑 ⚡ ✅ 💡 ➡️ 📊
- ابدأ بعنوان رئيسي # ثم خريطة ذهنية مبسطة بين الدروس (مع أسهم ➡️).
- لكل درس: عنوان فرعي ## يحتوي على: المفاهيم الأساسية، الصيغ المهمة (في جدول أو قائمة)، خطوات الحل النموذجية، أخطاء شائعة، نصائح.
- في الأخير قسم "🔗 الروابط بين الدروس" يبيّن العلاقة بينها.
- اجعل المخطط واضحاً، متسلسلاً، وسهل الحفظ.
- لا تكتب أي شرح خارج البطاقة.`;

    const userPrompt = `الفصل: ${chapterTitle}

دروس الفصل:
${lessonsBlock}

أنشئ الآن بطاقة المراجعة التخطيطية الكاملة لهذا الفصل.`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { content, provider, usage } = await generateWithAI(systemPrompt, userPrompt);

    // Log de consommation IA seulement si l'appel a réellement abouti.
    if (usage) {
      resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, req.headers.get("Authorization")).then(({ userId, roleGroup }) => {
        logTokenUsageAsync({
          supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "generate-chapter-revision",
          inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
        });
      });
    }

    return new Response(
      JSON.stringify({ success: true, content, provider }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generate-chapter-revision error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
