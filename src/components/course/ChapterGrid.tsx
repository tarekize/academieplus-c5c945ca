import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock } from "lucide-react";
import { useChaptersTimes, formatTime } from "@/hooks/useTimeTracking";
import { useMemo } from "react";

interface Chapter {
  id: string;
  title: string;
  order_index: number;
  completed?: boolean;
  theme?: string;
}

interface ChapterGridProps {
  chapters: Chapter[];
  onChapterSelect: (id: string) => void;
  subjectId?: string;
}

export const ChapterGrid = ({ chapters, onChapterSelect, subjectId }: ChapterGridProps) => {
  // Séparer Histoire et Géographie uniquement pour le cours d'histoire-géographie
  const isHistGeo = subjectId === "histoire";
  const historyChapters = isHistGeo ? chapters.filter(c => c.order_index < 8) : [];
  const geographyChapters = isHistGeo ? chapters.filter(c => c.order_index >= 8) : [];
  
  // Get chapter times
  const chapterIds = useMemo(() => chapters.map(c => c.id), [chapters]);
  const { times: chapterTimes } = useChaptersTimes(chapterIds);

  // Si ce n'est pas hist-géo, afficher tous les chapitres sans séparation
  if (!isHistGeo) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => {
          const timeSpent = chapterTimes[chapter.id] || 0;
          
          return (
            <Card
              key={chapter.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => onChapterSelect(chapter.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">
                    Chapitre {chapter.order_index + 1}
                  </h3>
                  {chapter.completed && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{chapter.title}</p>
                
                {/* Temps passé */}
                {timeSpent > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    <span>Temps : {formatTime(timeSpent)}</span>
                  </div>
                )}
                
                <Progress value={chapter.completed ? 100 : 0} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Histoire Section */}
      {historyChapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-3">
            Histoire
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {historyChapters.map((chapter) => {
              const timeSpent = chapterTimes[chapter.id] || 0;
              
              return (
                <Card
                  key={chapter.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  onClick={() => onChapterSelect(chapter.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        Chapitre {chapter.order_index + 1}
                      </h3>
                      {chapter.completed && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{chapter.title}</p>
                    
                    {timeSpent > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        <span>Temps : {formatTime(timeSpent)}</span>
                      </div>
                    )}
                    
                    <Progress value={chapter.completed ? 100 : 0} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Géographie Section */}
      {geographyChapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-3">
            Géographie
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {geographyChapters.map((chapter) => {
              const timeSpent = chapterTimes[chapter.id] || 0;
              
              return (
                <Card
                  key={chapter.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  onClick={() => onChapterSelect(chapter.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        Chapitre {chapter.order_index - 7}
                      </h3>
                      {chapter.completed && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{chapter.title}</p>
                    
                    {timeSpent > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        <span>Temps : {formatTime(timeSpent)}</span>
                      </div>
                    )}
                    
                    <Progress value={chapter.completed ? 100 : 0} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
