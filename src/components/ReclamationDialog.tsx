import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Send } from "lucide-react";

interface ReclamationDialogProps {
  userRole: "student" | "teacher";
  trigger?: React.ReactNode;
}

const SUBJECTS = [
  "Problème technique",
  "Contenu pédagogique",
  "Gestion de compte",
  "Problème d'abonnement",
  "Gestion de classe",
  "Autre",
];

const ReclamationDialog = ({ userRole, trigger }: ReclamationDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message.trim()) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("reclamations" as any).insert({
        user_id: user.id,
        user_role: userRole,
        subject,
        message: message.trim(),
      });

      if (error) throw error;

      toast({ title: "Réclamation envoyée", description: "Votre réclamation a été transmise à l'établissement." });
      setSubject("");
      setMessage("");
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-600 font-medium text-sm border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 group">
            <AlertCircle className="h-4 w-4" />
            Réclamation
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Soumettre une réclamation</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Motif</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Sélectionner un motif..." />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Décrivez votre problème en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl min-h-[120px] resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSubmit} disabled={loading || !subject || !message.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Envoyer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReclamationDialog;
