import { ClipboardCheck, PenTool, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityCard {
  id: string;
  title: string;
  icon: typeof ClipboardCheck;
  color: string;
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
      icon: ClipboardCheck,
      available: true,
      color: "hsl(262 83% 58%)", // Violet
    },
    {
      id: "exercices",
      title: "Exercices",
      icon: PenTool,
      available: true,
      color: "hsl(24 95% 53%)", // Orange
    },
    {
      id: "flashcards",
      title: "Flashcards",
      icon: Zap,
      available: false,
      color: "hsl(142 71% 45%)", // Vert
    },
  ];

  return (
    <div className="flex gap-3 mb-6 max-w-md">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeCard === card.id;
        
        return (
          <Card
            key={card.id}
            className={cn(
              "flex-1 overflow-hidden transition-all duration-200 group",
              card.available ? "cursor-pointer hover:shadow-md" : "opacity-50 cursor-not-allowed",
              "border",
              isActive 
                ? "bg-primary/10 border-primary shadow-md" 
                : "bg-card/50 border-border/50 hover:border-primary/30"
            )}
            onClick={() => card.available && onCardClick(card.id)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-2 relative">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform",
                  isActive && "scale-110"
                )}
                style={{ backgroundColor: card.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              
              <span className={cn(
                "text-xs font-medium text-center leading-tight",
                isActive ? "text-primary" : "text-foreground"
              )}>
                {card.title}
              </span>
              
              {!card.available && (
                <span className="absolute top-1 right-1 text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  Bientôt
                </span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
