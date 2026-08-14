import { supabase } from "@/integrations/supabase/client";

/** Statut de correction d'une (sous-)question :
 * "unanswered" = pas encore vérifiée, "correct" = verrouillée (bonne
 * réponse), "incorrect" = fausse mais toujours modifiable. */
export type QuestionStatus = "unanswered" | "correct" | "incorrect";

export interface ExamProgressState {
  startedAt: string;
  answers: string[][];
  status: QuestionStatus[][];
  submitted: boolean;
}

/** Charge la progression déjà enregistrée d'un élève sur un examen, ou en
 * crée une nouvelle (avec `started_at = now()`) si c'est le premier accès.
 * `started_at` n'est plus jamais réécrit ensuite : c'est ce qui permet au
 * chrono de reprendre là où il en était plutôt que de repartir de zéro. */
export async function loadOrCreateExamProgress(examId: string, studentId: string): Promise<ExamProgressState> {
  const { data: existing, error: selectError } = await (supabase as any)
    .from("exam_progress")
    .select("started_at, answers, status, submitted")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    return {
      startedAt: existing.started_at,
      answers: (existing.answers as string[][]) || [],
      status: (existing.status as QuestionStatus[][]) || [],
      submitted: !!existing.submitted,
    };
  }

  const { data: created, error: insertError } = await (supabase as any)
    .from("exam_progress")
    .insert({ exam_id: examId, student_id: studentId, answers: [], status: [], submitted: false })
    .select("started_at, answers, status, submitted")
    .single();
  if (insertError) throw insertError;

  return {
    startedAt: created.started_at,
    answers: (created.answers as string[][]) || [],
    status: (created.status as QuestionStatus[][]) || [],
    submitted: !!created.submitted,
  };
}

/** Réinitialise la progression d'un examen ("Refaire l'examen" après
 * expiration du chrono) : nouveau `started_at` (le chrono repart de zéro),
 * réponses/statuts vidés, soumission annulée. */
export async function resetExamProgress(examId: string, studentId: string): Promise<ExamProgressState> {
  const { data, error } = await (supabase as any)
    .from("exam_progress")
    .update({
      started_at: new Date().toISOString(),
      answers: [],
      status: [],
      submitted: false,
      submitted_at: null,
    })
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .select("started_at, answers, status, submitted")
    .single();
  if (error) throw error;
  return {
    startedAt: data.started_at,
    answers: (data.answers as string[][]) || [],
    status: (data.status as QuestionStatus[][]) || [],
    submitted: false,
  };
}

/** Sauvegarde (upsert sur exam_id+student_id) l'état courant des réponses,
 * du statut par question et de la soumission — appelé à chaque changement
 * pour que la reprise après sortie de la page soit fidèle. */
export async function saveExamProgress(
  examId: string,
  studentId: string,
  patch: { answers: string[][]; status: QuestionStatus[][]; submitted: boolean }
): Promise<void> {
  const { error } = await (supabase as any)
    .from("exam_progress")
    .update({
      answers: patch.answers,
      status: patch.status,
      submitted: patch.submitted,
      submitted_at: patch.submitted ? new Date().toISOString() : null,
    })
    .eq("exam_id", examId)
    .eq("student_id", studentId);
  if (error) throw error;
}
