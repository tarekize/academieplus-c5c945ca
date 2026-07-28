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
              {!isQuiz && (
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
