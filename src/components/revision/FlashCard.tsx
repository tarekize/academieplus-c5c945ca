import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashCardProps {
  question: string;
  answer: string;
  onNext: () => void;
  onDifficulty: (difficulty: "facile" | "moyen" | "difficile") => void;
}

export const FlashCard = ({ question, answer, onNext, onDifficulty }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDifficulty = (difficulty: "facile" | "moyen" | "difficile") => {
    onDifficulty(difficulty);
    setIsFlipped(false);
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "relative h-96 cursor-pointer transition-transform duration-500 transform-style-3d",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <Card className={cn(
          "absolute inset-0 backface-hidden",
          !isFlipped ? "block" : "hidden"
        )}>
          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="mb-4 text-sm text-muted-foreground">Question</div>
            <p className="text-2xl font-medium">{question}</p>
            <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Cliquez pour voir la réponse
            </div>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className={cn(
          "absolute inset-0 backface-hidden rotate-y-180",
          isFlipped ? "block" : "hidden"
        )}>
          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="mb-4 text-sm text-muted-foreground">Réponse</div>
            <p className="text-xl mb-8">{answer}</p>
            
            <div className="space-y-3 w-full max-w-xs">
              <p className="text-sm text-muted-foreground mb-2">
                Comment évaluez-vous cette carte ?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDifficulty("difficile");
                  }}
                >
                  Difficile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDifficulty("moyen");
                  }}
                >
                  Moyen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-green-500/10 hover:bg-green-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDifficulty("facile");
                  }}
                >
                  Facile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};