import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PencilLine, Sparkles, History } from "lucide-react";
import { ContentType, CONTENT_TYPE_LABELS } from "@/lib/teacherContent";
import ManualContentForm from "./ManualContentForm";
import GuidedContentChatbot from "./GuidedContentChatbot";
import TeacherContentHistory from "./TeacherContentHistory";

interface Props {
  teacherId: string;
  contentType: ContentType;
  onBack: () => void;
}

export default function TeacherContentSpace({ teacherId, contentType, onBack }: Props) {
  const [mode, setMode] = useState<"manual" | "ai" | "history">("ai");
  const label = CONTENT_TYPE_LABELS[contentType];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 mb-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Button>
          <h1 className="text-2xl font-bold">{label}s</h1>
          <p className="text-muted-foreground">Créez vos {label.toLowerCase()}s manuellement ou avec l'assistant IA.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "ai" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setMode("ai")}>
            <Sparkles className="h-4 w-4" /> Assistant IA
          </Button>
          <Button variant={mode === "manual" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setMode("manual")}>
            <PencilLine className="h-4 w-4" /> Mode manuel
          </Button>
          <Button variant={mode === "history" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setMode("history")}>
            <History className="h-4 w-4" /> Historique
          </Button>
        </div>
      </div>

      {mode === "ai"
        ? <GuidedContentChatbot key={contentType} teacherId={teacherId} contentType={contentType} />
        : mode === "manual"
        ? <ManualContentForm key={contentType} teacherId={teacherId} contentType={contentType} />
        : <TeacherContentHistory key={contentType} teacherId={teacherId} contentType={contentType} />}
    </div>
  );
}
