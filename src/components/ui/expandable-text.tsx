import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** Texte tronqué (N lignes) avec un lien "Voir plus / Voir moins" affiché
 * seulement si le texte déborde réellement — utilisé pour les motifs de
 * refus, potentiellement longs ou (cas pathologique) un seul "mot" sans
 * espaces qui déborderait sinon de sa carte. */
export function ExpandableText({ text, className, clampLines = 2 }: { text: string; className?: string; clampLines?: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  // Classes statiques (littérales) requises pour que Tailwind les génère —
  // un template literal avec une variable ne serait pas détecté au build.
  const clampClass = clampLines === 1 ? "line-clamp-1" : clampLines === 3 ? "line-clamp-3" : "line-clamp-2";

  return (
    <div>
      <p
        ref={ref}
        className={cn("break-words", !expanded && clampClass, className)}
      >
        {text}
      </p>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold underline underline-offset-2 hover:no-underline mt-0.5"
        >
          {expanded ? t("quizExerciseCRUD.showLess") : t("quizExerciseCRUD.showMore")}
        </button>
      )}
    </div>
  );
}
