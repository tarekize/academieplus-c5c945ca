import { FileText, Target, ClipboardList, Lock } from "lucide-react";
import { ContentType, CONTENT_TYPE_LABELS } from "@/lib/teacherContent";
import { useTeacherEstablishmentStatus } from "@/hooks/useTeacherEstablishmentStatus";
import TeacherPageHeader from "./TeacherPageHeader";
import GuidedContentChatbot from "./GuidedContentChatbot";
import ExamAIBuilder from "./ExamAIBuilder";
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

// Écran de création de contenu (exercice/quiz/examen) : route vers le bon
// assistant IA selon contentType, et verrouille l'accès si l'établissement
// actif de l'enseignant n'a pas d'abonnement actif (aiLocked).
export default function TeacherContentSpace({ teacherId, contentType, onBack }: Props) {
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
      />

      {aiLocked ? (
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
