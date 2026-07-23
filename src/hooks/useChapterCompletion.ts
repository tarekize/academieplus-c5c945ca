import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChapterLike {
  id: string;
}

// Un chapitre est "terminé" quand toutes ses leçons le sont, et une leçon est
// "terminée" quand l'élève a répondu à tous ses exercices ET tous ses QCM
// (peu importe si la réponse était juste ou fausse) — même règle que celle
// utilisée pour le statut de leçon sur le dashboard (StudentDashboardContent).
export function useChapterCompletion(userId: string | undefined, chapters: ChapterLike[]) {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const chapterIdsKey = chapters.map((c) => c.id).join(",");

  useEffect(() => {
    if (!userId || !chapterIdsKey) {
      setCompletion({});
      return;
    }
    let cancelled = false;

    (async () => {
      const chapterIds = chapterIdsKey.split(",");
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, chapter_id")
        .in("chapter_id", chapterIds);
      const lessons = lessonsData || [];
      if (lessons.length === 0) {
        if (!cancelled) setCompletion({});
        return;
      }

      const counts = await Promise.all(
        lessons.map(async (lesson: any) => {
          const [{ data: ex }, { data: qz }] = await Promise.all([
            supabase.rpc("get_student_exercises" as any, { _chapter_id: lesson.chapter_id, _lesson_id: lesson.id }),
            supabase.rpc("get_student_quizzes" as any, { _chapter_id: lesson.chapter_id, _lesson_id: lesson.id }),
          ]);
          return {
            lessonId: lesson.id as string,
            chapterId: lesson.chapter_id as string,
            exercisesTotal: (ex || []).length,
            quizzesTotal: (qz || []).length,
          };
        })
      );
      if (cancelled) return;

      const { data: scores } = await supabase
        .from("student_scores")
        .select("lesson_id, assessment_data")
        .eq("user_id", userId)
        .in("lesson_id", lessons.map((l: any) => l.id));
      if (cancelled) return;

      const doneByLesson = new Map<string, { exercises: Set<string>; quizzes: Set<string> }>();
      const extractIds = (arr: unknown[]) =>
        arr.filter((item): item is string | { id: string } =>
          typeof item === "string" || (!!item && typeof item === "object" && "id" in (item as any))
        ).map((item) => (typeof item === "string" ? item : (item as any).id));

      (scores || []).forEach((row: any) => {
        if (!row.lesson_id) return;
        const bucket = doneByLesson.get(row.lesson_id) || { exercises: new Set<string>(), quizzes: new Set<string>() };
        const assessmentData = (row.assessment_data || {}) as Record<string, any>;
        extractIds(assessmentData.completed_exercises || []).forEach((id) => bucket.exercises.add(id));
        extractIds(assessmentData.completed_quizzes || []).forEach((id) => bucket.quizzes.add(id));
        doneByLesson.set(row.lesson_id, bucket);
      });

      const chapterLessonDone = new Map<string, boolean[]>();
      counts.forEach(({ lessonId, chapterId, exercisesTotal, quizzesTotal }) => {
        const done = doneByLesson.get(lessonId);
        const exercisesDone = Math.min(done?.exercises.size || 0, exercisesTotal);
        const quizzesDone = Math.min(done?.quizzes.size || 0, quizzesTotal);
        const hasActivity = exercisesTotal + quizzesTotal > 0;
        const isCompleted = hasActivity && exercisesDone === exercisesTotal && quizzesDone === quizzesTotal;
        const arr = chapterLessonDone.get(chapterId) || [];
        arr.push(isCompleted);
        chapterLessonDone.set(chapterId, arr);
      });

      const result: Record<string, boolean> = {};
      chapterLessonDone.forEach((arr, chapterId) => {
        result[chapterId] = arr.length > 0 && arr.every(Boolean);
      });
      if (!cancelled) setCompletion(result);
    })();

    return () => { cancelled = true; };
  }, [userId, chapterIdsKey]);

  return completion;
}
