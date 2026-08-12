import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, PenTool, Send, Eye, Clock, Loader2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { HtmlWithMath } from "./HtmlWithMath";
import { useTimeTracking, formatTime } from "@/hooks/useTimeTracking";
import { ExerciseFormDialog, DeleteExerciseButton } from "./QuizExerciseCRUD";
import { ExportPDFButton } from "./ExportPDFButton";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownSolution } from "./MarkdownSolution";
import { MathKeyboard } from "./MathKeyboard";
import { cleanMathStatement } from "@/lib/mathStatement";
import { recordActivityAnswer, recordActivityHesitation } from "@/lib/recordActivityAnswer";
import type { HintUsage } from "@/lib/levelEngine";
import { useTranslation } from "react-i18next";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";

export interface DBExercise {
  id: string;
  lesson_id?: string | null;
  title: string;
  statement: string;
  expected_answer?: string;
  accepted_answers?: string[];
  solution?: string;
  difficulty?: number;
  hint?: string | null;
}

function DifficultyPencils({ level }: { level: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-0.5 ml-2" title={t("exercisePlayer.difficultyTitle", { level })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <PenTool key={i} className={cn("h-3.5 w-3.5", i < level ? "text-primary fill-primary/20" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

interface ChapterMathExercisesProps {
  exercises: DBExercise[];
  chapterTitle: string;
  chapterId: string;
  onClose: () => void;
  canManage?: boolean;
  onRefresh?: () => void;
}

export const ChapterMathExercises = ({ exercises, chapterTitle, chapterId, onClose, canManage, onRefresh }: ChapterMathExercisesProps) => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "ar" = i18n.language?.startsWith("fr") ? "fr" : "ar";
  const [currentExercise, setCurrentExercise] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [showCorrection, setShowCorrection] = useState<Record<string, boolean>>({});
  const [exerciseSolutions, setExerciseSolutions] = useState<Record<string, string>>({});
  const [exerciseTimes, setExerciseTimes] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [hintUsed, setHintUsed] = useState<Record<string, HintUsage>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const recordedRef = useRef<Record<string, boolean>>({});
  const lockTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Hesitation tracking per exercise
  const openedAtRef = useRef<number>(0);
  const typedRef = useRef<Record<string, boolean>>({});
  const emptiedRef = useRef<Record<string, boolean>>({});
  const submittedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => () => { Object.values(lockTimersRef.current).forEach(clearTimeout); }, []);

  const exercise = currentExercise !== null ? exercises[currentExercise] : null;

  // Le titre, l'énoncé, l'aide et le corrigé n'existent qu'en arabe en base :
  // traduits à la volée pour l'affichage en français, jamais écrits en base.
  const perExerciseInputs = exercises.flatMap((ex) => [ex.title, ex.statement, ex.hint || "", ex.solution || ""]);
  const { translated: tPerExercise } = useTranslatedContent(perExerciseInputs, lang);
  const translatedExercise = (index: number) => ({
    title: tPerExercise[index * 4] || exercises[index]?.title || "",
    statement: tPerExercise[index * 4 + 1] || exercises[index]?.statement || "",
    hint: tPerExercise[index * 4 + 2] || exercises[index]?.hint || "",
    solution: tPerExercise[index * 4 + 3] || exercises[index]?.solution || "",
  });

  // La solution renvoyée par le serveur au moment de la soumission/correction
  // (exerciseSolutions, différente du champ ex.solution pré-chargé) est
  // traduite séparément, sur les entrées effectivement chargées.
  const solutionIds = Object.keys(exerciseSolutions);
  const { translated: tSolutions } = useTranslatedContent(solutionIds.map((id) => exerciseSolutions[id]), lang);
  const translatedSolutionById: Record<string, string> = {};
  solutionIds.forEach((id, i) => { translatedSolutionById[id] = tSolutions[i] || exerciseSolutions[id]; });

  const currentExerciseContentId = useMemo(() => {
    if (currentExercise === null) return "";
    return `exercise-${chapterId}-${currentExercise}`;
  }, [chapterId, currentExercise]);

  const { formattedTime: currentExerciseTime, elapsedSeconds } = useTimeTracking({
    contentType: "exercise", contentId: currentExerciseContentId, chapterId, autoStart: true, enabled: currentExercise !== null,
  });

  useEffect(() => {
    if (currentExerciseContentId && elapsedSeconds > 0) {
      setExerciseTimes(prev => ({ ...prev, [currentExerciseContentId]: elapsedSeconds }));
    }
  }, [currentExerciseContentId, elapsedSeconds]);

  // Règle 3.2 — détection hésitation/abandon en quittant un exercice ouvert.
  useEffect(() => {
    if (!exercise) return;
    const ex = exercise;
    openedAtRef.current = Date.now();
    return () => {
      if (!userId) return;
      const openMs = Date.now() - (openedAtRef.current || Date.now());
      const didSubmit = submittedRef.current[ex.id];
      const isSolved = solved[ex.id];
      if (didSubmit || isSolved) return;
      if (emptiedRef.current[ex.id]) {
        recordActivityHesitation({ userId, chapterId, lessonId: ex.lesson_id ?? null, kind: "erase", difficulty: ex.difficulty }).catch(console.error);
      } else if (openMs > 60000) {
        recordActivityHesitation({ userId, chapterId, lessonId: ex.lesson_id ?? null, kind: "timeout", difficulty: ex.difficulty }).catch(console.error);
      }
    };
  }, [currentExercise, exercise, userId, chapterId, solved]);

  const hintUsageFor = (id: string): HintUsage => hintUsed[id] ?? "none";

  const handleAnswerChange = (id: string, val: string) => {
    setUserAnswers(prev => ({ ...prev, [id]: val }));
    if (val.trim().length > 0) typedRef.current[id] = true;
    else if (typedRef.current[id]) emptiedRef.current[id] = true;
  };

  const handleToggleHint = (ex: DBExercise) => {
    const opening = !showHint[ex.id];
    setShowHint(prev => ({ ...prev, [ex.id]: !prev[ex.id] }));
    if (opening && !hintUsed[ex.id]) {
      const after = (attempts[ex.id] ?? 0) > 0;
      setHintUsed(prev => ({ ...prev, [ex.id]: after ? "curative" : "preventive" }));
    } else if (opening && hintUsed[ex.id] === "preventive" && (attempts[ex.id] ?? 0) > 0) {
      // already wrong then re-open → escalate to curative
      setHintUsed(prev => ({ ...prev, [ex.id]: "curative" }));
    }
  };

  const handleSubmit = async (ex: DBExercise) => {
    if (locked[ex.id] || solved[ex.id]) return;
    const userAnswer = userAnswers[ex.id]?.trim() || "";
    if (!userAnswer) return;
    setIsSubmitting(true);
    const nextAttempts = (attempts[ex.id] ?? 0) + 1;
    setAttempts(prev => ({ ...prev, [ex.id]: nextAttempts }));
    submittedRef.current[ex.id] = true;

    let isCorrect = false;
    try {
      const { data, error } = await supabase.rpc('check_exercise_answer', {
        _exercise_id: ex.id,
        _user_answer: userAnswer,
      });
      if (error) throw error;
      const result = data as { is_correct: boolean; expected_answer: string; solution: string };
      isCorrect = result.is_correct;
      if (result.solution) setExerciseSolutions(prev => ({ ...prev, [ex.id]: result.solution }));
    } catch (error) {
      console.error("Error validating exercise:", error);
      if (ex.accepted_answers) {
        const userLower = userAnswer.toLowerCase();
        isCorrect = ex.accepted_answers.some(
          accepted => userLower === accepted.toLowerCase().trim() ||
            userLower.includes(accepted.toLowerCase().trim()) ||
            accepted.toLowerCase().trim().includes(userLower)
        );
        if (ex.solution) setExerciseSolutions(prev => ({ ...prev, [ex.id]: ex.solution! }));
      }
    } finally {
      setIsSubmitting(false);
    }

    if (isCorrect) {
      setSolved(prev => ({ ...prev, [ex.id]: true }));
      if (userId && !recordedRef.current[ex.id]) {
        recordedRef.current[ex.id] = true;
        recordActivityAnswer({
          userId, chapterId, lessonId: ex.lesson_id ?? null,
          isCorrect: true, difficulty: ex.difficulty,
          hintUsage: hintUsageFor(ex.id), attemptCount: nextAttempts,
        }).catch(console.error);
      }
    } else {
      // Règle 2A — verrouillage rouge 3s, sans révéler la réponse.
      setLocked(prev => ({ ...prev, [ex.id]: true }));
      if (lockTimersRef.current[ex.id]) clearTimeout(lockTimersRef.current[ex.id]);
      lockTimersRef.current[ex.id] = setTimeout(() => {
        setLocked(prev => ({ ...prev, [ex.id]: false }));
      }, 3000);
    }
  };

  const toggleCorrection = async (ex: DBExercise) => {
    const willReveal = !showCorrection[ex.id];
    setShowCorrection(prev => ({ ...prev, [ex.id]: !prev[ex.id] }));
    if (!willReveal) return;

    // Charger la solution si absente (consultation = abandon si non résolu).
    if (!exerciseSolutions[ex.id]) {
      try {
        const { data } = await supabase.rpc('check_exercise_answer', {
          _exercise_id: ex.id,
          _user_answer: userAnswers[ex.id]?.trim() || "",
        });
        const result = data as { solution?: string } | null;
        if (result?.solution) setExerciseSolutions(prev => ({ ...prev, [ex.id]: result.solution! }));
        else if (ex.solution) setExerciseSolutions(prev => ({ ...prev, [ex.id]: ex.solution! }));
      } catch {
        if (ex.solution) setExerciseSolutions(prev => ({ ...prev, [ex.id]: ex.solution! }));
      }
    }

    // Révéler la solution avant d'avoir réussi = abandon → compté comme échec.
    if (!solved[ex.id] && userId && !recordedRef.current[ex.id]) {
      recordedRef.current[ex.id] = true;
      submittedRef.current[ex.id] = true;
      recordActivityAnswer({
        userId, chapterId, lessonId: ex.lesson_id ?? null,
        isCorrect: false, difficulty: ex.difficulty,
        hintUsage: hintUsageFor(ex.id), attemptCount: Math.max(1, attempts[ex.id] ?? 0), abandoned: true,
      }).catch(console.error);
    }
  };

  if (currentExercise !== null && exercise) {
    const isSolved = solved[exercise.id];
    const isLocked = locked[exercise.id];
    const correctionVisible = showCorrection[exercise.id];
    const solution = exerciseSolutions[exercise.id];
    const tCurrent = translatedExercise(currentExercise);
    const displaySolution = translatedSolutionById[exercise.id] || solution;

    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentExercise(null)}>
              <ArrowLeft className="h-4 w-4 mr-2 rtl:rotate-180" />{t("exercisePlayer.backToList")}
            </Button>
            <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
              {t("exercisePlayer.exerciseCounter", { current: currentExercise + 1, total: exercises.length })}
            </span>
          </div>
          <CardTitle className="text-xl mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <PenTool className="h-5 w-5 text-amber" />
              </div>
              <span dir="auto">{tCurrent.title}</span>
              {exercise.difficulty && <DifficultyPencils level={exercise.difficulty} />}
            </div>
            <div className="flex items-center gap-2">
              {canManage && onRefresh && (
                <div className="flex gap-1">
                  <ExerciseFormDialog chapterId={chapterId} onSaved={onRefresh} exercise={exercise} />
                  <DeleteExerciseButton exerciseId={exercise.id} onDeleted={onRefresh} />
                </div>
              )}
              <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono font-medium">{currentExerciseTime}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4" />{t("exercisePlayer.statementLabel")}</h4>
            <HtmlWithMath htmlContent={cleanMathStatement(tCurrent.statement)} className="text-sm border-t pt-2 block text-start" dir={lang === "fr" ? "ltr" : "rtl"} />
          </div>

          {exercise.hint && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleToggleHint(exercise)}
                className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950 font-semibold">
                <Lightbulb className="h-4 w-4" />
                {showHint[exercise.id] ? t("exercisePlayer.hideHint") : t("exercisePlayer.showHint")}
              </Button>
              {showHint[exercise.id] && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1 text-sm text-amber-900 dark:text-amber-200">
                      <p className="font-semibold mb-2">{t("exercisePlayer.helpfulTip")}</p>
                      <HtmlWithMath htmlContent={tCurrent.hint} className="max-w-none text-start leading-relaxed" dir={lang === "fr" ? "ltr" : "rtl"} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {!isSolved && (
              <div className="flex gap-3 items-center">
                <Input id={`chap-exo-input-${exercise.id}`} placeholder={isLocked ? t("exercisePlayer.placeholderWrong") : t("exercisePlayer.placeholderAnswer")} value={userAnswers[exercise.id] || ""}
                  onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                  disabled={isLocked || isSubmitting}
                  className={cn("flex-1", isLocked && "border-red-500 ring-2 ring-red-500/40 bg-red-500/5")}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isLocked && !isSubmitting && userAnswers[exercise.id]?.trim()) handleSubmit(exercise); }}
                />
                <Button onClick={() => handleSubmit(exercise)} disabled={isLocked || isSubmitting || !userAnswers[exercise.id]?.trim()} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t("exercisePlayer.confirm")}
                </Button>
                {!isLocked && (
                  <MathKeyboard onInsert={(sym) => {
                    const el = document.getElementById(`chap-exo-input-${exercise.id}`) as HTMLInputElement | null;
                    const current = userAnswers[exercise.id] || "";
                    if (el) {
                      const start = el.selectionStart ?? current.length;
                      const end = el.selectionEnd ?? current.length;
                      const next = current.slice(0, start) + sym + current.slice(end);
                      handleAnswerChange(exercise.id, next);
                      requestAnimationFrame(() => { el.focus(); const pos = start + sym.length; el.setSelectionRange(pos, pos); });
                    } else {
                      handleAnswerChange(exercise.id, current + sym);
                    }
                  }} />
                )}
              </div>
            )}

            {isLocked && (
              <div className="p-4 rounded-lg flex items-center gap-3 bg-red-500/10 border border-red-500/30">
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{t("exercisePlayer.wrongAnswerLocked")}</p>
              </div>
            )}

            {isSolved && (
              <div className="p-4 rounded-lg flex items-center gap-3 bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <p className="font-medium text-green-700 dark:text-green-300">{t("exercisePlayer.correctAnswerCelebration")}</p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => toggleCorrection(exercise)}
            className="w-full gap-2 font-semibold">
            <Eye className="h-4 w-4" />
            {correctionVisible ? t("exercisePlayer.hideSolution") : t("exercisePlayer.showSolution")}
          </Button>

          {correctionVisible && solution && (
            <MarkdownSolution content={displaySolution} />
          )}

          <div className="flex gap-3">
            {currentExercise > 0 && <Button variant="outline" onClick={() => setCurrentExercise(currentExercise - 1)} className="flex-1">{t("exercisePlayer.previousExercise")}</Button>}
            {currentExercise < exercises.length - 1 && <Button onClick={() => setCurrentExercise(currentExercise + 1)} className="flex-1">{t("exercisePlayer.nextExercise")}</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = Object.values(solved).filter(Boolean).length;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <span>{t("exercisePlayer.exercisesTitle")}</span>
          </CardTitle>
          <div className="flex gap-2">
            {canManage && onRefresh && <ExerciseFormDialog chapterId={chapterId} onSaved={onRefresh} />}
            {exercises.length > 0 && (
              <ExportPDFButton targetRef={exportRef} title={`${chapterTitle} — ${t("exercisePlayer.exercisesTitle")}`} label={t("cours.exportPdf")} />
            )}
            <Button variant="outline" onClick={onClose}>{t("exercisePlayer.backToLesson")}</Button>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">{t("exercisePlayer.progressSummary", { chapterTitle, completed: completedCount, total: exercises.length })}</p>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t("exercisePlayer.noExercisesAvailable")}</p>
        ) : (
          <div className="grid gap-3">
            {exercises.map((ex, index) => {
              const isSolved = solved[ex.id];
              const exerciseId = `exercise-${chapterId}-${index}`;
              const timeForExercise = exerciseTimes[exerciseId] || 0;
              const tEx = translatedExercise(index);
              return (
                <button key={ex.id} onClick={() => setCurrentExercise(index)} className={cn(
                  "w-full p-4 rounded-lg border text-end transition-all hover:shadow-md flex items-center justify-between gap-4",
                  isSolved ? "bg-green-500/5 border-green-500/30" : "hover:bg-accent"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      isSolved ? "bg-green-500 text-white" : "bg-muted"
                    )}>
                      {isSolved ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <div dir="auto">
                      <h4 className="font-medium flex items-center">{tEx.title}{ex.difficulty && <DifficultyPencils level={ex.difficulty} />}</h4>
                      <span className="text-sm text-muted-foreground line-clamp-1">{tEx.statement.substring(0, 60)}...</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {timeForExercise > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />{formatTime(timeForExercise)}
                      </div>
                    )}
                    <ArrowLeft className="h-4 w-4 text-primary rtl:rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Rendu hors-écran de tous les exercices (énoncé + solution rendus
          exactement comme à l'écran, LaTeX inclus) : sert uniquement de
          source à la capture html2canvas de l'export PDF, jamais visible. */}
      <div ref={exportRef} style={{ position: "fixed", left: "-9999px", top: 0, width: 780 }} aria-hidden className="bg-white p-8" dir={lang === "fr" ? "ltr" : "rtl"}>
        <h1 className="text-2xl font-bold text-center border-b pb-4 mb-6">{chapterTitle} — {t("exercisePlayer.exercisesTitle")}</h1>
        {exercises.map((ex, i) => {
          const tEx = translatedExercise(i);
          return (
            <div key={ex.id} className={i > 0 ? "mt-6 pt-6 border-t" : ""}>
              <h3 className="font-bold mb-2">{i + 1}. {tEx.title}</h3>
              <HtmlWithMath htmlContent={cleanMathStatement(tEx.statement)} className="text-sm text-start" dir={lang === "fr" ? "ltr" : "rtl"} />
              {ex.solution && (
                <div className="mt-3">
                  <MarkdownSolution content={tEx.solution} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
