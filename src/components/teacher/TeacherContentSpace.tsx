import { useState } from "react";
import { Sparkles, History, FileText, Target, ClipboardList, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentType, CONTENT_TYPE_LABELS } from "@/lib/teacherContent";
import { useTeacherEstablishmentStatus } from "@/hooks/useTeacherEstablishmentStatus";
import TeacherPageHeader from "./TeacherPageHeader";
import GuidedContentChatbot from "./GuidedContentChatbot";
import ExamAIBuilder from "./ExamAIBuilder";
import TeacherContentHistory from "./TeacherContentHistory";
import { Card, CardContent } from "@/components/ui/card";

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
  { key: "history", label: "Historique", icon: History },
] as const;

export default function TeacherContentSpace({ teacherId, contentType, onBack }: Props) {
  const [mode, setMode] = useState<"ai" | "history">("ai");
  const label = CONTENT_TYPE_LABELS[contentType];
  const { hasActiveEstablishment } = useTeacherEstablishmentStatus(teacherId);
  // false seulement une fois qu'on sait avec certitude qu'aucun établissement
  // lié n'a un abonnement actif — pendant le chargement (null) on ne bloque pas.
  const aiLocked = hasActiveEstablishment === false;

  return (
    <div className="space-y-5">
      <TeacherPageHeader
        icon={CONTENT_TYPE_ICON[contentType]}
        iconClassName={CONTENT_TYPE_STYLE[contentType]}
        title={`${label}s`}
        description={`Créez vos ${label.toLowerCase()}s avec l'assistant IA.`}
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

      {mode === "history" ? (
        <TeacherContentHistory key={contentType} teacherId={teacherId} contentType={contentType} />
      ) : aiLocked ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Assistant IA désactivé</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              L'abonnement de votre établissement n'est pas actif. Contactez votre établissement pour réactiver l'assistant IA.
            </p>
          </CardContent>
        </Card>
      ) : contentType === "exam" ? (
        <ExamAIBuilder key={contentType} teacherId={teacherId} />
      ) : (
        <GuidedContentChatbot key={contentType} teacherId={teacherId} contentType={contentType} />
      )}
    </div>
  );
}
