import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Eye, Trash2, Plus, Code2 } from "lucide-react";
import { ExamExercise } from "@/lib/examTypes";
import { cn } from "@/lib/utils";

interface ExamViewerProps {
  exercises: ExamExercise[];
  /** Le pédago peut éditer (brouillon/refusé) ; sinon vue lecture seule
   * identique à ce que verra l'élève (utilisée aussi côté admin pour la revue). */
  editable?: boolean;
  onChange?: (exercises: ExamExercise[]) => void;
}

function MathText({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
        {text || ""}
      </ReactMarkdown>
    </div>
  );
}

/** Affiche les exercices d'un examen exactement comme les verra l'élève.
 * En mode éditable, chaque exercice bascule entre "Aperçu" et "Modifier"
 * (édition directe du texte, y compris LaTeX brut entre $...$). */
export default function ExamViewer({ exercises, editable = false, onChange }: ExamViewerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const update = (index: number, field: keyof ExamExercise, value: string) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  };

  const removeExercise = (index: number) => {
    if (!onChange) return;
    onChange(exercises.filter((_, i) => i !== index));
  };

  const addExercise = () => {
    if (!onChange) return;
    onChange([...exercises, { statement: "", solution: "", answer: "" }]);
  };

  if (exercises.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Aucun exercice pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {exercises.map((ex, idx) => {
        const isEditing = editingIndex === idx;
        return (
          <div key={idx} className="rounded-2xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {idx + 1}
                </span>
                Exercice {idx + 1}
                {ex.chapter_title && <span className="text-xs font-normal text-muted-foreground">— {ex.chapter_title}</span>}
              </span>
              {editable && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setEditingIndex(isEditing ? null : idx)}
                  >
                    {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {isEditing ? "Aperçu" : "Modifier"}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeExercise(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> Énoncé (texte / LaTeX entre $...$)
                  </Label>
                  <Textarea rows={3} value={ex.statement} onChange={(e) => update(idx, "statement", e.target.value)} className="mt-1 font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> Solution détaillée
                  </Label>
                  <Textarea rows={4} value={ex.solution} onChange={(e) => update(idx, "solution", e.target.value)} className="mt-1 font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Réponse finale</Label>
                  <Textarea rows={1} value={ex.answer} onChange={(e) => update(idx, "answer", e.target.value)} className="mt-1 font-mono text-sm" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <MathText text={ex.statement} />
                {ex.solution && (
                  <details className="rounded-xl bg-secondary/40 p-3">
                    <summary className="text-xs font-semibold text-muted-foreground cursor-pointer">Voir la solution</summary>
                    <div className="mt-2">
                      <MathText text={ex.solution} />
                    </div>
                  </details>
                )}
                {ex.answer && (
                  <p className={cn("text-sm font-medium rounded-lg bg-primary/5 px-3 py-2")}>
                    Réponse : <MathText text={ex.answer} />
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {editable && (
        <Button variant="outline" onClick={addExercise} className="w-full gap-2 rounded-xl border-dashed">
          <Plus className="h-4 w-4" />
          Ajouter un exercice
        </Button>
      )}
    </div>
  );
}
