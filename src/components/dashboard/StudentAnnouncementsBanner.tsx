import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, StickyNote } from "lucide-react";
import { formatLocaleDate } from "@/lib/formatLocale";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface StudentAnnouncementsBannerProps {
  userId: string;
}

export default function StudentAnnouncementsBanner({ userId }: StudentAnnouncementsBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      // Class memberships of this student (RLS allows the student & their parents).
      const { data: memberships } = await (supabase as any)
        .from("class_students")
        .select("class_id")
        .eq("student_id", userId);
      const classIds = (memberships || []).map((m: any) => m.class_id);

      if (classIds.length > 0) {
        const { data: anns } = await (supabase as any)
          .from("class_announcements")
          .select("id, title, content, created_at")
          .in("class_id", classIds)
          .order("created_at", { ascending: false })
          .limit(5);
        if (active) setAnnouncements((anns as Announcement[]) || []);
      }

      const { data: nts } = await (supabase as any)
        .from("teacher_student_notes")
        .select("id, content, created_at")
        .eq("student_id", userId)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (active) setNotes((nts as Note[]) || []);
    })();
    return () => { active = false; };
  }, [userId]);

  if (announcements.length === 0 && notes.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {announcements.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Megaphone className="h-4 w-4" /> Annonces de la classe
            </div>
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg bg-card/60 border p-3">
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{a.content}</p>
                <span className="text-[10px] text-muted-foreground">
                  {formatLocaleDate(a.created_at, { dateStyle: "long" } as any)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {notes.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <StickyNote className="h-4 w-4 text-primary" /> Remarques de l'enseignant
            </div>
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border p-3">
                <p className="text-sm whitespace-pre-wrap break-words">{n.content}</p>
                <span className="text-[10px] text-muted-foreground">
                  {formatLocaleDate(n.created_at, { dateStyle: "long" } as any)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
