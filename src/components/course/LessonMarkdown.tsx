import React from "react";
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
 * Rendu professionnel d'une leçon Markdown + LaTeX (KaTeX).
 *
 * - Supporte $...$ (inline) et $$...$$ (block) via remark-math + rehype-katex.
 * - Supporte HTML brut (rehype-raw) pour les blocs colorés (تعريف، خواص، ...).
 * - Force chaque formule KaTeX en `dir="ltr"` + `inline-block` pour éviter
 *   tout décalage quand le paragraphe environnant est en arabe (RTL).
 */
const LessonMarkdown: React.FC<LessonMarkdownProps> = ({ content, dir = "rtl" }) => {
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
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default LessonMarkdown;
