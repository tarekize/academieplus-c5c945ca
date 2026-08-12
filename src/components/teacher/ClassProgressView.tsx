import { Fragment, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeStudentGroup, GROUP_INFO, GROUP_ORDER, type StudentGroupLetter } from "@/lib/studentGrouping";
import { applyDecay } from "@/lib/levelEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users, Target, AlertTriangle, TrendingUp, ChevronRight, Trash2, RefreshCw, ClipboardCheck } from "lucide-react";
import { getSchoolLevelLabel } from "@/lib/validation";
import { toast } from "sonner";
import ClassContentTracking from "./ClassContentTracking";

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
  updated_at: string | null;
}

interface ComputedStudent {
  profile: StudentProfile;
  linkId: string;
  global: number;
  group: StudentGroupLetter;
  lessonLevels: Record<string, number | null>;
  answered: boolean;
}

// Couleur de la pastille de la grille de progression selon le niveau maîtrisé.
function cellColor(level: number | null): string {
  if (level === null || level === undefined) return "bg-muted";
  if (level >= 75) return "bg-blue-600";
  if (level >= 40) return "bg-green-600";
  if (level >= 20) return "bg-amber-700";
  return "bg-red-500";
}

// Initiales affichées dans l'avatar de repli d'un élève.
function initials(p: StudentProfile): string {
  return [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}

// Nom complet affichable d'un élève, avec repli si les deux champs sont vides.
function fullName(p: StudentProfile): string {
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || "Élève";
}

interface ClassProgressViewProps {
  classRow: ClassRow;
  onOpenStudentDetail: (student: StudentProfile) => void;
  readOnly?: boolean;
  teacherId?: string;
}

// Grille de progression d'une classe : un élève par ligne, une notion par
// colonne, coloriée selon le niveau maîtrisé. Utilisé à la fois côté
// enseignant (édition possible : retrait d'élève, suivi de contenu) et côté
// tableau de bord établissement (readOnly, sans les actions de modification).
export default function ClassProgressView({ classRow, onOpenStudentDetail, readOnly, teacherId }: ClassProgressViewProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [students, setStudents] = useState<ComputedStudent[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  // Recharge tout : membres de la classe, chapitres/leçons du niveau, scores
  // de chaque élève, puis calcule le niveau par notion et le groupe (A/B/C/D)
  // de chacun. Tout est scopé à classRow.id, jamais à une classe arbitraire.
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
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
      setSelectedChapterId((prev) => {
        if (prev && chapterRows.some((c) => c.id === prev)) return prev;
        return chapterRows[0]?.id ?? null;
      });

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
          .select("user_id, chapter_id, lesson_id, current_level, total_answers, updated_at")
          .in("user_id", studentIds);
        scoreRows = (scores as any[]) || [];
      }

      // 4. Compute per student
      const computed: ComputedStudent[] = memberRows
        .filter((m) => profilesById[m.student_id])
        .map((m) => {
        const p = profilesById[m.student_id];
        // Applique la décroissance temporelle (oubli) avant tout calcul — sans ça,
        // le niveau affiché ici divergeait de celui du tableau de bord élève
        // (qui l'applique déjà), ce qui pouvait faire manquer un blocage réel
        // dont le niveau brut était encore juste au-dessus du seuil.
        const own = scoreRows
          .filter((s) => s.user_id === p.id)
          .map((s) => ({ ...s, current_level: applyDecay(s.current_level || 0, s.updated_at).level }));

        // Per lesson (notion) : moyenne pondérée par nombre de réponses — cohérent
        // avec le calcul du tableau de bord élève, pas une moyenne simple entre
        // lignes (qui pourrait diluer un vrai blocage si plusieurs lignes existent).
        const lessonLevels: Record<string, number | null> = {};
        for (const ls of lessonRows) {
          const rows = own.filter((s) => s.lesson_id === ls.id && (s.total_answers || 0) > 0);
          if (rows.length === 0) {
            lessonLevels[ls.id] = null;
          } else {
            const weightedSum = rows.reduce((a, s) => a + s.current_level * s.total_answers, 0);
            const weightTotal = rows.reduce((a, s) => a + s.total_answers, 0);
            lessonLevels[ls.id] = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : null;
          }
        }

        const { global: pct, answered, group } = computeStudentGroup(
          own.map((s) => ({ lesson_id: s.lesson_id, current_level: s.current_level, total_answers: s.total_answers })),
        );

        return {
          profile: p,
          linkId: m.id,
          global: pct,
          group,
          lessonLevels,
          answered,
        };
      });

      // Regroupe par niveau (A/B/C/D), puis trie par score décroissant au sein de chaque groupe
      computed.sort((a, b) => {
        const gi = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
        return gi !== 0 ? gi : b.global - a.global;
      });
      setStudents(computed);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du chargement de la classe");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classRow.id, classRow.school_level]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Retire un élève de la classe (bouton corbeille, masqué en readOnly).
  // Filtre défensif sur class_id en plus de l'id du lien : empêche de
  // retirer par erreur/manipulation un élève d'une AUTRE classe si jamais un
  // linkId périmé ou forgé était rejoué.
  const removeStudent = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("class_students")
        .delete()
        .eq("id", linkId)
        .eq("class_id", classRow.id);
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
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Grille de progression — élèves × notions</CardTitle>
            <div className="flex items-center gap-2">
              {!readOnly && teacherId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setTrackingOpen(true)}
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Suivi de la classe
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fetchData(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Rafraîchir
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs pt-2">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-600" /> Maîtrisé &gt;75%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-600" /> En ZPD 40-74%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-700" /> Lacune 20-39%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Blocage &lt;20%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-muted border" /> Non évalué</span>
          </div>
          {/* Sélecteur de chapitre — affiche un seul chapitre à la fois : la grille
              précédente entassait tous les chapitres dans un tableau géant à
              défilement horizontal avec des en-têtes de leçon en texte vertical
              minuscule, illisible. Un chapitre à la fois avec des en-têtes
              horizontaux normaux reste lisible sans défilement excessif. */}
          {chapters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                    selectedChapterId === ch.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground/70 border-border hover:bg-muted"
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {(() => {
            const chapterLessons = lessons.filter((l) => l.chapter_id === selectedChapterId);

            if (chapters.length === 0) {
              return <p className="text-sm text-muted-foreground">Aucun chapitre disponible pour ce niveau.</p>;
            }
            if (chapterLessons.length === 0) {
              return <p className="text-sm text-muted-foreground">Aucune leçon disponible pour ce chapitre.</p>;
            }

            return (
              <div className="overflow-x-auto">
                <table className="border-separate w-full" style={{ borderSpacing: "2px" }}>
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground sticky left-0 bg-background pr-3 min-w-[200px]">Élève</th>
                      {chapterLessons.map((ls) => (
                        <th key={ls.id} title={ls.title} className="text-xs font-medium text-muted-foreground px-2 pb-2 text-center min-w-[110px] max-w-[160px]">
                          <div className="whitespace-normal leading-snug">{ls.title}</div>
                        </th>
                      ))}
                      <th className="text-xs font-medium text-muted-foreground px-2">Score</th>
                      <th className="text-xs font-medium text-muted-foreground px-1">Gr.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const prevGroup = i > 0 ? students[i - 1].group : null;
                      const isNewGroup = s.group !== prevGroup;
                      const groupCount = students.filter((st) => st.group === s.group).length;
                      const groupAvg = Math.round(
                        students.filter((st) => st.group === s.group).reduce((a, st) => a + st.global, 0) / groupCount,
                      );
                      return (
                      <Fragment key={s.profile.id}>
                      {isNewGroup && (
                        <tr key={`group-${s.group}`}>
                          <td colSpan={chapterLessons.length + 3} className="pt-4 pb-1 sticky left-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold ${GROUP_INFO[s.group].tone}`}>
                                Groupe {s.group}
                              </span>
                              <span className="text-xs font-medium text-foreground/80">{GROUP_INFO[s.group].label}</span>
                              <span className="text-xs text-muted-foreground">· {groupCount} élève{groupCount > 1 ? "s" : ""} · moyenne {groupAvg}%</span>
                            </div>
                          </td>
                        </tr>
                      )}
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
                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeStudent(s.linkId)}
                                  className="text-destructive h-7 px-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </td>
                        {chapterLessons.map((ls) => {
                          const lvl = s.lessonLevels[ls.id];
                          return (
                            <td key={ls.id} className="align-top text-center">
                              <div
                                title={`${ls.title} : ${lvl === null ? "Non évalué" : lvl + "%"}`}
                                className={`w-5 h-5 rounded-sm mx-auto ${cellColor(lvl)} cursor-default`}
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
                      </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {!readOnly && teacherId && (
        <ClassContentTracking
          open={trackingOpen}
          onOpenChange={setTrackingOpen}
          teacherId={teacherId}
          classId={classRow.id}
          roster={students.map((s) => s.profile)}
        />
      )}
    </div>
  );
}
