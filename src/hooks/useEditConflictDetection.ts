import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditingUser {
  user_id: string;
  user_name: string;
  last_activity: string;
}

export const useEditConflictDetection = (courseId: number, currentUserId: string, currentUserName: string) => {
  const [activeEditors, setActiveEditors] = useState<EditingUser[]>([]);
  const channelName = `course-editing-${courseId}`;

  useEffect(() => {
    if (!courseId || !currentUserId) return;

    const channel = supabase.channel(channelName);

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const editors: EditingUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.user_id !== currentUserId) {
              editors.push({
                user_id: presence.user_id,
                user_name: presence.user_name,
                last_activity: presence.last_activity,
              });
            }
          });
        });

        setActiveEditors(editors);

        if (editors.length > 0) {
          const editorNames = editors.map(e => e.user_name).join(', ');
          toast.warning(`Attention: ${editorNames} modifie également ce cours`, {
            duration: 5000,
          });
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.user_id !== currentUserId) {
            toast.info(`${presence.user_name} a commencé à modifier ce cours`);
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (presence.user_id !== currentUserId) {
            toast.info(`${presence.user_name} a quitté l'édition`);
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            user_name: currentUserName,
            last_activity: new Date().toISOString(),
          });
        }
      });

    // Update presence every 30 seconds
    const interval = setInterval(async () => {
      await channel.track({
        user_id: currentUserId,
        user_name: currentUserName,
        last_activity: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [courseId, currentUserId, currentUserName, channelName]);

  return { activeEditors };
};
