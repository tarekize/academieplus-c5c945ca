// Extrait des exercices/quiz/examens à partir d'un document importé (PDF, Word
// déjà converti en texte côté client, ou image) — enseignant/pédago/admin
// seulement. Contrairement à generate-teacher-content (qui INVENTE du contenu
// à partir d'un sujet), cette fonction EXTRAIT le contenu déjà présent dans le
// document fourni, sans en inventer de nouveau. Retourne le même contrat
// {items: GeneratedItem[]} que generate-teacher-content pour pouvoir réutiliser
// telles quelles les étapes de relecture/envoi déjà en place côté client.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractGeminiUsage, type AiUsage } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 10;

// NB : dupliqué (plutôt que partagé via _shared/) car les redéploiements
// mono-fonction de cette plateforme ne repèrent pas toujours un nouveau
// fichier _shared/ ajouté après coup ("Module not found" au déploiement) —
// chaque function reste donc volontairement autonome pour ce point.
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
    if (!inString) {
      out += c;
      if (c === '"') inString = true;
      continue;
    }
    if (c === '"') { out += c; inString = false; continue; }
    if (c === "\n") { out += "\\n"; continue; }
    if (c === "\r") { out += "\\r"; continue; }
    if (c === "\t") { out += "\\t"; continue; }
    if (c !== "\\") { out += c; continue; }
    const next = input[i + 1];
    if (next === undefined) { out += "\\\\"; continue; }
    if (next === '"' || next === "\\" || next === "/") {
      out += "\\" + next; i++; continue;
    }
    if (next === "n" && !looksLikeLatexNCommand(input, i + 1)) {
      out += "\\n"; i++; continue;
    }
    if (next === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
      out += "\\u" + input.slice(i + 2, i + 6); i += 5; continue;
    }
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

// Le contenu d'un document importé peut contenir des demi-paires UTF-16
// orphelines ou des caractères de contrôle invisibles — Gemini rejette la
// requête entière avec un 400 générique dans ce cas.
function sanitizeForGemini(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
}

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

// Convertit les parts façon OpenAI (texte / image_url en data URL) envoyées par
// le client en "parts" Gemini — inlineData accepte aussi bien une image qu'un
// PDF (mimeType: application/pdf), Gemini analyse alors le document directement
// plutôt qu'une simple OCR sur une image brute.
function toGeminiParts(parts: ContentPart[]): any[] {
  const out: any[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (p.type === "text" && typeof p.text === "string") {
      out.push({ text: sanitizeForGemini(p.text) });
    } else if (p.type === "image_url" && p.image_url?.url) {
      const m = p.image_url.url.match(/^data:([^;]+);base64,(.+)$/);
      if (m) out.push({ inlineData: { mimeType: m[1], data: m[2] } });
    }
  }
  if (out.length === 0) out.push({ text: "" });
  return out;
}

interface Body {
  contentType: "exercise" | "quiz" | "exam";
  parts: ContentPart[];
}

function buildSystemPrompt(contentType: Body["contentType"]): string {
  const kindLabel = contentType === "quiz" ? "des questions à choix multiple (QCM)" : "des exercices";
  return `Tu es un professeur de mathématiques algérien expert. Un document (PDF, image ou texte extrait d'un fichier Word) t'est fourni.
Ta mission : EXTRAIRE ${kindLabel} déjà présents dans ce document — n'invente RIEN, ne complète pas un énoncé incomplet, n'ajoute aucun exercice qui n'est pas dans le document. Si le document ne contient aucun exercice/question exploitable, réponds avec une liste "items" vide.
IMPORTANT — Langue : rédige la totalité du contenu extrait (énoncés, options, réponses, indices, explications) EXCLUSIVEMENT en arabe (اللغة العربية), même si le document source est en français — traduis fidèlement, sans changer le sens ni les valeurs numériques.

RÈGLE ABSOLUE — AUCUN DIALOGUE : tu n'es PAS dans une conversation avec l'utilisateur, il ne verra jamais ta réponse brute et ne peut pas te répondre. Ne pose donc JAMAIS de question, ne demande JAMAIS de clarification ni de confirmation (ex: "veux-tu exactement les mêmes exercices ou que je les améliore ?"), n'explique pas ce que tu vas faire. Décide seul, silencieusement, et applique systématiquement ce choix par défaut : retranscris fidèlement les exercices tels qu'ils sont dans le document, SANS les améliorer, SANS changer leur difficulté ni leur énoncé — la seule adaptation autorisée est la traduction vers l'arabe et la mise en forme LaTeX déjà exigées ci-dessus. Ta toute première caractère de réponse doit être "{" et rien d'autre avant.

FORMAT MATHÉMATIQUE OBLIGATOIRE : TOUTES les expressions mathématiques (variables, fonctions, fractions, puissances, indices, limites, racines, symboles ∞, ≤, ≥, ≠, ±, →, etc.) DOIVENT être réécrites en LaTeX entre délimiteurs $...$ (ou $$...$$ pour une formule isolée), pour le rendu KaTeX côté client — même si le document source ne les avait pas en LaTeX.
- Fractions : \\frac{a}{b} (JAMAIS a/b en texte brut).
- Puissances : x^{n} (JAMAIS x^n ni x**n). Indices : x_{n}. Racines : \\sqrt{x}.
- Symboles : \\infty, \\to, \\lim_{x \\to +\\infty}, \\leq, \\geq, \\neq, \\pm, \\cdot, \\times.`;
}

function buildUserPrompt(contentType: Body["contentType"]): string {
  if (contentType === "quiz") {
    return `Extrais du document ci-joint toutes les questions à choix multiple qu'il contient (aucune limite de nombre, prends-les toutes).
Si le document contient des exercices ouverts (pas de choix multiple), transforme chacun en QCM à 4 options plausibles seulement si un énoncé à choix explicite existe déjà dans le document — sinon ignore-le.
Réponds UNIQUEMENT en JSON valide de la forme :
{"items":[{"question":"...","options":["A","B","C","D"],"correct_answer":"la bonne option exacte (texte identique à l'une des options)","hint":"indice utile sans donner la réponse","explanation":"explication de la correction","difficulty":1}]}
Les "options" et "correct_answer" doivent aussi utiliser LaTeX entre $...$ quand elles contiennent des maths. "difficulty" est une estimation de 1 (facile) à 5 (avancé) basée sur le contenu réel de la question.
⚠️ Réponds directement par l'objet JSON, sans aucune question ni texte avant/après.`;
  }
  return `Extrais du document ci-joint tous les ${contentType === "exam" ? "exercices d'examen" : "exercices"} qu'il contient (aucune limite de nombre, prends-les tous).
Réponds UNIQUEMENT en JSON valide de la forme :
{"items":[{"title":"titre court","statement":"énoncé complet de l'exercice, retranscrit fidèlement","hint":"indice utile sans donner la réponse","expected_answer":"réponse attendue concise (si présente dans le document, sinon déduis-la de la solution)","solution":"corrigé si présent dans le document, sinon une correction détaillée que tu rédiges toi-même (voir format ci-dessous)","difficulty":2}]}

Format de "solution" — OBLIGATOIRE :
- Corrections RICHES et DÉTAILLÉES en HTML avec plusieurs étapes numérotées, JAMAIS une seule ligne.
- Structure attendue : <p><strong>الخطوة 1 :</strong> ...</p><p>$$ formule $$</p><p><strong>الخطوة 2 :</strong> ...</p>... puis <p><strong>الاستنتاج :</strong> $$ \\boxed{résultat} $$</p>.
- "difficulty" est une estimation de 1 (facile) à 5 (avancé) basée sur le contenu réel de l'exercice.
⚠️ Réponds directement par l'objet JSON, sans aucune question ni texte avant/après.`;
}

async function callGemini(systemPrompt: string, userParts: any[]): Promise<{ text: string; usage: AiUsage | null }> {
  const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!GEMINI_API_KEY_2) throw new Error("GEMINI_API_KEY_2 not configured");

  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"];
  let lastError = "Gemini unavailable";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY_2}`;
    const generationConfig: Record<string, unknown> = { responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 16000 };
    if (model.startsWith("gemini-2.5") || model.includes("flash-latest")) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: userParts }],
        generationConfig,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const finishReason = data?.candidates?.[0]?.finishReason;
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";
      if (finishReason && finishReason !== "STOP") {
        console.error(`Gemini ${model} incomplete response: finishReason=${finishReason}`);
        lastError = `Gemini ${model} incomplete: ${finishReason}`;
        continue;
      }
      return { text, usage: extractGeminiUsage(data) };
    }
    const errText = await response.text();
    console.error(`Gemini ${model} error:`, response.status, errText);
    lastError = `Gemini API failed: ${response.status}`;
  }
  throw new Error(lastError);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller }, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerRoles } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id);
    const isAuthorized = (callerRoles ?? []).some((r: any) => ["teacher", "pedago", "admin"].includes(r.role));
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Accès réservé aux enseignants et à l'équipe pédagogique" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: allowed, error: rateLimitError } = await adminClient.rpc("check_and_log_rate_limit", {
      p_user_id: caller.id,
      p_action: "ia_extract_document",
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
    if (!body?.contentType || !Array.isArray(body.parts) || body.parts.length === 0) {
      return new Response(JSON.stringify({ error: "contentType et parts (document) requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(body.contentType);
    const userParts = [{ text: sanitizeForGemini(buildUserPrompt(body.contentType)) }, ...toGeminiParts(body.parts)];

    const { text: rawContent, usage } = await callGemini(systemPrompt, userParts);
    if (!rawContent.trim()) throw new Error("Réponse IA vide");

    let items: any[] = [];
    try {
      const parsed = parseAiJson(rawContent);
      items = Array.isArray(parsed?.items) ? parsed.items : [];
    } catch (e) {
      console.error("[extract-content-from-document] JSON parse failed:", (e as Error).message, "raw:", rawContent.slice(0, 500));
    }

    if (usage) {
      resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, authHeader).then(({ userId, roleGroup }) => {
        logTokenUsageAsync({
          supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "extract-content-from-document",
          inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
        });
      });
    }

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-content-from-document error:", e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
