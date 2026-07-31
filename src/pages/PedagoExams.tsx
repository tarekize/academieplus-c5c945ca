import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { Loader2, FileText } from "lucide-react";
import ExamCellDialog from "@/components/exams/ExamCellDialog";

interface SubjectCol {
  id: string;
  name: string;
  name_ar: string | null;
}

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

export default function PedagoExams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectCol[]>([]);
  const [rows, setRows] = useState<RowDef[]>([]);
  const [cellStatus, setCellStatus] = useState<Record<string, "pending" | "rejected" | null>>({});
  const [selectedCell, setSelectedCell] = useState<{ subject: SubjectCol; row: RowDef } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: subjectRows } = await supabase
        .from("pedago_subjects" as any)
        .select("subject_id, subjects:subject_id(id, name, name_ar)")
        .eq("user_id", user.id);
      const subs: SubjectCol[] = ((subjectRows as any[]) || [])
        .map((r) => r.subjects)
        .filter(Boolean)
        .map((s: any) => ({ id: s.id, name: s.name, name_ar: s.name_ar }));
      setSubjects(subs);

      const allRows: RowDef[] = [];
      for (const level of SCHOOL_LEVELS) {
        if (LEVELS_WITH_FILIERES.includes(level.id)) {
          const { data: filieres } = await supabase
            .from("filieres")
            .select("id, code, name")
            .eq("school_level", level.id as any)
            .order("name");
          (filieres || []).forEach((f: any) => {
            allRows.push({
              key: `${level.id}|${f.id}`,
              schoolLevel: level.id,
              levelName: level.name,
              filiereId: f.id,
              filiereCode: f.code,
              filiereName: f.name,
            });
          });
        } else {
          allRows.push({ key: `${level.id}|`, schoolLevel: level.id, levelName: level.name, filiereId: null, filiereCode: null, filiereName: null });
        }
      }
      setRows(allRows);

      if (subs.length > 0) {
        const { data: examRows } = await supabase
          .from("exams" as any)
          .select("subject, school_level, filiere_id, status")
          .in("subject", subs.map((s) => s.id));
        const map: Record<string, "pending" | "rejected" | null> = {};
        ((examRows as any[]) || []).forEach((e) => {
          const key = `${e.subject}|${e.school_level}|${e.filiere_id || ""}`;
          if (e.status === "rejected") map[key] = "rejected";
          else if (e.status === "pending" && map[key] !== "rejected") map[key] = "pending";
        });
        setCellStatus(map);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const cellKey = (subjectId: string, row: RowDef) => `${subjectId}|${row.schoolLevel}|${row.filiereId || ""}`;

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (subjects.length === 0) {
      return <p className="text-center text-muted-foreground py-20">Aucune matière ne vous a été assignée. Contactez l'administrateur.</p>;
    }
    return (
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-secondary/50">
              <th className="p-3 text-left font-semibold sticky left-0 bg-secondary/50 z-10">Niveau / Filière</th>
              {subjects.map((s) => (
                <th key={s.id} className="p-3 text-center font-semibold whitespace-nowrap">{s.name_ar || s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t hover:bg-secondary/20">
                <td className="p-3 font-medium sticky left-0 bg-background z-10 whitespace-nowrap">
                  {row.levelName}{row.filiereName ? ` — ${row.filiereName}` : ""}
                </td>
                {subjects.map((s) => {
                  const status = cellStatus[cellKey(s.id, row)];
                  return (
                    <td key={s.id} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedCell({ subject: s, row })}
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        aria-label={`Examens ${s.name} ${row.levelName}`}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {status && (
                          <span
                            className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background ${status === "rejected" ? "bg-red-500" : "bg-amber-500"}`}
                          />
                        )}
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
  }, [loading, subjects, rows, cellStatus]);

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Examens"
        subtitle="Créez et gérez les examens par matière et niveau/filière"
        titleIcon={FileText}
        onBack={() => navigate("/dashboard")}
        showProfileMenu={false}
      />
      <main className="container mx-auto px-4 py-8">{content}</main>

      {selectedCell && (
        <ExamCellDialog
          open={!!selectedCell}
          onOpenChange={(open) => { if (!open) setSelectedCell(null); }}
          subject={selectedCell.subject.id}
          subjectName={selectedCell.subject.name_ar || selectedCell.subject.name}
          schoolLevel={selectedCell.row.schoolLevel}
          levelName={selectedCell.row.levelName}
          filiereId={selectedCell.row.filiereId}
          filiereName={selectedCell.row.filiereName}
          isTerminale={selectedCell.row.schoolLevel === "terminale"}
        />
      )}
    </div>
  );
}
