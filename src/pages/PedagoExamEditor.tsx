import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, FileText } from "lucide-react";
import { toast } from "sonner";
import ExamViewer from "@/components/exams/ExamViewer";
import DocumentImportButton from "@/components/DocumentImportButton";
import { ExamExercise, ExamRecord, TRIMESTER_LABELS, EXAM_STATUS_META } from "@/lib/examTypes";
import { GeneratedItem } from "@/lib/teacherContent";
import { logPedagoActivity } from "@/lib/pedagoActivityLog";

/** Page complète (pas de pop-up) où le pédago consulte/modifie un examen :
 * brouillon/refusé -> éditable ; soumis/validé -> aperçu identique à
 * l'élève, en lecture seule. Atteinte depuis la grille Examens (nouvel
 * examen généré/importé ou reprise d'un élément de l'historique). */
export default function PedagoExamEditor() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [exercises, setExercises] = useState<ExamExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchExam = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("exams" as any).select("*").eq("id", examId).maybeSingle();
    if (!error && data) {
      const row = data as any as ExamRecord;
      setExam(row);
      setTitle(row.title_ar || row.title || "");
      setDuration(row.duration_minutes || 60);
      setExercises(Array.isArray(row.content) ? row.content : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (examId) fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const editable = exam ? (exam.status === "draft" || exam.status === "rejected") : false;

  const saveDraft = async (): Promise<boolean> => {
    if (!exam) return false;
    setSaving(true);
    try {
      const { error } = await supabase.rpc("save_exam_draft" as any, {
        p_exam_id: exam.id,
        p_subject: exam.subject,
        p_school_level: exam.school_level,
        p_filiere_id: exam.filiere_id,
        p_trimester: exam.trimester,
        p_title: title,
        p_title_ar: title,
        p_duration_minutes: duration,
        p_content: exercises,
        p_chapter_ids: exam.chapter_ids,
        p_source: exam.source,
      });
      if (error) throw error;
      toast.success("Brouillon enregistré");
      return true;
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!exam) return;
    if (exercises.length === 0) {
      toast.error("Ajoutez au moins un exercice avant de soumettre.");
      return;
    }
    setSubmitting(true);
    try {
      const ok = await saveDraft();
      if (!ok) return;
      const { error } = await supabase.rpc("submit_exam_for_review" as any, { p_exam_id: exam.id });
      if (error) throw error;
      logPedagoActivity({ action: "update", entityType: "exam", entityId: exam.id, entityTitle: title, subject: exam.subject, schoolLevel: exam.school_level });
      toast.success("Examen envoyé pour validation");
      fetchExam();
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImported = (items: GeneratedItem[]) => {
    const mapped: ExamExercise[] = items
      .filter((it) => (it.statement || "").trim() || (it.sub_questions && it.sub_questions.length >= 2))
      .map((it) => ({
        statement: it.statement || "",
        solution: it.solution || "",
        answer: it.expected_answer || "",
        sub_questions: it.sub_questions && it.sub_questions.length >= 2 ? it.sub_questions : undefined,
      }));
    if (mapped.length === 0) return;
    setExercises((prev) => [...prev, ...mapped]);
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
        <AppHeader title="Examen" titleIcon={FileText} onBack={() => navigate("/pedago/examens")} showProfileMenu={false} />
        <main className="container mx-auto px-4 py-16 text-center text-muted-foreground">Examen introuvable.</main>
      </div>
    );
  }

  const meta = EXAM_STATUS_META[exam.status];

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title={title || "Examen"}
        subtitle={`${TRIMESTER_LABELS[exam.trimester]} · ${exam.subject} · ${exam.school_level}`}
        titleIcon={FileText}
        onBack={() => navigate("/pedago/examens")}
        showProfileMenu={false}
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge className={meta.className}>{meta.label}</Badge>
          {editable && (
            <DocumentImportButton contentType="exam" onExtracted={handleImported} label="Importer un document" variant="outline" />
          )}
        </div>

        {exam.status === "rejected" && exam.rejection_reason && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive mb-1">Motif du refus :</p>
            <p className="text-destructive/90 whitespace-pre-wrap break-words">{exam.rejection_reason}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Titre de l'examen</Label>
            <Input className="mt-1" value={title} disabled={!editable} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Durée (minutes)</Label>
            <Input type="number" className="mt-1" value={duration} disabled={!editable} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
        </div>

        <ExamViewer exercises={exercises} mode={editable ? "edit" : "preview"} onChange={editable ? setExercises : undefined} />

        {editable && (
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="gap-2" disabled={saving} onClick={saveDraft}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer le brouillon
            </Button>
            <Button className="gap-2" disabled={submitting} onClick={submit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Soumettre à validation
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
