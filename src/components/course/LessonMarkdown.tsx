import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

interface LessonMarkdownProps {
  content: string;
  dir?: "rtl" | "ltr";
}

/**
 * Pré-traitement du contenu pour fiabiliser le rendu KaTeX en contexte arabe (RTL).
 *
 * - Insère un espace fin autour des délimiteurs `$...$` quand ils sont collés
 *   à des caractères arabes (sinon `remark-math` ne les détecte pas).
 * - Normalise les `$$ ... $$` sur leur propre ligne pour le mode display.
 */
function preprocessContent(raw: string): string {
  let s = raw;

  // 1) S'assurer que $$...$$ display soient sur leur propre ligne
  s = s.replace(/([^\n])\$\$/g, "$1\n$$").replace(/\$\$([^\n])/g, "$$\n$1");

  // 2) Ajouter un espace autour des $...$ inline collés à de l'arabe ou à des lettres
  //    Délimiteur ouvrant: caractère non-espace + $
  s = s.replace(/(\S)\$(?!\$)/g, "$1 $");
  //    Délimiteur fermant: $ + caractère non-espace
  s = s.replace(/(?<!\$)\$(\S)/g, (m, c) => {
    // Ne pas casser un $$ display
    if (c === "$") return m;
    return "$ " + c;
  });

  return s;
}

/**
 * Rendu professionnel d'une leçon Markdown + LaTeX (KaTeX).
 *
 * - Supporte $...$ (inline) et $$...$$ (block) via remark-math + rehype-katex.
 * - Supporte HTML brut (rehype-raw) pour les blocs colorés (تعريف، خواص، ...).
 * - Force chaque formule KaTeX en `dir="ltr"` + `inline-block` pour éviter
 *   tout décalage quand le paragraphe environnant est en arabe (RTL).
 */
const LessonMarkdown: React.FC<LessonMarkdownProps> = ({ content, dir = "rtl" }) => {
  const processed = useMemo(() => preprocessContent(content || ""), [content]);

  return (
    <div
      dir={dir}
      lang={dir === "rtl" ? "ar" : "fr"}
      className="lesson-markdown prose prose-slate dark:prose-invert max-w-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

export default LessonMarkdown;
