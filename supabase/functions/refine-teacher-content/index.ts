// Chat libre, mais volontairement borné : une fois que generate-teacher-content
// a produit une liste d'exercices/quiz pour un enseignant (via HelpChatbot.tsx,
// écran "results"), l'enseignant peut discuter avec l'IA pour affiner CETTE
// liste précise — l'enrichir, retirer un item, corriger une réponse, etc. —
// mais l'IA doit refuser toute question hors de ce périmètre (pas de chat
// général). Réutilise le même pipeline JSON que generate-teacher-content
// (cleanGeneratedJson/fixJsonStringEscapes pour le LaTeX), dupliqué ici
// plutôt que partagé via _shared/ pour la même raison que les autres
// fonctions IA de ce dépôt (redéploiements mono-fonction qui ne repèrent pas
// toujours un _shared/ ajouté après coup).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractOpenAiCompatUsage, type AiUsage } from "../_shared/tokenLogger.ts";

function cleanGeneratedJson(rawContent: string): string {
  let cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) cleaned = objectMatch[0];
  return cleaned;
}

const LATEX_N_WORDS = ["nabla", "neq", "notin", "ncong", "nless", "ngtr", "nexists", "nmid"];
function looksLikeLatexNCommand(input: string, pos: number): boolean {
  return LATEX_N_WORDS.some((w) => input.startsWith(w, pos));
}

function fixJsonStringEscapes(input: string): string {
  let out = "";
  let inString = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!inString) { out += c; if (c === '"') inString = true; continue; }
    if (c === '"') { out += c; inString = false; continue; }
    if (c === "\n") { out += "\\n"; continue; }
    if (c === "\r") { out += "\\r"; continue; }
    if (c === "\t") { out += "\\t"; continue; }
    if (c !== "\\") { out += c; continue; }
    const next = input[i + 1];
    if (next === undefined) { out += "\\\\"; continue; }
    if (next === '"' || next === "\\" || next === "/") { out += "\\" + next; i++; continue; }
    if (next === "n" && !looksLikeLatexNCommand(input, i + 1)) { out += "\\n"; i++; continue; }
    if (next === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) { out += "\\u" + input.slice(i + 2, i + 6); i += 5; continue; }
    out += "\\\\";
  }
  return out;
}

function parseAiJson(rawContent: string): any {
  const cleaned = cleanGeneratedJson(rawContent);
  try { return JSON.parse(cleaned); } catch { /* fallthrough */ }
  const fixed = fixJsonStringEscapes(cleaned);
  return JSON.parse(fixed);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_ITEMS = 40;
const MAX_HISTORY = 12;

interface RefineItem {
  _type: "exercise" | "quiz";
  title?: string;
  statement?: string;
  question?: string;
  options?: string[];
  correct_answer?: string;
  hint?: string;
  solution?: string;
  explanation?: string;
  expected_answer?: string;
  difficulty?: number;
  [key: string]: unknown;
}

interface Body {
  items: RefineItem[];
  message: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

// Construit le prompt système : borne strictement l'IA à la liste d'items
// fournie (l'enseignant ne peut pas s'en servir comme chat général) et
// définit le format d'action JSON attendu en retour.
function buildPrompt(items: RefineItem[], message: string, history: { role: string; content: string }[]) {
  const itemsJson = JSON.stringify(
    items.map((it, i) => ({ index: i, ...it })),
    null,
    2
  );
  const historyText = history
    .slice(-MAX_HISTORY)
    .map((h) => `${h.role === "user" ? "Enseignant" : "Toi"} : ${h.content}`)
    .join("\n");

  const system = `Tu es un assistant qui aide EXCLUSIVEMENT un enseignant à affiner une liste d'exercices/quiz déjà générés pour ses élèves. Tu ne dois JAMAIS répondre à une question ou demande qui n'est pas directement liée à CES exercices/quiz précis (pas de conversation générale, pas de cours sur un autre sujet, pas d'aide administrative, pas de sujet hors mathématiques/pédagogie de cette liste). Si la demande est hors de ce périmètre, réponds poliment que tu ne peux aider que sur ces exercices/quiz, et renvoie "actions": [].

Voici la liste actuelle des exercices/quiz (index 0-based, NE PAS renuméroter) :
${itemsJson}

Selon la demande de l'enseignant, effectue une ou plusieurs de ces actions :
- Modifier un item existant : {"op":"update","index":N,"patch":{ ...uniquement les champs à changer... }}
- Supprimer un item : {"op":"remove","index":N}
- Ajouter un nouvel item (enrichir la liste) : {"op":"add","item":{"_type":"exercise"|"quiz", ...mêmes champs que les items ci-dessus...}}

Réponds UNIQUEMENT en JSON strict, sans texte autour :
{"reply":"réponse courte et naturelle à afficher à l'enseignant (en français, ton conversationnel)","actions":[...]}
Si tu ne fais aucune modification (juste une réponse informative), "actions" doit être [].

RÈGLES DE CONTENU pour tout texte d'exercice/quiz que tu écris ou modifies (statement/question/options/hint/solution/explanation) :
- Rédige-le EXCLUSIVEMENT en arabe (اللغة العربية), jamais en français, sauf notation mathématique universelle.
- Toute expression mathématique en LaTeX entre $...$ (ou $$...$$), ex: "$f(x) = \\frac{2x^{2}+3x-1}{x-1}$" — jamais en texte brut.
- Pour "solution" (exercice), garde le format HTML par étapes déjà utilisé : <p><strong>الخطوة 1 :</strong> ...</p>... <p><strong>الاستنتاج :</strong> $$ \\boxed{résultat} $$</p>.

${historyText ? `Historique récent de la conversation :\n${historyText}\n` : ""}
Demande actuelle de l'enseignant : "${message}"`;

  return { system };
}

async function callGateway(system: string): Promise<{ parsed: any; usage: AiUsage | null }> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY manquante");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  const usage = extractOpenAiCompatUsage(data);
  try {
    return { parsed: parseAiJson(content), usage };
  } catch (e) {
    console.error("[refine-teacher-content] JSON parse failed:", (e as Error).message, "raw:", content.slice(0, 500));
    return { parsed: { reply: "Désolé, une erreur est survenue en traitant la réponse. Réessayez.", actions: [] }, usage };
  }
}

// Valide et normalise les actions renvoyées par l'IA avant de les transmettre
// au frontend : un index hors bornes ou un op inconnu est silencieusement
// ignoré plutôt que de risquer de corrompre l'état côté client.
function sanitizeActions(rawActions: unknown, itemsCount: number): any[] {
  if (!Array.isArray(rawActions)) return [];
  const out: any[] = [];
  for (const a of rawActions) {
    if (!a || typeof a !== "object") continue;
    const op = (a as any).op;
    if (op === "update") {
      const index = Number((a as any).index);
      if (!Number.isInteger(index) || index < 0 || index >= itemsCount) continue;
      const patch = (a as any).patch;
      if (!patch || typeof patch !== "object") continue;
      out.push({ op: "update", index, patch });
    } else if (op === "remove") {
      const index = Number((a as any).index);
      if (!Number.isInteger(index) || index < 0 || index >= itemsCount) continue;
      out.push({ op: "remove", index });
    } else if (op === "add") {
      const item = (a as any).item;
      if (!item || typeof item !== "object") continue;
      if (item._type !== "exercise" && item._type !== "quiz") continue;
      const hasText = item._type === "quiz" ? !!item.question : !!item.statement;
      if (!hasText) continue;
      out.push({ op: "add", item });
    }
  }
  return out;
}

// Appelée par HelpChatbot.tsx (écran "results", après génération) quand
// l'enseignant envoie un message dans le chat libre borné. Authentification +
// rôle (teacher/pedago/admin) + rate limiting obligatoires : même garde que
// generate-teacher-content, cet appel consomme un quota IA payant.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrlAuth = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKeyAuth = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrlAuth, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller }, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClientAuth = createClient(supabaseUrlAuth, serviceRoleKeyAuth, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: callerRoles } = await adminClientAuth.from("user_roles").select("role").eq("user_id", caller.id);
    const isAuthorized = (callerRoles ?? []).some((r: any) => ["teacher", "pedago", "admin"].includes(r.role));
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Accès réservé aux enseignants et à l'équipe pédagogique" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: allowed, error: rateLimitError } = await adminClientAuth.rpc("check_and_log_rate_limit", {
      p_user_id: caller.id,
      p_action: "ia_teacher_content_refine",
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!allowed) {
      return new Response(JSON.stringify({ error: "Trop de requêtes. Merci de patienter quelques instants." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const items = Array.isArray(body?.items) ? body.items.slice(0, MAX_ITEMS) : [];
    const message = (body?.message || "").trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun exercice/quiz à discuter" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const history = Array.isArray(body?.conversationHistory) ? body.conversationHistory : [];

    const { system } = buildPrompt(items, message, history);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { parsed, usage } = await callGateway(system);
    const reply = typeof parsed?.reply === "string" && parsed.reply.trim()
      ? parsed.reply.trim()
      : "Je n'ai pas de réponse à apporter pour cette demande.";
    const actions = sanitizeActions(parsed?.actions, items.length);

    if (usage) {
      resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, req.headers.get("Authorization")).then(({ userId, roleGroup }) => {
        logTokenUsageAsync({
          supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "refine-teacher-content",
          inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
        });
      });
    }

    return new Response(JSON.stringify({ reply, actions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
