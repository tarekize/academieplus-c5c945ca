import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  GeneratedItem, generateTeacherContent, saveTeacherContent, assignContent,
} from "@/lib/teacherContent";

interface Props {
  teacherId: string;
  schoolLevel: string | null;
  /** Class help: provide classId + studentIds (all members). Student help: provide studentId. */
  classId?: string;
  studentIds?: string[];
  studentId?: string;
  targetName: string;
  mode: "class" | "student";
}

interface WeakLesson { lessonId: string; title: string; chapterTitle: string; }

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm max-w-[90%]">{children}</div>
    </div>
  );
}

interface GenEntry extends GeneratedItem { _type: "exercise" | "quiz"; }

export default function HelpChatbot(props: Props) {
  const { teacherId, schoolLevel, classId, studentIds, studentId, targetName, mode } = props;
  const [phase, setPhase] = useState<"analyzing" | "proposal" | "none" | "generating" | "results">("analyzing");
  const [weak, setWeak] = useState<WeakLesson[]>([]);
  const [items, setItems] = useState<GenEntry[]>([]);
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [phase, items]);

  useEffect(() => {
    (async () => {
      const ids = mode === "class" ? (studentIds || []) : (studentId ? [studentId] : []);
      if (ids.length === 0) { setPhase("none"); return; }

      const { data: scores } = await supabase
        .from("student_scores")
        .select("user_id, lesson_id, current_level, total_answers")
        .in("user_id", ids);
      const rows = ((scores as any[]) || []).filter((s) => s.lesson_id && (s.total_answers || 0) > 0);

      // Group by lesson
      const byLesson: Record<string, { weakCount: number; total: number }> = {};
      for (const r of rows) {
        byLesson[r.lesson_id] = byLesson[r.lesson_id] || { weakCount: 0, total: 0 };
        byLesson[r.lesson_id].total += 1;
        if ((r.current_level || 0) < 40) byLesson[r.lesson_id].weakCount += 1;
      }

      const weakLessonIds: string[] = [];
      for (const [lid, v] of Object.entries(byLesson)) {
        if (mode === "class") {
          // majority of the students who attempted this lesson are weak
          if (v.weakCount > v.total / 2) weakLessonIds.push(lid);
        } else {
          if (v.weakCount > 0) weakLessonIds.push(lid);
        }
      }

      if (weakLessonIds.length === 0) { setPhase("none"); return; }

      const { data: lessons } = await supabase
        .from("lessons").select("id, title, chapter_id").in("id", weakLessonIds);
      const chapterIds = Array.from(new Set(((lessons as any[]) || []).map((l) => l.chapter_id).filter(Boolean)));
      const { data: chaps } = await supabase.from("chapters").select("id, title").in("id", chapterIds.length ? chapterIds : ["00000000-0000-0000-0000-000000000000"]);
      const chapMap: Record<string, string> = {};
      for (const c of (chaps as any[]) || []) chapMap[c.id] = c.title;

      const w: WeakLesson[] = ((lessons as any[]) || []).slice(0, 4).map((l) => ({
        lessonId: l.id, title: l.title, chapterTitle: chapMap[l.chapter_id] || "",
      }));
      setWeak(w);
      setPhase("proposal");
    })();
  }, [mode, classId, studentId, JSON.stringify(studentIds)]);

  const generate = async () => {
    setPhase("generating");
    try {
      const focus = `Les élèves sont en difficulté sur : ${weak.map((w) => w.title).join(", ")}.`;
      const lessonTitle = weak[0]?.title;
      const chapterTitle = weak[0]?.chapterTitle;
      const [ex, qz] = await Promise.all([
        generateTeacherContent({
          contentType: "exercise", schoolLevel: schoolLevel || undefined,
          chapterTitle, lessonTitle, count: 5, difficultyMin: 1, difficultyMax: 3, focusNote: focus,
        }),
        generateTeacherContent({
          contentType: "quiz", schoolLevel: schoolLevel || undefined,
          chapterTitle, lessonTitle, count: 5, difficultyMin: 1, difficultyMax: 3, focusNote: focus,
        }),
      ]);
      const merged: GenEntry[] = [
        ...ex.map((e) => ({ ...e, _type: "exercise" as const })),
        ...qz.map((q) => ({ ...q, _type: "quiz" as const })),
      ];
      if (merged.length === 0) { toast.error("Aucun contenu généré."); setPhase("proposal"); return; }
      setItems(merged);
      setPhase("results");
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération");
      setPhase("proposal");
    }
  };

  const sendOne = async (idx: number) => {
    const it = items[idx];
    const weakForType = weak[0];
    try {
      const id = await saveTeacherContent({
        teacherId, contentType: it._type,
        lessonId: weakForType?.lessonId, schoolLevel,
        title: it.title || it.question?.slice(0, 60),
        payload: it, difficulty: it.difficulty, source: "ai",
      });
      await assignContent({
        contentId: id, assignedBy: teacherId,
        classIds: mode === "class" && classId ? [classId] : [],
        studentIds: mode === "student" && studentId ? [studentId] : [],
      });
      setSent((s) => ({ ...s, [idx]: true }));
      toast.success(`Contenu envoyé à ${targetName}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div ref={scrollRef} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {phase === "analyzing" && (
            <Bubble><span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analyse des performances…</span></Bubble>
          )}

          {phase === "none" && (
            <Bubble>
              {mode === "class"
                ? "Bonne nouvelle ! Aucune lacune majoritaire détectée dans cette classe pour le moment."
                : `Aucune lacune notable détectée pour ${targetName} pour le moment.`}
            </Bubble>
          )}

          {(phase === "proposal" || phase === "generating" || phase === "results") && (
            <Bubble>
              {mode === "class" ? (
                <>La majorité de vos élèves sont en difficulté sur : <strong>{weak.map((w) => w.title).join(", ")}</strong>. Souhaitez-vous les aider avec des exercices ?</>
              ) : (
                <>{targetName} est en difficulté sur : <strong>{weak.map((w) => w.title).join(", ")}</strong>. Voici une liste d'exercices et quiz adaptés.</>
              )}
            </Bubble>
          )}

          {phase === "proposal" && (
            <div className="pl-10">
              <Button size="sm" className="gap-2" onClick={generate}>
                <Sparkles className="h-4 w-4" /> Oui, générer 5 exercices + 5 quiz
              </Button>
            </div>
          )}

          {phase === "generating" && (
            <Bubble><span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Génération en cours…</span></Bubble>
          )}

          {phase === "results" && (
            <>
              <Bubble>Validez individuellement chaque contenu à envoyer à {targetName}.</Bubble>
              <div className="space-y-3 pl-2">
                {items.map((it, idx) => (
                  <Card key={idx} className="border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <Badge variant="outline">{it._type === "quiz" ? "Quiz" : "Exercice"}</Badge>
                          {it.difficulty ? <span className="text-xs text-muted-foreground">Diff. {it.difficulty}/5</span> : null}
                        </p>
                        <Button
                          size="sm" variant={sent[idx] ? "secondary" : "default"}
                          className="gap-1 shrink-0" disabled={sent[idx]} onClick={() => sendOne(idx)}
                        >
                          <Send className="h-3.5 w-3.5" /> {sent[idx] ? "Envoyé" : "Valider & envoyer"}
                        </Button>
                      </div>
                      {it.title && <p className="font-medium text-sm">{it.title}</p>}
                      {it.statement && <p className="text-sm whitespace-pre-wrap">{it.statement}</p>}
                      {it.question && <p className="text-sm whitespace-pre-wrap">{it.question}</p>}
                      {it.options && (
                        <ul className="text-sm list-disc list-inside text-muted-foreground">
                          {it.options.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      )}
                      {it.hint && <p className="text-xs text-amber-700 dark:text-amber-400">💡 {it.hint}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
