import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCode, PenLine } from "lucide-react";
import InlineLessonEditor from "./InlineLessonEditor";
import LessonSourceEditor from "./LessonSourceEditor";

/**
 * Champ de contenu riche partagé par l'édition de leçon, l'édition d'exercices/quiz
 * pédago et l'assistant IA enseignant : bascule entre édition directe (WYSIWYG) et
 * édition source (LaTeX/Markdown), avec les mêmes deux éditeurs que le contenu de leçon.
 */
export default function RichContentField({
  label,
  value,
  onChange,
  minHeight = 100,
  resetKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minHeight?: number;
  /** À fournir seulement si CE champ peut afficher un contenu différent sans que
   * le formulaire parent ne soit démonté (ex: plusieurs sous-questions dans le
   * même dialogue) — sinon InlineLessonEditor garderait l'ancien texte affiché.
   * Par défaut, `label` suffit : il est stable tant que le champ ne change pas
   * de rôle, et RichContentField est de toute façon remonté avec le formulaire
   * qui l'englobe (dialogue fermé/rouvert) dans tous les usages actuels. */
  resetKey?: string | number;
}) {
  const [latexMode, setLatexMode] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium">{label}</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setLatexMode((v) => !v)}
        >
          {latexMode ? <PenLine className="h-3 w-3" /> : <FileCode className="h-3 w-3" />}
          {latexMode ? "Édition directe" : "Édition LaTeX"}
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden" style={{ minHeight }} dir="auto">
        {latexMode ? (
          <LessonSourceEditor content={value} onChange={onChange} />
        ) : (
          <InlineLessonEditor content={value} onChange={onChange} resetKey={resetKey ?? label} />
        )}
      </div>
    </div>
  );
}
