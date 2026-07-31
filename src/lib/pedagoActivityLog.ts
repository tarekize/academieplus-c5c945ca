import { supabase } from "@/integrations/supabase/client";

export type PedagoActivityAction = "create" | "update" | "delete";
export type PedagoActivityEntityType = "chapter" | "lesson" | "lesson_content" | "exam";

interface LogPedagoActivityParams {
  action: PedagoActivityAction;
  entityType: PedagoActivityEntityType;
  entityId?: string | null;
  entityTitle?: string | null;
  chapterId?: string | null;
  subject?: string | null;
  schoolLevel?: string | null;
}

/**
 * Trace un ajout/modification/suppression de chapitre/leçon/contenu pour la
 * page "Activité" du pédago. Best-effort : ne doit jamais faire échouer
 * l'action métier qui vient de réussir si le log échoue.
 */
export async function logPedagoActivity(params: LogPedagoActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from("pedago_activity_log" as any).insert({
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      entity_title: params.entityTitle ?? null,
      chapter_id: params.chapterId ?? null,
      subject: params.subject ?? null,
      school_level: params.schoolLevel ?? null,
    } as any);
    if (error) console.error("Error logging pedago activity:", error);
  } catch (error) {
    console.error("Error logging pedago activity:", error);
  }
}
