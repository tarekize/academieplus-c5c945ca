// Connecte le chatbot IA au moteur de niveau de l'élève.
// Quand l'IA propose un exercice et que l'élève y répond, l'IA ajoute un marqueur
// caché [[EVAL:correct|difficulty|concept]] à la fin de son message.
// Ce module extrait ce marqueur et alimente le calcul de niveau + les lacunes.
import { supabase } from "@/integrations/supabase/client";
import { computeDelta, applyDelta } from "@/lib/levelEngine";
import { getPlacementLevel } from "@/lib/initialLevel";

export interface ChatEval {
  isCorrect: boolean;
  difficulty: number;
  concept: string;
}

const EVAL_REGEX = /\[\[EVAL:\s*([01])\s*\|\s*(\d)\s*\|\s*([^\]]*?)\]\]/i;

/** Sépare le marqueur EVAL du contenu affiché. */
export function extractEval(content: string): { cleanContent: string; evalData: ChatEval | null } {
  const match = content.match(EVAL_REGEX);
  if (!match) return { cleanContent: content, evalData: null };

  const evalData: ChatEval = {
    isCorrect: match[1] === "1",
    difficulty: Math.min(5, Math.max(1, parseInt(match[2], 10) || 3)),
    concept: (match[3] || "").trim().slice(0, 200),
  };

  const cleanContent = content.replace(new RegExp(EVAL_REGEX.source, "gi"), "").trim();
  return { cleanContent, evalData };
}

/** Retire simplement le marqueur EVAL (pour l'affichage). */
export function stripEvalMarker(content: string): string {
  return content.replace(new RegExp(EVAL_REGEX.source, "gi"), "").trim();
}

interface RecordParams {
  userId: string;
  chapterId: string;
  chapterTitle?: string;
  evalData: ChatEval;
}

/**
 * Enregistre la réponse de l'élève donnée dans le chatbot IA dans le moteur
 * de niveau (student_scores au niveau du chapitre, lesson_id = null), puis
 * génère un commentaire IA des lacunes en cas d'erreur (notification élève).
 */
export async function recordChatExerciseAnswer({ userId, chapterId, chapterTitle, evalData }: RecordParams): Promise<void> {
  if (!userId || !chapterId) return;

  // 1) Charger la ligne de score niveau-chapitre (lesson_id null) si elle existe.
  const { data: existing } = await supabase
    .from("student_scores")
    .select("*")
    .eq("user_id", userId)
    .eq("chapter_id", chapterId)
    .is("lesson_id", null)
    .maybeSingle();

  const currentLevel = existing?.current_level ?? 50;
  const totalAnswers = (existing?.total_answers ?? 0) + 1;
  const correctAnswers = (existing?.correct_answers ?? 0) + (evalData.isCorrect ? 1 : 0);
  const streak = evalData.isCorrect ? (existing?.streak ?? 0) + 1 : 0;
  const accuracyRate = Math.round((correctAnswers / totalAnswers) * 100);

  // Règle 1 — ELO pondéré par difficulté (le chatbot devient un paramètre du niveau).
  const delta = computeDelta({
    isCorrect: evalData.isCorrect,
    timeSec: 60,
    difficulty: evalData.difficulty,
    currentLevel,
  });
  const newLevel = applyDelta(currentLevel, delta);

  const row = {
    user_id: userId,
    chapter_id: chapterId,
    lesson_id: null as string | null,
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

