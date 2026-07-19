import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useActivityLog = () => {
  const { toast } = useToast();

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
