import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, Hash, GraduationCap, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";

interface CurrentClass {
  membershipId: string;
  classId: string;
  name: string;
}

interface JoinClassDialogProps {
  onClassChange?: (hasClass: boolean) => void;
}

/** Widget "compte élève" permettant de rejoindre une classe via un code fourni
 * par l'enseignant, ou de quitter la classe actuelle. La validation du code
 * (existence, essais successifs...) est entièrement déléguée à l'edge function
 * `join-class` côté serveur — aucune requête directe vers la table `classes`
 * n'est faite ici, ce qui évite qu'un client puisse deviner un code par
 * requêtes répétées en contournant une éventuelle protection anti-bruteforce serveur. */
export default function JoinClassDialog({ onClassChange }: JoinClassDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [current, setCurrent] = useState<CurrentClass | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /** Charge la classe actuelle de l'élève connecté (la plus récente s'il y en
   * avait plusieurs), pour afficher soit le bouton "rejoindre" soit la classe + option de sortie. */
  const loadCurrentClass = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      setUserId(uid ?? null);
      if (!uid) {
        setCurrent(null);
        onClassChange?.(false);
        return;
      }
      const { data, error } = await supabase
        .from("class_students")
        .select("id, class_id, classes(name)")
        .eq("student_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setCurrent({
          membershipId: data.id,
          classId: data.class_id,
          name: (data as any).classes?.name || t("joinClass.myClass"),
        });
        onClassChange?.(true);
      } else {
        setCurrent(null);
        onClassChange?.(false);
      }
    } catch (e: any) {
      setCurrent(null);
      onClassChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentClass();
  }, []);

  /** Rejoint une classe via le code saisi, en passant par l'edge function
   * `join-class` (seule habilitée à valider le code côté serveur). */
  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error(t("joinClass.emptyCodeError"));
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("join-class", {
        body: { code: trimmed },
      });
      if (error) {
        toast.error(await extractFunctionErrorMessage(error));
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      const name = (data as any)?.class?.name || t("joinClass.defaultClassName");
      toast.success(t("joinClass.joinedSuccess", { name }));
      setCode("");
      setOpen(false);
      await loadCurrentClass();
    } catch (e: any) {
      toast.error(e.message || t("joinClass.unexpectedError"));
    } finally {
      setSaving(false);
    }
  };

  /** Quitte la classe actuelle (supprime la ligne class_students correspondante). */
  const handleLeave = async () => {
    if (!current) return;
    setLeaving(true);
    try {
      // Filtre défensif sur student_id en plus de l'id du lien : même si la
      // policy RLS de suppression s'avérait trop large, un élève ne pourrait
      // ainsi jamais supprimer le lien d'un AUTRE élève en devinant/rejouant
      // un membershipId qui ne lui appartient pas.
      const { error } = await supabase
        .from("class_students")
        .delete()
        .eq("id", current.membershipId)
        .eq("student_id", userId);
      if (error) throw error;
      toast.success(t("joinClass.leftClassSuccess"));
      setCurrent(null);
      onClassChange?.(false);
    } catch (e: any) {
      toast.error(e.message || t("joinClass.leaveError"));
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center gap-3 px-4 py-3.5 text-muted-foreground">
        <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
        <span className="text-sm">{t("joinClass.loading")}</span>
      </div>
    );
  }

  // Already in a class: show the class name + a trash button to leave.
  if (current) {
    return (
      <div className="w-full flex items-center gap-3 px-4 py-3.5">
        <span className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium">{t("joinClass.myClass")}</span>
          <span className="block text-xs text-muted-foreground truncate">{current.name}</span>
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 active:scale-90 transition-transform"
              aria-label={t("joinClass.leaveClassAria")}
            >
              {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("joinClass.leaveClassTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("joinClass.leaveClassDesc", { name: current.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t("joinClass.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeave}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("joinClass.leave")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Not in a class: show the join button + dialog.
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCode(""); }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
        >
          <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
            <Users className="h-4 w-4" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium">{t("joinClass.joinClassTitle")}</span>
            <span className="block text-xs text-muted-foreground">{t("joinClass.joinClassSubtitle")}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("joinClass.joinClassTitle")}</DialogTitle>
          <DialogDescription>
            {t("joinClass.dialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="class-code">{t("joinClass.codeLabel")}</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="class-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder={t("joinClass.codePlaceholder")}
              maxLength={8}
              className="pl-9 rounded-xl font-mono tracking-wider"
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>{t("joinClass.cancel")}</Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("joinClass.joining")}</> : t("joinClass.join")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
