import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import LessonMarkdown from "@/components/course/LessonMarkdown";
import RichContentField from "@/components/course/RichContentField";
import { GeneratedItem } from "@/lib/teacherContent";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GeneratedItem | null;
  onChange: (patch: Partial<GeneratedItem>) => void;
  onSend?: () => void;
  sendLabel?: string;
  sent?: boolean;
}

/** Popup "aperçu côté élève" + édition directe/LaTeX d'un exercice/quiz généré
 * par l'IA — même composant que côté pédago (HelpChatbot.tsx), extrait ici
 * pour être partagé avec les flux enseignant (GuidedContentChatbot, ExamAIBuilder). */
export default function GeneratedItemPreviewDialog({ open, onOpenChange, item, onChange, onSend, sendLabel = "Envoyer", sent }: Props) {
  const isQuiz = typeof item?.question === "string";
  const hasSubQuestions = !isQuiz && !!item?.sub_questions && item.sub_questions.length > 0;

  const updateSubQuestion = (i: number, patch: Partial<{ question: string; expected_answer: string }>) => {
    const next = [...(item?.sub_questions || [])];
    next[i] = { ...next[i], ...patch };
    onChange({ sub_questions: next });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>Aperçu côté élève — {isQuiz ? "Quiz" : "Exercice"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                {item.title && <h3 className="font-semibold">{item.title}</h3>}
                <LessonMarkdown content={isQuiz ? (item.question || "") : (item.statement || "")} />
                {hasSubQuestions && (
                  <ol className="space-y-2 list-decimal pl-4">
                    {item.sub_questions!.map((q, i) => (
                      <li key={i}><LessonMarkdown content={q.question} /></li>
                    ))}
                  </ol>
                )}
                {isQuiz && item.options && (
                  <ul className="space-y-1.5">
                    {item.options.map((o, i) => (
                      <li key={i} className={`text-sm rounded-lg border px-3 py-2 ${o === item.correct_answer ? "border-green-500/50 bg-green-500/10" : ""}`}>
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
                {item.hint && <p className="text-xs text-amber-700 dark:text-amber-400">💡 {item.hint}</p>}
              </div>

              <RichContentField
                label={isQuiz ? "Question" : "Énoncé"}
                value={isQuiz ? (item.question || "") : (item.statement || "")}
                onChange={(v) => onChange(isQuiz ? { question: v } : { statement: v })}
                minHeight={120}
              />
              {hasSubQuestions ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Questions ({item.sub_questions!.length})</p>
                  {item.sub_questions!.map((q, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <RichContentField
                        label={`Question ${i + 1}`}
                        value={q.question}
                        onChange={(v) => updateSubQuestion(i, { question: v })}
                        minHeight={60}
                      />
                      <RichContentField
                        label={`Réponse attendue ${i + 1}`}
                        value={q.expected_answer || ""}
                        onChange={(v) => updateSubQuestion(i, { expected_answer: v })}
                        minHeight={40}
                      />
                    </div>
                  ))}
                </div>
              ) : !isQuiz && (
                <RichContentField
                  label="Réponse attendue"
                  value={item.expected_answer || ""}
                  onChange={(v) => onChange({ expected_answer: v })}
                  minHeight={60}
                />
              )}
              <RichContentField
                label={isQuiz ? "Explication" : "Solution"}
                value={isQuiz ? (item.explanation || "") : (item.solution || "")}
                onChange={(v) => onChange(isQuiz ? { explanation: v } : { solution: v })}
                minHeight={140}
              />
            </div>
            {onSend && (
              <DialogFooter>
                <Button onClick={onSend} disabled={sent} className="gap-1">
                  <Send className="h-4 w-4" /> {sent ? "Envoyé" : sendLabel}
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
