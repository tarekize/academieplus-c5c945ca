import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UnreadTeacherContentItem {
  content_id: string;
  content_type: "exercise" | "quiz" | "exam";
  subject: string | null;
  chapter_id: string | null;
  lesson_id: string | null;
  school_level: string | null;
}

/**
 * Point rouge élève : liste (côté client) de tout le contenu envoyé par un
 * enseignant (teacher_content, via teacher_content_assignments) que l'élève
 * courant n'a pas encore consulté. Alimente les badges en cascade
 * matière → chapitre → leçon → "Ma classe" (ou → examen pour un examen).
 */
export function useUnreadTeacherContent(userId: string | null | undefined) {
  const [items, setItems] = useState<UnreadTeacherContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); setLoading(false); return; }
    const { data, error } = await (supabase as any).rpc("student_unread_teacher_content");
    if (!error) setItems((data as UnreadTeacherContentItem[]) || []);
    setLoading(false);
    loadedRef.current = true;
  }, [userId]);

  useEffect(() => {
    loadedRef.current = false;
    refresh();
  }, [refresh]);

  const markRead = useCallback(async (contentIds: string[]) => {
    if (!userId || contentIds.length === 0) return;
    const unique = Array.from(new Set(contentIds));
    setItems((prev) => prev.filter((it) => !unique.includes(it.content_id)));
    await (supabase as any)
      .from("teacher_content_reads")
      .upsert(unique.map((content_id) => ({ content_id, student_id: userId })), { onConflict: "content_id,student_id" });
  }, [userId]);

  const hasForSubject = useCallback((subject: string) => items.some((it) => it.subject === subject), [items]);
  const hasForChapter = useCallback((chapterId: string) => items.some((it) => it.chapter_id === chapterId), [items]);
  const hasForLesson = useCallback((lessonId: string) => items.some((it) => it.lesson_id === lessonId), [items]);
  const hasExamFor = useCallback(
    (schoolLevel?: string | null, subject?: string | null) =>
      items.some((it) => it.content_type === "exam" && (!schoolLevel || it.school_level === schoolLevel) && (!subject || it.subject === subject)),
    [items]
  );

  return { items, loading, refresh, markRead, hasForSubject, hasForChapter, hasForLesson, hasExamFor };
}
