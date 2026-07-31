import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, FileText, ChevronLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import ExamViewer from "@/components/exams/ExamViewer";
import { ExamRecord, TRIMESTER_LABELS, trimesterOptions, EXAM_STATUS_META } from "@/lib/examTypes";
import { SUBJECTS } from "@/lib/subjects";

interface RowDef {
  key: string;
  schoolLevel: string;
  levelName: string;
  filiereId: string | null;
  filiereCode: string | null;
  filiereName: string | null;
}

const SCHOOL_LEVELS: { id: string; name: string }[] = [
  { id: "5eme_primaire", name: "5ème Primaire" },
  { id: "1ere_cem", name: "1ère CEM" },
  { id: "2eme_cem", name: "2ème CEM" },
  { id: "3eme_cem", name: "3ème CEM" },
  { id: "4eme_cem", name: "4ème CEM" },
  { id: "premiere", name: "Première" },
  { id: "seconde", name: "Seconde" },
  { id: "terminale", name: "Terminale" },
];
const LEVELS_WITH_FILIERES = ["premiere", "seconde", "terminale"];

interface SelectedCell {
  subject: string;
  subjectName: string;
  schoolLevel: string;
  levelName: string;
  filiereId: string | null;
  filiereName: string | null;
}

export default function AdminExams() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RowDef[]>([]);
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [deepLinkTrimester, setDeepLinkTrimester] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const allRows: RowDef[] = [];
      for (const level of SCHOOL_LEVELS) {
        if (LEVELS_WITH_FILIERES.includes(level.id)) {
          const { data: filieres } = await supabase
            .from("filieres")
            .select("id, code, name")
            .eq("school_level", level.id as any)
            .order("name");
          (filieres || []).forEach((f: any) => {
            allRows.push({ key: `${level.id}|${f.id}`, schoolLevel: level.id, levelName: level.name, filiereId: f.id, filiereCode: f.code, filiereName: f.name });
          });
        } else {
          allRows.push({ key: `${level.id}|`, schoolLevel: level.id, levelName: level.name, filiereId: null, filiereCode: null, filiereName: null });
        }
      }
      setRows(allRows);

      const { data: pendingExams } = await supabase
        .from("exams" as any)
        .select("subject, school_level, filiere_id")
        .eq("status", "pending");
      const set = new Set<string>();
      ((pendingExams as any[]) || []).forEach((e) => set.add(`${e.subject}|${e.school_level}|${e.filiere_id || ""}`));
      setPendingCells(set);

      // Deep-link depuis /admin/validation ("Examiner") : subject + niveau (+
      // filiere en code, + trimestre) ouvrent directement la cellule visée.
      const subject = searchParams.get("subject");
      const niveau = searchParams.get("niveau");
      const filiereCode = searchParams.get("filiere");
      const trimester = searchParams.get("trimester");
      if (subject && niveau) {
        const row = allRows.find((r) => r.schoolLevel === niveau && (filiereCode ? r.filiereCode === filiereCode : !r.filiereId));
        const subjectDef = SUBJECTS.find((s) => s.id === subject);
        if (row) {
          setSelectedCell({
            subject, subjectName: subjectDef?.name || subject, schoolLevel: niveau, levelName: row.levelName,
            filiereId: row.filiereId, filiereName: row.filiereName,
          });
          if (trimester) setDeepLinkTrimester(Number(trimester));
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cellKey = (subjectId: string, row: RowDef) => `${subjectId}|${row.schoolLevel}|${row.filiereId || ""}`;

  if (selectedCell) {
    return (
      <AdminExamCellPanel
        cell={selectedCell}
        initialTrimester={deepLinkTrimester}
        onBack={() => { setSelectedCell(null); setDeepLinkTrimester(null); }}
      />
    );
  }

  const content = loading ? (
    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  ) : (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-secondary/50">
            <th className="p-3 text-left font-semibold sticky left-0 bg-secondary/50 z-10">Niveau / Filière</th>
            {SUBJECTS.map((s) => (
              <th key={s.id} className="p-3 text-center font-semibold whitespace-nowrap">{s.nameAr || s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t hover:bg-secondary/20">
              <td className="p-3 font-medium sticky left-0 bg-background z-10 whitespace-nowrap">
                {row.levelName}{row.filiereName ? ` — ${row.filiereName}` : ""}
              </td>
              {SUBJECTS.map((s) => {
                const hasPending = pendingCells.has(cellKey(s.id, row));
                return (
                  <td key={s.id} className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCell({
                        subject: s.id, subjectName: s.nameAr || s.name, schoolLevel: row.schoolLevel, levelName: row.levelName,
                        filiereId: row.filiereId, filiereName: row.filiereName,
                      })}
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      aria-label={`Examens ${s.name} ${row.levelName}`}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {hasPending && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-red-500 animate-pulse" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Examens"
        subtitle="Visualisation et validation des examens envoyés par les pédagogues"
        titleIcon={FileText}
        onBack={() => navigate("/dashboard")}
        showProfileMenu={false}
      />
      <main className="container mx-auto px-4 py-8">{content}</main>
    </div>
  );
}

function AdminExamCellPanel({ cell, initialTrimester, onBack }: { cell: SelectedCell; initialTrimester: number | null; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [reviewExam, setReviewExam] = useState<ExamRecord | null>(null);
  const isTerminale = cell.schoolLevel === "terminale";

  const fetchExams = async () => {
    setLoading(true);
    let query = supabase
      .from("exams" as any)
      .select("*")
      .eq("subject", cell.subject)
      .eq("school_level", cell.schoolLevel)
      .order("created_at", { ascending: false });
    query = cell.filiereId ? query.eq("filiere_id", cell.filiereId) : query.is("filiere_id", null);
    const { data, error } = await query;
    if (!error && data) setExams(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell.subject, cell.schoolLevel, cell.filiereId]);

  useEffect(() => {
    if (!initialTrimester || loading) return;
    const pending = exams.find((e) => e.trimester === initialTrimester && e.status === "pending");
    if (pending) setReviewExam(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrimester, loading, exams]);

  const trimesters = trimesterOptions(isTerminale);

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title={`Examens — ${cell.subjectName}`}
        subtitle={`${cell.levelName}${cell.filiereName ? ` · ${cell.filiereName}` : ""}`}
        titleIcon={FileText}
        onBack={onBack}
        showProfileMenu={false}
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Retour à la grille
        </Button>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-3">
            {trimesters.map((t) => {
              const examsForT = exams.filter((e) => e.trimester === t).sort((a, b) => b.created_at.localeCompare(a.created_at));
              const pending = examsForT.find((e) => e.status === "pending");
              const latest = examsForT[0];
              return (
                <div key={t} className="rounded-2xl border p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {pending && <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />}
                    <span className="font-medium text-sm">{TRIMESTER_LABELS[t]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {latest ? (
                      <>
                        <Badge className={EXAM_STATUS_META[latest.status].className}>{EXAM_STATUS_META[latest.status].label}</Badge>
                        <Button size="sm" variant={pending ? "default" : "outline"} onClick={() => setReviewExam(pending || latest)}>
                          {pending ? "Examiner" : "Voir"}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Aucun examen envoyé</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {reviewExam && (
        <ExamReviewDialog
          exam={reviewExam}
          onClose={() => setReviewExam(null)}
          onDecided={() => { setReviewExam(null); fetchExams(); }}
        />
      )}
    </div>
  );
}

function ExamReviewDialog({ exam, onClose, onDecided }: { exam: ExamRecord; onClose: () => void; onDecided: () => void }) {
  const [reason, setReason] = useState("");
  const [showRefuse, setShowRefuse] = useState(false);
  const [busy, setBusy] = useState(false);
  const canDecide = exam.status === "pending";

  const approve = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("approve_exam" as any, { p_exam_id: exam.id });
      if (error) throw error;
      toast.success("Examen validé");
      onDecided();
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const refuse = async () => {
    if (!reason.trim()) {
      toast.error("Merci de préciser un motif de refus.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.rpc("reject_exam" as any, { p_exam_id: exam.id, p_reason: reason.trim() });
      if (error) throw error;
      toast.success("Examen refusé");
      onDecided();
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{exam.title_ar || exam.title}</DialogTitle>
          <p className="text-xs text-muted-foreground">{TRIMESTER_LABELS[exam.trimester]} · Envoyé par {exam.submitted_by_name || "Pédagogue"}</p>
        </DialogHeader>

        <ExamViewer exercises={exam.content} mode="preview" />

        {canDecide && (
          <>
            {showRefuse && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-destructive">Motif du refus (obligatoire)</label>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Expliquez pourquoi cet examen est refusé..." />
              </div>
            )}
            <DialogFooter className="gap-2">
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
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
