/**
 * Adaptive level engine — pure functions.
 * Specification: ELO weighted by difficulty + composite without reading_time/streak
 * + weighted global level + temporal decay.
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;

const DIFFICULTY_WEIGHT: Record<number, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.3,
  5: 1.6,
};

// Median expected response time per difficulty (seconds)
const MEDIAN_TIME: Record<number, number> = {
  1: 30,
  2: 45,
  3: 60,
  4: 90,
  5: 120,
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const normDifficulty = (d?: number): number => {
  if (!d || d < 1) return 3;
  if (d > 5) return 5;
  return Math.round(d);
};

export interface DeltaInput {
  isCorrect: boolean;
  timeSec: number;
  difficulty?: number;
  currentLevel: number;
}

/**
 * Règle 1 — ELO ajustement par réponse, pondéré par difficulté + temps.
 */
export function computeDelta({ isCorrect, timeSec, difficulty, currentLevel }: DeltaInput): number {
  const diff = normDifficulty(difficulty);
  const weight = DIFFICULTY_WEIGHT[diff];
  const expected = 1 / (1 + Math.pow(10, (diff * 20 - currentLevel) / 40));

  let delta: number;
  if (isCorrect) {
    delta = clamp(Math.round(3 * (1 - expected) * weight), 1, 5);
  } else {
    delta = clamp(Math.round(-2 * expected * weight), -5, -1);
  }

  const median = MEDIAN_TIME[diff];
  if (isCorrect && timeSec < median * 0.6) delta = Math.round(delta * 1.2);
  else if (isCorrect && timeSec > median * 2.0) delta = Math.round(delta * 0.8);
  else if (!isCorrect && timeSec > 120) delta = Math.round(delta * 1.3);

  // Re-clamp after time modulator
  if (isCorrect) delta = clamp(delta, 1, 6);
  else delta = clamp(delta, -7, -1);

  return delta;
}

export function applyDelta(currentLevel: number, delta: number): number {
  return clamp(currentLevel + delta, 5, 100);
}

export interface CompositeInput {
  currentLevel: number;
  /** Taux de réussite pondéré difficulté (0-100). Fallback: accuracy_rate. */
  weightedAccuracy: number;
  /** Taux quiz (0-100). */
  quizAccuracy: number;
}

/**
 * Règle 2 — composite (sans reading_time ni streak).
 *   0.40 × taux pondéré difficulté
 * + 0.35 × current_level
 * + 0.25 × quiz_accuracy
 */
export function computeComposite({ currentLevel, weightedAccuracy, quizAccuracy }: CompositeInput): number {
  const composite = 0.40 * weightedAccuracy + 0.35 * currentLevel + 0.25 * quizAccuracy;
  return Math.round(clamp(composite, 5, 100));
}

export interface LessonScore {
  lesson_id?: string | null;
  current_level: number;
  total_answers: number;
}

export interface GlobalResult {
  global: number;
  weakestLessonId: string | null;
  strongestLessonId: string | null;
  weakestLevel: number | null;
  strongestLevel: number | null;
  criticalGap: boolean;
}

/**
 * Règle 3 — niveau global pondéré par nombre de réponses.
 */
export function computeGlobal(scores: LessonScore[]): GlobalResult {
  const active = scores.filter((s) => (s.total_answers || 0) > 0);
  if (active.length === 0) {
    return {
      global: 0,
      weakestLessonId: null,
      strongestLessonId: null,
      weakestLevel: null,
      strongestLevel: null,
      criticalGap: false,
    };
  }

  const totalAns = active.reduce((a, s) => a + s.total_answers, 0) || 1;
  const global = active.reduce((a, s) => a + s.current_level * (s.total_answers / totalAns), 0);

  const weakest = active.reduce((a, s) => (s.current_level < a.current_level ? s : a));
  const strongest = active.reduce((a, s) => (s.current_level > a.current_level ? s : a));
  const criticalGap = active.some((s) => s.current_level < 30);

  return {
    global: Math.round(clamp(global, 5, 100)),
    weakestLessonId: weakest.lesson_id ?? null,
    strongestLessonId: strongest.lesson_id ?? null,
    weakestLevel: weakest.current_level,
    strongestLevel: strongest.current_level,
    criticalGap,
  };
}

/**
 * Règle 5 — décroissance temporelle (oubli) appliquée par leçon.
 * - <= 7 jours : aucun decay.
 * - > 7 jours  : facteur = max(0.10, 1 - 0.01*(days-7)).
 */
export function applyDecay(currentLevel: number, lastUpdate: Date | string | null): { level: number; applied: boolean; days: number } {
  if (!lastUpdate) return { level: currentLevel, applied: false, days: 0 };
  const last = typeof lastUpdate === "string" ? new Date(lastUpdate) : lastUpdate;
  const days = Math.floor((Date.now() - last.getTime()) / 86_400_000);
  if (days <= 7) return { level: currentLevel, applied: false, days };
  const decay = Math.max(0.10, 1 - 0.01 * (days - 7));
  const next = Math.max(5, Math.round(currentLevel * decay));
  return { level: next, applied: next !== currentLevel, days };
}
