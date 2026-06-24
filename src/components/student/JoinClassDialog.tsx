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
import { Users, Loader2, Hash, GraduationCap, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CurrentClass {
  membershipId: string;
  classId: string;
  name: string;
}

export default function JoinClassDialog() {
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
      } else {
        setCurrent(null);
      }
    } catch (e: any) {
      setCurrent(null);
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
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression du lien");
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" className="gap-2 rounded-xl" disabled>
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
      </Button>
    );
  }

  // Already in a class: show the class name + a trash button to leave.
  if (current) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">{current.name}</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              aria-label="Quitter la classe"
            >
              {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Quitter la classe ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous allez supprimer votre lien avec « {current.name} ». Vous pourrez
                ensuite saisir un autre code pour rejoindre une nouvelle classe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeave}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        <Button variant="outline" className="gap-2 rounded-xl">
          <Users className="h-4 w-4" /> Rejoindre une classe
        </Button>
      </DialogTrigger>
      <DialogContent>
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
              className="pl-9 font-mono tracking-wider"
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ajout...</> : "Rejoindre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
