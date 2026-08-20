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
  /** Sens de lecture du contenu affiché. Par défaut "rtl" (le contenu généré
   * par l'IA est en arabe en base), mais un appelant qui affiche une version
   * déjà traduite en français doit passer "ltr" — sinon le texte français
   * s'affichait toujours avec l'alignement/bordures d'un texte arabe. */
  dir?: "rtl" | "ltr";
}

/**
 * Rendu d'une solution/correction pas-à-pas (markdown + LaTeX via KaTeX),
 * utilisé pour les corrigés détaillés d'exercices et de quiz.
 */
export const MarkdownSolution = ({ content, title = "الحل المفصل", compact = false, dir = "rtl" }: MarkdownSolutionProps) => {
  // Un contenu \boxed{...} dont l'intérieur est du LaTeX (ex. "+\infty",
  // contient un backslash ou ^/_) doit rester entre $...$ pour que
  // remarkMath/rehypeKatex le rende encore en symbole ; sinon (texte/nombre
  // simple, parfois en arabe) on le laisse en texte brut, car KaTeX ne sait
  // pas correctement composer de l'arabe en mode math.
  const wrapMathIfNeeded = (inner: string) => (/\\|[\^_]/.test(inner) ? `$${inner}$` : inner);

  // Auto-fix common AI output issues:
  // - Replace \boxed{X} (ou "oxed{X}" / "\x08oxed{X}" corrompus) par une
  //   réponse finale mise en valeur, en gardant X entre $...$ s'il contient
  //   du LaTeX (cf. wrapMathIfNeeded) au lieu de toujours le dégrader en
  //   texte brut — sinon "+\infty" s'affichait tel quel au lieu de "+∞".
  let cleaned = (content || "")
    // Un contenu ré-encodé en JSON par erreur en amont laisse parfois des
    // "\n" littéraux (texte, pas un vrai saut de ligne) — sans ça, markdown
    // ne les interprète jamais comme des paragraphes/retours à la ligne.
    .replace(/\\n(?![a-zA-Z])/g, "\n")
    .replace(/\$\$\s*\\?boxed\{([^{}]+)\}\s*\$\$/g, (_m, inner) => `\n\n> ## ✅ **${wrapMathIfNeeded(inner)}**\n\n`)
    .replace(/\$\s*\\?boxed\{([^{}]+)\}\s*\$/g, (_m, inner) => `**${wrapMathIfNeeded(inner)}**`)
    // Backspace char variants
    .replace(/\x08oxed\{([^{}]+)\}/g, (_m, inner) => `**${wrapMathIfNeeded(inner)}**`)
    // Plain \boxed{...} or oxed{...} not wrapped in $...$
    .replace(/\\boxed\{([^{}]+)\}/g, (_m, inner) => `**${wrapMathIfNeeded(inner)}**`)
    .replace(/(^|[^a-zA-Z\\])oxed\{([^{}]+)\}/g, (_m, prefix, inner) => `${prefix}**${wrapMathIfNeeded(inner)}**`);

  return (
    <div
      className={
        "rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/30 dark:via-background dark:to-blue-950/30 " +
        (compact ? "p-3 space-y-2" : "p-5 space-y-4")
      }
      dir={dir}
    >
      <h4 className="font-bold text-base md:text-lg text-purple-900 dark:text-purple-200 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        {title}
      </h4>

      <div className="solution-content text-start text-sm leading-relaxed">
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
            border-inline-start: 4px solid hsl(243 70% 60%);
            border-radius: 4px;
          }
          .dark .solution-content h1, .dark .solution-content h2 { color: hsl(262 80% 75%); border-color: hsl(262 50% 40%); }
          .dark .solution-content h3 { color: hsl(243 80% 80%); background: hsl(243 40% 20%); border-color: hsl(243 70% 60%); }
          .solution-content p { margin: 0.5rem 0; line-height: 1.7; }
          .solution-content ul, .solution-content ol { margin-block: 0.5rem; margin-inline: 1.5rem 0; padding-inline-start: 1rem; }
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
            border-inline-start: 4px solid hsl(160 70% 45%);
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
