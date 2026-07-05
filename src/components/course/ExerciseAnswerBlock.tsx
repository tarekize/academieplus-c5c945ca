import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, BookOpen } from "lucide-react";
import { HtmlWithMath } from "./HtmlWithMath";
import { cleanMathStatement } from "@/lib/mathStatement";
import { recordTeacherContentAttempt, normalizeAnswer } from "@/lib/teacherContentAttempt";

interface Props {
  /** The teacher_content row id this exercise belongs to (attempts are recorded against it). */
  contentId: string;
  userId: string;
  statement?: string;
  expectedAnswer?: string;
  solution?: string;
  hint?: string;
}

/** Self-contained answer/correction block for a single teacher-authored exercise. */
export default function ExerciseAnswerBlock({ contentId, userId, statement, expectedAnswer, solution, hint }: Props) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleHint = () => {
    if (showHint) return;
    setShowHint(true);
    recordTeacherContentAttempt(contentId, userId, { hintDelta: 1 });
  };

  const handleCheck = () => {
    if (revealed) { setRevealed(false); return; }
    const correct = !!expectedAnswer && normalizeAnswer(answer) === normalizeAnswer(expectedAnswer);
    setRevealed(true);
    recordTeacherContentAttempt(contentId, userId, {
      attemptDelta: 1,
      errorDelta: correct ? 0 : 1,
      completed: true,
      isCorrect: correct,
      answer: answer || null,
    });
  };

  return (
    <div className="space-y-3">
      {statement && (
        <HtmlWithMath htmlContent={cleanMathStatement(statement)} className="text-sm text-right" dir="rtl" />
      )}
      {hint && showHint && (
        <div className="text-xs text-amber-700 dark:text-amber-400 bg-yellow-500/5 p-2 rounded" dir="rtl">💡 {hint}</div>
      )}
      <div className="flex gap-2 items-center" dir="rtl">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
          placeholder="أدخل إجابتك..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          dir="rtl" />
        {hint && !showHint && (
          <Button size="sm" variant="ghost" onClick={handleHint}>
            <Lightbulb className="h-4 w-4 mr-1" /> تلميح
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleCheck}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> {revealed ? "إخفاء" : "التصحيح"}
        </Button>
      </div>
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
