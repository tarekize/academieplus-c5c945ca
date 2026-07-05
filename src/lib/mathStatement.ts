// Utilities to clean AI-generated math statements and ensure KaTeX can render them.

const LATEX_HINT = /\\(?:lim|frac|sqrt|sum|prod|int|infty|to|cdot|times|div|pm|leq|geq|neq|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|phi|omega|left|right|begin|end|mathbb|mathrm|mathcal|log|ln|sin|cos|tan|exp|partial|nabla|forall|exists|in|notin|subset|cup|cap|emptyset|Delta|Sigma|Omega|overline|underline|vec|hat|dot|ddot)\b|[\\^_]\{|\\\(|\\\[|\\/;

export function cleanMathStatement(raw: string): string {
  if (!raw) return "";
  let s = raw;

  // Convert escaped \$ into real $ delimiters
  s = s.replace(/\\\$/g, "$");
  // Collapse leftover empty $ $ or $$ $$
  s = s.replace(/\$\s*\$/g, "");
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
      // Wrap complete \begin{env}...\end{env} blocks (cases, array, matrix...) as display math first.
      const withEnvs = part.replace(/\\begin\{(\w+)\}[\s\S]*?\\end\{\1\}/g, (m) => `$$${m}$$`);
      // Then wrap any remaining bare LaTeX runs, without touching the blocks just wrapped.
      return withEnvs
        .split(/(\$\$[\s\S]*?\$\$)/g)
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
