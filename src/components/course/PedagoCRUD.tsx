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
import { Plus, Pencil, Trash2, Loader2, Clock, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useArabicKeyboardField } from "@/components/course/ArabicKeyboard";
import { logPedagoActivity } from "@/lib/pedagoActivityLog";
import { cn } from "@/lib/utils";

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
        logPedagoActivity({
          action: "update",
          entityType: "chapter",
          entityId: chapter.id,
          entityTitle: titleFrValue || titleValue,
          chapterId: chapter.id,
          subject,
          schoolLevel,
        });
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

        const { data: inserted, error } = await supabase.from("chapters").insert(insertData).select("id").single();
        if (error) throw error;
        toast.success(t("pedagoCRUD.chapter.addSuccess"));
        logPedagoActivity({
          action: "create",
          entityType: "chapter",
          entityId: inserted?.id,
          entityTitle: titleFrValue || titleValue,
          chapterId: inserted?.id,
          subject,
          schoolLevel,
        });
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

interface DeleteChapterButtonProps {
  chapterId: string;
  onDeleted: () => void;
  title?: string;
  subject?: string;
  schoolLevel?: string;
  /** Statut actuel du chapitre : une suppression demandée par un pédago sur un
   * chapitre 'approved' (publié) n'est pas immédiate, voir DeleteItemButton. */
  status?: string;
  deletionRequested?: boolean;
  isAdmin?: boolean;
}

export function DeleteChapterButton({ chapterId, onDeleted, title, subject, schoolLevel, status, deletionRequested, isAdmin }: DeleteChapterButtonProps) {
  return (
    <DeleteItemButton
      itemType="chapter"
      itemId={chapterId}
      onDeleted={onDeleted}
      status={status}
      deletionRequested={deletionRequested}
      isAdmin={isAdmin}
      onLogActivity={() => logPedagoActivity({ action: "delete", entityType: "chapter", entityId: chapterId, entityTitle: title, subject, schoolLevel })}
    />
  );
}

interface DeleteItemButtonProps {
  itemType: "chapter" | "lesson";
  itemId: string;
  onDeleted: () => void;
  status?: string;
  deletionRequested?: boolean;
  isAdmin?: boolean;
  onLogActivity?: () => void;
}

/** Bouton de suppression partagé chapitre/leçon : un admin (ou un pédago sur
 * un élément jamais publié) supprime immédiatement. Un pédago qui supprime un
 * élément publié ('approved') envoie une demande à l'admin au lieu de
 * supprimer : l'élément reste intact et visible des élèves jusqu'à décision.
 * Une fois la demande envoyée, le pédago voit un badge "en attente" ; l'admin
 * voit à la place deux actions Confirmer/Annuler. */
function DeleteItemButton({ itemType, itemId, onDeleted, status, deletionRequested, isAdmin, onLogActivity }: DeleteItemButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const isChapter = itemType === "chapter";
  // Un pédago qui supprime un élément publié n'efface rien tout de suite :
  // sa demande part en attente de décision admin, avec un motif obligatoire
  // pour que l'admin comprenne pourquoi (voir request_item_deletion).
  const needsReason = status === "approved" && !isAdmin;
  const labels = isChapter ? {
    aria: t("pedagoCRUD.chapter.deleteAria"),
    confirmTitle: t("pedagoCRUD.chapter.deleteConfirmTitle"),
    confirmDescription: t("pedagoCRUD.chapter.deleteConfirmDescription"),
    error: t("pedagoCRUD.chapter.deleteError"),
  } : {
    aria: t("pedagoCRUD.lesson.deleteAria"),
    confirmTitle: t("pedagoCRUD.lesson.deleteConfirmTitle"),
    confirmDescription: t("pedagoCRUD.lesson.deleteConfirmDescription"),
    error: t("pedagoCRUD.lesson.deleteError"),
  };

  if (deletionRequested) {
    if (isAdmin) {
      const approve = async () => {
        setLoading(true);
        try {
          const { error } = await supabase.rpc("approve_item_deletion" as any, { p_item_type: itemType, p_item_id: itemId });
          if (error) throw error;
          toast.success(t("pedagoCRUD.deletion.approveSuccess"));
          onDeleted();
        } catch (e: any) {
          toast.error(e.message || labels.error);
        } finally {
          setLoading(false);
        }
      };
      const reject = async () => {
        setLoading(true);
        try {
          const { error } = await supabase.rpc("reject_item_deletion" as any, { p_item_type: itemType, p_item_id: itemId });
          if (error) throw error;
          toast.success(t("pedagoCRUD.deletion.rejectSuccess"));
          onDeleted();
        } catch (e: any) {
          toast.error(e.message || labels.error);
        } finally {
          setLoading(false);
        }
      };
      return (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" disabled={loading} onClick={approve} aria-label={t("pedagoCRUD.deletion.approveAria")} title={t("pedagoCRUD.deletion.approveAria")}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={loading} onClick={reject} aria-label={t("pedagoCRUD.deletion.rejectAria")} title={t("pedagoCRUD.deletion.rejectAria")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return (
      <Badge variant="secondary" className="badge-status-pending gap-1 shrink-0">
        <Clock className="h-3 w-3" /> {t("pedagoCRUD.deletion.pending")}
      </Badge>
    );
  }

  const handleDelete = async () => {
    if (needsReason && !reason.trim()) {
      toast.error(t("pedagoCRUD.deletion.reasonRequired"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("request_item_deletion" as any, { p_item_type: itemType, p_item_id: itemId, p_reason: reason.trim() || null });
      if (error) throw error;
      onLogActivity?.();
      toast.success(data === false ? t("pedagoCRUD.deletion.requestSent") : t(isChapter ? "pedagoCRUD.chapter.deleteSuccess" : "pedagoCRUD.lesson.deleteSuccess"));
      setReason("");
      onDeleted();
    } catch (error: any) {
      toast.error(error.message || labels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog onOpenChange={(open) => { if (!open) setReason(""); }}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-destructive hover:text-destructive", !isChapter && "h-7 w-7")} aria-label={labels.aria}>
          <Trash2 className={cn("h-4 w-4", !isChapter && "h-3 w-3")} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{labels.confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {labels.confirmDescription}
              {needsReason && (
                <span className="block mt-2 font-medium text-foreground">{t("pedagoCRUD.deletion.needsValidationNotice")}</span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {needsReason && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("pedagoCRUD.deletion.reasonLabel")}</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("pedagoCRUD.deletion.reasonPlaceholder")}
              rows={3}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || (needsReason && !reason.trim())}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
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
        logPedagoActivity({
          action: "update",
          entityType: "lesson",
          entityId: lesson.id,
          entityTitle: titleFrValue || titleValue,
          chapterId,
        });
      } else {
        const { data: existing } = await supabase
          .from("lessons")
          .select("order_index")
          .eq("chapter_id", chapterId)
          .order("order_index", { ascending: false })
          .limit(1);

        const nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

        const { data: inserted, error } = await supabase.from("lessons").insert({
          chapter_id: chapterId,
          title: titleFrValue || titleValue,
          title_ar: titleValue,
          order_index: nextIndex,
        }).select("id").single();
        if (error) throw error;
        toast.success(t("pedagoCRUD.lesson.addSuccess"));
        logPedagoActivity({
          action: "create",
          entityType: "lesson",
          entityId: inserted?.id,
          entityTitle: titleFrValue || titleValue,
          chapterId,
        });
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

interface DeleteLessonButtonProps {
  lessonId: string;
  onDeleted: () => void;
  chapterId?: string;
  title?: string;
  status?: string;
  deletionRequested?: boolean;
  isAdmin?: boolean;
}

export function DeleteLessonButton({ lessonId, onDeleted, chapterId, title, status, deletionRequested, isAdmin }: DeleteLessonButtonProps) {
  return (
    <DeleteItemButton
      itemType="lesson"
      itemId={lessonId}
      onDeleted={onDeleted}
      status={status}
      deletionRequested={deletionRequested}
      isAdmin={isAdmin}
      onLogActivity={() => logPedagoActivity({ action: "delete", entityType: "lesson", entityId: lessonId, entityTitle: title, chapterId })}
    />
  );
}
