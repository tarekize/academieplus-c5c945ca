import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Chapter {
  id: string;
  title: string;
  completed?: boolean;
}

interface CourseNavigationProps {
  chapters: Chapter[];
  activeChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
}

export const CourseNavigation = ({
  chapters,
  activeChapterId,
  onChapterSelect
}: CourseNavigationProps) => {
  return (
    <div className="bg-card rounded-lg border-2 p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Circle className="h-4 w-4" />
        Chapitres
      </h3>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all hover:bg-accent/50",
                activeChapterId === chapter.id && "bg-primary/10 border-l-4 border-primary",
                chapter.completed && "bg-accent/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {chapter.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Chapitre {index + 1}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {chapter.title}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};