import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Clock, CheckCircle, Loader2, Send } from "lucide-react";

interface Reclamation {
  id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  created_at: string;
  resolved_at: string | null;
}

const SUBJECTS = [
  "Problème technique",
  "Contenu pédagogique",
  "Gestion de compte",
  "Gestion de classe",
  "Problème d'abonnement",
  "Autre",
];

interface Props {
  onBack: () => void;
}

export default function TeacherReclamationPanel({ onBack }: Props) {
  const { toast } = useToast();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReclamations();
  }, []);

  const fetchReclamations = async () => {
    setLoadingList(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from("reclamations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setReclamations(data);
    setLoadingList(false);
  };

  const handleSubmit = async () => {
    if (!subject || !message.trim()) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await (supabase as any).from("reclamations").insert({
        user_id: user.id,
        user_role: "teacher",
        subject,
        message: message.trim(),
      });

      if (error) throw error;

      toast({ title: "Réclamation envoyée", description: "Votre réclamation a été transmise à l'établissement." });
      setSubject("");
      setMessage("");
      fetchReclamations();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "resolved") return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Résolu</Badge>;
    if (status === "rejected") return <Badge variant="destructive">Rejeté</Badge>;
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h1 className="text-xl font-bold">Réclamations</h1>
        </div>
      </div>

      {/* New reclamation form */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nouvelle réclamation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              className="rounded-xl min-h-[100px] resize-none"
              disabled={submitting}
            />
          </div>
          <Button
            className="w-full rounded-xl"
            onClick={handleSubmit}
            disabled={submitting || !subject || !message.trim()}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Envoyer la réclamation
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <div>
        <h2 className="text-base font-semibold mb-3 text-muted-foreground">Mes réclamations précédentes</h2>
        {loadingList ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : reclamations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune réclamation soumise.</p>
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
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
                      <p className="text-xs font-medium text-green-700 mb-1">Réponse de l'établissement :</p>
                      <p className="text-sm text-green-800">{r.response}</p>
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
  );
}
