import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, StickyNote, Trash2, Lock, Eye } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  is_private: boolean;
  created_at: string;
}

interface TeacherStudentNotesProps {
  studentId: string;
  classId?: string | null;
}

export default function TeacherStudentNotes({ studentId, classId }: TeacherStudentNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setTeacherId(data.user?.id ?? null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("teacher_student_notes")
      .select("id, content, is_private, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (!error) setNotes((data as Note[]) || []);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    const text = content.trim();
    if (!text) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("teacher_student_notes").insert({
        teacher_id: teacherId,
        student_id: studentId,
        class_id: classId ?? null,
        content: text,
        is_private: isPrivate,
      });
      if (error) throw error;
      setContent("");
      toast.success("Remarque ajoutée");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("teacher_student_notes").delete().eq("id", id);
    if (error) { toast.error("Suppression impossible"); return; }
    toast.success("Remarque supprimée");
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StickyNote className="h-5 w-5 text-primary" /> Remarques sur l'élève
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter une remarque…"
            className="min-h-[70px]"
          />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Switch id="note-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label htmlFor="note-private" className="text-sm cursor-pointer">
                {isPrivate ? "Privée (vous seul)" : "Visible par l'élève et ses parents"}
              </Label>
            </div>
            <Button onClick={handleAdd} disabled={saving || !content.trim()} size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune remarque pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm whitespace-pre-wrap break-words">{n.content}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={n.is_private ? "secondary" : "outline"} className="text-[10px] gap-1">
                      {n.is_private ? <Lock className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {n.is_private ? "Privée" : "Visible"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDelete(n.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
