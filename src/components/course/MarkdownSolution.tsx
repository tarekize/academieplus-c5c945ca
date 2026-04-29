import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CheckCircle2 } from "lucide-react";

interface MarkdownSolutionProps {
  content: string;
  title?: string;
  compact?: boolean;
}

/**
 * Renders an Arabic step-by-step math solution with markdown + KaTeX support.
 * Used for exercise/quiz detailed solutions.
 */
export const MarkdownSolution = ({ content, title = "الحل المفصل", compact = false }: MarkdownSolutionProps) => {
  // Auto-fix common AI output issues:
  // - Replace \boxed{X} (or broken "oxed{X}" / "\x08oxed{X}") with a clean highlighted answer
  //   instead of relying on KaTeX rendering (which often fails outside math delimiters).
  let cleaned = (content || "")
    // Strip math delimiters around boxed so we render it as plain markdown
    .replace(/\$\$\s*\\?boxed\{([^{}]+)\}\s*\$\$/g, "\n\n> ## ✅ **$1**\n\n")
    .replace(/\$\s*\\?boxed\{([^{}]+)\}\s*\$/g, "**$1**")
    // Backspace char variants
    .replace(/\x08oxed\{([^{}]+)\}/g, "**$1**")
    // Plain \boxed{...} or oxed{...} not wrapped in $...$
    .replace(/\\boxed\{([^{}]+)\}/g, "**$1**")
    .replace(/(^|[^a-zA-Z\\])oxed\{([^{}]+)\}/g, "$1**$2**");

  return (
    <div
      className={
        "rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/30 dark:via-background dark:to-blue-950/30 " +
        (compact ? "p-3 space-y-2" : "p-5 space-y-4")
      }
      dir="rtl"
    >
      <h4 className="font-bold text-base md:text-lg text-purple-900 dark:text-purple-200 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        {title}
      </h4>

      <div className="solution-content text-right text-sm leading-relaxed">
        <style>{`
          .solution-content h1, .solution-content h2 {
            font-size: 1.05rem;
            font-weight: 700;
            color: hsl(262 70% 45%);
            margin: 0.75rem 0 0.5rem;
            padding-bottom: 0.4rem;
            border-bottom: 2px solid hsl(262 70% 80%);
          }
          .solution-content h3 {
            font-size: 0.95rem;
            font-weight: 700;
            color: hsl(243 70% 50%);
            margin: 0.75rem 0 0.4rem;
            padding: 0.4rem 0.6rem;
            background: hsl(243 70% 95%);
            border-right: 4px solid hsl(243 70% 60%);
            border-radius: 4px;
          }
          .dark .solution-content h1, .dark .solution-content h2 { color: hsl(262 80% 75%); border-color: hsl(262 50% 40%); }
          .dark .solution-content h3 { color: hsl(243 80% 80%); background: hsl(243 40% 20%); border-color: hsl(243 70% 60%); }
          .solution-content p { margin: 0.5rem 0; line-height: 1.7; }
          .solution-content ul, .solution-content ol { margin: 0.5rem 1.5rem 0.5rem 0; padding-right: 1rem; }
          .solution-content li { margin: 0.25rem 0; }
          .solution-content strong { color: hsl(243 70% 40%); font-weight: 700; }
          .dark .solution-content strong { color: hsl(243 80% 80%); }
          .solution-content code {
            background: hsl(243 70% 95%);
            color: hsl(243 70% 30%);
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
          }
          .dark .solution-content code { background: hsl(243 40% 20%); color: hsl(243 80% 85%); }
          .solution-content .katex-display {
            margin: 0.75rem 0;
            padding: 0.75rem;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            overflow-x: auto;
          }
          .dark .solution-content .katex-display { background: hsl(0 0% 10%); }
          .solution-content blockquote {
            border-right: 4px solid hsl(160 70% 45%);
            background: hsl(160 70% 95%);
            padding: 0.5rem 0.75rem;
            margin: 0.5rem 0;
            border-radius: 4px;
          }
          .dark .solution-content blockquote { background: hsl(160 40% 15%); }
        `}</style>

        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
        >
          {cleaned}
        </ReactMarkdown>
      </div>
    </div>
  );
};
