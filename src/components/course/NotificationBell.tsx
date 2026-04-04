import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudentNotifications } from "@/hooks/useStudentNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useStudentNotifications(userId);

  if (!userId) return null;

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
          <h3 className="font-semibold text-sm">Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙƒÙ„ ÙƒÙ…Ù‚Ø±ÙˆØ¡
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground" dir="rtl">
              Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                onClick={() => markAsRead(n.id)}
                dir="rtl"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{n.notification_type === "performance_drop" ? "ðŸ“‰" : n.notification_type === "improvement" ? "ðŸ“ˆ" : "ðŸ””"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    {n.diagnostic && (
                      <p className="text-xs mt-1 text-yellow-600">{n.diagnostic}</p>
                    )}
                    {n.advice && (
                      <p className="text-xs mt-1 text-green-600">{n.advice}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString("ar-DZ")}
                    </p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
