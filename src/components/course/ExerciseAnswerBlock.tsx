import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, XCircle, Clock, BookOpen, Send } from "lucide-react";
import { HtmlWithMath } from "./HtmlWithMath";
import { cleanMathStatement, splitStatementIntoQuestions } from "@/lib/mathStatement";
import { recordTeacherContentAttempt, normalizeAnswer } from "@/lib/teacherContentAttempt";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  /** The teacher_content row id this exercise belongs to (attempts are recorded against it). */
  contentId: string;
  userId: string;
  statement?: string;
  expectedAnswer?: string;
  solution?: string;
  hint?: string;
}

type Grade = "none" | "pending" | "correct" | "incorrect";

/** Self-contained answer/correction block for a single teacher-authored exercise.
 * Si l'enseignant a saisi une réponse attendue et/ou un corrigé, la soumission
 * est auto-corrigée immédiatement. Sinon, elle part "en attente" chez
 * l'enseignant (page "Suivi de la classe"), qui la corrige lui-même — l'élève
 * peut alors réessayer tant qu'il n'a pas obtenu "correct". */
export default function ExerciseAnswerBlock({ contentId, userId, statement, expectedAnswer, solution, hint }: Props) {
  const { intro, questions } = splitStatementIntoQuestions(statement || "");
  const hasSubQuestions = questions.length >= 2;
  const hasCorrection = !!(expectedAnswer?.trim() || solution?.trim());

  const [answer, setAnswer] = useState("");
  const [subAnswers, setSubAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [grade, setGrade] = useState<Grade>("none");
  const [loadingAttempt, setLoadingAttempt] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("teacher_content_attempts")
        .select("completed, is_correct, last_answer")
        .eq("content_id", contentId)
        .eq("student_id", userId)
        .maybeSingle();
      if (!active) return;
      if (data?.completed) {
        setGrade(data.is_correct === true ? "correct" : data.is_correct === false ? "incorrect" : "pending");
        if (typeof data.last_answer === "string") setAnswer(data.last_answer);
      }
      setLoadingAttempt(false);
    })();
    return () => { active = false; };
  }, [contentId, userId]);

  // Se met à jour en direct quand l'enseignant corrige manuellement une
  // réponse en attente depuis "Suivi de la classe".
  useEffect(() => {
    const channel = supabase
      .channel(`tca_${contentId}_${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teacher_content_attempts", filter: `content_id=eq.${contentId}` },
        (payload: any) => {
          if (payload.new?.student_id !== userId) return;
          setGrade(payload.new.is_correct === true ? "correct" : payload.new.is_correct === false ? "incorrect" : "pending");
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [contentId, userId]);

  const handleHint = () => {
    if (showHint) return;
    setShowHint(true);
    recordTeacherContentAttempt(contentId, userId, { hintDelta: 1 });
  };

  const canEdit = grade === "none" || grade === "incorrect";

  const handleSubmit = () => {
    if (!canEdit) return;
    const combinedAnswer = hasSubQuestions
      ? subAnswers.map((a, i) => `${i + 1}. ${a}`).join(" — ")
      : answer;
    if (!combinedAnswer.trim()) return;
    // Auto-corrigé seulement si l'enseignant a fourni une réponse attendue —
    // sinon la correction reste "en attente" (null) pour que l'enseignant la
    // tranche lui-même, au lieu d'être marquée fausse par défaut.
    const autoCorrect = expectedAnswer?.trim()
      ? normalizeAnswer(combinedAnswer) === normalizeAnswer(expectedAnswer)
      : null;
    setGrade(autoCorrect === true ? "correct" : autoCorrect === false ? "incorrect" : "pending");
    recordTeacherContentAttempt(contentId, userId, {
      attemptDelta: 1,
      errorDelta: autoCorrect === false ? 1 : 0,
      completed: true,
      isCorrect: autoCorrect,
      answer: combinedAnswer,
    });
  };

  const handleToggleReveal = () => {
    if (!hasCorrection) return;
    setRevealed((r) => !r);
  };

  if (loadingAttempt) return null;

  return (
    <div className="space-y-3">
      {hasSubQuestions ? (
        <div className="space-y-4" dir="rtl">
          {intro && <HtmlWithMath htmlContent={cleanMathStatement(intro)} className="text-sm text-right" dir="rtl" />}
          {questions.map((q, i) => (
            <div key={i} className="space-y-1.5">
              <HtmlWithMath htmlContent={cleanMathStatement(q)} className="text-sm text-right" dir="rtl" />
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background disabled:opacity-60"
                placeholder={`إجابة السؤال ${i + 1}...`}
                value={subAnswers[i] || ""}
                onChange={(e) => setSubAnswers((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                disabled={!canEdit}
                dir="rtl" />
            </div>
          ))}
        </div>
      ) : (
        statement && (
          <HtmlWithMath htmlContent={cleanMathStatement(statement)} className="text-sm text-right" dir="rtl" />
        )
      )}

      {hint && showHint && (
        <div className="text-xs text-amber-700 dark:text-amber-400 bg-yellow-500/5 p-2 rounded" dir="rtl">💡 {hint}</div>
      )}

      <div className="flex gap-2 items-center flex-wrap" dir="rtl">
        {!hasSubQuestions && (
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background disabled:opacity-60"
            placeholder="أدخل إجابتك..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!canEdit}
            dir="rtl" />
        )}
        {hint && !showHint && (
          <Button size="sm" variant="ghost" onClick={handleHint}>
            <Lightbulb className="h-4 w-4 mr-1" /> تلميح
          </Button>
        )}
        <Button size="sm" variant={canEdit ? "default" : "secondary"} onClick={handleSubmit} disabled={!canEdit}>
          <Send className="h-4 w-4 mr-1" /> {grade === "none" ? "إرسال الإجابة" : "إعادة الإرسال"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleToggleReveal} disabled={!hasCorrection} title={!hasCorrection ? "لم يضف الأستاذ تصحيحاً لهذا التمرين" : undefined}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> {revealed ? "إخفاء" : "التصحيح"}
        </Button>
      </div>

      {grade === "correct" && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-500/5 p-2.5 rounded-lg" dir="rtl">
          <CheckCircle2 className="h-4 w-4" /> إجابة صحيحة!
        </div>
      )}
      {grade === "incorrect" && (
        <div className="flex items-center gap-2 text-sm font-medium text-red-500 bg-red-500/5 p-2.5 rounded-lg" dir="rtl">
          <XCircle className="h-4 w-4" /> إجابة غير صحيحة، حاول مجدداً.
        </div>
      )}
      {grade === "pending" && (
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-500/5 p-2.5 rounded-lg" dir="rtl">
          <Clock className="h-4 w-4" /> تم إرسال إجابتك، بانتظار تصحيح الأستاذ.
        </div>
      )}

      {revealed && (
        <div className="bg-muted/50 p-3 rounded text-sm space-y-1" dir="rtl">
          {expectedAnswer && (
            <p><span className="font-semibold">الإجابة:</span>{" "}
              <HtmlWithMath htmlContent={cleanMathStatement(expectedAnswer)} className="inline" /></p>
          )}
          {solution && (
            <div>
              <p className="font-semibold flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4" /> الحل:</p>
              <HtmlWithMath htmlContent={cleanMathStatement(solution)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
