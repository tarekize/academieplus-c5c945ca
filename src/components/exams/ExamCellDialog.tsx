import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, FileUp, History, ChevronLeft } from "lucide-react";
import ViaIAWizard from "./ViaIAWizard";
import ImportDocumentFlow from "./ImportDocumentFlow";
import ExamHistoryList from "./ExamHistoryList";

interface ExamCellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  subjectName: string;
  schoolLevel: string;
  levelName: string;
  filiereId: string | null;
  filiereName: string | null;
  isTerminale: boolean;
}

type Screen = "menu" | "ai" | "import" | "history";

export default function ExamCellDialog({
  open, onOpenChange, subject, subjectName, schoolLevel, levelName, filiereId, filiereName, isTerminale,
}: ExamCellDialogProps) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("menu");

  const close = () => { onOpenChange(false); setTimeout(() => setScreen("menu"), 200); };
  const backToMenu = () => setScreen("menu");
  // Ferme la pop-up et redirige vers la page complète de l'examen (créé ou
  // repris depuis l'historique) — jamais affiché dans la pop-up elle-même.
  const openExamPage = (examId: string) => { close(); navigate(`/pedago/examens/${examId}`); };

  const screenTitle: Record<Screen, string> = {
    menu: "Examens",
    ai: "Créer via IA",
    import: "Importer un document",
    history: "Historique des examens",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {screen !== "menu" && (
              <Button variant="ghost" size="icon" className="h-7 w-7 -ml-1" onClick={backToMenu}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle>{screenTitle[screen]}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subjectName} · {levelName}{filiereName ? ` · ${filiereName}` : ""}
              </p>
            </div>
          </div>
        </DialogHeader>

        {screen === "menu" && (
          <div className="grid grid-cols-1 gap-3 py-2">
            <button
              type="button"
              onClick={() => setScreen("ai")}
              className="flex items-center gap-3 rounded-2xl border p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Via IA</p>
                <p className="text-xs text-muted-foreground">Générer un examen étape par étape avec l'IA</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setScreen("import")}
              className="flex items-center gap-3 rounded-2xl border p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FileUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Importer un document</p>
                <p className="text-xs text-muted-foreground">Retranscrire fidèlement un examen existant</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setScreen("history")}
              className="flex items-center gap-3 rounded-2xl border p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <History className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Historique</p>
                <p className="text-xs text-muted-foreground">Voir les examens précédents de cette matière/niveau</p>
              </div>
            </button>
          </div>
        )}

        {screen === "ai" && (
          <ViaIAWizard
            subject={subject}
            schoolLevel={schoolLevel}
            filiereId={filiereId}
            isTerminale={isTerminale}
            onCreated={openExamPage}
          />
        )}

        {screen === "import" && (
          <ImportDocumentFlow
            subject={subject}
            schoolLevel={schoolLevel}
            filiereId={filiereId}
            isTerminale={isTerminale}
            onCreated={openExamPage}
          />
        )}

        {screen === "history" && (
          <ExamHistoryList
            subject={subject}
            schoolLevel={schoolLevel}
            filiereId={filiereId}
            isTerminale={isTerminale}
            onOpenExam={openExamPage}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
