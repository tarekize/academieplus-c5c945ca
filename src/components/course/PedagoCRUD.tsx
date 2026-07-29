import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useArabicKeyboardField } from "@/components/course/ArabicKeyboard";

interface PedagoChapterFormProps {
  schoolLevel: string;
  filiereId?: string | null;
  subject: string;
  onSaved: () => void;
  chapter?: { id: string; title: string; title_ar: string | null; description: string | null; order_index: number };
}

export function ChapterFormDialog({ schoolLevel, filiereId, subject, onSaved, chapter }: PedagoChapterFormProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleAr, setTitleAr] = useState(chapter?.title_ar || chapter?.title || "");
  const [titleFr, setTitleFr] = useState(chapter && chapter.title !== chapter.title_ar ? chapter.title : "");
  const [description, setDescription] = useState(chapter?.description || "");
  const { onFocus: onKeyboardFocus, onBlur: onKeyboardBlur } = useArabicKeyboardField();

  const isEdit = !!chapter;

  const handleSubmit = async () => {
    const titleValue = titleAr.trim();
    const titleFrValue = titleFr.trim();
    if (!titleValue) {
      toast.error(t("pedagoCRUD.titleRequired"));
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("chapters")
          .update({
            title: titleFrValue || titleValue,
            title_ar: titleValue,
            description: description.trim() || null,
          })
          .eq("id", chapter.id);

        if (error) throw error;
        toast.success(t("pedagoCRUD.chapter.updateSuccess"));
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
          title: titleFrValue || titleValue,
          title_ar: titleValue,
          description: description.trim() || null,
          school_level: schoolLevel,
          subject,
          order_index: nextIndex,
          filiere_id: filiereId || null,
        };

        const { error } = await supabase.from("chapters").insert(insertData);
        if (error) throw error;
        toast.success(t("pedagoCRUD.chapter.addSuccess"));
      }

      setOpen(false);
      setTitleAr("");
      setTitleFr("");
      setDescription("");
      onSaved();
    } catch (error: any) {
      console.error("Error saving chapter:", error);
      toast.error(error.message || t("pedagoCRUD.chapter.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && chapter) {
          setTitleAr(chapter.title_ar || chapter.title || "");
          setTitleFr(chapter.title !== chapter.title_ar ? chapter.title : "");
          setDescription(chapter.description || "");
        }
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("pedagoCRUD.chapter.editAria")}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("pedagoCRUD.chapter.addButton")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("pedagoCRUD.chapter.editTitle") : t("pedagoCRUD.chapter.newTitle")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("pedagoCRUD.chapter.editDescription") : t("pedagoCRUD.chapter.newDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t("pedagoCRUD.chapter.titleArLabel")}</label>
            <Input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              onFocus={(e) => onKeyboardFocus(e.currentTarget)}
              onBlur={onKeyboardBlur}
              placeholder={t("pedagoCRUD.chapter.titleArPlaceholder")}
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("pedagoCRUD.chapter.titleFrLabel")}</label>
            <Input
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              placeholder={t("pedagoCRUD.chapter.titleFrPlaceholder")}
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("pedagoCRUD.chapter.descriptionLabel")}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => onKeyboardFocus(e.currentTarget)}
              onBlur={onKeyboardBlur}
              placeholder={t("pedagoCRUD.chapter.descriptionPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("app.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? t("app.edit") : t("app.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChapterButton({ chapterId, onDeleted }: { chapterId: string; onDeleted: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete lessons first
      await supabase.from("lessons").delete().eq("chapter_id", chapterId);
      const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
      if (error) throw error;
      toast.success(t("pedagoCRUD.chapter.deleteSuccess"));
      onDeleted();
    } catch (error: any) {
      toast.error(error.message || t("pedagoCRUD.chapter.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={t("pedagoCRUD.chapter.deleteAria")}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("pedagoCRUD.chapter.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("pedagoCRUD.chapter.deleteConfirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("app.delete")}
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleAr, setTitleAr] = useState(lesson?.title_ar || lesson?.title || "");
  const [titleFr, setTitleFr] = useState(lesson && lesson.title !== lesson.title_ar ? lesson.title : "");
  const { onFocus: onKeyboardFocus, onBlur: onKeyboardBlur } = useArabicKeyboardField();

  const isEdit = !!lesson;

  const handleSubmit = async () => {
    const titleValue = titleAr.trim();
    const titleFrValue = titleFr.trim();
    if (!titleValue) {
      toast.error(t("pedagoCRUD.titleRequired"));
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("lessons")
          .update({ title: titleFrValue || titleValue, title_ar: titleValue })
          .eq("id", lesson.id);
        if (error) throw error;
        toast.success(t("pedagoCRUD.lesson.updateSuccess"));
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
          title: titleFrValue || titleValue,
          title_ar: titleValue,
          order_index: nextIndex,
        });
        if (error) throw error;
        toast.success(t("pedagoCRUD.lesson.addSuccess"));
      }

      setOpen(false);
      setTitleAr("");
      setTitleFr("");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || t("pedagoCRUD.lesson.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && lesson) {
          setTitleAr(lesson.title_ar || lesson.title || "");
          setTitleFr(lesson.title !== lesson.title_ar ? lesson.title : "");
        }
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t("pedagoCRUD.lesson.editAria")}>
            <Pencil className="h-3 w-3" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3 w-3" />
            {t("pedagoCRUD.lesson.addButton")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("pedagoCRUD.lesson.editTitle") : t("pedagoCRUD.lesson.newTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t("pedagoCRUD.lesson.titleArLabel")}</label>
            <Input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              onFocus={(e) => onKeyboardFocus(e.currentTarget)}
              onBlur={onKeyboardBlur}
              placeholder={t("pedagoCRUD.lesson.titleArPlaceholder")}
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t("pedagoCRUD.lesson.titleFrLabel")}</label>
            <Input
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              placeholder={t("pedagoCRUD.lesson.titleFrPlaceholder")}
              dir="ltr"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("app.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? t("app.edit") : t("app.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteLessonButton({ lessonId, onDeleted }: { lessonId: string; onDeleted: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) throw error;
      toast.success(t("pedagoCRUD.lesson.deleteSuccess"));
      onDeleted();
    } catch (error: any) {
      toast.error(error.message || t("pedagoCRUD.lesson.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" aria-label={t("pedagoCRUD.lesson.deleteAria")}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("pedagoCRUD.lesson.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("pedagoCRUD.lesson.deleteConfirmDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("app.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
