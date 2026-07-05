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
import { Loader2, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";
import { saveTeacherContent, assignContent, getTrimesterOptions } from "@/lib/teacherContent";
import SendContentDialog from "./SendContentDialog";

interface ChapterRow { id: string; title: string; }

interface AIExerciseRow {
  chapter_id: string;
  statement: string;
  solution: string;
  answer: string;
  generating: boolean;
}

const emptyRow = (): AIExerciseRow => ({ chapter_id: "", statement: "", solution: "", answer: "", generating: false });

interface Props {
  teacherId: string;
}

export default function ExamAIBuilder({ teacherId }: Props) {
  const [levels, setLevels] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [chapters, setChapters] = useState<ChapterRow[]>([]);

  const [title, setTitle] = useState("");
  const [trimester, setTrimester] = useState("");
  const [count, setCount] = useState(3);
  const [rows, setRows] = useState<AIExerciseRow[]>(Array.from({ length: 3 }, emptyRow));

  const [sendOpen, setSendOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("classes").select("school_level").eq("teacher_id", teacherId);
      const set = Array.from(new Set(((data as any[]) || []).map((c) => c.school_level).filter(Boolean)));
      setLevels(set as string[]);
    })();
  }, [teacherId]);

  useEffect(() => {
    if (!level) { setChapters([]); return; }
    (async () => {
      const { data } = await supabase
        .from("chapters").select("id, title")
        .eq("school_level", level as any).eq("subject", "math")
        .order("order_index");
      // Chapters exist once per filière, so the same title can come back several
      // times for a level with multiple filières — keep only the first of each.
      const seen = new Set<string>();
      const deduped = ((data as ChapterRow[]) || []).filter((c) => (seen.has(c.title) ? false : (seen.add(c.title), true)));
      setChapters(deduped);
    })();
    // Bac Blanc/Finale only make sense for terminale — clear an invalid selection.
    if (level !== "terminale" && (trimester === "4" || trimester === "5")) {
      setTrimester("");
    }
  }, [level]);

  const changeCount = (n: number) => {
    setCount(n);
    setRows((prev) => {
      const next = [...prev];
      if (n > prev.length) {
        for (let i = prev.length; i < n; i++) next.push(emptyRow());
      } else {
        next.length = n;
      }
      return next;
    });
  };

  const updateRow = (index: number, field: keyof AIExerciseRow, value: any) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const generateRow = async (index: number) => {
    const row = rows[index];
    if (!row.chapter_id) { toast.error("Choisissez un chapitre d'abord."); return; }
    updateRow(index, "generating", true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exam-exercise", {
        body: { chapter_id: row.chapter_id },
      });
      if (error) throw error;
      const ex = data?.exercise;
      if (!ex?.statement) throw new Error("Échec de la génération");
      setRows((prev) => prev.map((r, i) => (
        i === index ? { ...r, statement: ex.statement, solution: ex.solution || "", answer: ex.answer || "", generating: false } : r
      )));
    } catch (e: any) {
      updateRow(index, "generating", false);
      toast.error(e.message || "Échec de la génération");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTrimester("");
    setCount(3);
    setRows(Array.from({ length: 3 }, emptyRow));
  };

  const doShare = async (classIds: string[]) => {
    const validExercises = rows
      .filter((r) => r.statement.trim())
      .map((r) => ({ statement: r.statement.trim(), solution: r.solution.trim() || undefined, answer: r.answer.trim() || undefined }));
    if (validExercises.length === 0) { toast.error("Générez au moins un exercice."); return; }

    setSaving(true);
    try {
      const id = await saveTeacherContent({
        teacherId, contentType: "exam",
        schoolLevel: level,
        title: title || validExercises[0].statement.slice(0, 60),
        payload: { title: title || undefined, exercises: validExercises, trimester: Number(trimester) },
        source: "ai",
      });
      await assignContent({ contentId: id, assignedBy: teacherId, classIds });
      toast.success("Examen partagé aux classes sélectionnées");
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du partage");
    } finally {
      setSaving(false);
    }
  };

  const handleShareClick = () => {
    if (!level) { toast.error("Choisissez un niveau."); return; }
    if (!trimester) { toast.error("Choisissez le trimestre (ou le bac blanc/final)."); return; }
    if (!rows.some((r) => r.statement.trim())) { toast.error("Générez au moins un exercice."); return; }
    setSendOpen(true);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" /> Générateur d'examen par IA
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Niveau *</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>
                {levels.map((lv) => (
                  <SelectItem key={lv} value={lv}>{getSchoolLevelLabel(lv)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Trimestre *</Label>
            <Select value={trimester} onValueChange={setTrimester} disabled={!level}>
              <SelectTrigger><SelectValue placeholder="Choisir le trimestre ou le bac" /></SelectTrigger>
              <SelectContent>
                {getTrimesterOptions(level).map((t) => (
                  <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'examen (optionnel)" />
          </div>
          <div className="space-y-1.5">
            <Label>Nombre d'exercices</Label>
            <Select value={String(count)} onValueChange={(v) => changeCount(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {idx + 1}
                  </span>
                  Exercice {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Select value={row.chapter_id} onValueChange={(v) => updateRow(idx, "chapter_id", v)} disabled={!level}>
                    <SelectTrigger className="min-w-[180px]"><SelectValue placeholder="Choisir un chapitre" /></SelectTrigger>
                    <SelectContent>
                      {chapters.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => generateRow(idx)}
                    disabled={row.generating || !row.chapter_id}
                    className="gap-1.5 whitespace-nowrap"
                  >
                    {row.generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Générer
                  </Button>
                </div>
              </div>

              {(row.statement || row.solution || row.answer) && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <Label>Énoncé</Label>
                    <Textarea value={row.statement} onChange={(e) => updateRow(idx, "statement", e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Solution</Label>
                    <Textarea value={row.solution} onChange={(e) => updateRow(idx, "solution", e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Réponse finale</Label>
                    <Input value={row.answer} onChange={(e) => updateRow(idx, "answer", e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button className="gap-2" disabled={saving} onClick={handleShareClick}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          Partager l'examen
        </Button>
      </CardContent>

      <SendContentDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        teacherId={teacherId}
        schoolLevel={level}
        onConfirm={doShare}
      />
    </Card>
  );
}
