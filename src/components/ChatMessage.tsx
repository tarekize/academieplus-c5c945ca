import { cn } from "@/lib/utils";
import { Bot, ChevronRight, RefreshCw, ChevronDown } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useNavigate } from "react-router-dom";

interface BreadcrumbNav {
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  lessonTitle: string;
}

function parseBreadcrumbs(content: string): { cleanContent: string; breadcrumbs: BreadcrumbNav[] } {
  const breadcrumbs: BreadcrumbNav[] = [];
  const regex = /\[\[BREADCRUMB:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+?)\]\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    breadcrumbs.push({
      chapterId: match[1].trim(),
      chapterTitle: match[2].trim(),
      lessonId: match[3].trim(),
      lessonTitle: match[4].trim(),
    });
  }

  const cleanContent = content.replace(/\[\[BREADCRUMB:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+?)\]\]/g, "").trim();
  return { cleanContent, breadcrumbs };
}

// Sépare la section "Reformulation simplifiée" du reste de la réponse.
// La section débute à une ligne de titre contenant l'émoji 🔄 (ou le texte
// "reformulation simplifiée") et s'arrête au titre d'étape suivant.
function extractReformulation(content: string): { mainContent: string; reformulation: string | null } {
  const lines = content.split("\n");
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("🔄") || /reformulation simplifi/i.test(lines[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return { mainContent: content, reformulation: null };

  const nextStepMarkers = ["✏️", "📖", "💡", "📝", "📌"];
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (nextStepMarkers.some((m) => lines[i].includes(m))) {
      endIdx = i;
      break;
    }
  }

  const body = lines.slice(startIdx + 1, endIdx).join("\n").trim();
  if (!body) return { mainContent: content, reformulation: null };

  const mainContent = [...lines.slice(0, startIdx), ...lines.slice(endIdx)].join("\n").trim();
  return { mainContent, reformulation: body };
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  onNavigate?: (path: string) => void;
  onReformulationClick?: () => void;
}

const isArabicText = (text: string): boolean => {
  const stripped = text
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/\$[^$]*?\$/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\[\[BREADCRUMB:[^\]]+\]\]/g, "");
  const arabic = (stripped.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  const latin = (stripped.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  return arabic > latin;
};

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-primary mb-3 mt-4 pb-2 border-b-2 border-primary/30">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-bold text-primary mb-2 mt-3">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-semibold text-secondary mb-2 mt-2">{children}</h3>
  ),
  strong: ({ children }: any) => <strong className="font-bold text-primary">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-accent">{children}</em>,
  p: ({ children }: any) => <p className="leading-relaxed mb-2">{children}</p>,
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside space-y-1 ml-2 text-foreground">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside space-y-1 ml-2 text-foreground">{children}</ol>
  ),
  li: ({ children }: any) => <li className="ml-4 marker:text-primary">{children}</li>,
  code: ({ children, className }: any) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-sm">
        {children}
      </code>
    ) : (
      <code className="block bg-muted p-3 rounded-lg overflow-x-auto font-mono text-sm">
        {children}
      </code>
    );
  },
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">
      {children}
    </blockquote>
  ),
  // Force LTR direction on math (KaTeX) so formulas always read left-to-right,
  // even when the surrounding message is in Arabic (RTL).
  span: ({ node, className, children, ...props }: any) => {
    if (className && className.includes("math-inline")) {
      return (
        <span
          {...props}
          className={cn(className, "inline-block align-middle")}
          dir="ltr"
          style={{ unicodeBidi: "isolate" }}
        >
          {children}
        </span>
      );
    }
    return <span {...props} className={className}>{children}</span>;
  },
  div: ({ node, className, children, ...props }: any) => {
    if (className && className.includes("math-display")) {
      return (
        <div
          {...props}
          className={cn(className, "my-3 overflow-x-auto text-left")}
          dir="ltr"
          style={{ unicodeBidi: "isolate", textAlign: "left" }}
        >
          {children}
        </div>
      );
    }
    return <div {...props} className={className}>{children}</div>;
  },
};

const MarkdownContent = ({ children }: { children: string }) => (
  <ReactMarkdown
    className="space-y-3"
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={markdownComponents}
  >
    {children}
  </ReactMarkdown>
);

export const ChatMessage = ({ role, content, isStreaming, onNavigate, onReformulationClick }: ChatMessageProps) => {
  const isUser = role === "user";
  const navigate = useNavigate();
  const [showReformulation, setShowReformulation] = useState(false);

  const { cleanContent, breadcrumbs } = isUser
    ? { cleanContent: content, breadcrumbs: [] }
    : parseBreadcrumbs(content);

  // On ne replie la reformulation qu'une fois la réponse complète (pas en streaming).
  const { mainContent, reformulation } =
    isUser || isStreaming
      ? { mainContent: cleanContent, reformulation: null }
      : extractReformulation(cleanContent);

  const isRtl = isArabicText(content);
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";
  const textAlign = isRtl ? "text-right" : "text-left";

  const handleChapterClick = (bc: BreadcrumbNav) => {
    const path = `/cours/math?chapitre=${bc.chapterId}`;
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  const handleLessonClick = (bc: BreadcrumbNav) => {
    const path = `/cours/math?chapitre=${bc.chapterId}&lecon=${bc.lessonId}`;
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  const toggleReformulation = () => {
    setShowReformulation((prev) => {
      const next = !prev;
      if (next) onReformulationClick?.();
      return next;
    });
  };

  return (
    <div className={cn(
      "flex gap-3.5 p-4 rounded-[1.15rem] transition-all duration-500 will-change-transform",
      isUser
        ? "bg-[#0A2551] text-white ml-auto max-w-[85%] rounded-br-sm shadow-[0_5px_15px_rgba(10,37,81,0.2)]"
        : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-tl-sm mr-auto max-w-[90%]"
    )}>
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border border-[#0A2551]/10 bg-gradient-to-br from-[#0A2551] to-blue-600 text-white mt-1"
        )}>
          <Bot strokeWidth={1.5} className="w-5 h-5 drop-shadow-sm" />
        </div>
      )}

      <div className="flex-1 space-y-1.5 pt-0.5" dir={dir}>
        <p className={cn(
          "text-[0.75rem] font-bold tracking-wide uppercase",
          textAlign,
          isUser ? "text-blue-200/80" : "text-[#0A2551]/70 dark:text-blue-400"
        )}>
          {isUser ? (isRtl ? "أنت" : "Vous") : (isRtl ? "المساعد الرياضي" : "Assistant mathématique")}
        </p>
        <div className={cn(
          "prose prose-sm max-w-none antialiased leading-relaxed font-medium",
          textAlign,
          isUser ? "text-white prose-p:text-white" : "text-slate-700 dark:text-slate-300"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <>
              {mainContent && <MarkdownContent>{mainContent}</MarkdownContent>}

              {/* Reformulation simplifiée — masquée derrière un bouton */}
              {reformulation && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={toggleReformulation}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm transition-colors"
                    aria-expanded={showReformulation}
                  >
                    <RefreshCw className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{isRtl ? "إعادة صياغة مبسّطة" : "Reformulation simplifiée"}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform",
                        showReformulation && "rotate-180"
                      )}
                    />
                  </button>
                  {showReformulation && (
                    <div className="mt-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
                      <MarkdownContent>{reformulation}</MarkdownContent>
                    </div>
                  )}
                </div>
              )}

              {/* Breadcrumb navigation */}
              {breadcrumbs.map((bc, idx) => (
                <div
                  key={idx}
                  className="flex items-center flex-wrap gap-1 mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm"
                  dir="auto"
                >
                  <span className="text-muted-foreground font-medium">📚</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <button
                    onClick={() => handleChapterClick(bc)}
                    className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors cursor-pointer"
                  >
                    {bc.chapterTitle}
                  </button>
                  <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <button
                    onClick={() => handleLessonClick(bc)}
                    className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors cursor-pointer"
                  >
                    {bc.lessonTitle}
                  </button>
                </div>
              ))}
            </>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
