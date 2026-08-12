import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, Award } from "lucide-react";
import { toast } from "sonner";
import DocumentImportButton from "@/components/DocumentImportButton";
import { ExamExercise, trimesterOptions, TRIMESTER_LABELS } from "@/lib/examTypes";
import { GeneratedItem } from "@/lib/teacherContent";

interface ImportDocumentFlowProps {
  subject: string;
  schoolLevel: string;
  filiereId: string | null;
  isTerminale: boolean;
  /** Le brouillon vient d'être enregistré : le parent ferme la pop-up et
   * redirige vers la page complète d'édition de cet examen, où l'aperçu de
   * validation du contenu importé se fait. */
  onCreated: (examId: string) => void;
}

/** Import d'un document (PDF/Word/image) : l'IA extrait fidèlement les
 * exercices déjà présents (mode "Exactement les mêmes" de
 * DocumentImportButton, sans reformulation). */
export default function ImportDocumentFlow({ subject, schoolLevel, filiereId, isTerminale, onCreated }: ImportDocumentFlowProps) {
  const [trimester, setTrimester] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  /** Callback de DocumentImportButton une fois l'IA revenue avec les
   * exercices extraits du document : les convertit au format ExamExercise,
   * puis enregistre un brouillon d'examen via save_exam_draft. */
  const handleExtracted = async (items: GeneratedItem[]) => {
    const mapped: ExamExercise[] = items
      .filter((it) => (it.statement || "").trim() || (it.sub_questions && it.sub_questions.length >= 2))
      .map((it) => ({
        statement: it.statement || "",
        solution: it.solution || "",
        answer: it.expected_answer || "",
        sub_questions: it.sub_questions && it.sub_questions.length >= 2 ? it.sub_questions : undefined,
      }));
    if (mapped.length === 0) {
      toast.error("Aucun contenu exploitable trouvé dans ce document.");
      return;
    }

    setSaving(true);
    try {
      const title = `Examen — ${TRIMESTER_LABELS[trimester || 1]}`;
      const { data, error } = await supabase.rpc("save_exam_draft" as any, {
        p_exam_id: null,
        p_subject: subject,
        p_school_level: schoolLevel,
        p_filiere_id: filiereId,
        p_trimester: trimester,
        p_title: title,
        p_title_ar: title,
        p_duration_minutes: 60,
        p_content: mapped,
        p_chapter_ids: null,
        p_source: "import",
      });
      if (error) throw error;
      onCreated(data as string);
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setSaving(false);
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

  if (saving) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Enregistrement du brouillon…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center py-6">
      <p className="text-sm text-muted-foreground">
        Importez le document de l'examen : le contenu est retranscrit fidèlement (choisissez "Exactement les mêmes"). Vous pourrez valider l'aperçu sur la page suivante.
      </p>
      <DocumentImportButton contentType="exam" onExtracted={handleExtracted} label="Importer un document" className="mx-auto" />
    </div>
  );
}
