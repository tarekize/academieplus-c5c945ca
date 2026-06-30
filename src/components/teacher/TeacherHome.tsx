import { Card, CardContent } from "@/components/ui/card";
import { School, FileText, Target, ClipboardList, AlertCircle, User } from "lucide-react";

export type TeacherSection = "establishment" | "exercise" | "quiz" | "exam" | "reclamation" | "profil";

interface Props {
  onSelect: (section: TeacherSection) => void;
}

const TILES: { key: TeacherSection; label: string; desc: string; icon: any; color: string }[] = [
  { key: "establishment", label: "Établissement", desc: "Établissements & classes", icon: School, color: "text-blue-600 bg-blue-600/10" },
  { key: "exercise", label: "Exercices", desc: "Créer & envoyer des exercices", icon: FileText, color: "text-emerald-600 bg-emerald-600/10" },
  { key: "quiz", label: "Quiz", desc: "Créer & envoyer des quiz", icon: Target, color: "text-amber-600 bg-amber-600/10" },
  { key: "exam", label: "Examens", desc: "Créer & envoyer des examens", icon: ClipboardList, color: "text-purple-600 bg-purple-600/10" },
  { key: "reclamation", label: "Réclamation", desc: "Soumettre une réclamation", icon: AlertCircle, color: "text-red-600 bg-red-600/10" },
  { key: "profil", label: "Mon profil", desc: "Informations & compte", icon: User, color: "text-indigo-600 bg-indigo-600/10" },
];

export default function TeacherHome({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {TILES.map((t) => {
        const Icon = t.icon;
        return (
          <Card
            key={t.key}
            onClick={() => onSelect(t.key)}
            className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${t.color}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t.label}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
