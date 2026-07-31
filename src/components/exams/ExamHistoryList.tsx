import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExamRecord, ExamStatus, EXAM_STATUS_META, TRIMESTER_LABELS, trimesterOptions } from "@/lib/examTypes";

interface ExamHistoryListProps {
  subject: string;
  schoolLevel: string;
  filiereId: string | null;
  isTerminale: boolean;
  /** Ouvre la page complète d'édition/consultation de cet examen. */
  onOpenExam: (examId: string) => void;
}

/** Liste filtrable des examens précédents pour cette matière/niveau/filière.
 * Cliquer sur un élément redirige vers la page complète de l'examen (pas de
 * pop-up) — éditable si brouillon/refusé, aperçu lecture seule sinon. */
export default function ExamHistoryList({ subject, schoolLevel, filiereId, isTerminale, onOpenExam }: ExamHistoryListProps) {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [trimesterFilter, setTrimesterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
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
    })();
  }, [subject, schoolLevel, filiereId]);

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
                onClick={() => onOpenExam(exam.id)}
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
