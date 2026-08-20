import React, { useEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import renderMathInElement from "katex/dist/contrib/auto-render.js";
import "katex/dist/katex.min.css";
import { sanitizeLessonHtml } from "@/lib/sanitizeHtml";
import { lessonSchema, convertPedagoBlocks } from "@/lib/lessonBlocks";

interface LessonMarkdownProps {
  content: string;
  dir?: "rtl" | "ltr";
}

/**
 * Pré-traitement Markdown pour fiabiliser KaTeX en contexte arabe (RTL).
 * Stratégie : on n'utilise plus remark-math (qui rate les $ collés à de l'arabe),
 * on laisse passer les $...$ et $$...$$ tels quels dans le HTML, puis on appelle
 * KaTeX auto-render sur le DOM final — c'est beaucoup plus permissif.
 */
function preprocessContent(raw: string): string {
  let s = raw || "";
  // Normaliser $$...$$ sur leur propre ligne pour le mode display
  s = s.replace(/([^\n])\$\$/g, "$1\n$$").replace(/\$\$([^\n])/g, "$$\n$1");
  s = convertPedagoBlocks(s);
  return s;
}

/** Détecte un contenu principalement HTML (ex. leçon enrichie par l'IA qui
 * commence par <div dir="rtl">...) pour choisir le chemin de rendu HTML brut
 * plutôt que le parseur Markdown. */
function isHtmlContent(s: string): boolean {
  const t = (s || "").trim();
  if (!t) return false;
  // Strip optional ```html fences
  const stripped = t.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return /^<(div|section|article|main|h[1-6])\b/i.test(stripped);
}

/** Retire un éventuel fencing ```html ... ``` autour du contenu (l'IA renvoie
 * parfois le HTML entouré d'un bloc de code Markdown). */
function stripCodeFences(s: string): string {
  return (s || "").trim().replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

/** Affiche le contenu d'une leçon, qu'il soit du Markdown ou du HTML déjà
 * enrichi par l'IA, avec rendu KaTeX des formules. Le HTML passe par
 * sanitizeLessonHtml (chemin HTML) ou rehype-sanitize (chemin Markdown) avant
 * dangerouslySetInnerHTML/rendu, donc un contenu compromis ne peut pas
 * injecter de script. */
const LessonMarkdown: React.FC<LessonMarkdownProps> = ({ content, dir = "rtl" }) => {
  const isHtml = useMemo(() => isHtmlContent(content || ""), [content]);
  const processed = useMemo(
    () => (isHtml
      ? sanitizeLessonHtml(convertPedagoBlocks(stripCodeFences(content || "")))
      : preprocessContent(content || "")),
    [content, isHtml]
  );

  // Rendu Markdown -> chaîne HTML statique (déjà nettoyée par rehypeSanitize
  // pendant la conversion AST->HTML de ReactMarkdown, donc pas besoin de la
  // repasser dans sanitizeLessonHtml) plutôt que de laisser ReactMarkdown
  // produire de vrais enfants React dans le conteneur : renderMathInElement
  // ci-dessous mute le DOM directement (remplace les nœuds texte $...$ par
  // des <span> KaTeX) SANS que React en soit informé. Avec de vrais enfants
  // React, le rendu suivant (changement de leçon) tente de réconcilier son
  // arbre fiber — resté périmé par rapport au DOM déjà modifié par KaTeX —
  // et plante avec "Failed to execute removeChild" au 2e/3e changement de
  // leçon. Avec dangerouslySetInnerHTML (comme HtmlWithMath.tsx, qui n'a
  // jamais ce problème), React traite le contenu comme opaque et se contente
  // de réécrire tout le innerHTML au changement — sans jamais essayer de
  // retrouver un nœud individuel que KaTeX aurait déjà remplacé.
  const html = useMemo(
    () => (isHtml
      ? processed
      : renderToStaticMarkup(
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, lessonSchema]]}>
            {processed}
          </ReactMarkdown>
        )),
    [processed, isHtml]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      });
    } catch (e) {
      console.error("KaTeX auto-render error", e);
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      dir={dir}
      lang={dir === "rtl" ? "ar" : "fr"}
      className="lesson-markdown prose prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default LessonMarkdown;
