import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SCHOOL_LEVELS = [
  { value: "5eme_primaire", label: "5ème Primaire" },
  { value: "1ere_cem", label: "1ère CEM" },
  { value: "2eme_cem", label: "2ème CEM" },
  { value: "3eme_cem", label: "3ème CEM" },
  { value: "4eme_cem", label: "4ème CEM" },
  { value: "seconde", label: "Seconde" },
  { value: "premiere", label: "Première" },
  { value: "terminale", label: "Terminale" },
];

const FILIERE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  premiere: [
    { value: "tronc_commun_scientifique", label: "Tronc Commun Sciences" },
    { value: "tronc_commun_lettres", label: "Tronc Commun Lettres" },
  ],
  seconde: [
    { value: "sciences", label: "Sciences" },
    { value: "lettres", label: "Lettres" },
    { value: "gestion", label: "Gestion" },
    { value: "math_techniques", label: "Math techniques" },
    { value: "mathematiques", label: "Mathématiques" },
  ],
  terminale: [
    { value: "sciences", label: "Sciences" },
    { value: "lettres", label: "Lettres" },
    { value: "gestion", label: "Gestion" },
    { value: "math_techniques", label: "Math techniques" },
    { value: "mathematiques", label: "Mathématiques" },
  ],
};

interface CreateClassDialogProps {
  teacherId: string;
  establishmentId?: string | null;
  onCreated: () => void;
}

export default function CreateClassDialog({ teacherId, establishmentId, onCreated }: CreateClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [filiere, setFiliere] = useState("");
  const [saving, setSaving] = useState(false);

  const needsFiliere = ["premiere", "seconde", "terminale"].includes(schoolLevel);

  const reset = () => {
    setName("");
    setSchoolLevel("");
    setFiliere("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Veuillez nommer la classe.");
      return;
    }
    if (!schoolLevel) {
      toast.error("Veuillez choisir un niveau.");
      return;
    }
    if (needsFiliere && !filiere) {
      toast.error("Veuillez choisir une filière.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("classes").insert({
        teacher_id: teacherId,
        name: name.trim(),
        school_level: schoolLevel as any,
        filiere: needsFiliere ? filiere : null,
        subject: "math",
      });
      if (error) throw error;
      toast.success("Classe créée avec succès");
      reset();
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création de la classe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter une classe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle classe</DialogTitle>
          <DialogDescription>
            Créez une classe pour regrouper vos élèves et suivre leur progression.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="class-name">Nom de la classe *</Label>
            <Input
              id="class-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Terminale Spé Maths — TG1"
            />
          </div>
          <div className="space-y-2">
            <Label>Niveau scolaire *</Label>
            <Select value={schoolLevel} onValueChange={(v) => { setSchoolLevel(v); setFiliere(""); }}>
              <SelectTrigger><SelectValue placeholder="Sélectionnez un niveau" /></SelectTrigger>
              <SelectContent>
                {SCHOOL_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {needsFiliere && (
            <div className="space-y-2">
              <Label>Filière *</Label>
              <Select value={filiere} onValueChange={setFiliere}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez une filière" /></SelectTrigger>
                <SelectContent>
                  {(FILIERE_OPTIONS[schoolLevel] || []).map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Création...</> : "Créer la classe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
