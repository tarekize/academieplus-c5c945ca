import { useState } from "react";
import { PencilLine, Sparkles, History, FileText, Target, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentType, CONTENT_TYPE_LABELS } from "@/lib/teacherContent";
import TeacherPageHeader from "./TeacherPageHeader";
import ManualContentForm from "./ManualContentForm";
import GuidedContentChatbot from "./GuidedContentChatbot";
import TeacherContentHistory from "./TeacherContentHistory";

interface Props {
  teacherId: string;
  contentType: ContentType;
  onBack: () => void;
}

const CONTENT_TYPE_ICON: Record<ContentType, any> = {
  exercise: FileText,
  quiz: Target,
  exam: ClipboardList,
};

const CONTENT_TYPE_STYLE: Record<ContentType, string> = {
  exercise: "bg-emerald-500/10 text-emerald-600",
  quiz: "bg-amber-500/10 text-amber-600",
  exam: "bg-purple-500/10 text-purple-600",
};

const MODES = [
  { key: "ai", label: "Assistant IA", icon: Sparkles },
  { key: "manual", label: "Mode manuel", icon: PencilLine },
  { key: "history", label: "Historique", icon: History },
] as const;

export default function TeacherContentSpace({ teacherId, contentType, onBack }: Props) {
  const [mode, setMode] = useState<"manual" | "ai" | "history">("ai");
  const label = CONTENT_TYPE_LABELS[contentType];

  return (
    <div className="space-y-5">
      <TeacherPageHeader
        icon={CONTENT_TYPE_ICON[contentType]}
        iconClassName={CONTENT_TYPE_STYLE[contentType]}
        title={`${label}s`}
        description={`Créez vos ${label.toLowerCase()}s manuellement ou avec l'assistant IA.`}
        onBack={onBack}
        action={
          <div className="inline-flex items-center gap-1 rounded-2xl bg-muted p-1">
            {MODES.map((m) => {
              const Icon = m.icon;
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      {mode === "ai"
        ? <GuidedContentChatbot key={contentType} teacherId={teacherId} contentType={contentType} />
        : mode === "manual"
        ? <ManualContentForm key={contentType} teacherId={teacherId} contentType={contentType} />
        : <TeacherContentHistory key={contentType} teacherId={teacherId} contentType={contentType} />}
    </div>
  );
}
