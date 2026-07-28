import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logTokenUsageAsync, resolveCallerRoleGroup, extractOpenAiCompatUsage, type AiUsage } from "../_shared/tokenLogger.ts";

// NB : ces deux helpers sont dupliqués depuis bulk-gen-terminale-gemini plutôt que
// partagés via _shared/ car les redéploiements mono-fonction de cette plateforme ne
// repèrent pas toujours un nouveau fichier _shared/ ajouté après coup ("Module not
// found" au déploiement) — chaque function reste donc volontairement autonome ici.
function cleanGeneratedJson(rawContent: string): string {
  let cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) cleaned = objectMatch[0];
  return cleaned;
}

// Commandes LaTeX fréquentes qui commencent par "n" — seule lettre encore
// ambiguë avec un vrai échappement JSON ici (\n reste nécessaire pour les
// sauts de ligne des solutions multi-étapes). Ex : \neq, \nabla. Sans ce
// garde-fou, "\n" suivi de "eq{...}" serait lu comme un saut de ligne suivi
// du texte "eq{...}", corrompant la formule.
const LATEX_N_WORDS = ["nabla", "neq", "notin", "ncong", "nless", "ngtr", "nexists", "nmid"];

function looksLikeLatexNCommand(input: string, pos: number): boolean {
  return LATEX_N_WORDS.some((w) => input.startsWith(w, pos));
}

// Walk the JSON character-by-character; inside string literals, escape any
// backslash that isn't followed by a valid JSON escape char. This handles
// LaTeX commands (\frac, \alpha, \sqrt, \mathbb, \begin, \\) without
// breaking already-valid escapes like \n, \", \\, \uXXXX.
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
    // \n reste un vrai saut de ligne, sauf s'il amorce une commande LaTeX
    // connue (\neq, \nabla...). \b, \f, \r et \t ne sont JAMAIS utilisés
    // intentionnellement par ce générateur (aucun besoin de tabulation, retour
    // arrière, saut de page ou retour chariot dans ce contenu) : ce sont
    // toujours le début d'une commande LaTeX (\frac, \forall, \begin, \boxed,
    // \binom, \bar, \beta, \right, \rightarrow, \rho, \tan, \theta, \times,
    // \to, \tau...) — le backslash est donc systématiquement doublé pour eux.
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 20;

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  "5eme_primaire": "5ème année primaire",
  "1ere_cem": "1ère année CEM",
  "2eme_cem": "2ème année CEM",
  "3eme_cem": "3ème année CEM",
  "4eme_cem": "4ème année CEM (BEM)",
  "premiere": "1ère année secondaire",
  "seconde": "2ème année secondaire",
  "terminale": "3ème année secondaire (BAC)",
};

interface Body {
  contentType: "exercise" | "quiz" | "exam";
  schoolLevel?: string;
  chapterTitle?: string;
  lessonTitle?: string;
  count?: number;
  difficultyMin?: number;
  difficultyMax?: number;
  focusNote?: string; // optional context (e.g. weak points for class/student help)
}

function buildPrompt(b: Body) {
  const levelLabel = SCHOOL_LEVEL_LABELS[b.schoolLevel || ""] || b.schoolLevel || "";
  const count = Math.min(Math.max(b.count || 3, 1), 10);
  const dMin = Math.min(Math.max(b.difficultyMin ?? 1, 1), 5);
  const dMax = Math.min(Math.max(b.difficultyMax ?? 3, dMin), 5);

  const common = `Tu es un professeur de mathématiques algérien expert.
Niveau scolaire : ${levelLabel}
Chapitre : ${b.chapterTitle || "—"}
Leçon ciblée : ${b.lessonTitle || "—"}
Difficulté demandée : entre ${dMin}/5 et ${dMax}/5 (varie réellement les difficultés dans cet intervalle : ne génère pas ${count} items au même niveau).
${b.focusNote ? `Contexte pédagogique : ${b.focusNote}` : ""}
Reste STRICTEMENT sur la leçon "${b.lessonTitle || ""}".
IMPORTANT — Langue : rédige la totalité du contenu (énoncés, options, réponses, indices, explications) EXCLUSIVEMENT en arabe (اللغة العربية). N'utilise JAMAIS le français, sauf pour la notation mathématique standard qui reste universelle (chiffres, symboles, formules).

FORMAT MATHÉMATIQUE OBLIGATOIRE : TOUTES les expressions mathématiques (variables, fonctions, fractions, puissances, indices, limites, racines, symboles ∞, ≤, ≥, ≠, ±, →, etc.) DOIVENT être écrites en LaTeX entre délimiteurs $...$ (ou $$...$$ pour une formule isolée), pour le rendu KaTeX côté client.
- Fractions : \\frac{a}{b} (JAMAIS a/b en texte brut).
- Puissances : x^{n} (JAMAIS x^n ni x**n). Indices : x_{n}. Racines : \\sqrt{x}.
- Symboles : \\infty, \\to, \\lim_{x \\to +\\infty}, \\leq, \\geq, \\neq, \\pm, \\cdot, \\times.
- Exemple correct : "$f(x) = \\frac{2x^{2} + 3x - 1}{x - 1}$". INTERDIT d'écrire f(x) = (2x^2+3x-1)/(x-1) en texte brut.`;

  if (b.contentType === "quiz") {
    return {
      system: common,
      user: `Génère ${count} questions de quiz à choix multiple (QCM) sur cette leçon.
Réponds UNIQUEMENT en JSON valide de la forme :
{"items":[{"question":"...","options":["A","B","C","D"],"correct_answer":"la bonne option exacte (texte identique à l'une des options)","hint":"indice utile sans donner la réponse","explanation":"explication de la correction, qui cible l'erreur typique de l'élève","difficulty":1}]}
Les "options" et "correct_answer" doivent aussi utiliser LaTeX entre $...$ quand elles contiennent des maths.`,
    };
  }
  // exercise or exam
  return {
    system: common,
    user: `Génère ${count} ${b.contentType === "exam" ? "exercices d'examen" : "exercices"} sur cette leçon.
Réponds UNIQUEMENT en JSON valide de la forme :
{"items":[{"title":"titre court","statement":"énoncé complet de l'exercice","hint":"indice utile sans donner la réponse","expected_answer":"réponse attendue concise","solution":"correction détaillée (voir format ci-dessous)","difficulty":2}]}

Exercice à PLUSIEURS questions/parties (souvent numérotées 1), 2), 3)...) — IMPORTANT :
Si un exercice comporte naturellement plusieurs questions distinctes, ne les mélange PAS dans "statement"/"expected_answer". Utilise à la place un champ "sub_questions", et laisse "statement" comme l'énoncé/contexte commun uniquement (sans répéter les questions) et "expected_answer" vide :
{"title":"...","statement":"énoncé commun (contexte, données de l'exercice)","sub_questions":[{"question":"1) énoncé de cette question précise","expected_answer":"réponse attendue pour CETTE question"},{"question":"2) ...","expected_answer":"..."}],"hint":"...","solution":"...","difficulty":2}
Chaque élève répondra séparément à chaque "sub_questions", avec sa propre case de réponse — donne donc bien une "expected_answer" pour CHAQUE sous-question quand c'est possible. N'utilise "sub_questions" que si l'exercice a vraiment plusieurs questions séparées ; pour un exercice à une seule question, garde le format simple ("statement"/"expected_answer") sans "sub_questions".

Format de "solution" — OBLIGATOIRE :
- Corrections RICHES et DÉTAILLÉES en HTML avec plusieurs étapes numérotées, JAMAIS une seule ligne.
- Structure attendue : <p><strong>الخطوة 1 :</strong> ...</p><p>$$ formule $$</p><p><strong>الخطوة 2 :</strong> ...</p>... puis <p><strong>الاستنتاج :</strong> $$ \\boxed{résultat} $$</p>.
- Chaque étape doit justifier le calcul (règle, théorème ou propriété utilisée), pas seulement donner le résultat.
- Minimum 3 étapes claires pour un exercice de difficulté ≥ 2.`,
  };
}

async function callGateway(system: string, user: string): Promise<{ parsed: any; usage: AiUsage | null }> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY manquante");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
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
    // Le contenu LaTeX (\frac, \infty, \lim...) casse parfois le JSON même après
    // réparation des échappements — on dégrade en liste vide plutôt que de faire
    // échouer toute la requête avec une erreur 500 opaque.
    console.error("[generate-teacher-content] JSON parse failed:", (e as Error).message, "raw:", content.slice(0, 500));
    return { parsed: { items: [] }, usage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // --- Authentification + autorisation obligatoires : cette fonction
    // consomme un quota IA payant à chaque appel et n'a de sens que pour un
    // enseignant/pédagogue/admin qui prépare du contenu de classe — sans
    // contrôle de rôle, n'importe quel élève authentifié pouvait l'appeler
    // directement (en contournant ExamAIBuilder.tsx) pour générer du contenu
    // IA payant à volonté. ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrlAuth = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKeyAuth = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrlAuth, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
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
      p_action: "ia_teacher_content_request",
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
    if (!body?.contentType) {
      return new Response(JSON.stringify({ error: "contentType requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { system, user } = buildPrompt(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { parsed, usage } = await callGateway(system, user);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];

    // Log de consommation IA seulement si l'appel a réellement abouti.
    if (usage) {
      resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, req.headers.get("Authorization")).then(({ userId, roleGroup }) => {
        logTokenUsageAsync({
          supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: "generate-teacher-content",
          inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
        });
      });
    }
    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
