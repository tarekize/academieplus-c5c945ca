import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ChevronRight, ChevronLeft, Award, Star } from "lucide-react";
import { toast } from "sonner";
import { ExamExercise, trimesterOptions, TRIMESTER_LABELS, TRIMESTER_LABELS_AR } from "@/lib/examTypes";

interface ChapterOption {
  id: string;
  title: string;
}

interface ViaIAWizardProps {
  subject: string;
  schoolLevel: string;
  filiereId: string | null;
  isTerminale: boolean;
  /** Le brouillon vient d'être enregistré : le parent ferme la pop-up et
   * redirige vers la page complète d'édition de cet examen. */
  onCreated: (examId: string) => void;
}

type Step = "trimester" | "chapters" | "params" | "difficulty" | "generating";

const DIFFICULTY_LABELS: Record<number, string> = { 1: "Facile", 2: "Moyen", 3: "Difficile" };

export default function ViaIAWizard({ subject, schoolLevel, filiereId, isTerminale, onCreated }: ViaIAWizardProps) {
  const [step, setStep] = useState<Step>("trimester");
  const [trimester, setTrimester] = useState<number | null>(null);
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [countPerChapter, setCountPerChapter] = useState<Record<string, number>>({});
  const [chatInstructions, setChatInstructions] = useState("");
  const [difficultyPerChapter, setDifficultyPerChapter] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Charge les chapitres disponibles une seule fois, dès l'arrivée sur
  // l'étape "chapters" (le `chapters.length > 0` évite un rechargement à
  // chaque retour sur cette étape).
  useEffect(() => {
    if (step !== "chapters" || chapters.length > 0) return;
    setLoadingChapters(true);
    let query = supabase
      .from("chapters")
      .select("id, title, title_ar")
      .eq("subject", subject)
      .eq("school_level", schoolLevel as any)
      .order("order_index", { ascending: true });
    query = filiereId ? query.eq("filiere_id", filiereId) : query.is("filiere_id", null);
    query.then(({ data, error }) => {
      if (!error && data) {
        setChapters((data as any[]).map((c) => ({ id: c.id, title: c.title_ar || c.title })));
      }
      setLoadingChapters(false);
    });
  }, [step, subject, schoolLevel, filiereId]);

  /** Coche/décoche un chapitre ; à la première sélection, initialise ses
   * réglages (nombre d'exercices, difficulté) à des valeurs par défaut. */
  const toggleChapter = (id: string) => {
    setSelectedChapterIds((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      setCountPerChapter((cnt) => ({ ...cnt, [id]: cnt[id] ?? 2 }));
      setDifficultyPerChapter((d) => ({ ...d, [id]: d[id] ?? 2 }));
      return next;
    });
  };

  /** Lance la génération IA : construit la liste des exercices à générer
   * (chapitre × nombre demandé), appelle l'edge function generate-exam-exercise
   * pour chacun séquentiellement, puis enregistre le brouillon d'examen
   * résultant via save_exam_draft. Les échecs individuels sont signalés par
   * toast mais n'interrompent pas la génération des autres exercices. */
  const generate = async () => {
    setStep("generating");
    const jobs: { chapterId: string; chapterTitle: string; difficulty: number }[] = [];
    selectedChapterIds.forEach((id) => {
      const chapterTitle = chapters.find((c) => c.id === id)?.title || "";
      const count = countPerChapter[id] ?? 2;
      for (let i = 0; i < count; i++) {
        jobs.push({ chapterId: id, chapterTitle, difficulty: difficultyPerChapter[id] ?? 2 });
      }
    });
    setProgress({ done: 0, total: jobs.length });
    const results: ExamExercise[] = [];
    for (const job of jobs) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-exam-exercise", {
          body: { chapter_id: job.chapterId, difficulty: job.difficulty, instructions: chatInstructions },
        });
        if (error) throw error;
        const ex = data?.exercise;
        if (ex?.statement || (Array.isArray(ex?.sub_questions) && ex.sub_questions.length >= 2)) {
          results.push({
            statement: ex.statement || "",
            solution: ex.solution || "",
            answer: ex.answer || "",
            sub_questions: Array.isArray(ex?.sub_questions) && ex.sub_questions.length >= 2 ? ex.sub_questions : undefined,
            chapter_id: job.chapterId,
            chapter_title: job.chapterTitle,
            difficulty: job.difficulty,
          });
        }
      } catch (e: any) {
        toast.error("Erreur de génération", { description: e.message || `Échec pour "${job.chapterTitle}"` });
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    if (results.length === 0) {
      toast.error("Aucun exercice n'a pu être généré. Réessayez.");
      setStep("difficulty");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("save_exam_draft" as any, {
        p_exam_id: null,
        p_subject: subject,
        p_school_level: schoolLevel,
        p_filiere_id: filiereId,
        p_trimester: trimester,
        p_title: `Examen — ${TRIMESTER_LABELS[trimester || 1]}`,
        p_title_ar: `امتحان — ${TRIMESTER_LABELS_AR[trimester || 1]}`,
        p_duration_minutes: 60,
        p_content: results,
        p_chapter_ids: selectedChapterIds,
        p_source: "ai",
      });
      if (error) throw error;
      onCreated(data as string);
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
      setStep("difficulty");
    }
  };

  const trimesters = trimesterOptions(isTerminale);

  return (
    <div className="space-y-5">
      {step === "trimester" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choisissez le trimestre de l'examen.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trimesters.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTrimester(t); setStep("chapters"); }}
                className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
              >
                {t === 4 && <Star className="h-4 w-4 text-violet-600" />}
                {t === 5 && <Award className="h-4 w-4 text-rose-600" />}
                <span className="font-medium text-sm">{TRIMESTER_LABELS[t]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "chapters" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Sélectionnez les chapitres à couvrir.</p>
          {loadingChapters ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun chapitre disponible pour ce niveau.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {chapters.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-secondary/50">
                  <Checkbox checked={selectedChapterIds.includes(c.id)} onCheckedChange={() => toggleChapter(c.id)} />
                  <span className="text-sm">{c.title}</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setStep("trimester")}>
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>
            <Button size="sm" className="gap-1" disabled={selectedChapterIds.length === 0} onClick={() => setStep("params")}>
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "params" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Nombre d'exercices par chapitre, et précisions libres.</p>
          <div className="space-y-2">
            {selectedChapterIds.map((id) => (
              <div key={id} className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
                <span className="text-sm truncate">{chapters.find((c) => c.id === id)?.title}</span>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  className="w-20 h-8"
                  value={countPerChapter[id] ?? 2}
                  onChange={(e) => setCountPerChapter((p) => ({ ...p, [id]: Math.max(1, Math.min(10, Number(e.target.value) || 1)) }))}
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Instructions libres pour l'IA (optionnel)</Label>
            <Textarea
              rows={3}
              placeholder="Ex : privilégier des problèmes concrets, éviter les nombres décimaux..."
              value={chatInstructions}
              onChange={(e) => setChatInstructions(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setStep("chapters")}>
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>
            <Button size="sm" className="gap-1" onClick={() => setStep("difficulty")}>
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "difficulty" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Niveau de difficulté par chapitre.</p>
          <div className="space-y-2">
            {selectedChapterIds.map((id) => (
              <div key={id} className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
                <span className="text-sm truncate">{chapters.find((c) => c.id === id)?.title}</span>
                <Select
                  value={String(difficultyPerChapter[id] ?? 2)}
                  onValueChange={(v) => setDifficultyPerChapter((p) => ({ ...p, [id]: Number(v) }))}
                >
                  <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((d) => (
                      <SelectItem key={d} value={String(d)}>{DIFFICULTY_LABELS[d]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setStep("params")}>
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>
            <Button size="sm" className="gap-2" onClick={generate}>
              <Sparkles className="h-4 w-4" /> Générer
            </Button>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Génération en cours… {progress.done}/{progress.total}</p>
        </div>
      )}
    </div>
  );
}
