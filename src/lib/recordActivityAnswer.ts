// Enregistrement partagé d'une réponse d'activité (exercice/quiz) dans le
// moteur de niveau. Utilisé par les activités du chapitre (ChapterMathExercises
// / ChapterMathQuiz) pour qu'elles alimentent aussi student_scores.
import { supabase } from "@/integrations/supabase/client";
import { computeDelta, applyDelta, hesitationAdjustment, HintUsage } from "@/lib/levelEngine";
import { getPlacementLevel } from "@/lib/initialLevel";

interface RecordParams {
  userId: string;
  chapterId: string;
  lessonId?: string | null;
  isCorrect: boolean;
  timeSec?: number;
  difficulty?: number;
  hintUsage?: HintUsage;
  attemptCount?: number;
  abandoned?: boolean;
}

function buildMatcher(userId: string, chapterId: string, lessonId?: string | null) {
  let q = supabase.from("student_scores").select("*").eq("user_id", userId).eq("chapter_id", chapterId);
  q = lessonId ? q.eq("lesson_id", lessonId) : q.is("lesson_id", null);
  return q;
}

/**
 * Met à jour (ou crée) la ligne student_scores correspondante en appliquant
 * l'ajustement ELO enrichi des signaux comportementaux.
 */
export async function recordActivityAnswer({
  userId,
  chapterId,
  lessonId = null,
  isCorrect,
  timeSec = 60,
  difficulty,
  hintUsage = "none",
  attemptCount = 1,
  abandoned = false,
}: RecordParams): Promise<void> {
  if (!userId || !chapterId) return;

  const { data: existing } = await buildMatcher(userId, chapterId, lessonId).maybeSingle();

  const currentLevel = existing?.current_level ?? (await getPlacementLevel(userId));
  const totalAnswers = (existing?.total_answers ?? 0) + 1;
  const correctAnswers = (existing?.correct_answers ?? 0) + (isCorrect ? 1 : 0);
  const streak = isCorrect ? (existing?.streak ?? 0) + 1 : 0;
  const accuracyRate = Math.round((correctAnswers / totalAnswers) * 100);

  const delta = computeDelta({
    isCorrect,
    timeSec,
    difficulty,
    currentLevel,
    hintUsage,
    attemptCount,
    abandoned,
  });
  const newLevel = applyDelta(currentLevel, delta);

  const row = {
    user_id: userId,
    chapter_id: chapterId,
    lesson_id: lessonId,
    current_level: newLevel,
    total_answers: totalAnswers,
    correct_answers: correctAnswers,
    accuracy_rate: accuracyRate,
    streak,
  };

  if (existing) {
    await supabase.from("student_scores").update(row).eq("id", existing.id);
  } else {
    await supabase.from("student_scores").insert(row);
  }
}

/**
 * Enregistre un signal d'hésitation/abandon sans réponse soumise.
 * Les drapeaux sont accumulés dans assessment_data (jsonb), et un léger
 * ajustement de niveau est appliqué pour le cas "timeout".
 */
export async function recordActivityHesitation({
  userId,
  chapterId,
  lessonId = null,
  kind,
  difficulty,
}: {
  userId: string;
  chapterId: string;
  lessonId?: string | null;
  kind: "timeout" | "erase";
  difficulty?: number;
}): Promise<void> {
  if (!userId || !chapterId) return;

  const { data: existing } = await buildMatcher(userId, chapterId, lessonId).maybeSingle();

  const assessment = (existing?.assessment_data as Record<string, any> | null) || {};
  const nextAssessment = {
    ...assessment,
    hesitation_timeout: (assessment.hesitation_timeout || 0) + (kind === "timeout" ? 1 : 0),
    hesitation_erase: (assessment.hesitation_erase || 0) + (kind === "erase" ? 1 : 0),
  };

  const adjust = hesitationAdjustment(kind, difficulty);

  if (existing) {
    const newLevel = applyDelta(existing.current_level ?? 50, adjust);
    await supabase
      .from("student_scores")
      .update({ assessment_data: nextAssessment, current_level: newLevel })
      .eq("id", existing.id);
  } else {
    const baseLevel = await getPlacementLevel(userId);
    await supabase.from("student_scores").insert({
      user_id: userId,
      chapter_id: chapterId,
      lesson_id: lessonId,
      current_level: applyDelta(baseLevel, adjust),
      assessment_data: nextAssessment,
    });
  }
}
