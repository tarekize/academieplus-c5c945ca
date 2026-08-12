import DashboardTile from "@/components/dashboard/DashboardTile";
import { School, FileText, Target, ClipboardList, AlertCircle, User } from "lucide-react";
import { toast } from "sonner";

export type TeacherSection = "establishment" | "exercise" | "quiz" | "exam" | "reclamation" | "profil";

interface Props {
  onSelect: (section: TeacherSection) => void;
  // Sections nécessitant un établissement lié pour être utilisées (envoyer un
  // exercice/quiz/examen ou une réclamation n'a pas de sens sans établissement).
  hasEstablishment: boolean;
}

const REQUIRES_ESTABLISHMENT: TeacherSection[] = ["exercise", "quiz", "exam", "reclamation"];

export const TEACHER_SECTIONS: {
  key: TeacherSection;
  label: string;
  desc: string;
  icon: any;
  iconBg: string;
  iconText: string;
}[] = [
  { key: "establishment", label: "Établissement", desc: "Établissements & classes", icon: School, iconBg: "bg-blue-500/10", iconText: "text-blue-600" },
  { key: "exercise", label: "Exercices", desc: "Créer & envoyer des exercices", icon: FileText, iconBg: "bg-emerald-500/10", iconText: "text-emerald-600" },
  { key: "quiz", label: "Quiz", desc: "Créer & envoyer des quiz", icon: Target, iconBg: "bg-amber-500/10", iconText: "text-amber-600" },
  { key: "exam", label: "Examens", desc: "Créer & envoyer des examens", icon: ClipboardList, iconBg: "bg-purple-500/10", iconText: "text-purple-600" },
  { key: "reclamation", label: "Réclamation", desc: "Soumettre une réclamation", icon: AlertCircle, iconBg: "bg-rose-500/10", iconText: "text-rose-600" },
  { key: "profil", label: "Mon profil", desc: "Informations & compte", icon: User, iconBg: "bg-indigo-500/10", iconText: "text-indigo-600" },
];

// Grille d'accueil enseignant : une tuile par section. Verrouille côté client
// les sections qui nécessitent un établissement lié (l'appel serveur réel est
// de toute façon protégé plus bas dans la chaîne — ceci n'est qu'un confort UX).
export default function TeacherHome({ onSelect, hasEstablishment }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEACHER_SECTIONS.map((t) => {
        const locked = !hasEstablishment && REQUIRES_ESTABLISHMENT.includes(t.key);
        // Clic sur une tuile : bloque avec un message explicite si la section
        // est verrouillée, sinon délègue la navigation au parent.
        const handleActivate = () => {
          if (locked) {
            toast.error("Ajoutez d'abord un établissement pour accéder à cette fonctionnalité.");
            return;
          }
          onSelect(t.key);
        };
        return (
          <DashboardTile
            key={t.key}
            icon={t.icon}
            iconBg={t.iconBg}
            iconText={t.iconText}
            title={t.label}
            description={t.desc}
            onClick={handleActivate}
            locked={locked}
            lockedDescription="Ajoutez un établissement pour débloquer"
          />
        );
      })}
    </div>
  );
}
