import { Card, CardContent } from "@/components/ui/card";
import { School, FileText, Target, ClipboardList, AlertCircle, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TeacherSection = "establishment" | "exercise" | "quiz" | "exam" | "reclamation" | "profil";

interface Props {
  onSelect: (section: TeacherSection) => void;
}

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

export default function TeacherHome({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEACHER_SECTIONS.map((t) => {
        const Icon = t.icon;
        return (
          <Card
            key={t.key}
            onClick={() => onSelect(t.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(t.key); }}
            className={cn(
              "group cursor-pointer rounded-2xl border-border/60 transition-all duration-300",
              "hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-card)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                  t.iconBg,
                  t.iconText,
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="flex items-center gap-1 text-lg font-semibold">
                  {t.label}
                  <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="text-sm leading-snug text-muted-foreground">{t.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
