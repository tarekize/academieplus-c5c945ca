import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Send, Clock, CheckCircle, XCircle, Inbox } from "lucide-react";

interface ReclamationDialogProps {
  userRole: "student" | "teacher";
  trigger?: React.ReactNode;
}

interface Reclamation {
  id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  created_at: string;
}

const SUBJECTS = [
  "Problème technique",
  "Contenu pédagogique",
  "Gestion de compte",
  "Problème d'abonnement",
  "Gestion de classe",
  "Autre",
];

const statusBadge = (status: string) => {
  if (status === "resolved")
    return (
      <Badge className="gap-1 rounded-full border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        <CheckCircle className="h-3 w-3" />Résolu
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="gap-1 rounded-full border-red-200 bg-red-100 text-red-700 hover:bg-red-100">
        <XCircle className="h-3 w-3" />Rejeté
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1 rounded-full">
      <Clock className="h-3 w-3" />En attente
    </Badge>
  );
};

const ReclamationDialog = ({ userRole, trigger }: ReclamationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchReclamations = async () => {
    setLoadingList(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingList(false); return; }

    const { data, error } = await supabase
      .from("reclamations" as any)
      .select("id, subject, message, status, response, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setReclamations(data as any as Reclamation[]);
    setLoadingList(false);
  };

  useEffect(() => {
    if (open) fetchReclamations();
  }, [open]);

  const handleSubmit = async () => {
    if (!subject || !message.trim()) {
      toast.error("Champs requis", { description: "Veuillez remplir tous les champs." });
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

      toast.success("Réclamation envoyée", { description: "Votre réclamation a été transmise à l'établissement." });
      setSubject("");
      setMessage("");
      fetchReclamations();
    } catch (err: any) {
      toast.error("Erreur", { description: err.message });
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
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
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

          <div className="pt-2 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Mes réclamations précédentes</h3>
            {loadingList ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : reclamations.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border/50">
                <CardContent className="py-8 text-center space-y-2">
                  <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Aucune réclamation soumise.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reclamations.map((r) => (
                  <Card key={r.id} className="rounded-2xl border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-medium text-sm">{r.subject}</p>
                        {statusBadge(r.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{r.message}</p>
                      {r.response && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-2">
                          <p className="text-xs font-medium text-emerald-700 mb-1">Réponse de l'établissement :</p>
                          <p className="text-sm text-emerald-800">{r.response}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReclamationDialog;
