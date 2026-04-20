import React, { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import renderMathInElement from "katex/dist/contrib/auto-render.js";
import "katex/dist/katex.min.css";

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
  return s;
}

const LessonMarkdown: React.FC<LessonMarkdownProps> = ({ content, dir = "rtl" }) => {
  const processed = useMemo(() => preprocessContent(content || ""), [content]);
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
  }, [processed]);

  return (
    <div
      ref={containerRef}
      dir={dir}
      lang={dir === "rtl" ? "ar" : "fr"}
      className="lesson-markdown prose prose-slate dark:prose-invert max-w-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

export default LessonMarkdown;
