// Les modèles IA renvoient du JSON contenant des commandes LaTeX (\frac, \infty,
// \lim, \leq, \boxed...) : ce sont des backslashes valides en LaTeX mais invalides
// tels quels dans une chaîne JSON (JSON exige \\ ou une séquence d'échappement
// reconnue). Ces fonctions nettoient puis réparent ces échappements avant parsing.

export function cleanGeneratedJson(rawContent: string): string {
  let cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) cleaned = objectMatch[0];
  return cleaned;
}

// Parcourt le JSON caractère par caractère ; à l'intérieur des chaînes, échappe
// tout backslash qui n'est pas suivi d'un caractère d'échappement JSON valide.
// Gère ainsi les commandes LaTeX (\frac, \alpha, \sqrt, \mathbb, \begin, \\) sans
// casser les échappements déjà valides (\n, \t, \", \\, \uXXXX).
export function fixJsonStringEscapes(input: string): string {
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
    if (next === '"' || next === "\\" || next === "/" ||
        next === "b" || next === "f" || next === "n" || next === "r" || next === "t") {
      out += "\\" + next; i++; continue;
    }
    if (next === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
      out += "\\u" + input.slice(i + 2, i + 6); i += 5; continue;
    }
    out += "\\\\";
  }
  return out;
}

/** Parse un JSON généré par une IA, en réparant les échappements LaTeX invalides si besoin. */
export function parseAiJson(rawContent: string): any {
  const cleaned = cleanGeneratedJson(rawContent);
  try { return JSON.parse(cleaned); } catch { /* fallthrough */ }
  const fixed = fixJsonStringEscapes(cleaned);
  return JSON.parse(fixed);
}
