import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudentNotifications } from "@/hooks/useStudentNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { notifications, unreadCount, markAllAsRead, deleteNotification } = useStudentNotifications(userId);
  const navigate = useNavigate();

  if (!userId) return null;

  const handleClick = async (n: typeof notifications[number]) => {
    await deleteNotification(n.id);
    if (!n.lesson_id || !n.chapter_id) return;

    // Lookup chapter to find subject
    const { data: chapter } = await supabase
      .from("chapters")
      .select("subject")
      .eq("id", n.chapter_id)
      .maybeSingle();

    const subject = chapter?.subject;
    if (!subject) return;

    const params = new URLSearchParams({
      chapitre: n.chapter_id,
      lecon: n.lesson_id,
    });
    navigate(`/cours/${subject}?${params.toString()}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground" dir="rtl">
              لا توجد إشعارات
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`w-full text-right p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                onClick={() => handleClick(n)}
                dir="rtl"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString("ar-DZ")}
                    </p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
