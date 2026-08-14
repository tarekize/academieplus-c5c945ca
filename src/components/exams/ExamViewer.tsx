import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Eye, Trash2, Plus, Code2, PenLine, Clock, Send, CheckCircle2, XCircle, BookOpen, ChevronDown, RotateCcw } from "lucide-react";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import { ExportPDFButton } from "@/components/course/ExportPDFButton";
import { MathKeyboard } from "@/components/course/MathKeyboard";
import { cleanMathStatement } from "@/lib/mathStatement";
import { ExamExercise, ExamSubQuestion } from "@/lib/examTypes";
import { normalizeAnswer } from "@/lib/teacherContentAttempt";
import { QuestionStatus, saveExamProgress } from "@/lib/examProgress";
import { cn } from "@/lib/utils";

export type ExamViewerMode = "student" | "preview" | "edit";

interface ExamViewerProps {
  exercises: ExamExercise[];
  mode: ExamViewerMode;
  /** "edit" only. */
  onChange?: (exercises: ExamExercise[]) => void;
  /** "student" only : durée de l'examen, alimente le compte à rebours. */
  durationMinutes?: number;
  /** Affiche le bouton "Exporter en PDF" (titre de l'examen requis). */
  examTitle?: string;
  /** "student" uniquement, pour persister la progression (chrono + réponses
   * + statut par question) : sans ça, quitter la page remet tout à zéro. */
  examId?: string;
  studentId?: string;
  /** Horodatage serveur figé au premier accès — sert de base au chrono
   * plutôt qu'un simple compteur local qui repartirait de zéro à chaque
   * montage du composant. */
  startedAt?: string;
  initialAnswers?: string[][];
  initialStatus?: QuestionStatus[][];
  initialSubmitted?: boolean;
  /** Appelé quand l'élève clique "Refaire l'examen" dans la pop-up de temps
   * écoulé — le parent doit réinitialiser la progression côté serveur. */
  onRestart?: () => void;
}

/** Rend un énoncé/solution qu'il soit du texte brut avec LaTeX ($...$) ou du
 * HTML structuré (<p>, <strong>...) — les deux formats produits par l'IA de
 * génération d'examens. HtmlWithMath détecte le format et rend le KaTeX. */
export function MathText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <HtmlWithMath
      htmlContent={cleanMathStatement(text)}
      className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
    />
  );
}

/** Bloc dépliant pour la solution détaillée, avec un rendu (HtmlWithMath)
 * qui gère aussi bien le LaTeX brut que le HTML structuré généré par l'IA. */
function SolutionBox({ solution }: { solution: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
      >
        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Solution détaillée</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-primary/10">
          <MathText text={solution} />
        </div>
      )}
    </div>
  );
}

/** Formate un nombre de secondes en "MM:SS" pour l'affichage du chrono. */
function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Compte à rebours affiché en haut de la feuille pendant que l'élève
 * compose. Le temps restant est recalculé à chaque tick à partir de
 * `startedAt` (horodatage serveur figé au premier accès) plutôt que d'un
 * simple compteur local : sortir de la page puis y revenir ne redémarre
 * donc pas le chrono à zéro, il continue de s'écouler pendant l'absence.
 * Appelle onExpire une seule fois quand le temps est écoulé. */
function CountdownTimer({
  durationMinutes,
  startedAt,
  onExpire,
  frozen,
}: {
  durationMinutes: number;
  startedAt?: string;
  onExpire: () => void;
  frozen: boolean;
}) {
  const computeRemaining = () => {
    const totalSeconds = Math.max(0, Math.round(durationMinutes * 60));
    if (!startedAt) return totalSeconds;
    const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  };
  const [secondsLeft, setSecondsLeft] = useState(computeRemaining);

  useEffect(() => {
    if (frozen || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft(computeRemaining());
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozen, secondsLeft, startedAt]);

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

/** Un exercice est traité comme "à sous-questions" seulement à partir de 2
 * (une seule sous-question serait affichée comme un exercice simple). */
function hasSubQuestions(ex: ExamExercise): boolean {
  return Array.isArray(ex.sub_questions) && ex.sub_questions.length >= 2;
}

/** Grille de réponses vides initiale : une case par sous-question si
 * l'exercice en a, sinon une seule case pour l'exercice entier. */
function makeAnswerGrid(exercises: ExamExercise[]): string[][] {
  return exercises.map((ex) => new Array(hasSubQuestions(ex) ? ex.sub_questions!.length : 1).fill(""));
}

/** Grille de statuts initiale ("unanswered" partout), même forme que
 * makeAnswerGrid — une case par (sous-)question. */
function makeStatusGrid(exercises: ExamExercise[]): QuestionStatus[][] {
  return exercises.map((ex) => new Array(hasSubQuestions(ex) ? ex.sub_questions!.length : 1).fill("unanswered") as QuestionStatus[]);
}

/** Composant unique pour les 3 façons de voir un examen :
 *  - "student" : la feuille d'examen avec une zone de réponse PAR QUESTION
 *    (un exercice à plusieurs questions a une zone pour chacune, pas une
 *    seule pour tout l'exercice), un chrono qui décompte, et un bouton
 *    "Soumettre" révélant la note. Une fois soumis, chaque question bien
 *    répondue est verrouillée (verte) et chaque question fausse reste
 *    modifiable (rouge) avec son propre bouton pour la revérifier.
 *  - "preview" : exactement la même feuille (pour pédago/admin), mais sans
 *    aucune zone de réponse — rien à insérer, juste la consultation.
 *  - "edit" : le pédago modifie chaque exercice, soit directement (aperçu
 *    du rendu en direct), soit via le LaTeX brut. */
export default function ExamViewer({
  exercises,
  mode,
  onChange,
  durationMinutes,
  examTitle,
  examId,
  studentId,
  startedAt,
  initialAnswers,
  initialStatus,
  initialSubmitted,
  onRestart,
}: ExamViewerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStyle, setEditStyle] = useState<"direct" | "latex">("direct");
  const [answers, setAnswers] = useState<string[][]>(() =>
    initialAnswers && initialAnswers.length === exercises.length ? initialAnswers : makeAnswerGrid(exercises)
  );
  const [status, setStatus] = useState<QuestionStatus[][]>(() =>
    initialStatus && initialStatus.length === exercises.length ? initialStatus : makeStatusGrid(exercises)
  );
  const [submitted, setSubmitted] = useState(!!initialSubmitted);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const exercisesExportRef = useRef<HTMLDivElement>(null);

  // Ne réinitialise PAS au montage (la progression restaurée serait
  // aussitôt écrasée par une grille vide) — seulement si le nombre
  // d'exercices change vraiment ensuite (pédago qui édite en direct).
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setAnswers(makeAnswerGrid(exercises));
    setStatus(makeStatusGrid(exercises));
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  // Sauvegarde (débouncée) de la progression à chaque changement de réponse,
  // de statut ou de soumission — uniquement en mode "student" avec un examen
  // suivi côté serveur (examId + studentId fournis).
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (mode !== "student" || !examId || !studentId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveExamProgress(examId, studentId, { answers, status, submitted }).catch((e) =>
        console.error("[ExamViewer] Échec de sauvegarde de la progression :", e)
      );
    }, 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, status, submitted, mode, examId, studentId]);

  /** Met à jour la réponse de l'élève à une (sous-)question donnée. */
  const setAnswer = (exIdx: number, subIdx: number, value: string) => {
    setAnswers((prev) => prev.map((row, i) => (i === exIdx ? row.map((a, j) => (j === subIdx ? value : a)) : row)));
  };

  /** Insère un symbole à la position du curseur dans le champ de réponse
   * (au lieu de simplement l'ajouter à la fin), comme dans ChapterMathExercises. */
  const insertAtCursor = (elementId: string, current: string, symbol: string, apply: (value: string) => void) => {
    const el = document.getElementById(elementId) as HTMLTextAreaElement | null;
    if (el) {
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
      const next = current.slice(0, start) + symbol + current.slice(end);
      apply(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + symbol.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      apply(current + symbol);
    }
  };

  // Les fonctions ci-dessous ("edit" mode uniquement) sont des no-op si
  // onChange n'est pas fourni (mode "student"/"preview" en lecture seule).

  /** Modifie un champ (énoncé, solution, réponse...) de l'exercice `index`. */
  const update = (index: number, field: keyof ExamExercise, value: string) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  };

  /** Modifie un champ d'une sous-question précise d'un exercice. */
  const updateSubQuestion = (exIdx: number, subIdx: number, field: keyof ExamSubQuestion, value: string) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => {
      if (i !== exIdx || !ex.sub_questions) return ex;
      return { ...ex, sub_questions: ex.sub_questions.map((sq, j) => (j === subIdx ? { ...sq, [field]: value } : sq)) };
    }));
  };

  /** Supprime une sous-question d'un exercice. */
  const removeSubQuestion = (exIdx: number, subIdx: number) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === exIdx && ex.sub_questions ? { ...ex, sub_questions: ex.sub_questions.filter((_, j) => j !== subIdx) } : ex)));
  };

  /** Ajoute une sous-question vide à un exercice. */
  const addSubQuestion = (exIdx: number) => {
    if (!onChange) return;
    onChange(exercises.map((ex, i) => (i === exIdx ? { ...ex, sub_questions: [...(ex.sub_questions || []), { question: "", expected_answer: "" }] } : ex)));
  };

  /** Retire un exercice entier de l'examen. */
  const removeExercise = (index: number) => {
    if (!onChange) return;
    onChange(exercises.filter((_, i) => i !== index));
  };

  /** Ajoute un exercice vide en fin d'examen. */
  const addExercise = () => {
    if (!onChange) return;
    onChange([...exercises, { statement: "", solution: "", answer: "" }]);
  };

  /** Calcule le score de l'élève à partir du statut de correction de chaque
   * (sous-)question — seules celles déjà vérifiées (via le bouton "Soumettre"
   * global ou un bouton "Vérifier" individuel) comptent dans le total. */
  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    let total = 0;
    status.forEach((row) => row.forEach((s) => {
      if (s === "unanswered") return;
      total += 1;
      if (s === "correct") correct += 1;
    }));
    return { correct, total };
  }, [submitted, status]);

  /** Corrige une (sous-)question précise en comparant la réponse actuelle
   * (normalisée) à la réponse attendue. */
  const gradeQuestion = (exIdx: number, subIdx: number): QuestionStatus => {
    const ex = exercises[exIdx];
    const expected = hasSubQuestions(ex) ? ex.sub_questions?.[subIdx]?.expected_answer : ex.answer;
    if (!expected?.trim()) return "unanswered";
    return normalizeAnswer(answers[exIdx]?.[subIdx] || "") === normalizeAnswer(expected) ? "correct" : "incorrect";
  };

  /** Revérifie une seule question (bouton "Vérifier" à côté d'une question
   * restée fausse) : verte + verrouillée si désormais juste, sinon reste
   * rouge et modifiable. */
  const checkSingleQuestion = (exIdx: number, subIdx: number) => {
    setStatus((prev) => prev.map((row, i) => (i === exIdx ? row.map((s, j) => (j === subIdx ? gradeQuestion(exIdx, subIdx) : s)) : row)));
  };

  /** Soumission de l'examen par l'élève (bouton ou expiration du chrono) :
   * corrige toutes les questions d'un coup (vert+verrouillé / rouge+modifiable)
   * et arrête le chrono. */
  const handleSubmit = () => {
    setStatus(exercises.map((ex, i) => {
      const count = hasSubQuestions(ex) ? ex.sub_questions!.length : 1;
      return new Array(count).fill(null).map((_, j) => gradeQuestion(i, j)) as QuestionStatus[];
    }));
    setSubmitted(true);
  };

  /** Le temps est écoulé : soumet automatiquement (avec les réponses déjà
   * saisies) et affiche la pop-up d'information. */
  const handleExpire = () => {
    if (submitted) return;
    handleSubmit();
    setShowTimeUpDialog(true);
  };

  const handleRestart = () => {
    setShowTimeUpDialog(false);
    onRestart?.();
  };

  if (exercises.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Aucun exercice pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {examTitle && (
        <div className="flex justify-end">
          <ExportPDFButton targetRef={exercisesExportRef} title={examTitle} />
        </div>
      )}
      {mode === "student" && durationMinutes ? (
        <CountdownTimer durationMinutes={durationMinutes} startedAt={startedAt} frozen={submitted} onExpire={handleExpire} />
      ) : null}

      {mode === "student" && (
        <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>انتهى وقت الامتحان</AlertDialogTitle>
              <AlertDialogDescription>
                انتهى الوقت المخصص لهذا الامتحان. النتيجة المعروضة تعتمد على الإجابات التي تم تسجيلها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowTimeUpDialog(false)}>عرض النتيجة</AlertDialogCancel>
              <AlertDialogAction onClick={handleRestart} className="gap-2">
                <RotateCcw className="h-4 w-4" /> إعادة المحاولة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {mode === "student" && score && (
        <div className={cn(
          "rounded-xl border p-4 text-center font-semibold",
          score.total > 0 && score.correct === score.total ? "bg-green-50 text-green-700 border-green-200" : "bg-primary/5 text-primary border-primary/20",
        )}>
          النتيجة : {score.correct} / {score.total}
        </div>
      )}

      <div ref={exercisesExportRef} className="space-y-4">
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
                      const subStatus = status[idx]?.[j] || "unanswered";
                      const locked = subStatus === "correct";
                      return (
                        <div key={j} className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium flex-1"><MathText text={sq.question} /></span>
                            {mode === "student" && submitted && subStatus !== "unanswered" && (
                              subStatus === "correct" ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            )}
                          </div>
                          {mode === "student" && (
                            <div className="flex gap-2 items-start">
                              <Textarea
                                id={`exam-answer-${idx}-${j}`}
                                rows={2}
                                placeholder={`الإجابة على السؤال ${j + 1}...`}
                                value={answers[idx]?.[j] || ""}
                                disabled={locked}
                                onChange={(e) => setAnswer(idx, j, e.target.value)}
                                className={cn("flex-1", subStatus === "correct" && "border-green-300 bg-green-50", subStatus === "incorrect" && "border-destructive/40 bg-destructive/5")}
                              />
                              {!locked && (
                                <MathKeyboard
                                  onInsert={(sym) => insertAtCursor(`exam-answer-${idx}-${j}`, answers[idx]?.[j] || "", sym, (v) => setAnswer(idx, j, v))}
                                />
                              )}
                            </div>
                          )}
                          {mode === "student" && submitted && subStatus === "incorrect" && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => checkSingleQuestion(idx, j)}>
                                <Send className="h-3.5 w-3.5" /> تحقق من الإجابة
                              </Button>
                              {sq.expected_answer && (
                                <p className="text-xs text-muted-foreground">الإجابة الصحيحة : <MathText text={sq.expected_answer} /></p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  mode === "student" && (
                    <div className="flex gap-2 items-start">
                      <Textarea
                        id={`exam-answer-${idx}-0`}
                        rows={2}
                        placeholder="إجابتك..."
                        value={answers[idx]?.[0] || ""}
                        disabled={status[idx]?.[0] === "correct"}
                        onChange={(e) => setAnswer(idx, 0, e.target.value)}
                        className={cn("flex-1", status[idx]?.[0] === "correct" && "border-green-300 bg-green-50", status[idx]?.[0] === "incorrect" && "border-destructive/40 bg-destructive/5")}
                      />
                      {status[idx]?.[0] !== "correct" && (
                        <MathKeyboard
                          onInsert={(sym) => insertAtCursor(`exam-answer-${idx}-0`, answers[idx]?.[0] || "", sym, (v) => setAnswer(idx, 0, v))}
                        />
                      )}
                    </div>
                  )
                )}

                {mode === "edit" && ex.solution && <SolutionBox solution={ex.solution} />}
                {mode === "edit" && !subQ && ex.answer && (
                  <p className="text-sm font-medium rounded-lg bg-primary/5 px-3 py-2">Réponse : <MathText text={ex.answer} /></p>
                )}

                {mode === "student" && submitted && !subQ && ex.answer && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {status[idx]?.[0] === "correct" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" /> صحيح</Badge>
                    ) : (
                      <>
                        <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> خطأ</Badge>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => checkSingleQuestion(idx, 0)}>
                          <Send className="h-3.5 w-3.5" /> تحقق من الإجابة
                        </Button>
                      </>
                    )}
                    <p className="text-sm">الإجابة الصحيحة : <MathText text={ex.answer} /></p>
                  </div>
                )}
                {mode === "student" && submitted && ex.solution && <SolutionBox solution={ex.solution} />}
              </div>
            )}
          </div>
        );
      })}
      </div>

      {mode === "edit" && (
        <Button variant="outline" onClick={addExercise} className="w-full gap-2 rounded-xl border-dashed">
          <Plus className="h-4 w-4" />
          Ajouter un exercice
        </Button>
      )}

      {mode === "student" && !submitted && (
        <Button onClick={handleSubmit} className="w-full gap-2">
          <Send className="h-4 w-4" />
          تسليم الامتحان
        </Button>
      )}
    </div>
  );
}
