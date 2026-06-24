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
  join_code?: string | null;
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

interface LessonRow {
  id: string;
  title: string;
  chapter_id: string;
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
  lessonLevels: Record<string, number | null>;
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
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [students, setStudents] = useState<ComputedStudent[]>([]);
  

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Class members
      const { data: members, error: memErr } = await supabase
        .from("class_students")
        .select("id, student_id")
        .eq("class_id", classRow.id);
      if (memErr) throw memErr;

      const memberRows = (members as any[]) || [];
      const studentIds = memberRows.map((m) => m.student_id);

      // 1b. Member profiles
      let profilesById: Record<string, StudentProfile> = {};
      if (studentIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, school_level, filiere, avatar_url")
          .in("id", studentIds);
        for (const p of (profs as any[]) || []) profilesById[p.id] = p as StudentProfile;
      }

      // 2. Resolve the class filière to its id (chapters are filière-specific)
      let filiereId: string | null = null;
      if (classRow.school_level && classRow.filiere) {
        const { data: fil } = await supabase
          .from("filieres")
          .select("id, code, name")
          .eq("school_level", classRow.school_level as any);
        const match = ((fil as any[]) || []).find(
          (f) => f.code === classRow.filiere || f.name === classRow.filiere,
        );
        filiereId = match?.id ?? null;
      }

      // 2b. Chapters for the class level + filière (avoids cross-filière duplicates)
      let chapterRows: ChapterRow[] = [];
      if (classRow.school_level) {
        let q = supabase
          .from("chapters")
          .select("id, title, order_index, filiere_id")
          .eq("school_level", classRow.school_level as any);
        if (filiereId) q = q.eq("filiere_id", filiereId);
        const { data: chs } = await q.order("order_index", { ascending: true });
        chapterRows = (chs as any[]) || [];
      }
      setChapters(chapterRows);

      // 2c. Lessons for all chapters of the level (the "notions")
      let lessonRows: LessonRow[] = [];
      if (chapterRows.length > 0) {
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("id, title, chapter_id, order_index")
          .in("chapter_id", chapterRows.map((c) => c.id))
          .order("order_index", { ascending: true });
        const orderByChapter: Record<string, number> = {};
        chapterRows.forEach((c, i) => { orderByChapter[c.id] = i; });
        lessonRows = ((lessonsData as any[]) || []).slice().sort((a, b) => {
          const ca = orderByChapter[a.chapter_id] ?? 999;
          const cb = orderByChapter[b.chapter_id] ?? 999;
          if (ca !== cb) return ca - cb;
          return (a.order_index || 0) - (b.order_index || 0);
        });
      }
      setLessons(lessonRows);

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
      const computed: ComputedStudent[] = memberRows
        .filter((m) => profilesById[m.student_id])
        .map((m) => {
        const p = profilesById[m.student_id];
        const own = scoreRows.filter((s) => s.user_id === p.id);

        // Per lesson (notion) average level
        const lessonLevels: Record<string, number | null> = {};
        for (const ls of lessonRows) {
          const rows = own.filter((s) => s.lesson_id === ls.id && (s.total_answers || 0) > 0);
          if (rows.length === 0) {
            lessonLevels[ls.id] = null;
          } else {
            const avg = rows.reduce((a, s) => a + (s.current_level || 0), 0) / rows.length;
            lessonLevels[ls.id] = Math.round(avg);
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
          lessonLevels,
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
      const n = Object.values(s.lessonLevels).filter((l) => l !== null && (l as number) < 20).length;
      return a + n;
    }, 0);
    const mastered = students.filter((s) => s.global >= 75).length;
    return { total, active, avg, blocages, mastered };
  }, [students]);

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
          {(() => {
            const chapterGroups = chapters
              .map((ch) => ({ ch, lessons: lessons.filter((l) => l.chapter_id === ch.id) }))
              .filter((g) => g.lessons.length > 0);
            const flatLessons = chapterGroups.flatMap((g) => g.lessons);
            const groupStartIds = new Set(chapterGroups.map((g) => g.lessons[0]?.id).filter(Boolean));
            const sepClass = (id: string) => (groupStartIds.has(id) ? "border-l-2 border-border pl-1" : "");

            if (flatLessons.length === 0) {
              return <p className="text-sm text-muted-foreground">Aucune leçon disponible pour ce niveau.</p>;
            }

            return (
              <div className="overflow-x-auto">
                <table className="border-separate" style={{ borderSpacing: "2px" }}>
                  <thead>
                    {/* Chapter grouping row */}
                    <tr>
                      <th rowSpan={2} className="text-left text-xs font-medium text-muted-foreground sticky left-0 bg-background pr-3 min-w-[200px] align-bottom">Élève</th>
                      {chapterGroups.map((g) => (
                        <th
                          key={g.ch.id}
                          colSpan={g.lessons.length}
                          title={g.ch.title}
                          className="text-[10px] font-semibold text-foreground/80 px-1 pb-1 border-b border-l-2 border-border text-center"
                        >
                          <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {g.ch.title.length > 22 ? g.ch.title.slice(0, 22) + "…" : g.ch.title}
                          </div>
                        </th>
                      ))}
                      <th rowSpan={2} className="text-xs font-medium text-muted-foreground px-2 align-bottom">Score</th>
                      <th rowSpan={2} className="text-xs font-medium text-muted-foreground px-1 align-bottom">Gr.</th>
                    </tr>
                    {/* Lesson (notion) row */}
                    <tr>
                      {flatLessons.map((ls) => (
                        <th key={ls.id} title={ls.title} className={`text-[10px] font-medium text-muted-foreground align-bottom h-20 ${sepClass(ls.id)}`}>
                          <div className="rotate-180 [writing-mode:vertical-rl] mx-auto max-h-20 overflow-hidden whitespace-nowrap">
                            {ls.title.length > 22 ? ls.title.slice(0, 22) + "…" : ls.title}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.profile.id}>
                        <td className="sticky left-0 bg-background pr-3 align-top py-2">
                          <div className="space-y-1.5">
                            <button
                              onClick={() => onOpenStudentDetail(s.profile)}
                              className="text-sm font-medium text-foreground hover:text-primary hover:underline whitespace-nowrap text-left block"
                            >
                              {fullName(s.profile)}
                            </button>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenStudentDetail(s.profile)}
                                className="gap-1 h-7"
                              >
                                Voir en détail <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudent(s.linkId)}
                                className="text-destructive h-7 px-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </td>
                        {flatLessons.map((ls) => {
                          const lvl = s.lessonLevels[ls.id];
                          return (
                            <td key={ls.id} className={`align-top ${sepClass(ls.id)}`}>
                              <div
                                title={`${ls.title} : ${lvl === null ? "Non évalué" : lvl + "%"}`}
                                className={`w-5 h-5 rounded-sm ${cellColor(lvl)} cursor-default`}
                              />
                            </td>
                          );
                        })}
                        <td className="px-2 text-center align-top">
                          <span className="text-sm font-semibold">
                            {s.answered ? `${s.global}%` : "—"}
                          </span>
                        </td>
                        <td className="px-1 text-center align-top">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${GROUP_INFO[s.group].tone}`}>
                            {s.group}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
