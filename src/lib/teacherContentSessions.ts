import { supabase } from "@/integrations/supabase/client";
import { ContentType } from "@/lib/teacherContent";

/** "help" = sessions de l'assistant "Aider les élèves" (HelpChatbot), qui
 * mélange exercices et quiz dans une même session — bucket séparé des types
 * mono-contenu de teacherContent.ts pour ne pas mélanger les historiques. */
export type SessionContentType = ContentType | "help";

export interface TeacherContentSessionRow {
  id: string;
  content_type: SessionContentType;
  title: string;
  state: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/** Liste les brouillons/sessions sauvegardés d'un enseignant pour un type de
 * contenu donné (historique affiché dans les générateurs IA enseignant). */
export async function listTeacherContentSessions(teacherId: string, contentType: SessionContentType): Promise<TeacherContentSessionRow[]> {
  const { data, error } = await (supabase as any)
    .from("teacher_content_sessions")
    .select("id, content_type, title, state, created_at, updated_at")
    .eq("teacher_id", teacherId)
    .eq("content_type", contentType)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as TeacherContentSessionRow[]) || [];
}

/** Crée ou met à jour (si `id` fourni) une session de génération enseignant
 * (état du wizard/chat + titre), pour reprendre plus tard un brouillon. */
export async function saveTeacherContentSession(params: {
  id?: string | null;
  teacherId: string;
  contentType: SessionContentType;
  title: string;
  state: Record<string, any>;
}): Promise<string> {
  if (params.id) {
    // Filtre défensif sur teacher_id en plus de l'id de session : empêche un
    // enseignant de réécrire la session d'un collègue en rejouant un id de
    // session qu'il ne possède pas, si la policy RLS d'update s'avérait trop
    // permissive.
    const { error } = await (supabase as any)
      .from("teacher_content_sessions")
      .update({ title: params.title, state: params.state })
      .eq("id", params.id)
      .eq("teacher_id", params.teacherId);
    if (error) throw error;
    return params.id;
  }
  const { data, error } = await (supabase as any)
    .from("teacher_content_sessions")
    .insert({ teacher_id: params.teacherId, content_type: params.contentType, title: params.title, state: params.state })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

// Supprime une session enregistrée (bouton corbeille dans TeacherContentSessionHistory).
// Ne filtre pas par teacher_id ici : repose entièrement sur la policy RLS de
// suppression de teacher_content_sessions pour empêcher un enseignant de
// supprimer la session d'un collègue — à vérifier côté RLS.
export async function deleteTeacherContentSession(id: string): Promise<void> {
  const { error } = await (supabase as any).from("teacher_content_sessions").delete().eq("id", id);
  if (error) throw error;
}
