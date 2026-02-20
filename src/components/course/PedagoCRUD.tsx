import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PedagoChapterFormProps {
  schoolLevel: string;
  filiereId?: string | null;
  subject: string;
  onSaved: () => void;
  chapter?: { id: string; title: string; title_ar: string | null; description: string | null; order_index: number };
}

export function ChapterFormDialog({ schoolLevel, filiereId, subject, onSaved, chapter }: PedagoChapterFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(chapter?.title || "");
  const [titleAr, setTitleAr] = useState(chapter?.title_ar || "");
  const [description, setDescription] = useState(chapter?.description || "");

  const isEdit = !!chapter;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("chapters")
          .update({
            title: title.trim(),
            title_ar: titleAr.trim() || null,
            description: description.trim() || null,
          })
          .eq("id", chapter.id);

        if (error) throw error;
        toast.success("Chapitre modifié avec succès");
      } else {
        // Get max order_index
        const { data: existing } = await supabase
          .from("chapters")
          .select("order_index")
          .eq("school_level", schoolLevel as any)
          .eq("subject", subject)
          .order("order_index", { ascending: false })
          .limit(1);

        const nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

        const insertData: any = {
          title: title.trim(),
          title_ar: titleAr.trim() || null,
          description: description.trim() || null,
          school_level: schoolLevel,
          subject,
          order_index: nextIndex,
          filiere_id: filiereId || null,
        };

        const { error } = await supabase.from("chapters").insert(insertData);
        if (error) throw error;
        toast.success("Chapitre ajouté avec succès");
      }

      setOpen(false);
      setTitle("");
      setTitleAr("");
      setDescription("");
      onSaved();
    } catch (error: any) {
      console.error("Error saving chapter:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && chapter) { setTitle(chapter.title); setTitleAr(chapter.title_ar || ""); setDescription(chapter.description || ""); } }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un chapitre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le chapitre" : "Nouveau chapitre"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations du chapitre." : "Ajoutez un nouveau chapitre au programme."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Titre (Français) *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Les fonctions affines" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Titre (Arabe)</label>
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="العنوان بالعربية" dir="rtl" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du chapitre..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Modifier" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChapterButton({ chapterId, onDeleted }: { chapterId: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete lessons first
      await supabase.from("lessons").delete().eq("chapter_id", chapterId);
      const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
      if (error) throw error;
      toast.success("Chapitre supprimé");
      onDeleted();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le chapitre ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les leçons associées seront également supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface LessonFormDialogProps {
  chapterId: string;
  onSaved: () => void;
  lesson?: { id: string; title: string; title_ar: string | null };
}

export function LessonFormDialog({ chapterId, onSaved, lesson }: LessonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(lesson?.title || "");
  const [titleAr, setTitleAr] = useState(lesson?.title_ar || "");

  const isEdit = !!lesson;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("lessons")
          .update({ title: title.trim(), title_ar: titleAr.trim() || null })
          .eq("id", lesson.id);
        if (error) throw error;
        toast.success("Leçon modifiée");
      } else {
        const { data: existing } = await supabase
          .from("lessons")
          .select("order_index")
          .eq("chapter_id", chapterId)
          .order("order_index", { ascending: false })
          .limit(1);

        const nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

        const { error } = await supabase.from("lessons").insert({
          chapter_id: chapterId,
          title: title.trim(),
          title_ar: titleAr.trim() || null,
          order_index: nextIndex,
        });
        if (error) throw error;
        toast.success("Leçon ajoutée");
      }

      setOpen(false);
      setTitle("");
      setTitleAr("");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && lesson) { setTitle(lesson.title); setTitleAr(lesson.title_ar || ""); } }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3 w-3" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3 w-3" />
            Leçon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la leçon" : "Nouvelle leçon"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Titre (Français) *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Introduction aux fonctions" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Titre (Arabe)</label>
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="العنوان بالعربية" dir="rtl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Modifier" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteLessonButton({ lessonId, onDeleted }: { lessonId: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) throw error;
      toast.success("Leçon supprimée");
      onDeleted();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la leçon ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
