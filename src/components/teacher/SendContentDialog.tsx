import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";

interface ClassOption {
  id: string;
  name: string;
  school_level: string | null;
  filiere: string | null;
}

interface SendContentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  teacherId: string;
  schoolLevel?: string | null;
  onConfirm: (classIds: string[]) => Promise<void> | void;
}

export default function SendContentDialog({
  open, onOpenChange, teacherId, schoolLevel, onConfirm,
}: SendContentDialogProps) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    (async () => {
      setLoading(true);
      let q = supabase
        .from("classes")
        .select("id, name, school_level, filiere")
        .eq("teacher_id", teacherId);
      if (schoolLevel) q = q.eq("school_level", schoolLevel as any);
      const { data } = await q.order("created_at", { ascending: false });
      setClasses((data as ClassOption[]) || []);
      setLoading(false);
    })();
  }, [open, teacherId, schoolLevel]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const handleSend = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast.error("Sélectionnez au moins une classe.");
      return;
    }
    setSending(true);
    try {
      await onConfirm(ids);
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer aux classes</DialogTitle>
          <DialogDescription>
            Choisissez les classes qui recevront ce contenu
            {schoolLevel ? ` (niveau ${getSchoolLevelLabel(schoolLevel)})` : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-2 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune classe correspondante pour ce niveau.
            </p>
          ) : (
            classes.map((c) => (
              <label key={c.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <Checkbox checked={!!selected[c.id]} onCheckedChange={() => toggle(c.id)} />
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getSchoolLevelLabel(c.school_level || "")}{c.filiere ? ` · ${c.filiere}` : ""}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSend} disabled={sending || loading} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Confirmer l'envoi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
