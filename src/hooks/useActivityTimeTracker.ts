import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ActivityType = "reading" | "quiz" | "exercise";

interface UseActivityTimeTrackerOptions {
  userId: string | null;
  chapterId: string;
  lessonId?: string | null;
  activityType: ActivityType;
  enabled?: boolean;
}

/**
 * Tracks time spent on a specific activity (reading/quiz/exercise).
 * On unmount or when activityType/lessonId changes, upserts the elapsed
 * seconds into the corresponding column of student_scores.
 */
export function useActivityTimeTracker({
  userId,
  chapterId,
  lessonId,
  activityType,
  enabled = true,
}: UseActivityTimeTrackerOptions) {
  const startTimeRef = useRef<number | null>(null);
  const activityRef = useRef(activityType);
  const userIdRef = useRef(userId);
  const lessonIdRef = useRef(lessonId);
  const chapterIdRef = useRef(chapterId);
  const enabledRef = useRef(enabled);

  // Keep refs in sync
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { chapterIdRef.current = chapterId; }, [chapterId]);
  useEffect(() => { lessonIdRef.current = lessonId; }, [lessonId]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const flushTime = useCallback(async () => {
    if (!startTimeRef.current || !userIdRef.current || !enabledRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    startTimeRef.current = null; // reset

    if (elapsed < 2) return; // ignore trivial durations

    const uid = userIdRef.current;
    const cid = chapterIdRef.current;
    const lid = lessonIdRef.current || null;
    const activity = activityRef.current;

    const columnMap: Record<ActivityType, string> = {
      reading: "reading_time_seconds",
      quiz: "quiz_time_seconds",
      exercise: "exercise_time_seconds",
    };
    const column = columnMap[activity];

    try {
      // Find existing row
      let query = supabase
        .from("student_scores")
        .select("id, reading_time_seconds, quiz_time_seconds, exercise_time_seconds")
        .eq("user_id", uid)
        .eq("chapter_id", cid);

      query = lid ? query.eq("lesson_id", lid) : query.is("lesson_id", null);

      const { data: rows } = await query;
      const row = rows?.[0];

      if (row) {
        const currentVal = (row as any)[column] || 0;
        await supabase
          .from("student_scores")
          .update({ [column]: currentVal + elapsed } as any)
          .eq("id", row.id);
      } else {
        await supabase
          .from("student_scores")
          .insert([{
            user_id: uid,
            chapter_id: cid,
            lesson_id: lid,
            [column]: elapsed,
          }]);
      }
    } catch (err) {
      console.error("[TimeTracker] flush error:", err);
    }
  }, []);

  // Start timer when enabled, flush on activity change or unmount
  useEffect(() => {
    if (!enabled || !userId) return;

    // Start fresh timer
    startTimeRef.current = Date.now();
    activityRef.current = activityType;

    return () => {
      // Flush accumulated time
      flushTime();
    };
  }, [activityType, lessonId, chapterId, userId, enabled, flushTime]);

  // Also flush on beforeunload (tab close / navigation away)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!startTimeRef.current || !userIdRef.current || !enabledRef.current) return;

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsed < 2) return;

      const uid = userIdRef.current;
      const cid = chapterIdRef.current;
      const lid = lessonIdRef.current || null;
      const activity = activityRef.current;

      const columnMap: Record<ActivityType, string> = {
        reading: "reading_time_seconds",
        quiz: "quiz_time_seconds",
        exercise: "exercise_time_seconds",
      };

      // Fallback: just mark start as null so we don't double-count
      startTimeRef.current = null;

      const payload = {
        user_id: uid,
        chapter_id: cid,
        lesson_id: lid,
        activity: activity,
        elapsed,
        column: columnMap[activity],
      };
      
      // Store in sessionStorage for recovery on next load
      try {
        const pending = JSON.parse(sessionStorage.getItem("pending_time_flush") || "[]");
        pending.push(payload);
        sessionStorage.setItem("pending_time_flush", JSON.stringify(pending));
      } catch {}
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Recover pending flushes from previous session
  useEffect(() => {
    const recoverPending = async () => {
      try {
        const raw = sessionStorage.getItem("pending_time_flush");
        if (!raw) return;
        sessionStorage.removeItem("pending_time_flush");
        const items = JSON.parse(raw);
        
        for (const item of items) {
          if (!item.user_id || !item.chapter_id || item.elapsed < 2) continue;

          let query = supabase
            .from("student_scores")
            .select("id, reading_time_seconds, quiz_time_seconds, exercise_time_seconds")
            .eq("user_id", item.user_id)
            .eq("chapter_id", item.chapter_id);

          query = item.lesson_id ? query.eq("lesson_id", item.lesson_id) : query.is("lesson_id", null);

          const { data: rows } = await query;
          const row = rows?.[0];

          if (row) {
            const currentVal = (row as any)[item.column] || 0;
            await supabase
              .from("student_scores")
              .update({ [item.column]: currentVal + item.elapsed } as any)
              .eq("id", row.id);
          } else {
            await supabase
              .from("student_scores")
              .insert([{
                user_id: item.user_id,
                chapter_id: item.chapter_id,
                lesson_id: item.lesson_id,
                [item.column]: item.elapsed,
              }]);
          }
        }
      } catch {}
    };
    recoverPending();
  }, []);
}
