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
import { ExamExercise, ExamSubQuestion } from "@/lib/examTypes";
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
  if (!text) return null;
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
        {text}
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
        "sticky top-0 z-10 flex items-center justify-center gap-2 rounded-xl border py-2 mb-4 font-mono text-lg font-bold tabular-nums bg-background",
        low ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse" : "bg-primary/5 text-primary border-primary/20",
      )}
    >
      <Clock className="h-5 w-5" />
      {formatClock(secondsLeft)}
    </div>
  );
}

function hasSubQuestions(ex: ExamExercise): boolean {
  return Array.isArray(ex.sub_questions) && ex.sub_questions.length >= 2;
}

function makeAnswerGrid(exercises: ExamExercise[]): string[][] {
  return exercises.map((ex) => new Array(hasSubQuestions(ex) ? ex.sub_questions!.length : 1).fill(""));
}

/** Composant unique pour les 3 façons de voir un examen :
 *  - "student" : la feuille d'examen avec une zone de réponse PAR QUESTION
 *    (un exercice à plusieurs questions a une zone pour chacune, pas une
 *    seule pour tout l'exercice), un chrono qui décompte, et un bouton
 *    "Soumettre" révélant la note.
 *  - "preview" : exactement la même feuille (pour pédago/admin), mais sans
 *    aucune zone de réponse — rien à insérer, juste la consultation.
 *  - "edit" : le pédago modifie chaque exercice, soit directement (aperçu
 *    du rendu en direct), soit via le LaTeX brut. */
export default function ExamViewer({ exercises, mode, onChange, durationMinutes }: ExamViewerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStyle, setEditStyle] = useState<"direct" | "latex">("direct");
  const [answers, setAnswers] = useState<string[][]>(() => makeAnswerGrid(exercises));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(makeAnswerGrid(exercises));
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  const setAnswer = (exIdx: number, subIdx: number, value: string) => {
    setAnswers((prev) => prev.map((row, i) => (i === exIdx ? row.map((a, j) => (j === subIdx ? value : a)) : row)));
  };

  const update = (index: number, field: keyof ExamExercise, value: string) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  };

  const updateSubQuestion = (exIdx: number, subIdx: number, field: keyof ExamSubQuestion, value: string) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => {
      if (i !== exIdx || !ex.sub_questions) return ex;
      return { ...ex, sub_questions: ex.sub_questions.map((sq, j) => (j === subIdx ? { ...sq, [field]: value } : sq)) };
    }));
  };

  const removeSubQuestion = (exIdx: number, subIdx: number) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === exIdx && ex.sub_questions ? { ...ex, sub_questions: ex.sub_questions.filter((_, j) => j !== subIdx) } : ex)));
  };

  const addSubQuestion = (exIdx: number) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === exIdx ? { ...ex, sub_questions: [...(ex.sub_questions || []), { question: "", expected_answer: "" }] } : ex)));
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
    let total = 0;
    exercises.forEach((ex, i) => {
      if (hasSubQuestions(ex)) {
        ex.sub_questions!.forEach((sq, j) => {
          if (!sq.expected_answer?.trim()) return;
          total += 1;
          if (normalizeAnswer(answers[i]?.[j] || "") === normalizeAnswer(sq.expected_answer)) correct += 1;
        });
      } else if (ex.answer?.trim()) {
        total += 1;
        if (normalizeAnswer(answers[i]?.[0] || "") === normalizeAnswer(ex.answer)) correct += 1;
      }
    });
    return { correct, total };
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
          score.total > 0 && score.correct === score.total ? "bg-green-50 text-green-700 border-green-200" : "bg-primary/5 text-primary border-primary/20",
        )}>
          Résultat : {score.correct} / {score.total}
        </div>
      )}

      {exercises.map((ex, idx) => {
        const isEditing = mode === "edit" && editingIndex === idx;
        const subQ = hasSubQuestions(ex) ? ex.sub_questions! : null;

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
              {mode === "edit" && (
                <div className="flex items-center gap-1">
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
                </div>
              )}
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
                      <Label className="text-xs text-muted-foreground">{subQ ? "Énoncé / contexte commun" : "Énoncé"}</Label>
                      <Textarea rows={3} value={ex.statement} onChange={(e) => update(idx, "statement", e.target.value)} className={cn("mt-1 text-sm", editStyle === "latex" && "font-mono")} />
                    </div>

                    {subQ ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Questions (une zone de réponse par question pour l'élève)</Label>
                        {subQ.map((sq, j) => (
                          <div key={j} className="rounded-lg border p-2.5 space-y-2 bg-secondary/20">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-muted-foreground">Question {j + 1}</span>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeSubQuestion(idx, j)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <Textarea rows={2} value={sq.question} onChange={(e) => updateSubQuestion(idx, j, "question", e.target.value)} className={cn("text-sm", editStyle === "latex" && "font-mono")} placeholder="Texte de la question" />
                            <Textarea rows={1} value={sq.expected_answer || ""} onChange={(e) => updateSubQuestion(idx, j, "expected_answer", e.target.value)} className={cn("text-sm", editStyle === "latex" && "font-mono")} placeholder="Réponse attendue pour cette question" />
                          </div>
                        ))}
                        <Button size="sm" variant="outline" className="w-full gap-1.5 border-dashed" onClick={() => addSubQuestion(idx)}>
                          <Plus className="h-3.5 w-3.5" /> Ajouter une question
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-xs text-muted-foreground">Réponse finale</Label>
                        <Textarea rows={1} value={ex.answer} onChange={(e) => update(idx, "answer", e.target.value)} className={cn("mt-1 text-sm", editStyle === "latex" && "font-mono")} />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-muted-foreground">Solution détaillée</Label>
                      <Textarea rows={4} value={ex.solution} onChange={(e) => update(idx, "solution", e.target.value)} className={cn("mt-1 text-sm", editStyle === "latex" && "font-mono")} />
                    </div>
                  </div>
                  {editStyle === "direct" && (
                    <div className="rounded-xl bg-secondary/30 p-3 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">Aperçu en direct</p>
                      <MathText text={ex.statement} />
                      {subQ ? (
                        <div className="space-y-2">
                          {subQ.map((sq, j) => (
                            <div key={j}>
                              <MathText text={sq.question} />
                              {sq.expected_answer && <p className="text-xs text-muted-foreground">Réponse : <MathText text={sq.expected_answer} /></p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        ex.answer && <p className="text-sm font-medium">Réponse : <MathText text={ex.answer} /></p>
                      )}
                      {ex.solution && <MathText text={ex.solution} />}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <MathText text={ex.statement} />

                {subQ ? (
                  <div className="space-y-3">
                    {subQ.map((sq, j) => {
                      const subCorrect = submitted && sq.expected_answer ? normalizeAnswer(answers[idx]?.[j] || "") === normalizeAnswer(sq.expected_answer) : null;
                      return (
                        <div key={j} className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium flex-1"><MathText text={sq.question} /></span>
                            {mode === "student" && submitted && sq.expected_answer && (
                              subCorrect ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            )}
                          </div>
                          {mode === "student" && (
                            <Textarea
                              rows={2}
                              placeholder={`Réponse à la question ${j + 1}...`}
                              value={answers[idx]?.[j] || ""}
                              disabled={submitted}
                              onChange={(e) => setAnswer(idx, j, e.target.value)}
                            />
                          )}
                          {mode === "student" && submitted && sq.expected_answer && (
                            <p className="text-xs text-muted-foreground">Réponse attendue : <MathText text={sq.expected_answer} /></p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  mode === "student" && (
                    <Textarea
                      rows={2}
                      placeholder="Votre réponse..."
                      value={answers[idx]?.[0] || ""}
                      disabled={submitted}
                      onChange={(e) => setAnswer(idx, 0, e.target.value)}
                    />
                  )
                )}

                {mode === "edit" && ex.solution && (
                  <details className="rounded-xl bg-secondary/40 p-3">
                    <summary className="text-xs font-semibold text-muted-foreground cursor-pointer">Voir la solution</summary>
                    <div className="mt-2"><MathText text={ex.solution} /></div>
                  </details>
                )}
                {mode === "edit" && !subQ && ex.answer && (
                  <p className="text-sm font-medium rounded-lg bg-primary/5 px-3 py-2">Réponse : <MathText text={ex.answer} /></p>
                )}

                {mode === "student" && submitted && !subQ && ex.answer && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {normalizeAnswer(answers[idx]?.[0] || "") === normalizeAnswer(ex.answer) ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Correct</Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Incorrect</Badge>
                    )}
                    <p className="text-sm"><span className="font-semibold">Réponse attendue :</span> <MathText text={ex.answer} /></p>
                  </div>
                )}
                {mode === "student" && submitted && ex.solution && (
                  <details className="rounded-lg bg-secondary/40 p-3 text-sm">
                    <summary className="text-xs font-semibold text-muted-foreground cursor-pointer">Voir la solution</summary>
                    <div className="mt-2"><MathText text={ex.solution} /></div>
                  </details>
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
