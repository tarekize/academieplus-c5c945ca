import { supabase } from "@/integrations/supabase/client";

/**
 * Règle 1 — niveau initial = score du test de positionnement.
 * Lit la ligne « placement » de l'élève (lesson_id NULL) et renvoie son
 * current_level. Fallback à 50 uniquement si aucun test n'a été passé.
 */
export async function getPlacementLevel(userId: string): Promise<number> {
  if (!userId) return 50;
  try {
    const { data } = await supabase
      .from("student_scores")
      .select("current_level")
      .eq("user_id", userId)
      .is("lesson_id", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && typeof data.current_level === "number") {
      return data.current_level;
    }
  } catch (e) {
    console.warn("getPlacementLevel fallback:", e);
  }
  return 50;
}
