import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { HtmlWithMath } from "./HtmlWithMath";
import { cleanMathStatement } from "@/lib/mathStatement";
import { cn } from "@/lib/utils";
import { Users, BookOpen, CheckCircle2, Pencil, Eye, Lightbulb } from "lucide-react";
import { recordTeacherContentAttempt, normalizeAnswer } from "@/lib/teacherContentAttempt";

interface TeacherContentRow {
  id: string;
  content_type: "exercise" | "quiz" | "exam";
  title: string | null;
  payload: any;
  difficulty: number | null;
  created_at: string;
}

interface Props {
  userId: string;
  /** "exercise" => exercises section ; "quiz" => quiz section */
  contentType: "exercise" | "quiz";
}

export function MyClassContent({ userId, contentType }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TeacherContentRow[]>([]);
  const [directIds, setDirectIds] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const handleHint = (id: string) => {
    if (showHint[id]) return;
    setShowHint((h) => ({ ...h, [id]: true }));
    recordTeacherContentAttempt(id, userId, { hintDelta: 1 });
  };

  const handleQuizCheck = (it: TeacherContentRow, p: any) => {
    if (revealed[it.id]) { setRevealed((r) => ({ ...r, [it.id]: false })); return; }
    const sel = selected[it.id];
    const correct = sel === p.correct_answer;
    setRevealed((r) => ({ ...r, [it.id]: true }));
    recordTeacherContentAttempt(it.id, userId, {
      attemptDelta: 1,
      errorDelta: correct ? 0 : 1,
      completed: true,
      isCorrect: correct,
      answer: sel || null,
    });
  };

  const handleExerciseCheck = (it: TeacherContentRow, p: any) => {
    if (revealed[it.id]) { setRevealed((r) => ({ ...r, [it.id]: false })); return; }
    const ans = answers[it.id] || "";
    const correct = !!p.expected_answer && normalizeAnswer(ans) === normalizeAnswer(p.expected_answer);
    setRevealed((r) => ({ ...r, [it.id]: true }));
    recordTeacherContentAttempt(it.id, userId, {
      attemptDelta: 1,
      errorDelta: correct ? 0 : 1,
      completed: true,
      isCorrect: correct,
      answer: ans || null,
    });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      // RLS limits assignments to mine (direct or via my classes).
      const { data: assignments } = await (supabase as any)
        .from("teacher_content_assignments")
        .select("content_id, student_id");
      const ids = Array.from(new Set((assignments || []).map((a: any) => a.content_id)));
      const direct = new Set<string>(
        (assignments || []).filter((a: any) => a.student_id === userId).map((a: any) => a.content_id)
      );
      if (ids.length === 0) {
        if (active) { setItems([]); setDirectIds(direct); setLoading(false); }
        return;
      }
      const wanted = contentType === "exercise" ? ["exercise", "exam"] : ["quiz"];
      const { data } = await (supabase as any)
        .from("teacher_content")
        .select("id, content_type, title, payload, difficulty, created_at")
        .in("id", ids)
        .in("content_type", wanted)
        .order("created_at", { ascending: false });
      if (!active) return;
      const rows = (data as TeacherContentRow[]) || [];
      // Direct (student-specific) content first.
      rows.sort((a, b) => Number(direct.has(b.id)) - Number(direct.has(a.id)));
      setItems(rows);
      setDirectIds(direct);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, contentType]);

  if (loading) {
    return (
      <Card className="border-emerald-500/20">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </CardContent>
      </Card>
    );
  }

  const isQuiz = contentType === "quiz";

  return (
    <Card className="border-emerald-500/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <Users className="h-5 w-5" />
            <span dir="rtl">{isQuiz ? "اختبارات من معلمي" : "تمارين من معلمي"}</span>
          </div>
          <Badge variant="secondary">{items.length} {isQuiz ? "أسئلة" : "تمارين"}</Badge>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" dir="rtl">
            {isQuiz ? "لم يرسل معلمك أي أسئلة بعد." : "لم يرسل معلمك أي تمارين بعد."}
          </div>
        ) : isQuiz ? (
          <div className="space-y-3">
            {items.map((it) => {
              const p = it.payload || {};
              const direct = directIds.has(it.id);
              const isRevealed = revealed[it.id];
              return (
                <Card key={it.id} className={cn(direct && "border-2 border-red-500 bg-red-500/5")}>
                  <CardContent className="p-4 space-y-3">
                    {direct && (
                      <Badge className="bg-red-600 hover:bg-red-600 text-white">⚠️ تمرين خاص بك</Badge>
                    )}
                    <div className="flex items-center gap-3" dir="rtl">
                      <HtmlWithMath htmlContent={cleanMathStatement(p.question || it.title || "")} className="flex-1 font-medium" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Pencil key={i} className={cn("h-3.5 w-3.5", i < (it.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />
                        ))}
                      </div>
                    </div>
                    {Array.isArray(p.options) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {p.options.map((opt: string, oIdx: number) => {
                          const isSel = selected[it.id] === opt;
                          const isCorrect = isRevealed && opt === p.correct_answer;
                          const isWrong = isRevealed && isSel && opt !== p.correct_answer;
                          return (
                            <Button key={oIdx}
                              variant={isCorrect ? "default" : isWrong ? "destructive" : isSel ? "secondary" : "outline"}
                              className="justify-start text-right"
                              onClick={() => !isRevealed && setSelected((s) => ({ ...s, [it.id]: opt }))}
                              dir="rtl">
                              <HtmlWithMath htmlContent={cleanMathStatement(opt)} className="flex-1 text-right" />
                            </Button>
                          );
                        })}
                      </div>
                    )}
                    {p.hint && showHint[it.id] && (
                      <div className="text-xs text-amber-700 dark:text-amber-400 bg-yellow-500/5 p-2 rounded" dir="rtl">💡 {p.hint}</div>
                    )}
                    <div className="flex justify-end gap-2" dir="rtl">
                      {p.hint && !showHint[it.id] && (
                        <Button size="sm" variant="ghost" onClick={() => handleHint(it.id)}>
                          <Lightbulb className="h-4 w-4 mr-1" /> تلميح
                        </Button>
                      )}
                      <Button size="sm" variant="outline" disabled={!selected[it.id]}
                        onClick={() => handleQuizCheck(it, p)}>
                        <Eye className="h-4 w-4 mr-1" /> {isRevealed ? "إخفاء" : "تحقق"}
                      </Button>
                    </div>
                    {isRevealed && p.explanation && (
                      <div className="bg-muted/50 p-3 rounded text-sm" dir="rtl">
                        <p className="font-semibold flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4" /> الشرح:</p>
                        <HtmlWithMath htmlContent={cleanMathStatement(p.explanation)} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => {
              const p = it.payload || {};
              const direct = directIds.has(it.id);
              const isRevealed = revealed[it.id];
              return (
                <Card key={it.id} className={cn(direct && "border-2 border-red-500 bg-red-500/5")}>
                  <CardContent className="p-4 space-y-3">
                    {direct && (
                      <Badge className="bg-red-600 hover:bg-red-600 text-white">⚠️ تمرين خاص بك</Badge>
                    )}
                    <div className="flex items-center gap-3" dir="rtl">
                      <HtmlWithMath htmlContent={cleanMathStatement(p.title || it.title || "")} className="flex-1 font-semibold" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Pencil key={i} className={cn("h-3.5 w-3.5", i < (it.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />
                        ))}
                      </div>
                    </div>
                    {p.statement && (
                      <HtmlWithMath htmlContent={cleanMathStatement(p.statement)} className="text-sm text-right" dir="rtl" />
                    )}
                    {p.hint && showHint[it.id] && (
                      <div className="text-xs text-amber-700 dark:text-amber-400 bg-yellow-500/5 p-2 rounded" dir="rtl">💡 {p.hint}</div>
                    )}
                    <div className="flex gap-2 items-center" dir="rtl">
                      <input
                        className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                        placeholder="أدخل إجابتك..."
                        value={answers[it.id] || ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [it.id]: e.target.value }))}
                        dir="rtl" />
                      {p.hint && !showHint[it.id] && (
                        <Button size="sm" variant="ghost" onClick={() => handleHint(it.id)}>
                          <Lightbulb className="h-4 w-4 mr-1" /> تلميح
                        </Button>
                      )}
                      <Button size="sm" variant="outline"
                        onClick={() => handleExerciseCheck(it, p)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> {isRevealed ? "إخفاء" : "التصحيح"}
                      </Button>
                    </div>
                    {isRevealed && (
                      <div className="bg-muted/50 p-3 rounded text-sm space-y-1" dir="rtl">
                        {p.expected_answer && (
                          <p><span className="font-semibold">الإجابة:</span>{" "}
                            <HtmlWithMath htmlContent={cleanMathStatement(p.expected_answer)} className="inline" /></p>
                        )}
                        {p.solution && (
                          <div>
                            <p className="font-semibold flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4" /> الحل:</p>
                            <HtmlWithMath htmlContent={cleanMathStatement(p.solution)} />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
