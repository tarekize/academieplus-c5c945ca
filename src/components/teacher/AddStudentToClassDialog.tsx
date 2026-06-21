import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

interface AddStudentToClassDialogProps {
  classId: string;
  onAdded: () => void;
}

export default function AddStudentToClassDialog({ classId, onAdded }: AddStudentToClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Veuillez entrer le code de l'élève.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("add-student-to-class", {
        body: { classId, code: trimmed },
      });
      if (error) {
        // Edge function returns the message inside data on non-2xx in some cases
        const msg = (data as any)?.error || error.message || "Erreur lors de l'ajout";
        toast.error(msg);
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      const s = (data as any)?.student;
      const fullName = s ? [s.first_name, s.last_name].filter(Boolean).join(" ") : "L'élève";
      toast.success(`${fullName} a été ajouté(e) à la classe`);
      setCode("");
      setOpen(false);
      onAdded();
    } catch (e: any) {
      toast.error(e.message || "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCode(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" /> Ajouter un élève
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un élève à la classe</DialogTitle>
          <DialogDescription>
            Saisissez le code de liaison de l'élève. Il le trouve dans son espace, rubrique « Mes informations ».
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="student-code">Code de l'élève</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="student-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex : a1b2c3d4"
              className="pl-9 font-mono tracking-wider"
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ajout...</> : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
