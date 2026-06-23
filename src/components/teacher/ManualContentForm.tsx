import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";
import {
  ContentType, CONTENT_TYPE_LABELS, GeneratedItem, saveTeacherContent, assignContent,
} from "@/lib/teacherContent";
import SendContentDialog from "./SendContentDialog";

interface Props {
  teacherId: string;
  contentType: ContentType;
  /** When set, content is sent directly to these targets (no class-picker dialog). */
  fixedClassIds?: string[];
  fixedStudentIds?: string[];
  /** Preselect and lock the level (e.g. class help). */
  fixedLevel?: string | null;
  targetLabel?: string;
}

interface Row { id: string; title: string; }

export default function ManualContentForm({
  teacherId, contentType, fixedClassIds, fixedStudentIds, fixedLevel, targetLabel,
}: Props) {
  const hasFixedTarget = !!((fixedClassIds && fixedClassIds.length) || (fixedStudentIds && fixedStudentIds.length));

  const [levels, setLevels] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Row[]>([]);
  const [lessons, setLessons] = useState<Row[]>([]);

  const [level, setLevel] = useState(fixedLevel || "");
  const [chapterId, setChapterId] = useState("");
  const [lessonId, setLessonId] = useState("");

  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [expected, setExpected] = useState("");
  const [solution, setSolution] = useState("");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState("3");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("");
  const [explanation, setExplanation] = useState("");

  const [sendOpen, setSendOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isQuiz = contentType === "quiz";
  const typeLabel = CONTENT_TYPE_LABELS[contentType];

  useEffect(() => {
    if (fixedLevel) { setLevel(fixedLevel); return; }
    (async () => {
      const { data } = await supabase.from("classes").select("school_level").eq("teacher_id", teacherId);
      const set = Array.from(new Set(((data as any[]) || []).map((c) => c.school_level).filter(Boolean)));
      setLevels(set as string[]);
    })();
  }, [teacherId, fixedLevel]);

  useEffect(() => {
    if (!level) { setChapters([]); return; }
    (async () => {
      const { data } = await supabase.from("chapters").select("id, title").eq("school_level", level as any).order("order_index");
      setChapters((data as Row[]) || []);
      setChapterId(""); setLessonId("");
    })();
  }, [level]);

  useEffect(() => {
    if (!chapterId) { setLessons([]); return; }
    (async () => {
      const { data } = await supabase.from("lessons").select("id, title").eq("chapter_id", chapterId).order("order_index");
      setLessons((data as Row[]) || []);
      setLessonId("");
    })();
  }, [chapterId]);

  const validate = (): boolean => {
    if (!level) { toast.error("Choisissez un niveau."); return false; }
    if (isQuiz) {
      if (!statement.trim()) { toast.error("Saisissez la question."); return false; }
      if (options.filter((o) => o.trim()).length < 2) { toast.error("Au moins 2 options."); return false; }
      if (!correct.trim()) { toast.error("Indiquez la bonne réponse."); return false; }
    } else {
      if (!statement.trim()) { toast.error("Saisissez l'énoncé."); return false; }
    }
    return true;
  };

  const buildPayload = (): GeneratedItem => {
    if (isQuiz) {
      return {
        question: statement.trim(),
        options: options.map((o) => o.trim()).filter(Boolean),
        correct_answer: correct.trim(),
        explanation: explanation.trim() || undefined,
        hint: hint.trim() || undefined,
        difficulty: Number(difficulty),
      };
    }
    return {
      title: title.trim() || undefined,
      statement: statement.trim(),
      expected_answer: expected.trim() || undefined,
      solution: solution.trim() || undefined,
      hint: hint.trim() || undefined,
      difficulty: Number(difficulty),
    };
  };

  const doSave = async (classIds: string[], studentIds: string[]) => {
    setSaving(true);
    try {
      const id = await saveTeacherContent({
        teacherId, contentType,
        chapterId: chapterId || null, lessonId: lessonId || null,
        schoolLevel: level, title: title || statement.slice(0, 60),
        payload: buildPayload(), difficulty: Number(difficulty), source: "manual",
      });
      await assignContent({ contentId: id, assignedBy: teacherId, classIds, studentIds });
      toast.success(`${typeLabel} envoyé${targetLabel ? ` à ${targetLabel}` : " aux classes sélectionnées"}`);
      setTitle(""); setStatement(""); setExpected(""); setSolution(""); setHint("");
      setOptions(["", "", "", ""]); setCorrect(""); setExplanation("");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handlePrimary = () => {
    if (!validate()) return;
    if (hasFixedTarget) {
      doSave(fixedClassIds || [], fixedStudentIds || []);
    } else {
      setSendOpen(true);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Niveau *</Label>
            <Select value={level} onValueChange={setLevel} disabled={!!fixedLevel}>
              <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>
                {(fixedLevel ? [fixedLevel] : levels).map((lv) => (
                  <SelectItem key={lv} value={lv}>{getSchoolLevelLabel(lv)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Chapitre</Label>
            <Select value={chapterId} onValueChange={setChapterId} disabled={!level}>
              <SelectTrigger><SelectValue placeholder="Chapitre" /></SelectTrigger>
              <SelectContent>
                {chapters.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Leçon</Label>
            <Select value={lessonId} onValueChange={setLessonId} disabled={!chapterId}>
              <SelectTrigger><SelectValue placeholder="Leçon" /></SelectTrigger>
              <SelectContent>
                {lessons.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isQuiz && (
          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre court (optionnel)" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{isQuiz ? "Question *" : "Énoncé *"}</Label>
          <Textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows={3}
            placeholder={isQuiz ? "Saisissez la question…" : "Saisissez l'énoncé de l'exercice…"} />
        </div>

        {isQuiz ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o, i) => (
                <div key={i} className="space-y-1.5">
                  <Label>Option {i + 1}</Label>
                  <Input value={o} onChange={(e) => setOptions((prev) => prev.map((x, j) => j === i ? e.target.value : x))} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Bonne réponse * (texte identique à une option)</Label>
              <Input value={correct} onChange={(e) => setCorrect(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Explication</Label>
              <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Réponse attendue</Label>
              <Input value={expected} onChange={(e) => setExpected(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Correction / solution</Label>
              <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={3} />
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Indice</Label>
            <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Indice (optionnel)" />
          </div>
          <div className="space-y-1.5">
            <Label>Difficulté</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((d) => <SelectItem key={d} value={String(d)}>{d}/5</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="gap-2" disabled={saving} onClick={handlePrimary}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : hasFixedTarget ? <Send className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {hasFixedTarget ? `Envoyer${targetLabel ? ` à ${targetLabel}` : ""}` : "Enregistrer et envoyer"}
        </Button>
      </CardContent>

      {!hasFixedTarget && (
        <SendContentDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          teacherId={teacherId}
          schoolLevel={level}
          onConfirm={(classIds) => doSave(classIds, [])}
        />
      )}
    </Card>
  );
}
