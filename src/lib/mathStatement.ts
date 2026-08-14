// Utilities to clean AI-generated math statements and ensure KaTeX can render them.

const LATEX_HINT = /\\(?:lim|frac|sqrt|sum|prod|int|infty|to|cdot|times|div|pm|leq|geq|neq|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|phi|omega|left|right|begin|end|mathbb|mathrm|mathcal|log|ln|sin|cos|tan|exp|partial|nabla|forall|exists|in|notin|subset|cup|cap|emptyset|Delta|Sigma|Omega|overline|underline|vec|hat|dot|ddot)\b|[\\^_]\{|\\\(|\\\[|\\/;

// L'IA écrit occasionnellement ∞ comme le mot arabe translittéré
// phonétiquement ("إنفينيتي") au lieu de la macro \infty, le plus souvent
// imbriqué dans un \text{$...} invalide (un "$" au milieu d'un \text{} n'a
// aucun sens) — ex. "\text{lim}_{x \to +\text{$إنفينيتي}}" au lieu de
// "\lim_{x \to +\infty}". KaTeX échoue alors à parser tout le $...$
// englobant et affiche la source brute au lieu de la formule.
const INFINITY_AR_TRANSLITERATIONS = ["إنفينيتي", "انفينيتي", "إنفينتي", "انفينتي"];
// Autres opérateurs que l'IA emballe parfois dans un \text{...} au lieu
// d'utiliser leur macro LaTeX dédiée (même symptôme : le \text{...} brise le
// rendu de toute la formule englobante).
const TEXT_WRAPPED_COMMANDS: Record<string, string> = {
  lim: "\\lim", sin: "\\sin", cos: "\\cos", tan: "\\tan", ln: "\\ln", log: "\\log", exp: "\\exp",
};

/** Répare les motifs de LaTeX cassé les plus fréquents que l'IA produit en
 * essayant d'"arabiser" un symbole/opérateur au lieu d'utiliser sa macro
 * LaTeX — voir les commentaires ci-dessus. Doit s'exécuter avant le
 * délimitage $...$ pour que le contenu réparé soit ensuite détecté comme du
 * LaTeX valide par LATEX_HINT. */
function repairBrokenLatexArtifacts(s: string): string {
  let out = s;
  out = repairBoxedConclusion(out);
  const infinityPattern = INFINITY_AR_TRANSLITERATIONS.join("|");
  out = out.replace(new RegExp(`\\\\text\\{\\$?(?:${infinityPattern})\\}`, "g"), "\\infty");
  out = out.replace(new RegExp(infinityPattern, "g"), "\\infty");
  out = out.replace(/\\text\{(lim|sin|cos|tan|ln|log|exp)\}/g, (_m, name: string) => TEXT_WRAPPED_COMMANDS[name]);
  return out;
}

/** Répare le \boxed{...} de conclusion (imposé par le prompt IA en fin de
 * solution) quand l'IA y glisse un "$" parasite au milieu (ex.
 * "f$'(x)=1" au lieu de "f'(x)=1") : ce "$" isolé casse le comptage des
 * délimiteurs $...$/$$...$$ pour TOUT le reste de la chaîne, donc KaTeX
 * n'arrive plus à faire correspondre l'ouverture/fermeture et affiche la
 * source brute au lieu du rendu. Localise "\boxed{" (accolade équilibrée,
 * car le contenu contient souvent des sous-blocs comme \lim_{x \to +\infty}),
 * retire tout "$" à l'intérieur, puis renveloppe proprement en $$...$$. */
function repairBoxedConclusion(s: string): string {
  const m = /\\?boxed\{/.exec(s);
  if (!m) return s;
  const openIdx = m.index;
  const contentStart = openIdx + m[0].length;
  let depth = 1;
  let end = -1;
  for (let i = contentStart; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return s; // accolades non équilibrées : on ne touche à rien

  const inner = s.slice(contentStart, end).replace(/\$/g, "");
  const before = s.slice(0, openIdx).replace(/\$+\s*$/, "");
  const after = s.slice(end + 1).replace(/^\s*\\?\$+/, "");
  return `${before}$$\\boxed{${inner}}$$${after}`;
}

/** Corrige un énoncé mathématique généré par IA pour que KaTeX puisse le
 * rendre : répare les artefacts LaTeX les plus courants (voir
 * repairBrokenLatexArtifacts), normalise les `\$` échappés, et enveloppe les
 * blocs LaTeX oubliés (non délimités par `$...$`) que l'IA laisse parfois
 * passer. */
export function cleanMathStatement(raw: string): string {
  if (!raw) return "";
  let s = raw;

  // Un contenu ré-encodé en JSON par erreur en amont (ex. import/génération)
  // laisse parfois des "\n" littéraux (backslash + n, pas un vrai saut de
  // ligne) dans le texte stocké — affichés tels quels au lieu d'un retour à
  // la ligne. Lookahead négatif pour ne pas casser \nabla (qui commence
  // aussi par "\n" mais suivi d'une lettre).
  s = s.replace(/\\n(?![a-zA-Z])/g, "\n");

  s = repairBrokenLatexArtifacts(s);

  // Convert escaped \$ into real $ delimiters
  s = s.replace(/\\\$/g, "$");
  // Collapse leftover EMPTY $ $ / $$ $$ spans only. Naively matching any
  // "$" + whitespace* + "$" (as this used to) also matches the first two
  // characters of a perfectly normal, non-empty "$$...content...$$" block —
  // silently stripping its delimiters and leaving raw LaTeX behind. The
  // lookaround in the second pass keeps each "$" from being treated as lone
  // when it's actually one half of a "$$" pair.
  s = s.replace(/\$\$\s*\$\$/g, "");
  s = s.replace(/(?<!\$)\$(?!\$)\s*(?<!\$)\$(?!\$)/g, "");
  // Trim multiple spaces created by replacements
  s = s.replace(/[ \t]{2,}/g, " ").trim();

  // Wrap any LaTeX-looking runs that aren't already inside a $...$/$$...$$ span.
  // AI-generated content sometimes wraps most inline formulas but leaves multi-line
  // blocks (e.g. \begin{cases}...\end{cases} for piecewise functions) undelimited,
  // which KaTeX then silently ignores — those must still be picked up here even
  // though the string already contains other, properly-delimited math.
  if (LATEX_HINT.test(s)) {
    s = wrapUndelimitedLatexRuns(s);
  }

  return s;
}

// Splits on existing $...$/$$...$$ spans (left untouched) and only processes the gaps.
// Spans may legitimately contain newlines (e.g. a multi-line \begin{cases}), so this
// must not stop at the first \n or it will mistake an existing span for a gap and
// wrap it a second time, leaving stray unmatched $ characters behind.
function wrapUndelimitedLatexRuns(s: string): string {
  return s
    .split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)
    .map((part) => {
      if (part.startsWith("$")) return part;
      if (!LATEX_HINT.test(part)) return part;
      // Wrap complete \begin{env}...\end{env} blocks (cases, array, matrix...) with a
      // single $...$ (not $$...$$): HtmlWithMath's own "put $$ on its own line"
      // normalization inserts a newline right after an opening $$ that isn't already
      // followed by one, which — for a $$ we just inserted immediately before
      // \begin{...} — splits the delimiter from its content and breaks rendering.
      // A single $ isn't touched by that normalization, so it renders correctly.
      const withEnvs = part.replace(/\\begin\{(\w+)\}[\s\S]*?\\end\{\1\}/g, (m) => "$" + m + "$");
      // Then wrap any remaining bare LaTeX runs, without touching the blocks just wrapped.
      return withEnvs
        .split(/(\$[^$]*?\$)/g)
        .map((seg) => (seg.startsWith("$") ? seg : wrapLatexRuns(seg)))
        .join("");
    })
    .join("");
}

// Find contiguous LaTeX-looking spans and wrap them with $...$
function wrapLatexRuns(s: string): string {
  // A LaTeX "token" matches: \command, \command{...}, ^{...}, _{...}, ^x, _x,
  // braces groups {...}, or math chars next to them.
  // We greedily match a span that starts at a LaTeX trigger and continues
  // while it sees math-friendly characters (letters, digits, +-*/=(),.<>{}^_\\ space).
  const trigger = /\\[a-zA-Z]+|[\\^_]\{|\\\(|\\\[/g;
  let out = "";
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = trigger.exec(s)) !== null) {
    const start = m.index;
    if (start < lastIndex) continue;

    // Extend the run forward as long as we keep seeing math-ish content
    let end = start;
    let depth = 0;
    while (end < s.length) {
      const c = s[end];
      if (c === "{") { depth++; end++; continue; }
      if (c === "}") { if (depth === 0) break; depth--; end++; continue; }
      // Allow common math characters
      if (/[A-Za-z0-9+\-*/=().,<>!|^_\\&]/.test(c)) { end++; continue; }
      // Allow spaces only if we're inside braces or followed by more math
      if (c === " ") {
        // Look ahead: keep space if next non-space is math-ish or backslash
        let j = end + 1;
        while (j < s.length && s[j] === " ") j++;
        if (j < s.length && /[A-Za-z0-9+\-*/=().,<>!|^_\\{}&]/.test(s[j]) && depth >= 0) {
          // Only continue if next chunk also looks mathy (has another \ or ^ or _ or digit/op)
          const lookahead = s.slice(j, Math.min(j + 20, s.length));
          if (/[\\^_]|^\\s*[A-Za-z0-9]+\\s*[=+\-*/^_<>(){}]/.test(lookahead) || depth > 0) {
            end = j;
            continue;
          }
        }
        break;
      }
      break;
    }

    if (end > start) {
      out += s.slice(lastIndex, start) + "$" + s.slice(start, end).trim() + "$";
      lastIndex = end;
      trigger.lastIndex = end;
    }
  }
  out += s.slice(lastIndex);
  return out;
}

/** Détection rapide de contenu mathématique (LaTeX) dans un énoncé, pour
 * décider s'il faut passer par le rendu KaTeX ou du texte brut. */
export function statementHasMath(s: string): boolean {
  return /[$\\<]|\\\(|\\\[/.test(s || "");
}

/**
 * Splits an exercise statement into an intro (context before the first numbered
 * question) and a list of individual questions, so the UI can give each one its
 * own answer field instead of a single box for the whole exercise. Returns an
 * empty `questions` array when fewer than 2 numbered questions are detected
 * (callers should then fall back to rendering the statement as a single block).
 */
export function splitStatementIntoQuestions(statement: string): { intro: string; questions: string[] } {
  const raw = (statement || "").trim();
  if (!raw) return { intro: "", questions: [] };

  // Matches a marker like "1. " / "2) " at the start of a line, or right after
  // whitespace/colon, so inline numbering without real line breaks still works.
  // Requires whitespace right after the digit+punctuation so decimals like "3.14" don't match.
  const markerRegex = /(?:^|\n|(?<=[:\s]))(\d{1,2})[.\)]\s+/g;
  const matches = [...raw.matchAll(markerRegex)];

  if (matches.length < 2) {
    return { intro: "", questions: [] };
  }

  const firstIndex = matches[0].index ?? 0;
  const intro = raw.slice(0, firstIndex).trim();
  const questions: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
    questions.push(raw.slice(start, end).trim());
  }
  return { intro, questions };
}
