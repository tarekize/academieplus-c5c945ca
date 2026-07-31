import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronLeft, Save, Send, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import ExamViewer from "./ExamViewer";
import { ExamExercise, ExamRecord, ExamStatus, EXAM_STATUS_META, TRIMESTER_LABELS, trimesterOptions } from "@/lib/examTypes";
import { logPedagoActivity } from "@/lib/pedagoActivityLog";

interface ExamHistoryListProps {
  subject: string;
  schoolLevel: string;
  filiereId: string | null;
  isTerminale: boolean;
  onChanged: () => void;
}

export default function ExamHistoryList({ subject, schoolLevel, filiereId, isTerminale, onChanged }: ExamHistoryListProps) {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [trimesterFilter, setTrimesterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState<ExamRecord | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [exercises, setExercises] = useState<ExamExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    let query = supabase
      .from("exams" as any)
      .select("*")
      .eq("subject", subject)
      .eq("school_level", schoolLevel)
      .order("created_at", { ascending: false });
    query = filiereId ? query.eq("filiere_id", filiereId) : query.is("filiere_id", null);
    const { data, error } = await query;
    if (!error && data) setExams(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, schoolLevel, filiereId]);

  const openExam = (exam: ExamRecord) => {
    setOpen(exam);
    setTitle(exam.title_ar || exam.title || "");
    setDuration(exam.duration_minutes || 60);
    setExercises(Array.isArray(exam.content) ? exam.content : []);
  };

  const editable = open ? (open.status === "draft" || open.status === "rejected") : false;

  const saveDraft = async (): Promise<boolean> => {
    if (!open) return false;
    setSaving(true);
    try {
      const { error } = await supabase.rpc("save_exam_draft" as any, {
        p_exam_id: open.id,
        p_subject: subject,
        p_school_level: schoolLevel,
        p_filiere_id: filiereId,
        p_trimester: open.trimester,
        p_title: title,
        p_title_ar: title,
        p_duration_minutes: duration,
        p_content: exercises,
        p_chapter_ids: open.chapter_ids,
        p_source: open.source,
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
    if (!open) return;
    setSubmitting(true);
    try {
      const ok = await saveDraft();
      if (!ok) return;
      const { error } = await supabase.rpc("submit_exam_for_review" as any, { p_exam_id: open.id });
      if (error) throw error;
      logPedagoActivity({ action: "update", entityType: "exam", entityId: open.id, entityTitle: title, subject, schoolLevel });
      toast.success("Examen envoyé pour validation");
      setOpen(null);
      fetchList();
      onChanged();
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (open) {
    const meta = EXAM_STATUS_META[open.status];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setOpen(null)}>
            <ChevronLeft className="h-4 w-4" /> Retour à la liste
          </Button>
          <Badge className={meta.className}>{meta.label}</Badge>
        </div>

        {open.status === "rejected" && open.rejection_reason && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive mb-1">Motif du refus :</p>
            <p className="text-destructive/90 whitespace-pre-wrap break-words">{open.rejection_reason}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Titre de l'examen</label>
            <Input className="mt-1" value={title} disabled={!editable} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Durée (minutes)</label>
            <Input type="number" className="mt-1" value={duration} disabled={!editable} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
        </div>

        <ExamViewer exercises={exercises} editable={editable} onChange={editable ? setExercises : undefined} />

        {editable && (
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
        )}
      </div>
    );
  }

  const filtered = exams.filter((e) => {
    if (trimesterFilter !== "all" && String(e.trimester) !== trimesterFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={trimesterFilter} onValueChange={setTrimesterFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Trimestre" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les trimestres</SelectItem>
            {trimesterOptions(isTerminale).map((t) => (
              <SelectItem key={t} value={String(t)}>{TRIMESTER_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {(["draft", "pending", "approved", "rejected"] as ExamStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{EXAM_STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">Aucun examen pour ces filtres.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.map((exam) => {
            const meta = EXAM_STATUS_META[exam.status];
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => openExam(exam)}
                className="w-full flex items-center gap-3 rounded-xl border p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{exam.title_ar || exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {TRIMESTER_LABELS[exam.trimester]} · {format(new Date(exam.created_at), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <Badge className={meta.className}>{meta.label}</Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
