import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, Trash2, Plus, Code2, PenLine, Clock, Send, CheckCircle2, XCircle } from "lucide-react";
import { ExamExercise } from "@/lib/examTypes";
import { normalizeAnswer } from "@/lib/teacherContentAttempt";
import { cn } from "@/lib/utils";

export type ExamViewerMode = "student" | "preview" | "edit";

interface ExamViewerProps {
  exercises: ExamExercise[];
  mode: ExamViewerMode;
  /** "edit" only. */
  onChange?: (exercises: ExamExercise[]) => void;
  /** "student" only : durée de l'examen, alimente le compte à rebours. */
  durationMinutes?: number;
}

export function MathText({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
        {text || ""}
      </ReactMarkdown>
    </div>
  );
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Compte à rebours affiché en haut de la feuille pendant que l'élève
 * compose. Appelle onExpire une seule fois quand le temps est écoulé. */
function CountdownTimer({ durationMinutes, onExpire, frozen }: { durationMinutes: number; onExpire: () => void; frozen: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.round(durationMinutes * 60)));

  useEffect(() => {
    if (frozen || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [frozen, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && !frozen) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const low = secondsLeft <= 60;
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex items-center justify-center gap-2 rounded-xl border py-2 mb-4 font-mono text-lg font-bold tabular-nums",
        low ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse" : "bg-primary/5 text-primary border-primary/20",
      )}
    >
      <Clock className="h-5 w-5" />
      {formatClock(secondsLeft)}
    </div>
  );
}

/** Composant unique pour les 3 façons de voir un examen :
 *  - "student" : la feuille d'examen avec une zone de réponse par question,
 *    un chrono qui décompte, et un bouton "Soumettre" révélant la note.
 *  - "preview" : exactement la même feuille (pour pédago/admin), mais sans
 *    aucune zone de réponse — rien à insérer, juste la consultation.
 *  - "edit" : le pédago modifie chaque exercice, soit directement (aperçu
 *    du rendu en direct), soit via le LaTeX brut. */
export default function ExamViewer({ exercises, mode, onChange, durationMinutes }: ExamViewerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStyle, setEditStyle] = useState<"direct" | "latex">("direct");
  const [answers, setAnswers] = useState<string[]>(() => exercises.map(() => ""));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(exercises.map(() => ""));
    setSubmitted(false);
  }, [exercises.length]);

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

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    exercises.forEach((ex, i) => {
      if (ex.answer && normalizeAnswer(answers[i] || "") === normalizeAnswer(ex.answer)) correct += 1;
    });
    return { correct, total: exercises.length };
  }, [submitted, exercises, answers]);

  const handleSubmit = () => setSubmitted(true);

  if (exercises.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Aucun exercice pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {mode === "student" && durationMinutes ? (
        <CountdownTimer durationMinutes={durationMinutes} frozen={submitted} onExpire={handleSubmit} />
      ) : null}

      {mode === "student" && score && (
        <div className={cn(
          "rounded-xl border p-4 text-center font-semibold",
          score.correct === score.total ? "bg-green-50 text-green-700 border-green-200" : "bg-primary/5 text-primary border-primary/20",
        )}>
          Résultat : {score.correct} / {score.total}
        </div>
      )}

      {exercises.map((ex, idx) => {
        const isEditing = mode === "edit" && editingIndex === idx;
        const studentCorrect = submitted && ex.answer ? normalizeAnswer(answers[idx] || "") === normalizeAnswer(ex.answer) : null;
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
              <div className="flex items-center gap-2">
                {mode === "student" && submitted && ex.answer && (
                  studentCorrect ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Correct</Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Incorrect</Badge>
                  )
                )}
                {mode === "edit" && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => { setEditingIndex(isEditing ? null : idx); setEditStyle("direct"); }}
                    >
                      {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                      {isEditing ? "Aperçu" : "Modifier"}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeExercise(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-secondary p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditStyle("direct")}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors", editStyle === "direct" ? "bg-background shadow-sm" : "text-muted-foreground")}
                  >
                    <PenLine className="h-3.5 w-3.5" /> Modifier directement
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStyle("latex")}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors", editStyle === "latex" ? "bg-background shadow-sm" : "text-muted-foreground")}
                  >
                    <Code2 className="h-3.5 w-3.5" /> Modifier via LaTeX
                  </button>
                </div>

                <div className={cn("grid gap-3", editStyle === "direct" && "sm:grid-cols-2")}>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Énoncé</Label>
                      <Textarea rows={3} value={ex.statement} onChange={(e) => update(idx, "statement", e.target.value)} className={cn("mt-1 text-sm", editStyle === "latex" && "font-mono")} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Solution détaillée</Label>
                      <Textarea rows={4} value={ex.solution} onChange={(e) => update(idx, "solution", e.target.value)} className={cn("mt-1 text-sm", editStyle === "latex" && "font-mono")} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Réponse finale</Label>
                      <Textarea rows={1} value={ex.answer} onChange={(e) => update(idx, "answer", e.target.value)} className={cn("mt-1 text-sm", editStyle === "latex" && "font-mono")} />
                    </div>
                  </div>
                  {editStyle === "direct" && (
                    <div className="rounded-xl bg-secondary/30 p-3 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">Aperçu en direct</p>
                      <MathText text={ex.statement} />
                      {ex.solution && <MathText text={ex.solution} />}
                      {ex.answer && <p className="text-sm font-medium">Réponse : <MathText text={ex.answer} /></p>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <MathText text={ex.statement} />

                {mode === "student" && (
                  <Textarea
                    rows={2}
                    placeholder="Votre réponse..."
                    value={answers[idx] || ""}
                    disabled={submitted}
                    onChange={(e) => setAnswers((prev) => prev.map((a, i) => (i === idx ? e.target.value : a)))}
                  />
                )}

                {mode === "edit" && ex.solution && (
                  <details className="rounded-xl bg-secondary/40 p-3">
                    <summary className="text-xs font-semibold text-muted-foreground cursor-pointer">Voir la solution</summary>
                    <div className="mt-2"><MathText text={ex.solution} /></div>
                  </details>
                )}
                {mode === "edit" && ex.answer && (
                  <p className="text-sm font-medium rounded-lg bg-primary/5 px-3 py-2">Réponse : <MathText text={ex.answer} /></p>
                )}

                {mode === "student" && submitted && (
                  <div className="rounded-lg bg-secondary/40 p-3 space-y-2 text-sm">
                    {ex.answer && <p><span className="font-semibold">Réponse attendue :</span> <MathText text={ex.answer} /></p>}
                    {ex.solution && (
                      <details>
                        <summary className="text-xs font-semibold text-muted-foreground cursor-pointer">Voir la solution</summary>
                        <div className="mt-2"><MathText text={ex.solution} /></div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {mode === "edit" && (
        <Button variant="outline" onClick={addExercise} className="w-full gap-2 rounded-xl border-dashed">
          <Plus className="h-4 w-4" />
          Ajouter un exercice
        </Button>
      )}

      {mode === "student" && !submitted && (
        <Button onClick={handleSubmit} className="w-full gap-2">
          <Send className="h-4 w-4" />
          Soumettre l'examen
        </Button>
      )}
    </div>
  );
}
