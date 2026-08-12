import { supabase } from "@/integrations/supabase/client";

// Journalise une action utilisateur générique dans activity_logs (visible côté
// admin). user_id vient de la session serveur (auth.getUser()), jamais d'un
// paramètre appelant : un utilisateur ne peut donc pas se faire passer pour
// un autre dans le journal via cet appel.
export const useActivityLog = () => {
  /** Enregistre `action` (+ détails libres) pour l'utilisateur courant. Échoue silencieusement (best-effort). */
  const logActivity = async (
    action: string,
    details?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          details: details || {},
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
};
