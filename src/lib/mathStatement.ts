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

  // If statement contains LaTeX commands but no $ delimiters, wrap LaTeX runs in $...$
  if (!s.includes("$") && LATEX_HINT.test(s)) {
    s = wrapLatexRuns(s);
  }

  return s;
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
      if (/[A-Za-z0-9+\-*/=().,<>!|^_\\]/.test(c)) { end++; continue; }
      // Allow spaces only if we're inside braces or followed by more math
      if (c === " ") {
        // Look ahead: keep space if next non-space is math-ish or backslash
        let j = end + 1;
        while (j < s.length && s[j] === " ") j++;
        if (j < s.length && /[A-Za-z0-9+\-*/=().,<>!|^_\\{}]/.test(s[j]) && depth >= 0) {
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
