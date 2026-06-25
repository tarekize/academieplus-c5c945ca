import { supabase } from "@/integrations/supabase/client";

interface AttemptPatch {
  attemptDelta?: number;
  errorDelta?: number;
  hintDelta?: number;
  completed?: boolean;
  isCorrect?: boolean | null;
  answer?: string | null;
}

/**
 * Enregistre (ou met à jour) la progression d'un élève sur un contenu envoyé
 * par l'enseignant : nombre de tentatives, d'erreurs, de clics sur l'indice.
 */
export async function recordTeacherContentAttempt(
  contentId: string,
  studentId: string,
  patch: AttemptPatch
): Promise<void> {
  if (!contentId || !studentId) return;

  const { data: existing } = await (supabase as any)
    .from("teacher_content_attempts")
    .select("*")
    .eq("content_id", contentId)
    .eq("student_id", studentId)
    .maybeSingle();

  const row = {
    content_id: contentId,
    student_id: studentId,
    attempts: (existing?.attempts || 0) + (patch.attemptDelta || 0),
    errors: (existing?.errors || 0) + (patch.errorDelta || 0),
    hints_used: (existing?.hints_used || 0) + (patch.hintDelta || 0),
    completed: patch.completed ?? existing?.completed ?? false,
    is_correct: patch.isCorrect ?? existing?.is_correct ?? null,
    last_answer: patch.answer ?? existing?.last_answer ?? null,
  };

  if (existing) {
    await (supabase as any).from("teacher_content_attempts").update(row).eq("id", existing.id);
  } else {
    await (supabase as any).from("teacher_content_attempts").insert(row);
  }
}

/** Normalise une réponse pour une comparaison souple (minuscules, sans espaces). */
export function normalizeAnswer(s: string): string {
  return (s || "").toLowerCase().replace(/\s+/g, "").trim();
}
