import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useChaptersTimes, formatTime } from "@/hooks/useTimeTracking";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

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

const ChapterCard = ({
  chapter,
  displayNumber,
  timeSpent,
  onSelect,
}: {
  chapter: Chapter;
  displayNumber: number;
  timeSpent: number;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative text-left w-full rounded-2xl border border-border bg-card overflow-hidden",
        "shadow-[var(--shadow-card)] transition-all duration-300",
        "hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)] hover:border-primary/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      {/* Top gradient ribbon */}
      <div className="h-1.5 w-full bg-[image:var(--gradient-primary)]" />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground",
              "bg-[image:var(--gradient-primary)] shadow-md transition-transform group-hover:scale-110"
            )}
          >
            {displayNumber}
          </div>
          {chapter.completed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Terminé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              À faire
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-base leading-snug mb-1.5 line-clamp-2">
          {chapter.title}
        </h3>
        <p className="text-xs font-medium text-muted-foreground mb-4">
          Chapitre {displayNumber}
        </p>

        {timeSpent > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(timeSpent)}</span>
          </div>
        )}

        <Progress value={chapter.completed ? 100 : 0} className="h-1.5" />

        <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          Ouvrir
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
};

export const ChapterGrid = ({ chapters, onChapterSelect, subjectId }: ChapterGridProps) => {
  const isHistGeo = subjectId === "histoire";
  const historyChapters = isHistGeo ? chapters.filter((c) => c.order_index < 8) : [];
  const geographyChapters = isHistGeo ? chapters.filter((c) => c.order_index >= 8) : [];

  const chapterIds = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const { times: chapterTimes } = useChaptersTimes(chapterIds);

  if (!isHistGeo) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            displayNumber={chapter.order_index + 1}
            timeSpent={chapterTimes[chapter.id] || 0}
            onSelect={() => onChapterSelect(chapter.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {historyChapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Histoire</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {historyChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                displayNumber={chapter.order_index + 1}
                timeSpent={chapterTimes[chapter.id] || 0}
                onSelect={() => onChapterSelect(chapter.id)}
              />
            ))}
          </div>
        </div>
      )}

      {geographyChapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Géographie</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {geographyChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                displayNumber={chapter.order_index - 7}
                timeSpent={chapterTimes[chapter.id] || 0}
                onSelect={() => onChapterSelect(chapter.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
