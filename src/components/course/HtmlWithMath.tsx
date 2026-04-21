import React, { useEffect, useMemo, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.js";
import "katex/dist/katex.min.css";

interface HtmlWithMathProps extends React.HTMLAttributes<HTMLDivElement> {
  htmlContent: string;
}

const HTML_TAG_REGEX = /<\s*(?:!doctype|a|article|aside|blockquote|br|code|div|em|figcaption|figure|footer|h[1-6]|header|hr|img|li|main|nav|ol|p|pre|section|small|span|strong|sub|sup|table|tbody|td|th|thead|tr|u|ul)\b/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function preprocessMathContent(raw: string) {
  const content = raw || "";
  const normalized = content
    .replace(/([^\n])\$\$/g, "$1\n$$")
    .replace(/\$\$([^\n])/g, "$$\n$1");

  if (HTML_TAG_REGEX.test(normalized)) {
    return normalized;
  }

  return escapeHtml(normalized).replace(/\n/g, "<br />");
}

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

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: processedContent }}
      {...props}
    />
  );
};
