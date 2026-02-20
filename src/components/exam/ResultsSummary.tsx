import { Trophy, Target, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ResultsSummaryProps {
  score: number;
  totalQuestions: number;
  duration: number; // en secondes
  onRetry: () => void;
  onReturn: () => void;
}

export const ResultsSummary = ({
  score,
  totalQuestions,
  duration,
  onRetry,
  onReturn
}: ResultsSummaryProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { text: "Excellent !", color: "text-green-500", icon: "🏆" };
    if (percentage >= 75) return { text: "Très bien", color: "text-blue-500", icon: "⭐" };
    if (percentage >= 60) return { text: "Bien", color: "text-yellow-500", icon: "👍" };
    if (percentage >= 50) return { text: "Passable", color: "text-orange-500", icon: "📚" };
    return { text: "À revoir", color: "text-red-500", icon: "💪" };
  };

  const grade = getGrade(percentage);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card className="border-2">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl">{grade.icon}</div>
          
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${grade.color}`}>
              {grade.text}
            </h2>
            <p className="text-muted-foreground">
              Vous avez terminé votre examen
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="space-y-2">
              <Target className="h-6 w-6 mx-auto text-primary" />
              <div className="text-2xl font-bold">{score}/{totalQuestions}</div>
              <div className="text-xs text-muted-foreground">Bonnes réponses</div>
            </div>

            <div className="space-y-2">
              <Clock className="h-6 w-6 mx-auto text-primary" />
              <div className="text-2xl font-bold">
                {minutes}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-xs text-muted-foreground">Temps écoulé</div>
            </div>

            <div className="space-y-2">
              <TrendingUp className="h-6 w-6 mx-auto text-primary" />
              <div className="text-2xl font-bold">{percentage}%</div>
              <div className="text-xs text-muted-foreground">Précision</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onReturn} className="flex-1">
          Retour au catalogue
        </Button>
        <Button onClick={onRetry} className="flex-1">
          <Trophy className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    </div>
  );
};