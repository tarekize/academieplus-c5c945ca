import { ClipboardCheck, PenTool, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ClipboardCheck;
  gradient: string;
  available: boolean;
}

interface ActivityCardsProps {
  onCardClick: (id: string) => void;
  activeCard?: string | null;
}

export const ActivityCards = ({ onCardClick, activeCard }: ActivityCardsProps) => {
  const cards: ActivityCard[] = [
    {
      id: "quiz",
      title: "Quiz",
      subtitle: "Teste tes connaissances",
      icon: ClipboardCheck,
      available: true,
      gradient: "linear-gradient(135deg, hsl(262 83% 62%), hsl(280 80% 72%))",
    },
    {
      id: "exercices",
      title: "Exercices",
      subtitle: "Entraîne-toi pas à pas",
      icon: PenTool,
      available: true,
      gradient: "linear-gradient(135deg, hsl(24 95% 56%), hsl(14 90% 66%))",
    },
    {
      id: "flashcards",
      title: "Flashcards",
      subtitle: "Révise en un clin d'œil",
      icon: Zap,
      available: false,
      gradient: "linear-gradient(135deg, hsl(142 71% 48%), hsl(160 70% 58%))",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeCard === card.id;

        return (
          <button
            key={card.id}
            type="button"
            disabled={!card.available}
            onClick={() => card.available && onCardClick(card.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-5 text-left transition-all duration-300",
              card.available
                ? "cursor-pointer hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
                : "opacity-55 cursor-not-allowed",
              isActive
                ? "border-primary ring-2 ring-primary/30 shadow-[var(--shadow-elegant)]"
                : "border-border shadow-[var(--shadow-card)] hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110",
                  isActive && "scale-110"
                )}
                style={{ backgroundImage: card.gradient }}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-bold leading-tight">{card.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{card.subtitle}</p>
              </div>
            </div>

            {!card.available && (
              <span className="absolute top-3 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Bientôt
              </span>
            )}

            {isActive && (
              <span className="absolute bottom-0 left-0 h-1 w-full bg-[image:var(--gradient-primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
