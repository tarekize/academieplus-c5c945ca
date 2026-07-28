import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import { cleanMathStatement } from "@/lib/mathStatement";
import { ContentType } from "@/lib/teacherContent";
import {
  FileText, Target, ClipboardList, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Eye, EyeOff, Pencil, Users, AlertCircle, Lightbulb, Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RosterStudent { id: string; first_name: string | null; last_name: string | null; }
interface ContentRow { id: string; content_type: string; title: string | null; payload: any; difficulty: number | null; created_at: string; }

type StudentStatus = "answered" | "seen" | "unseen";
interface StudentDetail {
  status: StudentStatus;
  isCorrect: boolean | null;
  lastAnswer: string | null;
  errors: number;
  hintsUsed: number;
  attempts: number;
}

const TYPE_OPTIONS: { key: ContentType; label: string; icon: any }[] = [
  { key: "exercise", label: "Exercices", icon: FileText },
  { key: "quiz", label: "Quiz", icon: Target },
  { key: "exam", label: "Examens", icon: ClipboardList },
];

function fullName(s: RosterStudent): string {
  return [s.first_name, s.last_name].filter(Boolean).join(" ") || "Élève";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  classId: string;
  roster: RosterStudent[];
}

/** Suivi de la classe : pour chaque exercice/quiz/examen envoyé par
 * l'enseignant à cette classe, montre — pour CHAQUE élève — s'il a répondu,
 * s'il a seulement ouvert le contenu sans répondre, ou s'il ne l'a même pas
 * encore vu (croise teacher_content_reads et teacher_content_attempts). */
export default function ClassContentTracking({ open, onOpenChange, teacherId, classId, roster }: Props) {
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [items, setItems] = useState<ContentRow[]>([]);
  const [selected, setSelected] = useState<ContentRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusByStudent, setStatusByStudent] = useState<Record<string, StudentDetail>>({});

  useEffect(() => {
    if (!open) { setContentType(null); setSelected(null); setItems([]); }
  }, [open]);

  useEffect(() => {
    if (!contentType) return;
    let active = true;
    (async () => {
      setLoadingList(true);
      setSelected(null);
      const rosterIds = roster.map((r) => r.id);
      const { data: asg } = await (supabase as any)
        .from("teacher_content_assignments")
        .select("content_id, class_id, student_id")
        .eq("assigned_by", teacherId);
      const contentIds = Array.from(new Set(
        ((asg as any[]) || [])
          .filter((a) => a.class_id === classId || (a.student_id && rosterIds.includes(a.student_id)))
          .map((a) => a.content_id)
      ));
      if (contentIds.length === 0) { if (active) { setItems([]); setLoadingList(false); } return; }
      const { data } = await (supabase as any)
        .from("teacher_content")
        .select("id, content_type, title, payload, difficulty, created_at")
        .eq("teacher_id", teacherId)
        .eq("content_type", contentType)
        .in("id", contentIds)
        .order("created_at", { ascending: false });
      if (!active) return;
      setItems((data as ContentRow[]) || []);
      setLoadingList(false);
    })();
    return () => { active = false; };
  }, [contentType, teacherId, classId, roster]);

  useEffect(() => {
    if (!selected) { setStatusByStudent({}); return; }
    let active = true;
    (async () => {
      setLoadingDetail(true);
      const rosterIds = roster.map((r) => r.id);
      const [{ data: reads }, { data: attempts }] = await Promise.all([
        (supabase as any).from("teacher_content_reads").select("student_id").eq("content_id", selected.id).in("student_id", rosterIds),
        (supabase as any).from("teacher_content_attempts")
          .select("student_id, completed, is_correct, last_answer, errors, hints_used, attempts")
          .eq("content_id", selected.id).in("student_id", rosterIds),
      ]);
      if (!active) return;
      const seenIds = new Set(((reads as any[]) || []).map((r) => r.student_id));
      const attemptByStudent: Record<string, any> = {};
      for (const a of (attempts as any[]) || []) attemptByStudent[a.student_id] = a;
      const map: Record<string, StudentDetail> = {};
      for (const s of roster) {
        const a = attemptByStudent[s.id];
        const answered = !!a?.completed;
        map[s.id] = {
          status: answered ? "answered" : seenIds.has(s.id) ? "seen" : "unseen",
          isCorrect: a?.is_correct ?? null,
          lastAnswer: a?.last_answer ?? null,
          errors: a?.errors || 0,
          hintsUsed: a?.hints_used || 0,
          attempts: a?.attempts || 0,
        };
      }
      setStatusByStudent(map);
      setLoadingDetail(false);
    })();
    return () => { active = false; };
  }, [selected, roster]);

  const goBack = () => {
    if (selected) { setSelected(null); return; }
    if (contentType) { setContentType(null); return; }
    onOpenChange(false);
  };

  const statusCounts = roster.reduce(
    (acc, s) => { acc[statusByStudent[s.id]?.status || "unseen"]++; return acc; },
    { answered: 0, seen: 0, unseen: 0 } as Record<StudentStatus, number>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>
              {selected ? "Suivi par élève" : contentType ? TYPE_OPTIONS.find((t) => t.key === contentType)?.label : "Suivi de la classe"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {!contentType && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {TYPE_OPTIONS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setContentType(t.key)}
                  className="p-4 rounded-xl border-2 border-border hover:border-primary text-center transition-all flex flex-col items-center gap-2"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {contentType && !selected && (
          loadingList ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Aucun contenu envoyé à cette classe pour l'instant.</p>
          ) : (
            <div className="space-y-2.5">
              {items.map((it) => {
                const p = it.payload || {};
                const isExamBundle = Array.isArray(p.exercises);
                const title = p.question || p.title || it.title || (isExamBundle ? "Examen" : "Sans titre");
                return (
                  <Card key={it.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelected(it)}>
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{new Date(it.created_at).toLocaleDateString("fr-FR")}</Badge>
                          {isExamBundle && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <ClipboardList className="h-3 w-3" /> {p.exercises.length} exercice{p.exercises.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Pencil key={i} className={cn("h-3 w-3", i < (it.difficulty || 3) ? "text-amber fill-orange-500/20" : "text-muted-foreground/20")} />
                            ))}
                          </div>
                        </div>
                        <div dir="rtl" className="truncate font-medium text-sm">
                          <HtmlWithMath htmlContent={cleanMathStatement(title)} className="truncate" />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        )}

        {selected && (
          <div className="space-y-4">
            <div dir="rtl" className="bg-muted/50 rounded-lg p-3">
              <HtmlWithMath
                htmlContent={cleanMathStatement(selected.payload?.question || selected.payload?.title || selected.payload?.statement || selected.title || "")}
                className="font-medium text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> {statusCounts.answered} a répondu</span>
              <span className="flex items-center gap-1 text-amber-600"><Eye className="h-3.5 w-3.5" /> {statusCounts.seen} vu sans répondre</span>
              <span className="flex items-center gap-1 text-muted-foreground"><EyeOff className="h-3.5 w-3.5" /> {statusCounts.unseen} pas vu</span>
            </div>

            {loadingDetail ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : (
              <div className="space-y-2">
                {roster.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm flex items-center justify-center gap-2"><Users className="h-4 w-4" /> Aucun élève dans cette classe.</p>
                ) : roster.map((s) => {
                  const d = statusByStudent[s.id];
                  const status = d?.status || "unseen";
                  return (
                    <div key={s.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-sm truncate">{fullName(s)}</span>
                        {status === "answered" ? (
                          <span className={cn("flex items-center gap-1 text-xs font-medium shrink-0", d?.isCorrect === false ? "text-red-500" : "text-emerald-600")}>
                            {d?.isCorrect === false ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            A répondu
                          </span>
                        ) : status === "seen" ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 shrink-0"><Eye className="h-3.5 w-3.5" /> Vu, pas répondu</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0"><EyeOff className="h-3.5 w-3.5" /> Pas vu</span>
                        )}
                      </div>
                      {status === "answered" && (
                        <div className="bg-muted/50 rounded-md p-2 space-y-1.5">
                          <div dir="rtl" className="text-sm">
                            <span className="text-xs text-muted-foreground">إجابته : </span>
                            <HtmlWithMath htmlContent={cleanMathStatement(d?.lastAnswer || "—")} className="inline" />
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1 text-red-500"><AlertCircle className="h-3 w-3" /> {d?.errors} erreur{(d?.errors || 0) > 1 ? "s" : ""}</span>
                            <span className="flex items-center gap-1 text-amber-500"><Lightbulb className="h-3 w-3" /> {d?.hintsUsed} indice{(d?.hintsUsed || 0) > 1 ? "s" : ""}</span>
                            <span className="flex items-center gap-1 text-blue-500"><Repeat className="h-3 w-3" /> {d?.attempts} tentative{(d?.attempts || 0) > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
