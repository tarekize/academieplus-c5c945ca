import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, FileText, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ExamViewer from "@/components/exams/ExamViewer";
import { ExamRecord, TRIMESTER_LABELS } from "@/lib/examTypes";

/** Page complète (pas de pop-up) où l'admin visualise un examen envoyé par
 * un pédago — exactement la même feuille que l'élève, sans zone de réponse
 * — le valide/refuse (motif obligatoire si refus), le supprime directement,
 * ou confirme/annule une demande de suppression du pédago. */
export default function AdminExamReview() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [reason, setReason] = useState("");
  const [showRefuse, setShowRefuse] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchExam = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("exams" as any).select("*").eq("id", examId).maybeSingle();
    if (!error && data) setExam(data as any);
    setLoading(false);
  };

  useEffect(() => {
    if (examId) fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const approve = async () => {
    if (!exam) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("approve_exam" as any, { p_exam_id: exam.id });
      if (error) throw error;
      toast.success("Examen validé");
      navigate("/admin/examens");
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const refuse = async () => {
    if (!exam) return;
    if (!reason.trim()) {
      toast.error("Merci de préciser un motif de refus.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.rpc("reject_exam" as any, { p_exam_id: exam.id, p_reason: reason.trim() });
      if (error) throw error;
      toast.success("Examen refusé");
      navigate("/admin/examens");
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const deleteExam = async () => {
    if (!exam) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("request_exam_deletion" as any, { p_exam_id: exam.id, p_reason: null });
      if (error) throw error;
      toast.success("Examen supprimé");
      navigate("/admin/examens");
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const confirmDeletion = async () => {
    if (!exam) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("approve_exam_deletion" as any, { p_exam_id: exam.id });
      if (error) throw error;
      toast.success("Suppression confirmée");
      navigate("/admin/examens");
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const cancelDeletion = async () => {
    if (!exam) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("reject_exam_deletion" as any, { p_exam_id: exam.id });
      if (error) throw error;
      toast.success("Demande de suppression annulée");
      fetchExam();
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen pro-shell">
        <AppHeader title="Examen" titleIcon={FileText} onBack={() => navigate("/admin/examens")} showProfileMenu={false} />
        <main className="container mx-auto px-4 py-16 text-center text-muted-foreground">Examen introuvable.</main>
      </div>
    );
  }

  const canDecide = exam.status === "pending";

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title={exam.title_ar || exam.title}
        subtitle={`${TRIMESTER_LABELS[exam.trimester]} · Envoyé par ${exam.submitted_by_name || "Pédagogue"}`}
        titleIcon={FileText}
        onBack={() => navigate("/admin/examens")}
        showProfileMenu={false}
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        {exam.deletion_requested && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-destructive">
              Suppression demandée par {exam.deletion_requested_by_name || "un pédagogue"}
            </p>
            {exam.deletion_reason && (
              <p className="text-sm text-destructive/90 whitespace-pre-wrap break-words">
                Motif : « {exam.deletion_reason} »
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelDeletion} disabled={busy}>Annuler la suppression</Button>
              <Button variant="destructive" onClick={confirmDeletion} disabled={busy} className="gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirmer la suppression
              </Button>
            </div>
          </div>
        )}

        <ExamViewer exercises={exam.content} mode="preview" examTitle={exam.title_ar || exam.title} />

        {canDecide && (
          <div className="space-y-3 border-t pt-4 sticky bottom-0 bg-background pb-3">
            {showRefuse && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-destructive">Motif du refus (obligatoire)</label>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Expliquez pourquoi cet examen est refusé..." />
              </div>
            )}
            <div className="flex justify-end gap-2">
              {showRefuse ? (
                <>
                  <Button variant="outline" onClick={() => setShowRefuse(false)} disabled={busy}>Annuler</Button>
                  <Button variant="destructive" onClick={refuse} disabled={busy} className="gap-2">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Confirmer le refus
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowRefuse(true)} disabled={busy} className="gap-2">
                    <X className="h-4 w-4" /> Refuser
                  </Button>
                  <Button onClick={approve} disabled={busy} className="gap-2">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Accepter
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {!exam.deletion_requested && (
          <div className="border-t pt-4 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" disabled={busy}>
                  <Trash2 className="h-4 w-4" /> Supprimer l'examen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cet examen ?</AlertDialogTitle>
                  <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteExam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </main>
    </div>
  );
}
