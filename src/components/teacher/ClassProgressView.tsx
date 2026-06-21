import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeGlobal } from "@/lib/levelEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users, Target, AlertTriangle, TrendingUp, ChevronRight, Trash2 } from "lucide-react";
import { getSchoolLevelLabel } from "@/lib/validation";
import { toast } from "sonner";

export interface ClassRow {
  id: string;
  name: string;
  school_level: string | null;
  filiere: string | null;
  subject: string;
}

interface StudentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school_level: string | null;
  filiere: string | null;
  avatar_url: string | null;
}

interface ChapterRow {
  id: string;
  title: string;
  order_index: number;
}

interface ScoreRow {
  user_id: string;
  chapter_id: string | null;
  lesson_id: string | null;
  current_level: number;
  total_answers: number;
}

interface ComputedStudent {
  profile: StudentProfile;
  linkId: string;
  global: number;
  group: "A" | "B" | "C" | "D";
  chapterLevels: Record<string, number | null>;
  answered: boolean;
}

const GROUP_INFO: Record<string, { label: string; tone: string }> = {
  A: { label: "Avancé — maîtrise solide", tone: "bg-blue-600 text-white" },
  B: { label: "Intermédiaire — en progression", tone: "bg-green-600 text-white" },
  C: { label: "Fragile — à consolider", tone: "bg-amber-600 text-white" },
  D: { label: "En difficulté — accompagnement", tone: "bg-red-500 text-white" },
};

function groupFromPct(pct: number): "A" | "B" | "C" | "D" {
  if (pct >= 70) return "A";
  if (pct >= 50) return "B";
  if (pct >= 30) return "C";
  return "D";
}

function cellColor(level: number | null): string {
  if (level === null || level === undefined) return "bg-muted";
  if (level >= 75) return "bg-blue-600";
  if (level >= 40) return "bg-green-600";
  if (level >= 20) return "bg-amber-700";
  return "bg-red-500";
}

function initials(p: StudentProfile): string {
  return [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}

function fullName(p: StudentProfile): string {
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || "Élève";
}

interface ClassProgressViewProps {
  classRow: ClassRow;
  onOpenStudentDetail: (student: StudentProfile) => void;
}

export default function ClassProgressView({ classRow, onOpenStudentDetail }: ClassProgressViewProps) {
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [students, setStudents] = useState<ComputedStudent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Class members
      const { data: members, error: memErr } = await supabase
        .from("class_students")
        .select("id, student_id, profiles:profiles!class_students_student_id_fkey(id, first_name, last_name, email, school_level, filiere, avatar_url)")
        .eq("class_id", classRow.id);
      if (memErr) throw memErr;

      const memberRows = ((members as any[]) || []).filter((m) => m.profiles);
      const studentIds = memberRows.map((m) => m.student_id);

      // 2. Chapters for the class level
      let chapterRows: ChapterRow[] = [];
      if (classRow.school_level) {
        const { data: chs } = await supabase
          .from("chapters")
          .select("id, title, order_index")
          .eq("school_level", classRow.school_level as any)
          .order("order_index", { ascending: true });
        chapterRows = (chs as any[]) || [];
      }
      setChapters(chapterRows);

      // 3. Scores for all students
      let scoreRows: ScoreRow[] = [];
      if (studentIds.length > 0) {
        const { data: scores } = await supabase
          .from("student_scores")
          .select("user_id, chapter_id, lesson_id, current_level, total_answers")
          .in("user_id", studentIds);
        scoreRows = (scores as any[]) || [];
      }

      // 4. Compute per student
      const computed: ComputedStudent[] = memberRows.map((m) => {
        const p = m.profiles as StudentProfile;
        const own = scoreRows.filter((s) => s.user_id === p.id);

        // Per chapter average level
        const chapterLevels: Record<string, number | null> = {};
        for (const ch of chapterRows) {
          const rows = own.filter((s) => s.chapter_id === ch.id && (s.total_answers || 0) > 0);
          if (rows.length === 0) {
            chapterLevels[ch.id] = null;
          } else {
            const avg = rows.reduce((a, s) => a + (s.current_level || 0), 0) / rows.length;
            chapterLevels[ch.id] = Math.round(avg);
          }
        }

        const g = computeGlobal(
          own.map((s) => ({ lesson_id: s.lesson_id, current_level: s.current_level, total_answers: s.total_answers })),
        );
        const answered = own.some((s) => (s.total_answers || 0) > 0);
        const pct = answered ? g.global : 0;

        return {
          profile: p,
          linkId: m.id,
          global: pct,
          group: groupFromPct(pct),
          chapterLevels,
          answered,
        };
      });

      // Sort by score descending (like the reference dashboard)
      computed.sort((a, b) => b.global - a.global);
      setStudents(computed);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du chargement de la classe");
    } finally {
      setLoading(false);
    }
  }, [classRow.id, classRow.school_level]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const removeStudent = async (linkId: string) => {
    try {
      const { error } = await supabase.from("class_students").delete().eq("id", linkId);
      if (error) throw error;
      toast.success("Élève retiré de la classe");
      fetchData();
    } catch (e: any) {
      toast.error("Impossible de retirer l'élève");
    }
  };

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.answered).length;
    const avg = total > 0 ? Math.round(students.reduce((a, s) => a + s.global, 0) / total) : 0;
    const blocages = students.reduce((a, s) => {
      const n = Object.values(s.chapterLevels).filter((l) => l !== null && (l as number) < 20).length;
      return a + n;
    }, 0);
    const mastered = students.filter((s) => s.global >= 75).length;
    return { total, active, avg, blocages, mastered };
  }, [students]);

  const selected = students.find((s) => s.profile.id === selectedId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center space-y-3">
          <Users className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">Aucun élève dans cette classe</h3>
          <p className="text-muted-foreground">
            Ajoutez des élèves avec leur code de liaison pour suivre leur progression.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.active}/{stats.total}</p>
                <p className="text-xs text-muted-foreground">Élèves actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avg}%</p>
                <p className="text-xs text-muted-foreground">Score classe moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.blocages}</p>
                <p className="text-xs text-muted-foreground">Blocages détectés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.mastered}</p>
                <p className="text-xs text-muted-foreground">Élèves &gt;75%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grille de progression — élèves × notions</CardTitle>
          <div className="flex flex-wrap gap-3 text-xs pt-2">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-600" /> Maîtrisé &gt;75%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-600" /> En ZPD 40-74%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-700" /> Lacune 20-39%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Blocage &lt;20%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-muted border" /> Non évalué</span>
          </div>
        </CardHeader>
        <CardContent>
          {chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun chapitre disponible pour ce niveau.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-separate" style={{ borderSpacing: "2px" }}>
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground sticky left-0 bg-background pr-3 min-w-[140px]">Élève</th>
                    {chapters.map((ch, i) => (
                      <th key={ch.id} title={ch.title} className="text-[10px] font-medium text-muted-foreground align-bottom h-16">
                        <div className="rotate-180 [writing-mode:vertical-rl] mx-auto max-h-16 overflow-hidden whitespace-nowrap">
                          {ch.title.length > 18 ? ch.title.slice(0, 18) + "…" : ch.title}
                        </div>
                      </th>
                    ))}
                    <th className="text-xs font-medium text-muted-foreground px-2">Score</th>
                    <th className="text-xs font-medium text-muted-foreground px-1">Gr.</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.profile.id}>
                      <td className="sticky left-0 bg-background pr-3">
                        <button
                          onClick={() => onOpenStudentDetail(s.profile)}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline whitespace-nowrap text-left"
                        >
                          {fullName(s.profile)}
                        </button>
                      </td>
                      {chapters.map((ch) => {
                        const lvl = s.chapterLevels[ch.id];
                        return (
                          <td key={ch.id}>
                            <div
                              title={`${ch.title} : ${lvl === null ? "Non évalué" : lvl + "%"}`}
                              className={`w-5 h-5 rounded-sm ${cellColor(lvl)} cursor-default`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-2 text-center">
                        <button
                          onClick={() => setSelectedId(s.profile.id)}
                          className="text-sm font-semibold hover:text-primary"
                        >
                          {s.answered ? `${s.global}%` : "—"}
                        </button>
                      </td>
                      <td className="px-1 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${GROUP_INFO[s.group].tone}`}>
                          {s.group}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sélectionner un élève</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {students.map((s) => (
              <Button
                key={s.profile.id}
                variant={selectedId === s.profile.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedId(s.profile.id)}
              >
                {fullName(s.profile)}
              </Button>
            ))}
          </div>

          {selected && (
            <div className="mt-6 rounded-lg border p-5 space-y-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials(selected.profile)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{fullName(selected.profile)}</p>
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <Badge className={GROUP_INFO[selected.group].tone}>
                        {selected.group} — {GROUP_INFO[selected.group].label}
                      </Badge>
                      <span className="text-muted-foreground">
                        {getSchoolLevelLabel(selected.profile.school_level || "")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenStudentDetail(selected.profile)} className="gap-1">
                    Voir en détail <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeStudent(selected.linkId)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Score global : </span>
                  <span className="font-bold">{selected.answered ? `${selected.global}%` : "Non évalué"}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Progression par notion</p>
                <div className="space-y-2">
                  {chapters.map((ch) => {
                    const lvl = selected.chapterLevels[ch.id];
                    return (
                      <div key={ch.id} className="flex items-center gap-3">
                        <span className="text-xs w-44 shrink-0 truncate" title={ch.title}>{ch.title}</span>
                        <Progress value={lvl ?? 0} className="h-2 flex-1" />
                        <span className="text-xs w-12 text-right text-muted-foreground">
                          {lvl === null ? "—" : `${lvl}%`}
                        </span>
                      </div>
                    );
                  })}
                  {chapters.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucune notion disponible.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
