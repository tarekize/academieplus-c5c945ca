import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

export default function JoinClassDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

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
    } catch (e: any) {
      toast.error(e.message || "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  };

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
