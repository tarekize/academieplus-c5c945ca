import { supabase } from "@/integrations/supabase/client";

export type ContentType = "exercise" | "quiz" | "exam";

export interface ExamExerciseItem {
  statement: string;
  solution?: string;
  answer?: string;
}

export interface GeneratedItem {
  // exercise / exam
  title?: string;
  statement?: string;
  expected_answer?: string;
  solution?: string;
  // quiz
  question?: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  // exam bundle: a single exam made of several exercises, shared to a class as one whole.
  exercises?: ExamExerciseItem[];
  // shared
  hint?: string;
  difficulty?: number;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  exercise: "Exercice",
  quiz: "Quiz",
  exam: "Examen",
};

export const SCHOOL_LEVELS = [
  { value: "5eme_primaire", label: "5ème Primaire" },
  { value: "1ere_cem", label: "1ère CEM" },
  { value: "2eme_cem", label: "2ème CEM" },
  { value: "3eme_cem", label: "3ème CEM" },
  { value: "4eme_cem", label: "4ème CEM" },
  { value: "seconde", label: "Seconde" },
  { value: "premiere", label: "Première" },
  { value: "terminale", label: "Terminale" },
];

/** Save a single piece of teacher content and return its id. */
export async function saveTeacherContent(params: {
  teacherId: string;
  contentType: ContentType;
  chapterId?: string | null;
  lessonId?: string | null;
  schoolLevel?: string | null;
  filiere?: string | null;
  title?: string | null;
  payload: GeneratedItem;
  difficulty?: number;
  source: "manual" | "ai";
}): Promise<string> {
  const { data, error } = await (supabase as any)
    .from("teacher_content")
    .insert({
      teacher_id: params.teacherId,
      content_type: params.contentType,
      chapter_id: params.chapterId ?? null,
      lesson_id: params.lessonId ?? null,
      school_level: (params.schoolLevel as any) ?? null,
      filiere: params.filiere ?? null,
      title: params.title ?? params.payload.title ?? null,
      payload: params.payload,
      difficulty: params.difficulty ?? params.payload.difficulty ?? 3,
      source: params.source,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id as string;
}

/** Assign an existing content to classes and/or a single student. */
export async function assignContent(params: {
  contentId: string;
  assignedBy: string;
  classIds?: string[];
  studentIds?: string[];
}): Promise<void> {
  const rows: any[] = [];
  for (const cid of params.classIds || []) {
    rows.push({ content_id: params.contentId, class_id: cid, assigned_by: params.assignedBy });
  }
  for (const sid of params.studentIds || []) {
    rows.push({ content_id: params.contentId, student_id: sid, assigned_by: params.assignedBy });
  }
  if (rows.length === 0) return;
  const { error } = await (supabase as any).from("teacher_content_assignments").insert(rows);
  if (error) throw error;
}

/** Generate content via the edge function. */
export async function generateTeacherContent(params: {
  contentType: ContentType;
  schoolLevel?: string;
  chapterTitle?: string;
  lessonTitle?: string;
  count?: number;
  difficultyMin?: number;
  difficultyMax?: number;
  focusNote?: string;
}): Promise<GeneratedItem[]> {
  const { data, error } = await supabase.functions.invoke("generate-teacher-content", {
    body: params,
  });
  if (error) throw error;
  const items = (data as any)?.items;
  if ((data as any)?.error) throw new Error((data as any).error);
  return Array.isArray(items) ? items : [];
}
