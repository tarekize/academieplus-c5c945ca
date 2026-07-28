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
    // isCorrect peut être explicitement remis à null (réponse en attente de
    // correction manuelle) — "??" ne distingue pas "non fourni" de "remis à
    // null" volontairement, d'où la vérification explicite ici.
    is_correct: patch.isCorrect !== undefined ? patch.isCorrect : (existing?.is_correct ?? null),
    last_answer: patch.answer ?? existing?.last_answer ?? null,
  };

  if (existing) {
    await (supabase as any).from("teacher_content_attempts").update(row).eq("id", existing.id);
  } else {
    await (supabase as any).from("teacher_content_attempts").insert(row);
  }
}

/**
 * Normalise une réponse pour une comparaison souple : les réponses attendues
 * générées par l'IA sont écrites en LaTeX ($3$, \boxed{3}...) alors que
 * l'élève tape du texte brut ("3") — sans ce nettoyage, une réponse
 * juste au fond était marquée fausse à cause du seul habillage LaTeX.
 * (Même logique que normalizeAnswer() dans LessonRemediation.tsx.)
 */
export function normalizeAnswer(s: string): string {
  let v = (s || "").replace(/\$/g, "").toLowerCase().trim();

  // Canonicalise les représentations de l'infini (∞, \infty, infty, inf).
  v = v
    .replace(/∞/g, "infinity")
    .replace(/\\infty/g, "infinity")
    .replace(/\binfty\b/g, "infinity")
    .replace(/\binf\b/g, "infinity");

  // Retire les commandes LaTeX restantes (\boxed, \frac, \to...) en gardant leur nom.
  v = v.replace(/\\[a-zA-Z]+/g, (m) => m.slice(1));

  v = v.replace(/[{}\s]/g, "").replace(/,/g, ".").trim();

  if (v === "infinity") v = "+infinity";

  return v;
}
