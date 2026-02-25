import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudentNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  diagnostic: string | null;
  advice: string | null;
  is_read: boolean;
  created_at: string;
  lesson_id: string | null;
  chapter_id: string | null;
}

export function useStudentNotifications(userId: string) {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("student_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as StudentNotification[]);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("student-notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "student_notifications",
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from("student_notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    await supabase
      .from("student_notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    fetchNotifications();
  }, [userId, fetchNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
