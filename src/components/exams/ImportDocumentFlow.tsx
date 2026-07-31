import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Send, Star, Award } from "lucide-react";
import { toast } from "sonner";
import DocumentImportButton from "@/components/DocumentImportButton";
import ExamViewer from "./ExamViewer";
import { ExamExercise, trimesterOptions, TRIMESTER_LABELS } from "@/lib/examTypes";
import { GeneratedItem } from "@/lib/teacherContent";
import { logPedagoActivity } from "@/lib/pedagoActivityLog";

interface ImportDocumentFlowProps {
  subject: string;
  schoolLevel: string;
  filiereId: string | null;
  isTerminale: boolean;
  onDone: () => void;
}

/** Import d'un document (PDF/Word/image) : l'IA extrait fidèlement les
 * exercices déjà présents (mode "Exactement les mêmes" de
 * DocumentImportButton, sans reformulation), puis un aperçu permet de
 * valider/ajuster le contenu avant d'enregistrer le brouillon. */
export default function ImportDocumentFlow({ subject, schoolLevel, filiereId, isTerminale, onDone }: ImportDocumentFlowProps) {
  const [trimester, setTrimester] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ExamExercise[]>([]);
  const [examId, setExamId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleExtracted = (items: GeneratedItem[]) => {
    const mapped: ExamExercise[] = items
      .filter((it) => (it.statement || "").trim())
      .map((it) => ({ statement: it.statement || "", solution: it.solution || "", answer: it.expected_answer || "" }));
    if (mapped.length === 0) return;
    setExercises((prev) => [...prev, ...mapped]);
    if (!title) setTitle(`Examen — ${TRIMESTER_LABELS[trimester || 1]}`);
  };

  const saveDraft = async (): Promise<string | null> => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("save_exam_draft" as any, {
        p_exam_id: examId,
        p_subject: subject,
        p_school_level: schoolLevel,
        p_filiere_id: filiereId,
        p_trimester: trimester,
        p_title: title,
        p_title_ar: title,
        p_duration_minutes: duration,
        p_content: exercises,
        p_chapter_ids: null,
        p_source: "import",
      });
      if (error) throw error;
      setExamId(data as string);
      toast.success("Brouillon enregistré");
      return data as string;
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (exercises.length === 0) {
      toast.error("Importez au moins un exercice avant de soumettre.");
      return;
    }
    setSubmitting(true);
    try {
      const id = examId || (await saveDraft());
      if (!id) return;
      const { error } = await supabase.rpc("submit_exam_for_review" as any, { p_exam_id: id });
      if (error) throw error;
      logPedagoActivity({ action: "update", entityType: "exam", entityId: id, entityTitle: title, subject, schoolLevel });
      toast.success("Examen envoyé pour validation");
      onDone();
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (trimester === null) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Choisissez le trimestre de l'examen à importer.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {trimesterOptions(isTerminale).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrimester(t)}
              className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
            >
              {t === 4 && <Star className="h-4 w-4 text-violet-600" />}
              {t === 5 && <Award className="h-4 w-4 text-rose-600" />}
              <span className="font-medium text-sm">{TRIMESTER_LABELS[t]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Importez un document : le contenu est retranscrit fidèlement (choisissez "Exactement les mêmes"), puis validez l'aperçu ci-dessous.
        </p>
        <DocumentImportButton contentType="exam" onExtracted={handleExtracted} label="Importer un document" />
      </div>

      {exercises.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Titre de l'examen</Label>
              <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Durée (minutes)</Label>
              <Input type="number" className="mt-1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Aperçu de validation — vérifiez le contenu extrait avant de soumettre :</p>
          <ExamViewer exercises={exercises} mode="edit" onChange={setExercises} />
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
            <Button variant="outline" className="gap-2" disabled={saving} onClick={saveDraft}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer le brouillon
            </Button>
            <Button className="gap-2" disabled={submitting} onClick={submit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Soumettre à validation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
