// Types partagés pour le module Examens (grille Pédago, wizard IA, import de
// document, historique, revue admin). `content` sur la table `exams` est un
// tableau de ExamExercise.
export interface ExamSubQuestion {
  question: string;
  expected_answer?: string;
}

export interface ExamExercise {
  /** Énoncé complet (exercice à une seule question), ou énoncé/contexte
   * commun uniquement quand `sub_questions` est renseigné (>= 2 éléments). */
  statement: string;
  solution: string;
  /** Réponse finale (utilisée seulement si `sub_questions` est absent/< 2). */
  answer: string;
  /** Quand un exercice comporte plusieurs questions distinctes, une zone de
   * réponse est affichée pour CHAQUE question plutôt qu'une seule pour tout
   * l'exercice (chacune notée indépendamment via sa propre expected_answer). */
  sub_questions?: ExamSubQuestion[];
  chapter_id?: string | null;
  chapter_title?: string | null;
  difficulty?: number | null;
}

export type ExamStatus = "draft" | "pending" | "approved" | "rejected";

export interface ExamRecord {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  content: ExamExercise[];
  duration_minutes: number;
  school_level: string;
  filiere_id: string | null;
  trimester: number;
  subject: string;
  status: ExamStatus;
  version_number: number;
  source: string;
  chapter_ids: string[] | null;
  submitted_by: string | null;
  submitted_by_name: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  deletion_requested: boolean;
  deletion_requested_by: string | null;
  deletion_requested_by_name: string | null;
  deletion_requested_at: string | null;
  deletion_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const TRIMESTER_LABELS: Record<number, string> = {
  1: "1er Trimestre",
  2: "2ème Trimestre",
  3: "3ème Trimestre",
  4: "Bac Blanc",
  5: "Bac Finale",
};

/** Trimestres proposés pour un examen : 1-3 pour tous, + Bac Blanc/Finale (4-5) en terminale. */
export function trimesterOptions(isTerminale: boolean): number[] {
  return isTerminale ? [1, 2, 3, 4, 5] : [1, 2, 3];
}

export const EXAM_STATUS_META: Record<ExamStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-secondary text-secondary-foreground" },
  pending: { label: "Soumis", className: "badge-status-pending" },
  approved: { label: "Validé", className: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Refusé", className: "bg-destructive/10 text-destructive border-destructive/20" },
};
