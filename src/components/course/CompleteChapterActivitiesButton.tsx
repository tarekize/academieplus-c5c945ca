import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  titleAr?: string | null;
}

interface Props {
  chapterId: string;
  chapterTitleAr: string;
  lessons: Lesson[];
  onDone?: () => void;
}

const TARGET = 10;

export function CompleteChapterActivitiesButton({ chapterId, chapterTitleAr, lessons, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleClick = async () => {
    if (loading) return;
    if (!lessons?.length) {
      toast.error("Aucune leçon dans ce chapitre");
      return;
    }

    setLoading(true);
    try {
      // 1) Compter exercices/quizzes par leçon
      const lessonIds = lessons.map((l) => l.id);

      const [{ data: exRows, error: exErr }, { data: qzRows, error: qzErr }] = await Promise.all([
        supabase.from("chapter_exercises").select("lesson_id").in("lesson_id", lessonIds),
        supabase.from("chapter_quizzes").select("lesson_id").in("lesson_id", lessonIds),
      ]);
      if (exErr) throw exErr;
      if (qzErr) throw qzErr;

      const exCount = new Map<string, number>();
      const qzCount = new Map<string, number>();
      (exRows || []).forEach((r: any) => exCount.set(r.lesson_id, (exCount.get(r.lesson_id) || 0) + 1));
      (qzRows || []).forEach((r: any) => qzCount.set(r.lesson_id, (qzCount.get(r.lesson_id) || 0) + 1));

      // 2) Filtrer les leçons incomplètes
      const incomplete = lessons.filter(
        (l) => (exCount.get(l.id) || 0) < TARGET || (qzCount.get(l.id) || 0) < TARGET,
      );

      if (incomplete.length === 0) {
        toast.success("Tout est déjà complet ✅", { description: `Toutes les leçons ont ${TARGET} exercices et ${TARGET} quiz.` });
        return;
      }

      toast("Génération en cours…", {
        description: `${incomplete.length} leçon(s) à compléter. Cela peut prendre quelques minutes.`,
      });

      let okCount = 0;
      let failCount = 0;
      const failures: string[] = [];

      for (let i = 0; i < incomplete.length; i++) {
        const lesson = incomplete[i];
        setProgress({ done: i, total: incomplete.length });

        try {
          const { data, error } = await supabase.functions.invoke("bulk-gen-terminale-gemini", {
            body: {
              lesson_id: lesson.id,
              chapter_id: chapterId,
              lesson_title_ar: lesson.titleAr || lesson.title,
              lesson_title_fr: lesson.title,
              chapter_title_ar: chapterTitleAr,
              replace: true, // remplacer pour atteindre 10/10 proprement
            },
          });
          if (error) throw error;
          if ((data as any)?.error) throw new Error((data as any).error);
          okCount++;
        } catch (e: any) {
          console.error("Génération échouée pour", lesson.title, e);
          failCount++;
          failures.push(`${lesson.titleAr || lesson.title}: ${e?.message || "échec"}`);
        }
      }

      setProgress({ done: incomplete.length, total: incomplete.length });

      if (failCount) {
        toast.error("Génération terminée", {
          description: `${okCount} leçon(s) complétée(s), ${failCount} échec(s). ${failures[0] || ""}`,
        });
      } else {
        toast.success("Génération terminée", {
          description: `${okCount} leçon(s) complétée(s).`,
        });
      }

      onDone?.();
    } catch (e: any) {
      console.error(e);
      toast.error("Erreur", { description: e.message || String(e) });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} variant="cta" size="sm">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress ? `${progress.done}/${progress.total}` : "Génération…"}
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          Compléter exercices & quiz (10/10)
        </>
      )}
    </Button>
  );
}
