import { useEffect, useState } from "react";
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

interface CurrentClass {
  membershipId: string;
  classId: string;
  name: string;
}

interface JoinClassDialogProps {
  onClassChange?: (hasClass: boolean) => void;
}

export default function JoinClassDialog({ onClassChange }: JoinClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [current, setCurrent] = useState<CurrentClass | null>(null);

  const loadCurrentClass = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
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
          name: (data as any).classes?.name || "Ma classe",
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

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Veuillez entrer le code de la classe.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("join-class", {
        body: { code: trimmed },
      });
      if (error) {
        const msg = (data as any)?.error || error.message || "Erreur lors de l'ajout";
        toast.error(msg);
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      const name = (data as any)?.class?.name || "la classe";
      toast.success(`Vous avez rejoint ${name}`);
      setCode("");
      setOpen(false);
      await loadCurrentClass();
    } catch (e: any) {
      toast.error(e.message || "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    if (!current) return;
    setLeaving(true);
    try {
      const { error } = await supabase
        .from("class_students")
        .delete()
        .eq("id", current.membershipId);
      if (error) throw error;
      toast.success("Vous avez quitté la classe.");
      setCurrent(null);
      onClassChange?.(false);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression du lien");
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
        <span className="text-sm">Chargement...</span>
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
          <span className="block text-sm font-medium">Ma classe</span>
          <span className="block text-xs text-muted-foreground truncate">{current.name}</span>
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 active:scale-90 transition-transform"
              aria-label="Quitter la classe"
            >
              {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Quitter la classe ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous allez supprimer votre lien avec « {current.name} ». Vous pourrez
                ensuite saisir un autre code pour rejoindre une nouvelle classe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeave}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Quitter
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
            <span className="block text-sm font-medium">Rejoindre une classe</span>
            <span className="block text-xs text-muted-foreground">Avec le code fourni par votre enseignant</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Rejoindre une classe</DialogTitle>
          <DialogDescription>
            Saisissez le code de la classe fourni par votre enseignant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="class-code">Code de la classe</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="class-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex : A1B2C3D4"
              className="pl-9 rounded-xl font-mono tracking-wider"
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Annuler</Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ajout...</> : "Rejoindre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
