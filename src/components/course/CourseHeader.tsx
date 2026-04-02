import { Clock, BarChart3, BookOpen, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CourseHeaderProps {
  title: string;
  description?: string;
  difficulty?: string;
  duration?: number;
  progress?: number;
  subjectColor: string;
  onDownloadPDF?: () => void;
}

export const CourseHeader = ({
  title,
  description,
  difficulty,
  duration,
  progress = 0,
  subjectColor,
  onDownloadPDF
}: CourseHeaderProps) => {
  const difficultyColors = {
    facile: "bg-green-500",
    moyen: "bg-yellow-500",
    difficile: "bg-red-500"
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-lg border-2 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {onDownloadPDF && (
            <Button 
              className="py-6 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg" 
              onClick={onDownloadPDF}
            >
              <Download className="h-5 w-5 mr-2" />
              Télécharger PDF
            </Button>
          )}
          
          <div className="flex gap-2 flex-wrap">
          {difficulty && (
            <Badge className={difficultyColors[difficulty as keyof typeof difficultyColors]}>
              <BarChart3 className="h-3 w-3 mr-1" />
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          )}
          {duration && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {duration} min
            </Badge>
          )}
          </div>
        </div>
      </div>

    </div>
  );
};