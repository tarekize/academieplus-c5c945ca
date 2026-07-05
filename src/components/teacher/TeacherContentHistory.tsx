import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import { cleanMathStatement } from "@/lib/mathStatement";
import { ContentType } from "@/lib/teacherContent";
import { History, Pencil, Users, AlertCircle, Lightbulb, Repeat, CheckCircle2, XCircle, ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentRow {
  id: string;
  content_type: string;
  title: string | null;
  payload: any;
  difficulty: number | null;
  created_at: string;
}

interface AttemptRow {
  id: string;
  content_id: string;
  student_id: string;
  errors: number;
  hints_used: number;
  attempts: number;
  completed: boolean;
  is_correct: boolean | null;
  last_answer: string | null;
}

interface Props {
  teacherId: string;
  contentType: ContentType;
}

export default function TeacherContentHistory({ teacherId, contentType }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ContentRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [recipients, setRecipients] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<ContentRow | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const wanted = contentType === "quiz" ? ["quiz"] : ["exercise", "exam"];
      const { data: content } = await (supabase as any)
        .from("teacher_content")
        .select("id, content_type, title, payload, difficulty, created_at")
        .eq("teacher_id", teacherId)
        .in("content_type", wanted)
        .order("created_at", { ascending: false });
      const rows = (content as ContentRow[]) || [];
      const ids = rows.map((r) => r.id);

      let att: AttemptRow[] = [];
      let recCount: Record<string, number> = {};
      if (ids.length) {
        const { data: a } = await (supabase as any)
          .from("teacher_content_attempts")
          .select("*")
          .in("content_id", ids);
        att = (a as AttemptRow[]) || [];

        // Count recipients (assignments). Class assignments count enrolled students.
        const { data: asg } = await (supabase as any)
          .from("teacher_content_assignments")
          .select("content_id, class_id, student_id")
          .in("content_id", ids);
        const classIds = Array.from(new Set((asg || []).filter((x: any) => x.class_id).map((x: any) => x.class_id)));
        const classSize: Record<string, number> = {};
        if (classIds.length) {
          const { data: cs } = await (supabase as any)
            .from("class_students")
            .select("class_id, student_id")
            .in("class_id", classIds);
          (cs || []).forEach((x: any) => { classSize[x.class_id] = (classSize[x.class_id] || 0) + 1; });
        }
        (asg || []).forEach((x: any) => {
          const add = x.student_id ? 1 : (classSize[x.class_id] || 0);
          recCount[x.content_id] = (recCount[x.content_id] || 0) + add;
        });
      }

      // Resolve student names.
      const studentIds = Array.from(new Set(att.map((a) => a.student_id)));
      const nameMap: Record<string, string> = {};
      if (studentIds.length) {
        const { data: profs } = await (supabase as any)
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", studentIds);
        (profs || []).forEach((p: any) => {
          nameMap[p.id] = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Élève";
        });
      }

      if (!active) return;
      setItems(rows);
      setAttempts(att);
      setNames(nameMap);
      setRecipients(recCount);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [teacherId, contentType]);

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>;
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
          Aucun contenu envoyé pour le moment.
        </CardContent>
      </Card>
    );
  }

  const dialogAttempts = open ? attempts.filter((a) => a.content_id === open.id) : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <History className="h-4 w-4" /> Historique — {items.length} {contentType === "quiz" ? "quiz" : "exercices"} envoyé(s)
      </div>

      {items.map((it) => {
        const p = it.payload || {};
        const att = attempts.filter((a) => a.content_id === it.id);
        const done = att.filter((a) => a.completed).length;
        const total = recipients[it.id] || 0;
        const isExamBundle = Array.isArray(p.exercises);
        const title = p.question || p.title || it.title || (isExamBundle ? "Examen" : "Sans titre");
        return (
          <Card key={it.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setOpen(it)}>
            <CardContent className="p-4 flex items-center gap-3">
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
                      <Pencil key={i} className={cn("h-3 w-3", i < (it.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />
                    ))}
                  </div>
                </div>
                <div dir="rtl" className="truncate font-medium text-sm">
                  <HtmlWithMath htmlContent={cleanMathStatement(title)} className="truncate" />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {done}/{total || "—"}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats par élève</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-4">
              {Array.isArray(open.payload?.exercises) ? (
                <div className="space-y-2">
                  {(open.payload.exercises as { statement: string; solution?: string; answer?: string }[]).map((ex, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">Exercice {idx + 1}</p>
                      <HtmlWithMath htmlContent={cleanMathStatement(ex.statement)} className="font-medium text-sm" dir="rtl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div dir="rtl" className="bg-muted/50 rounded-lg p-3">
                  <HtmlWithMath htmlContent={cleanMathStatement(open.payload?.question || open.payload?.title || open.payload?.statement || open.title || "")} className="font-medium" />
                </div>
              )}

              {dialogAttempts.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">Aucun élève n'a encore travaillé sur ce contenu.</p>
              ) : (
                <div className="space-y-2">
                  {dialogAttempts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {a.is_correct ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                        <span className="font-medium truncate">{names[a.student_id] || "Élève"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <span className="flex items-center gap-1 text-red-500" title="Erreurs"><AlertCircle className="h-3.5 w-3.5" /> {a.errors}</span>
                        <span className="flex items-center gap-1 text-amber-500" title="Indices utilisés"><Lightbulb className="h-3.5 w-3.5" /> {a.hints_used}</span>
                        <span className="flex items-center gap-1 text-blue-500" title="Tentatives"><Repeat className="h-3.5 w-3.5" /> {a.attempts}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 text-red-500" /> Erreurs</span>
                <span className="flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Indices</span>
                <span className="flex items-center gap-1"><Repeat className="h-3.5 w-3.5 text-blue-500" /> Tentatives</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
