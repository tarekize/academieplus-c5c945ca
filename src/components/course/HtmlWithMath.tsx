import React, { useEffect, useMemo, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.js";
import "katex/dist/katex.min.css";
import { sanitizeLessonHtml } from "@/lib/sanitizeHtml";
import { convertPedagoBlocks } from "@/lib/lessonBlocks";

interface HtmlWithMathProps extends React.HTMLAttributes<HTMLDivElement> {
  htmlContent: string;
}

const HTML_TAG_REGEX = /<\s*(?:!doctype|a|article|aside|blockquote|br|code|div|em|figcaption|figure|footer|h[1-6]|header|hr|img|li|main|nav|ol|p|pre|section|small|span|strong|sub|sup|table|tbody|td|th|thead|tr|u|ul)\b/i;

/** Échappe les caractères HTML spéciaux d'un texte brut (contenu sans balises),
 * pour l'insérer sans risque via dangerouslySetInnerHTML plus bas. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Nettoie/normalise un contenu (LaTeX + éventuel HTML + blocs pédago) avant
 * rendu : dépiège \boxed{}, isole les $$...$$ sur leur propre ligne pour KaTeX,
 * et échappe le texte s'il ne contient aucune balise HTML connue (contenu
 * texte brut, pour éviter d'interpréter par erreur un "<" mathématique comme
 * une balise). */
function preprocessMathContent(raw: string) {
  let content = raw || "";

  // Remove \boxed{...} or actual backspace \x08oxed{...} and keep inner content
  content = content.replace(/\\boxed\{([^{}]+)\}/g, "$1");
  content = content.replace(/\x08oxed\{([^{}]+)\}/g, "$1");

  // A raw newline inside a math span becomes a literal <br/> below, which splits
  // the span across DOM nodes and stops KaTeX's auto-render from ever matching
  // its closing delimiter (it then shows the raw $...$ text instead of the
  // formula). Collapse any newline found inside $$...$$ or $...$ to a space first.
  content = content.replace(/\$\$[\s\S]*?\$\$|\$[^$]*?\$/g, (span) => span.replace(/\s*\n\s*/g, " "));

  const normalized = convertPedagoBlocks(
    content
      .replace(/([^\n])\$\$/g, "$1\n$$")
      .replace(/\$\$([^\n])/g, "$$\n$1")
  );

  if (HTML_TAG_REGEX.test(normalized)) {
    return normalized;
  }

  return escapeHtml(normalized).replace(/\n/g, "<br />");
}

/** Affiche un contenu HTML/LaTeX (leçon, énoncé, corrigé...) avec les formules
 * rendues par KaTeX. Le HTML final passe par sanitizeLessonHtml juste avant
 * dangerouslySetInnerHTML : un contenu enseignant/IA compromis ne peut pas
 * injecter de script. `dir`/`className` (dont l'alignement text-start/text-end)
 * doivent être fournis par l'appelant selon la langue active de l'UI. */
export const HtmlWithMath: React.FC<HtmlWithMathProps> = ({ htmlContent, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedContent = useMemo(() => preprocessMathContent(htmlContent), [htmlContent]);

  useEffect(() => {
    if (containerRef.current) {
      try {
        renderMathInElement(containerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false,
          ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        });
      } catch (e) {
        console.error("Error rendering math", e);
      }
    }
  }, [processedContent]);

  const safeContent = useMemo(() => sanitizeLessonHtml(processedContent), [processedContent]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: safeContent }}
      {...props}
    />
  );
};
