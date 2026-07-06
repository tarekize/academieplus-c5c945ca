import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Bot, Loader2, Send, Sparkles, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";
import {
  ContentType, CONTENT_TYPE_LABELS, GeneratedItem,
  generateTeacherContent, saveTeacherContent, assignContent,
} from "@/lib/teacherContent";
import SendContentDialog from "./SendContentDialog";

type Step = "greeting" | "level" | "filiere" | "chapter" | "lesson" | "count" | "difficulty" | "generating" | "results";

interface ChapterRow { id: string; title: string; }
interface LessonRow { id: string; title: string; }
interface FiliereRow { id: string; code: string; name: string; name_ar: string | null; }

interface Props {
  teacherId: string;
  contentType: ContentType;
}

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

export default function GuidedContentChatbot({ teacherId, contentType }: Props) {
  const [step, setStep] = useState<Step>("greeting");
  const [levels, setLevels] = useState<string[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [level, setLevel] = useState<string>("");
  const [filieres, setFilieres] = useState<FiliereRow[]>([]);
  const [filiere, setFiliere] = useState<FiliereRow | null>(null);
  const [chapter, setChapter] = useState<ChapterRow | null>(null);
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [count, setCount] = useState(3);
  const [diff, setDiff] = useState<[number, number]>([1, 3]);

  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [sendIndex, setSendIndex] = useState<number | null>(null);
  const [sentIdx, setSentIdx] = useState<Record<number, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [step, items]);

  // Load distinct levels of the teacher's classes
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("classes").select("school_level").eq("teacher_id", teacherId);
      const set = Array.from(new Set(((data as any[]) || []).map((c) => c.school_level).filter(Boolean)));
      setLevels(set as string[]);
      setStep("level");
    })();
  }, [teacherId]);

  const fetchChaptersFor = async (lv: string, filiereRow: FiliereRow | null) => {
    setLoadingList(true);
    let query = supabase
      .from("chapters").select("id, title")
      .eq("school_level", lv as any).eq("subject", "math")
      .order("order_index");
    query = filiereRow ? query.eq("filiere_id", filiereRow.id) : query.is("filiere_id", null);
    const { data } = await query;
    setChapters((data as ChapterRow[]) || []);
    setLoadingList(false);
    setStep("chapter");
  };

  const chooseLevel = async (lv: string) => {
    setLevel(lv);
    setFiliere(null);
    setLoadingList(true);
    // Chapters are tied to a specific filière — a level with several (terminale,
    // premiere, seconde) needs one picked first, otherwise their chapters mix together.
    const { data: filiereRows } = await supabase
      .from("filieres").select("id, code, name, name_ar")
      .eq("school_level", lv as any).order("name");
    const fRows = (filiereRows as FiliereRow[]) || [];
    setFilieres(fRows);
    if (fRows.length > 0) {
      setLoadingList(false);
      setStep("filiere");
      return;
    }
    await fetchChaptersFor(lv, null);
  };

  const chooseFiliere = async (f: FiliereRow) => {
    setFiliere(f);
    await fetchChaptersFor(level, f);
  };

  const chooseChapter = async (ch: ChapterRow) => {
    setChapter(ch);
    setLoadingList(true);
    const { data } = await supabase
      .from("lessons").select("id, title").eq("chapter_id", ch.id).order("order_index");
    setLessons((data as LessonRow[]) || []);
    setLoadingList(false);
    setStep("lesson");
  };

  const chooseLesson = (ls: LessonRow) => { setLesson(ls); setStep("count"); };

  const runGeneration = async () => {
    setStep("generating");
    try {
      const result = await generateTeacherContent({
        contentType,
        schoolLevel: level,
        chapterTitle: chapter?.title,
        lessonTitle: lesson?.title,
        count,
        difficultyMin: diff[0],
        difficultyMax: diff[1],
      });
      if (result.length === 0) {
        toast.error("Aucun contenu généré, réessayez.");
        setStep("difficulty");
        return;
      }
      setItems(result);
      setStep("results");
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération");
      setStep("difficulty");
    }
  };

  const handleSend = async (classIds: string[]) => {
    if (sendIndex === null) return;
    const item = items[sendIndex];
    try {
      const id = await saveTeacherContent({
        teacherId, contentType,
        chapterId: chapter?.id, lessonId: lesson?.id,
        schoolLevel: level, filiere: filiere?.code || null, title: item.title || item.question?.slice(0, 60),
        payload: item, difficulty: item.difficulty, source: "ai",
      });
      await assignContent({ contentId: id, assignedBy: teacherId, classIds });
      setSentIdx((s) => ({ ...s, [sendIndex]: true }));
      toast.success("Contenu envoyé aux classes sélectionnées");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    }
  };

  const typeLabel = CONTENT_TYPE_LABELS[contentType];

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div ref={scrollRef} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          <Bubble>Salut ! 👋 Je vais t'aider à créer des {typeLabel.toLowerCase()}s. Sur quel niveau puis-je t'aider ?</Bubble>

          {/* Step: level */}
          {(step === "level") && (
            <div className="flex flex-wrap gap-2 pl-10">
              {levels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Vous n'avez aucune classe. Créez d'abord une classe.</p>
              ) : levels.map((lv) => (
                <Button key={lv} size="sm" variant="outline" onClick={() => chooseLevel(lv)}>
                  {getSchoolLevelLabel(lv)}
                </Button>
              ))}
            </div>
          )}

          {level && step !== "level" && (
            <div className="flex justify-end"><Badge variant="secondary">{getSchoolLevelLabel(level)}</Badge></div>
          )}

          {/* Step: filiere */}
          {step === "filiere" && (
            <>
              <Bubble>Quelle filière ?</Bubble>
              {loadingList ? <Loader2 className="h-5 w-5 animate-spin text-primary ml-10" /> : (
                <div className="flex flex-wrap gap-2 pl-10">
                  {filieres.map((f, i) => (
                    <Button
                      key={f.id} size="sm" variant="outline"
                      onClick={() => chooseFiliere(f)}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {f.name_ar || f.name}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          {filiere && (step === "chapter" || step === "lesson" || step === "count" || step === "difficulty" || step === "generating" || step === "results") && (
            <div className="flex justify-end"><Badge variant="secondary">{filiere.name_ar || filiere.name}</Badge></div>
          )}

          {/* Step: chapter */}
          {step === "chapter" && (
            <>
              <Bubble>Parfait ! Dans quel cours veux-tu rattacher ce contenu ? Voici les chapitres :</Bubble>
              {loadingList ? <Loader2 className="h-5 w-5 animate-spin text-primary ml-10" /> : (
                <div className="flex flex-wrap gap-2 pl-10">
                  {chapters.map((ch, i) => (
                    <Button
                      key={ch.id} size="sm" variant="outline"
                      onClick={() => chooseChapter(ch)}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {ch.title}
                    </Button>
                  ))}
                  {chapters.length === 0 && <p className="text-sm text-muted-foreground">Aucun chapitre pour ce niveau.</p>}
                </div>
              )}
            </>
          )}

          {chapter && (step === "lesson" || step === "count" || step === "difficulty" || step === "generating" || step === "results") && (
            <div className="flex justify-end"><Badge variant="secondary">{chapter.title}</Badge></div>
          )}

          {/* Step: lesson */}
          {step === "lesson" && (
            <>
              <Bubble>Sélectionne la leçon ciblée :</Bubble>
              {loadingList ? <Loader2 className="h-5 w-5 animate-spin text-primary ml-10" /> : (
                <div className="flex flex-wrap gap-2 pl-10">
                  {lessons.map((ls, i) => (
                    <Button
                      key={ls.id} size="sm" variant="outline"
                      onClick={() => chooseLesson(ls)}
                      className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {ls.title}
                    </Button>
                  ))}
                  {lessons.length === 0 && <p className="text-sm text-muted-foreground">Aucune leçon dans ce chapitre.</p>}
                </div>
              )}
            </>
          )}

          {lesson && (step === "count" || step === "difficulty" || step === "generating" || step === "results") && (
            <div className="flex justify-end"><Badge variant="secondary">{lesson.title}</Badge></div>
          )}

          {/* Step: count */}
          {step === "count" && (
            <>
              <Bubble>Combien de {typeLabel.toLowerCase()}s veux-tu générer ? (1 à 10)</Bubble>
              <div className="pl-10 space-y-3 max-w-sm">
                <div className="flex items-center gap-3">
                  <Slider value={[count]} min={1} max={10} step={1} onValueChange={(v) => setCount(v[0])} />
                  <span className="font-bold w-6 text-center">{count}</span>
                </div>
                <Button size="sm" onClick={() => setStep("difficulty")}>Continuer</Button>
              </div>
            </>
          )}

          {/* Step: difficulty */}
          {step === "difficulty" && (
            <>
              <Bubble>Quel niveau de difficulté ? Choisis une valeur minimale et maximale (1 = facile, 5 = avancé).</Bubble>
              <div className="pl-10 space-y-3 max-w-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8">Min {diff[0]}</span>
                  <Slider
                    value={diff} min={1} max={5} step={1}
                    onValueChange={(v) => setDiff([v[0], v[1]] as [number, number])}
                  />
                  <span className="text-xs text-muted-foreground w-8">Max {diff[1]}</span>
                </div>
                <Button size="sm" className="gap-2" onClick={runGeneration}>
                  <Sparkles className="h-4 w-4" /> Générer
                </Button>
              </div>
            </>
          )}

          {/* Step: generating */}
          {step === "generating" && (
            <Bubble>
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Génération en cours…</span>
            </Bubble>
          )}

          {/* Step: results */}
          {step === "results" && (
            <>
              <Bubble>Voici {items.length} {typeLabel.toLowerCase()}{items.length > 1 ? "s" : ""}. Clique sur « Envoyer » pour les diffuser aux classes.</Bubble>
              <div className="space-y-3 pl-2">
                {items.map((it, idx) => (
                  <Card key={idx} className="border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">
                          {typeLabel} {idx + 1}
                          {it.difficulty ? <Badge variant="outline" className="ml-2">Diff. {it.difficulty}/5</Badge> : null}
                        </p>
                        <Button
                          size="sm" variant={sentIdx[idx] ? "secondary" : "default"}
                          className="gap-1 shrink-0" disabled={sentIdx[idx]}
                          onClick={() => setSendIndex(idx)}
                        >
                          <Send className="h-3.5 w-3.5" /> {sentIdx[idx] ? "Envoyé" : "Envoyer"}
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
                      {it.hint && <p className="text-xs text-amber-700 dark:text-amber-400">💡 Indice : {it.hint}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="pl-2">
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => { setItems([]); setSentIdx({}); setStep("count"); }}>
                  <ChevronLeft className="h-4 w-4" /> Générer d'autres contenus
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <SendContentDialog
        open={sendIndex !== null}
        onOpenChange={(o) => { if (!o) setSendIndex(null); }}
        teacherId={teacherId}
        schoolLevel={level}
        onConfirm={handleSend}
      />
    </Card>
  );
}
