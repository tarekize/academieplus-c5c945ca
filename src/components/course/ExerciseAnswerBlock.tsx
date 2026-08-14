import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, XCircle, Clock, BookOpen, Send } from "lucide-react";
import { HtmlWithMath } from "./HtmlWithMath";
import { MathKeyboard } from "./MathKeyboard";
import { cleanMathStatement, splitStatementIntoQuestions } from "@/lib/mathStatement";
import { recordTeacherContentAttempt, normalizeAnswer } from "@/lib/teacherContentAttempt";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSubQuestion } from "@/lib/teacherContent";
import { useTranslation } from "react-i18next";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";

interface Props {
  /** The teacher_content row id this exercise belongs to (attempts are recorded against it). */
  contentId: string;
  userId: string;
  statement?: string;
  expectedAnswer?: string;
  solution?: string;
  hint?: string;
  /** Exercice à plusieurs questions structurées par l'IA (une réponse attendue par
   * question). Si absent/vide, on retombe sur le découpage par numérotation du texte. */
  subQuestions?: ExerciseSubQuestion[];
}

type Grade = "none" | "pending" | "correct" | "incorrect";
type Part = { text: string; expectedAnswer?: string };

/** Self-contained answer/correction block for a single teacher-authored exercise.
 * Si l'enseignant a saisi une réponse attendue et/ou un corrigé, la soumission
 * est auto-corrigée immédiatement. Sinon, elle part "en attente" chez
 * l'enseignant (page "Suivi de la classe"), qui la corrige lui-même — l'élève
 * peut alors réessayer tant qu'il n'a pas obtenu "correct". */
export default function ExerciseAnswerBlock({ contentId, userId, statement, expectedAnswer, solution, hint, subQuestions }: Props) {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "ar" = i18n.language?.startsWith("fr") ? "fr" : "ar";
  const legacySplit = splitStatementIntoQuestions(statement || "");
  // >= 1 et non >= 2 : le prompt IA demande explicitement de ne remplir
  // sub_questions que pour un exercice à plusieurs questions, mais il arrive
  // que le modèle y mette une seule question quand même (ex. un exercice à
  // une seule limite à calculer). Avec un seuil à 2, ce cas tombait dans la
  // branche "statement" — qui ne contient alors que le contexte partagé
  // ("Calcule la limite suivante :"), jamais l'énoncé réel de la question,
  // resté coincé dans sub_questions[0].question et jamais affiché.
  const structuredParts: Part[] | null =
    subQuestions && subQuestions.length >= 1
      ? subQuestions.map((q) => ({ text: q.question, expectedAnswer: q.expected_answer }))
      : legacySplit.questions.length >= 2
        ? legacySplit.questions.map((q) => ({ text: q }))
        : null;
  const hasSubQuestions = !!structuredParts;
  const intro = subQuestions && subQuestions.length >= 1 ? (statement || "") : legacySplit.intro;
  const parts = structuredParts || [];
  const hasCorrection = hasSubQuestions
    ? parts.some((p) => !!p.expectedAnswer?.trim()) || !!solution?.trim()
    : !!(expectedAnswer?.trim() || solution?.trim());

  // Le contenu (énoncé, indice, réponse, corrigé) n'existe qu'en arabe en
  // base : traduit à la volée pour l'affichage quand l'interface est en
  // français, jamais écrit en base.
  const translationInputs = [
    statement || "",
    intro || "",
    hint || "",
    expectedAnswer || "",
    solution || "",
    ...parts.map((p) => p.text),
    ...parts.map((p) => p.expectedAnswer || ""),
  ];
  const { translated } = useTranslatedContent(translationInputs, lang);
  const tStatement = translated[0] || statement || "";
  const tIntro = translated[1] || intro || "";
  const tHint = translated[2] || hint || "";
  const tExpectedAnswer = translated[3] || expectedAnswer || "";
  const tSolution = translated[4] || solution || "";
  const tPartTexts = translated.slice(5, 5 + parts.length);
  const tPartAnswers = translated.slice(5 + parts.length, 5 + 2 * parts.length);

  const [answer, setAnswer] = useState("");
  const [subAnswers, setSubAnswers] = useState<string[]>(() => parts.map(() => ""));
  const [partChecked, setPartChecked] = useState<Record<number, boolean>>({});
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
        if (typeof data.last_answer === "string") {
          if (hasSubQuestions) {
            const restored = data.last_answer.split(" — ").map((s: string) => s.replace(/^\d+\.\s*/, ""));
            setSubAnswers((prev) => prev.map((v, i) => restored[i] ?? v));
          } else {
            setAnswer(data.last_answer);
          }
        }
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

  /** Insère un symbole à la position du curseur dans le champ de réponse ciblé. */
  const insertAtCursor = (elementId: string, current: string, symbol: string, apply: (value: string) => void) => {
    const el = document.getElementById(elementId) as HTMLInputElement | null;
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

  const handleHint = () => {
    if (showHint) return;
    setShowHint(true);
    recordTeacherContentAttempt(contentId, userId, { hintDelta: 1 });
  };

  const canEdit = grade === "none" || grade === "incorrect";

  const handleCheckPart = (i: number) => {
    const exp = parts[i]?.expectedAnswer;
    if (!exp?.trim()) return;
    const correct = normalizeAnswer(subAnswers[i] || "") === normalizeAnswer(exp);
    setPartChecked((prev) => ({ ...prev, [i]: correct }));
  };

  const handleSubmit = () => {
    if (!canEdit) return;
    const combinedAnswer = hasSubQuestions
      ? parts.map((p, i) => `${i + 1}. ${subAnswers[i] || ""}`).join(" — ")
      : answer;
    if (!combinedAnswer.trim()) return;

    // Auto-corrigé seulement si une réponse attendue existe (globale, ou pour
    // CHAQUE question quand l'exercice en a plusieurs) — sinon la correction
    // reste "en attente" (null) pour que l'enseignant la tranche lui-même,
    // au lieu d'être marquée fausse par défaut.
    let autoCorrect: boolean | null;
    if (hasSubQuestions) {
      const allGradable = parts.every((p) => !!p.expectedAnswer?.trim());
      autoCorrect = allGradable
        ? parts.every((p, i) => normalizeAnswer(subAnswers[i] || "") === normalizeAnswer(p.expectedAnswer!))
        : null;
    } else {
      autoCorrect = expectedAnswer?.trim() ? normalizeAnswer(combinedAnswer) === normalizeAnswer(expectedAnswer) : null;
    }

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

  // dir explicite plutôt que compter sur l'héritage du document : ce bloc
  // reste correctement RTL/LTR même monté dans un contexte qui override dir
  // plus haut (ex. aperçu enseignant), au lieu de retomber en LTR par défaut.
  return (
    <div className="space-y-3" dir={lang === "fr" ? "ltr" : "rtl"}>
      {hasSubQuestions ? (
        <div className="space-y-4">
          {intro && <HtmlWithMath htmlContent={cleanMathStatement(tIntro)} className="text-sm text-start" dir={lang === "fr" ? "ltr" : "rtl"} />}
          {parts.map((p, i) => (
            <div key={i} className="space-y-1.5">
              <HtmlWithMath htmlContent={cleanMathStatement(tPartTexts[i] || p.text)} className="text-sm text-start" dir={lang === "fr" ? "ltr" : "rtl"} />
              <div className="flex items-center gap-2">
                <input
                  id={`exo-answer-${contentId}-${i}`}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background disabled:opacity-60"
                  placeholder={t("exercisePlayer.subQuestionPlaceholder", { n: i + 1 })}
                  value={subAnswers[i] || ""}
                  onChange={(e) => { setSubAnswers((prev) => prev.map((v, j) => (j === i ? e.target.value : v))); setPartChecked((prev) => { const { [i]: _, ...rest } = prev; return rest; }); }}
                  disabled={!canEdit} />
                {canEdit && (
                  <MathKeyboard
                    onInsert={(sym) => insertAtCursor(`exo-answer-${contentId}-${i}`, subAnswers[i] || "", sym, (v) => setSubAnswers((prev) => prev.map((val, j) => (j === i ? v : val))))}
                  />
                )}
                <Button
                  size="sm" variant="outline" className="shrink-0"
                  onClick={() => handleCheckPart(i)}
                  disabled={!canEdit || !parts[i]?.expectedAnswer?.trim() || !subAnswers[i]?.trim()}
                  title={!parts[i]?.expectedAnswer?.trim() ? t("exercisePlayer.noTeacherAnswerTitle") : undefined}
                >
                  {t("exercisePlayer.check")}
                </Button>
                {partChecked[i] === true && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                {partChecked[i] === false && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        statement && (
          <HtmlWithMath htmlContent={cleanMathStatement(tStatement)} className="text-sm text-start" dir={lang === "fr" ? "ltr" : "rtl"} />
        )
      )}

      {hint && showHint && (
        <div className="text-xs text-amber-700 dark:text-amber-400 bg-yellow-500/5 p-2 rounded text-start" dir={lang === "fr" ? "ltr" : "rtl"}>💡 {tHint}</div>
      )}

      <div className="flex gap-2 items-center flex-wrap">
        {!hasSubQuestions && (
          <>
            <input
              id={`exo-answer-${contentId}`}
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background disabled:opacity-60"
              placeholder={t("exercisePlayer.placeholderAnswer")}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!canEdit} />
            {canEdit && (
              <MathKeyboard onInsert={(sym) => insertAtCursor(`exo-answer-${contentId}`, answer, sym, setAnswer)} />
            )}
          </>
        )}
        {hint && !showHint && (
          <Button size="sm" variant="ghost" onClick={handleHint}>
            <Lightbulb className="h-4 w-4 mr-1" /> {t("exercisePlayer.hint")}
          </Button>
        )}
        <Button size="sm" variant={canEdit ? "default" : "secondary"} onClick={handleSubmit} disabled={!canEdit}>
          <Send className="h-4 w-4 mr-1" /> {grade === "none" ? t("exercisePlayer.sendAnswer") : t("exercisePlayer.resendAnswer")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleToggleReveal} disabled={!hasCorrection} title={!hasCorrection ? t("exercisePlayer.noTeacherCorrectionTitle") : undefined}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> {revealed ? t("exercisePlayer.hide") : t("exercisePlayer.correction")}
        </Button>
      </div>

      {grade === "correct" && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-500/5 p-2.5 rounded-lg">
          <CheckCircle2 className="h-4 w-4" /> {t("exercisePlayer.correctAnswerSimple")}
        </div>
      )}
      {grade === "incorrect" && (
        <div className="flex items-center gap-2 text-sm font-medium text-red-500 bg-red-500/5 p-2.5 rounded-lg">
          <XCircle className="h-4 w-4" /> {t("exercisePlayer.wrongAnswerRetry")}
        </div>
      )}
      {grade === "pending" && (
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-500/5 p-2.5 rounded-lg">
          <Clock className="h-4 w-4" /> {t("exercisePlayer.pendingTeacherReview")}
        </div>
      )}

      {revealed && (
        <div className="bg-muted/50 p-3 rounded text-sm space-y-2">
          {hasSubQuestions ? (
            parts.map((p, i) => p.expectedAnswer ? (
              <p key={i}><span className="font-semibold">{t("exercisePlayer.subQuestionAnswerLabel", { n: i + 1 })}</span>{" "}
                <HtmlWithMath htmlContent={cleanMathStatement(tPartAnswers[i] || p.expectedAnswer)} className="inline" dir={lang === "fr" ? "ltr" : "rtl"} /></p>
            ) : null)
          ) : expectedAnswer && (
            <p><span className="font-semibold">{t("exercisePlayer.theAnswerLabel")}</span>{" "}
              <HtmlWithMath htmlContent={cleanMathStatement(tExpectedAnswer)} className="inline" dir={lang === "fr" ? "ltr" : "rtl"} /></p>
          )}
          {solution && (
            <div>
              <p className="font-semibold flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4" /> {t("exercisePlayer.theSolutionLabel")}</p>
              <HtmlWithMath htmlContent={cleanMathStatement(tSolution)} dir={lang === "fr" ? "ltr" : "rtl"} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
