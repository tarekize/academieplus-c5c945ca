import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Send, Sparkles, ChevronLeft, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";
import {
  ContentType, CONTENT_TYPE_LABELS, GeneratedItem,
  generateTeacherContent, saveTeacherContent, assignContent,
} from "@/lib/teacherContent";
import SendContentDialog from "./SendContentDialog";
import DocumentImportButton from "@/components/DocumentImportButton";
import GeneratedItemPreviewDialog from "@/components/GeneratedItemPreviewDialog";

type Step = "greeting" | "level" | "filiere" | "chapter" | "lesson" | "count" | "difficulty" | "generating" | "results";

interface ChapterRow { id: string; title: string; }
interface LessonRow { id: string; title: string; chapter_id: string; }
interface FiliereRow { id: string; code: string; name: string; name_ar: string | null; }

/** Un item généré, associé au chapitre/leçon dont il provient (peut être vide
 * pour un item importé depuis un document, non rattaché à une leçon précise). */
interface GenEntry extends GeneratedItem {
  _chapterId: string | null;
  _lessonId: string | null;
  _lessonTitle?: string | null;
}

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
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [count, setCount] = useState(3);
  const [diffMin, setDiffMin] = useState(1);
  const [diffMax, setDiffMax] = useState(3);

  const [items, setItems] = useState<GenEntry[]>([]);
  const [sendIndex, setSendIndex] = useState<number | null>(null);
  const [sentIdx, setSentIdx] = useState<Record<number, boolean>>({});
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [genProgress, setGenProgress] = useState<{ done: number; total: number } | null>(null);

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
    setSelectedChapterIds([]);
    setLoadingList(false);
    setStep("chapter");
  };

  const chooseLevel = async (lv: string) => {
    setLevel(lv);
    setFiliere(null);
    setLoadingList(true);
    // Chapters are tied to a specific filière — a level with several (terminale,
    // premiere, seconde) needs one picked first, otherwise their chapters mix together.
    // Ne propose que les filières réellement présentes parmi les classes de
    // l'enseignant à ce niveau (pas toutes les filières existantes) — sinon il
    // pouvait rattacher du contenu à une filière où il n'a aucune classe.
    const [{ data: filiereRows }, { data: teacherClasses }] = await Promise.all([
      supabase.from("filieres").select("id, code, name, name_ar").eq("school_level", lv as any).order("name"),
      supabase.from("classes").select("filiere").eq("teacher_id", teacherId).eq("school_level", lv as any),
    ]);
    const teacherFiliereValues = new Set(((teacherClasses as any[]) || []).map((c) => c.filiere).filter(Boolean));
    const fRows = ((filiereRows as FiliereRow[]) || []).filter(
      (f) => teacherFiliereValues.has(f.code) || teacherFiliereValues.has(f.name)
    );
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

  const toggleChapter = (id: string) => {
    setSelectedChapterIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmChapters = async () => {
    if (selectedChapterIds.length === 0) {
      toast.error("Choisis au moins un chapitre.");
      return;
    }
    setLoadingList(true);
    const { data } = await supabase
      .from("lessons").select("id, title, chapter_id").in("chapter_id", selectedChapterIds).order("order_index");
    setLessons((data as LessonRow[]) || []);
    setSelectedLessonIds([]);
    setLoadingList(false);
    setStep("lesson");
  };

  const toggleLesson = (id: string) => {
    setSelectedLessonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmLessons = () => {
    if (selectedLessonIds.length === 0) {
      toast.error("Choisis au moins une leçon.");
      return;
    }
    setStep("count");
  };

  const runGeneration = async () => {
    if (diffMin > diffMax) {
      toast.error("Le niveau minimal doit être inférieur ou égal au niveau maximal.");
      return;
    }
    setStep("generating");
    const targetLessons = lessons.filter((l) => selectedLessonIds.includes(l.id));
    setGenProgress({ done: 0, total: targetLessons.length });
    const allResults: GenEntry[] = [];
    try {
      for (let i = 0; i < targetLessons.length; i++) {
        const ls = targetLessons[i];
        const ch = chapters.find((c) => c.id === ls.chapter_id);
        try {
          // Un lot par leçon (pas un total réparti entre les leçons) : "count"
          // s'applique intégralement à chaque leçon sélectionnée.
          const result = await generateTeacherContent({
            contentType,
            schoolLevel: level,
            chapterTitle: ch?.title,
            lessonTitle: ls.title,
            count,
            difficultyMin: diffMin,
            difficultyMax: diffMax,
          });
          allResults.push(...result.map((it) => ({ ...it, _chapterId: ls.chapter_id, _lessonId: ls.id, _lessonTitle: ls.title })));
        } catch (e: any) {
          toast.error(`Échec pour « ${ls.title} » : ${e.message || "erreur de génération"}`);
        }
        setGenProgress({ done: i + 1, total: targetLessons.length });
      }
      if (allResults.length === 0) {
        toast.error("Aucun contenu généré, réessayez.");
        setStep("difficulty");
        return;
      }
      setItems(allResults);
      setSentIdx({});
      setStep("results");
    } finally {
      setGenProgress(null);
    }
  };

  const handleSend = async (classIds: string[]) => {
    if (sendIndex === null) return;
    const item = items[sendIndex];
    try {
      const id = await saveTeacherContent({
        teacherId, contentType,
        chapterId: item._chapterId, lessonId: item._lessonId,
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

  const handleDocumentExtracted = (extracted: GeneratedItem[]) => {
    // Ajoute à la suite des items déjà là (générés ou déjà importés) — les index
    // existants dans sentIdx restent valides puisqu'on ajoute en fin de liste.
    // Un document importé n'est pas rattaché à une leçon précise.
    const tagged: GenEntry[] = extracted.map((it) => ({ ...it, _chapterId: null, _lessonId: null }));
    setItems((prev) => [...prev, ...tagged]);
    setStep("results");
  };

  const updateItem = (idx: number, patch: Partial<GeneratedItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const selectedChapters = chapters.filter((c) => selectedChapterIds.includes(c.id));
  const selectedLessons = lessons.filter((l) => selectedLessonIds.includes(l.id));

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
                  {filieres.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune de vos classes n'a de filière à ce niveau.</p>
                  ) : filieres.map((f, i) => (
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

          {/* Step: chapter (sélection multiple) */}
          {step === "chapter" && (
            <>
              <Bubble>Parfait ! Dans quel(s) cours veux-tu rattacher ce contenu ? Sélectionne un ou plusieurs chapitres :</Bubble>
              {loadingList ? <Loader2 className="h-5 w-5 animate-spin text-primary ml-10" /> : (
                <div className="pl-10 space-y-3 max-w-md">
                  {chapters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun chapitre pour ce niveau.</p>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        {chapters.map((ch) => (
                          <label key={ch.id} className="flex items-center gap-2 text-sm cursor-pointer rounded-lg border px-3 py-2 hover:bg-muted/50">
                            <Checkbox checked={selectedChapterIds.includes(ch.id)} onCheckedChange={() => toggleChapter(ch.id)} />
                            {ch.title}
                          </label>
                        ))}
                      </div>
                      <Button size="sm" onClick={confirmChapters}>Continuer</Button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {selectedChapters.length > 0 && (step === "lesson" || step === "count" || step === "difficulty" || step === "generating" || step === "results") && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {selectedChapters.map((ch) => <Badge key={ch.id} variant="secondary">{ch.title}</Badge>)}
            </div>
          )}

          {/* Step: lesson (sélection multiple, groupée par chapitre) */}
          {step === "lesson" && (
            <>
              <Bubble>Sélectionne les leçons ciblées dans chaque chapitre :</Bubble>
              {loadingList ? <Loader2 className="h-5 w-5 animate-spin text-primary ml-10" /> : (
                <div className="pl-10 space-y-4 max-w-md">
                  {selectedChapters.map((ch) => {
                    const chLessons = lessons.filter((l) => l.chapter_id === ch.id);
                    return (
                      <div key={ch.id} className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground">{ch.title}</p>
                        {chLessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground pl-1">Aucune leçon dans ce chapitre.</p>
                        ) : chLessons.map((ls) => (
                          <label key={ls.id} className="flex items-center gap-2 text-sm cursor-pointer rounded-lg border px-3 py-2 hover:bg-muted/50">
                            <Checkbox checked={selectedLessonIds.includes(ls.id)} onCheckedChange={() => toggleLesson(ls.id)} />
                            {ls.title}
                          </label>
                        ))}
                      </div>
                    );
                  })}
                  <Button size="sm" onClick={confirmLessons}>Continuer</Button>
                </div>
              )}
            </>
          )}

          {selectedLessons.length > 0 && (step === "count" || step === "difficulty" || step === "generating" || step === "results") && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {selectedLessons.map((ls) => <Badge key={ls.id} variant="secondary">{ls.title}</Badge>)}
            </div>
          )}

          {/* Step: count */}
          {step === "count" && (
            <>
              <Bubble>
                Combien de {typeLabel.toLowerCase()}s veux-tu générer pour CHAQUE leçon sélectionnée ? (1 à 10)
              </Bubble>
              <div className="pl-10 space-y-3 max-w-sm">
                <div className="flex items-center gap-3">
                  <Input
                    type="number" min={1} max={10} value={count}
                    onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground">par leçon</span>
                </div>
                <Button size="sm" onClick={() => setStep("difficulty")}>Continuer</Button>
              </div>
            </>
          )}

          {/* Step: difficulty */}
          {step === "difficulty" && (
            <>
              <Bubble>Quel niveau de difficulté ? Saisis une valeur minimale et maximale (1 = facile, 5 = avancé).</Bubble>
              <div className="pl-10 space-y-3 max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Min</span>
                    <Input
                      type="number" min={1} max={5} value={diffMin}
                      onChange={(e) => setDiffMin(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Max</span>
                    <Input
                      type="number" min={1} max={5} value={diffMax}
                      onChange={(e) => setDiffMax(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16"
                    />
                  </div>
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
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours{genProgress ? ` (${genProgress.done}/${genProgress.total} leçons)` : "…"}
              </span>
            </Bubble>
          )}

          {/* Step: results */}
          {step === "results" && (
            <>
              <Bubble>Voici {items.length} {typeLabel.toLowerCase()}{items.length > 1 ? "s" : ""}. Visualise, modifie si besoin (directement ou en LaTeX), puis clique sur « Envoyer ».</Bubble>
              <div className="space-y-3 pl-2">
                {items.map((it, idx) => (
                  <Card key={idx} className={sentIdx[idx] ? "border-border" : "border-primary/20"}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                          {typeLabel} {idx + 1}
                          {it._lessonTitle && <span className="text-xs font-normal text-muted-foreground">{it._lessonTitle}</span>}
                          {it.difficulty ? <Badge variant="outline">Diff. {it.difficulty}/5</Badge> : null}
                        </p>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => setPreviewIdx(idx)}>
                            <Eye className="h-3.5 w-3.5" /> Visualiser
                          </Button>
                          <Button
                            size="sm" variant={sentIdx[idx] ? "secondary" : "default"}
                            className="gap-1" disabled={sentIdx[idx]}
                            onClick={() => setSendIndex(idx)}
                          >
                            {sentIdx[idx] ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                            {sentIdx[idx] ? "Envoyé" : "Envoyer"}
                          </Button>
                        </div>
                      </div>
                      {it.title && <p className="font-medium text-sm">{it.title}</p>}
                      {it.statement && <p className="text-sm whitespace-pre-wrap line-clamp-3 text-muted-foreground">{it.statement}</p>}
                      {it.question && <p className="text-sm whitespace-pre-wrap line-clamp-3 text-muted-foreground">{it.question}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="pl-2">
                <Button
                  size="sm" variant="ghost" className="gap-1"
                  onClick={() => {
                    setItems([]); setSentIdx({});
                    setSelectedChapterIds([]); setSelectedLessonIds([]);
                    setStep("chapter");
                  }}
                >
                  <ChevronLeft className="h-4 w-4" /> Générer d'autres contenus
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 border-t border-border flex flex-col items-center gap-1.5">
          {level ? (
            <DocumentImportButton contentType={contentType} onExtracted={handleDocumentExtracted} />
          ) : (
            // school_level est obligatoire pour enregistrer le contenu (colonne
            // NOT NULL) — sans niveau choisi, l'envoi plantait avec une erreur
            // Postgres brute ("invalid input value for enum school_level: ''").
            // On bloque donc l'import tant que le niveau n'est pas encore choisi,
            // au lieu de laisser échouer l'envoi plus tard.
            <p className="text-xs text-muted-foreground">Choisis d'abord un niveau ci-dessus pour pouvoir importer un document.</p>
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

      <GeneratedItemPreviewDialog
        open={previewIdx !== null}
        onOpenChange={(o) => !o && setPreviewIdx(null)}
        item={previewIdx !== null ? items[previewIdx] : null}
        onChange={(patch) => previewIdx !== null && updateItem(previewIdx, patch)}
        onSend={() => {
          if (previewIdx === null) return;
          const idx = previewIdx;
          setPreviewIdx(null);
          setSendIndex(idx);
        }}
        sent={previewIdx !== null ? !!sentIdx[previewIdx] : false}
      />
    </Card>
  );
}
