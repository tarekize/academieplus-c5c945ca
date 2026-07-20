import React, { useEffect, useMemo, useRef } from "react";
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

// Detect content that is primarily HTML (e.g. AI-enriched lessons starting with <div dir="rtl">)
function isHtmlContent(s: string): boolean {
  const t = (s || "").trim();
  if (!t) return false;
  // Strip optional ```html fences
  const stripped = t.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return /^<(div|section|article|main|h[1-6])\b/i.test(stripped);
}

function stripCodeFences(s: string): string {
  return (s || "").trim().replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

const LessonMarkdown: React.FC<LessonMarkdownProps> = ({ content, dir = "rtl" }) => {
  const isHtml = useMemo(() => isHtmlContent(content || ""), [content]);
  const processed = useMemo(
    () => (isHtml
      ? sanitizeLessonHtml(convertPedagoBlocks(stripCodeFences(content || "")))
      : preprocessContent(content || "")),
    [content, isHtml]
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
  }, [processed]);

  if (isHtml) {
    return (
      <div
        ref={containerRef}
        dir={dir}
        lang={dir === "rtl" ? "ar" : "fr"}
        className="lesson-markdown prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      dir={dir}
      lang={dir === "rtl" ? "ar" : "fr"}
      className="lesson-markdown prose prose-slate dark:prose-invert max-w-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, lessonSchema]]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

export default LessonMarkdown;
