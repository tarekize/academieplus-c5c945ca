import { computeGlobal } from "@/lib/levelEngine";

export type StudentGroupLetter = "A" | "B" | "C" | "D";

export const GROUP_INFO: Record<StudentGroupLetter, { label: string; tone: string }> = {
  A: { label: "Avancé — maîtrise solide", tone: "bg-blue-600 text-white" },
  B: { label: "Intermédiaire — en progression", tone: "bg-green-600 text-white" },
  C: { label: "Fragile — à consolider", tone: "bg-amber-600 text-white" },
  D: { label: "En difficulté — accompagnement", tone: "bg-red-500 text-white" },
};

export const GROUP_ORDER: StudentGroupLetter[] = ["A", "B", "C", "D"];

export function groupFromPct(pct: number): StudentGroupLetter {
  if (pct >= 70) return "A";
  if (pct >= 50) return "B";
  if (pct >= 30) return "C";
  return "D";
}

interface ScoreLike { lesson_id: string | null; current_level: number; total_answers: number; }

/** Score global (0-100) d'un élève à partir de ses student_scores, et le groupe (A-D) associé. */
export function computeStudentGroup(scores: ScoreLike[]): { global: number; answered: boolean; group: StudentGroupLetter } {
  const g = computeGlobal(scores);
  const answered = scores.some((s) => (s.total_answers || 0) > 0);
  const pct = answered ? g.global : 0;
  return { global: pct, answered, group: groupFromPct(pct) };
}
