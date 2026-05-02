import { cn } from "@/lib/utils";
import { Bot, User, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useNavigate } from "react-router-dom";

// Force math (KaTeX) and code to render LTR even inside RTL messages
const rtlMathFixCss = `
  .chat-msg-rtl .katex,
  .chat-msg-rtl .katex-display,
  .chat-msg-rtl .katex-html,
  .chat-msg-rtl .math,
  .chat-msg-rtl .math-inline,
  .chat-msg-rtl .math-display,
  .chat-msg-rtl code,
  .chat-msg-rtl pre {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left;
  }
  .chat-msg-rtl .katex-display { display: block; text-align: center; }
`;

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

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  onNavigate?: (path: string) => void;
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

export const ChatMessage = ({ role, content, isStreaming, onNavigate }: ChatMessageProps) => {
  const isUser = role === "user";
  const navigate = useNavigate();

  const { cleanContent, breadcrumbs } = isUser
    ? { cleanContent: content, breadcrumbs: [] }
    : parseBreadcrumbs(content);

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
              {cleanContent && (
                <ReactMarkdown
                  className="space-y-3"
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-primary mb-3 mt-4 pb-2 border-b-2 border-primary/30">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-primary mb-2 mt-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-secondary mb-2 mt-2">
                        {children}
                      </h3>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-primary">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-accent">{children}</em>
                    ),
                    p: ({ children }) => (
                      <p className="leading-relaxed mb-2">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 ml-2 text-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 ml-2 text-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="ml-4 marker:text-primary">{children}</li>
                    ),
                    code: ({ children, className }) => {
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
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {cleanContent}
                </ReactMarkdown>
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
