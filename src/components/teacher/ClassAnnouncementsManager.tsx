import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ClassAnnouncementsManagerProps {
  classId: string;
}

export default function ClassAnnouncementsManager({ classId }: ClassAnnouncementsManagerProps) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setTeacherId(data.user?.id ?? null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("class_announcements")
      .select("id, title, content, created_at")
      .eq("class_id", classId)
      .order("created_at", { ascending: false });
    if (!error) setItems((data as Announcement[]) || []);
    setLoading(false);
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Titre et message requis.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("class_announcements").insert({
        class_id: classId,
        teacher_id: teacherId,
        title: title.trim(),
        content: content.trim(),
      });
      if (error) throw error;
      toast.success("Annonce publiée");
      setTitle(""); setContent(""); setOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Échec de la publication");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("class_announcements").delete().eq("id", id);
    if (error) { toast.error("Suppression impossible"); return; }
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="h-5 w-5 text-primary" /> Annonces de la classe
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nouvelle annonce</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle annonce</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre (ex : Rappel examen)" />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre message à la classe…" className="min-h-[100px]" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune annonce publiée.</p>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div key={a.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{a.content}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDelete(a.id)}>
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
