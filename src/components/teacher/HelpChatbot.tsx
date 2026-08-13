import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Loader2, Send, Sparkles, Eye, CheckCircle2, History, Plus, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import {
  GeneratedItem, generateTeacherContent, saveTeacherContent, assignContent,
} from "@/lib/teacherContent";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";
import { computeStudentGroup, GROUP_INFO, GROUP_ORDER, type StudentGroupLetter } from "@/lib/studentGrouping";
import { TeacherContentSessionRow, saveTeacherContentSession } from "@/lib/teacherContentSessions";
import TeacherContentSessionHistory from "./TeacherContentSessionHistory";
import LessonMarkdown from "@/components/course/LessonMarkdown";
import RichContentField from "@/components/course/RichContentField";

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

interface WeakLesson { lessonId: string; title: string; chapterTitle: string; chapterId: string | null; }
type ContentTypeSel = "exercise" | "quiz";
interface GroupOption { letter: StudentGroupLetter; studentIds: string[]; }
interface GenEntry extends GeneratedItem { _type: ContentTypeSel; _lessonTitle?: string; _lessonId?: string; _chapterId?: string | null; }
interface LessonPlan { exercise: number; quiz: number; }

/** Bulle de dialogue "assistant" (avatar + fond gris) du chat d'aide IA. */
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

type Phase =
  | "loadingGroups" | "selectGroup"
  | "analyzing" | "none" | "selectLacunes"
  | "selectTypes" | "chooseApproach"
  | "aiCounts"
  | "lessonCounts" | "lessonIdea"
  | "generating" | "results";

export default function HelpChatbot(props: Props) {
  const { teacherId, schoolLevel, studentIds, studentId, targetName, mode } = props;
  const [phase, setPhase] = useState<Phase>(mode === "class" ? "loadingGroups" : "analyzing");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Groupes (mode classe uniquement)
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);

  // Lacunes
  const [weak, setWeak] = useState<WeakLesson[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);

  // Types de contenu
  const [types, setTypes] = useState<ContentTypeSel[]>(["exercise", "quiz"]);

  // Approche
  const [approach, setApproach] = useState<"ai" | "teacher" | null>(null);

  // Branche "IA génère tout"
  const [aiExerciseCount, setAiExerciseCount] = useState(4);
  const [aiQuizCount, setAiQuizCount] = useState(4);

  // Branche "j'ai des idées"
  const [lessonIdx, setLessonIdx] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan>({ exercise: 1, quiz: 1 });
  const [plans, setPlans] = useState<Record<string, LessonPlan>>({});
  const [itemQueue, setItemQueue] = useState<{ type: ContentTypeSel; indexInType: number }[]>([]);
  const [itemPos, setItemPos] = useState(0);
  const [ideaText, setIdeaText] = useState("");
  const [ideas, setIdeas] = useState<Record<string, string>>({});

  const [genProgress, setGenProgress] = useState<{ done: number; total: number } | null>(null);
  const [items, setItems] = useState<GenEntry[]>([]);
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Chat libre borné (écran "results") : l'enseignant peut demander à l'IA
  // d'enrichir/retirer/corriger un exercice ou quiz déjà généré. Persisté
  // dans la session au même titre que items/sent, pour que "Historique"
  // restaure une conversation qu'on peut continuer plutôt qu'un instantané figé.
  const [refineMessages, setRefineMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [refineInput, setRefineInput] = useState("");
  const [refineSending, setRefineSending] = useState(false);
  const refineScrollRef = useRef<HTMLDivElement>(null);
  // loadSession() appelle setSelectedGroup(...) pour restaurer l'état affiché
  // (nom du groupe, etc.) — mais selectedGroup est aussi la dépendance de
  // l'effet "Étape 2" ci-dessous (détection des lacunes), qui se relançait
  // donc à chaque restauration d'historique et écrasait phase="results" par
  // phase="selectLacunes" juste après. Ce ref laisse loadSession signaler à
  // cet effet de s'ignorer une fois, sans changer sa logique pour le vrai
  // flux (l'utilisateur qui clique sur un groupe à l'étape "selectGroup").
  const skipNextLacunesDetectionRef = useRef(false);

  const selectedLessons = weak.filter((w) => selectedLessonIds.includes(w.lessonId));
  const targetStudentIds = mode === "class" ? (selectedGroup?.studentIds || []) : (studentId ? [studentId] : []);

  // Fait défiler la conversation vers le bas à chaque nouvelle étape/résultat, comme un vrai chat.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [phase, items, itemPos, lessonIdx]);

  // Sauvegarde automatique de la session dès qu'un résultat existe, pour la
  // retrouver plus tard dans l'historique (bouton "Historique").
  useEffect(() => {
    if (phase !== "results" || items.length === 0) return;
    const title = `Aide · ${mode === "class" ? `Groupe ${selectedGroup?.letter ?? ""}` : targetName}${weak.length ? ` · ${selectedLessons.slice(0, 2).map((l) => l.title).join(", ")}${selectedLessons.length > 2 ? "…" : ""}` : ""}`;
    const state = {
      selectedGroup, weak, selectedLessonIds, types, approach,
      aiExerciseCount, aiQuizCount, items, sent, refineMessages,
    };
    saveTeacherContentSession({ id: sessionId, teacherId, contentType: "help", title, state })
      .then((id) => setSessionId(id))
      .catch((err) => console.error("Error saving teacher content session:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, items, sent, refineMessages]);

  /** Restaure une session sauvegardée (bouton "Historique") et saute directement à
   * l'écran des résultats — y compris le fil du chat libre, pour pouvoir CONTINUER
   * la conversation avec l'IA plutôt que de retomber sur un instantané figé. */
  const loadSession = (session: TeacherContentSessionRow) => {
    const s = session.state || {};
    skipNextLacunesDetectionRef.current = true;
    setSelectedGroup(s.selectedGroup || null);
    setWeak(s.weak || []);
    setSelectedLessonIds(s.selectedLessonIds || []);
    setTypes(s.types || ["exercise", "quiz"]);
    setApproach(s.approach || null);
    setAiExerciseCount(s.aiExerciseCount || 4);
    setAiQuizCount(s.aiQuizCount || 4);
    setItems(s.items || []);
    setSent(s.sent || {});
    setRefineMessages(s.refineMessages || []);
    setSessionId(session.id);
    setPhase("results");
    setShowHistory(false);
  };

  /** Repart de zéro sur une nouvelle session (dissocie sessionId pour ne pas écraser l'ancienne). */
  const startNewSession = () => {
    setSessionId(null);
    setRefineMessages([]);
    restart();
    setShowHistory(false);
  };

  // Fait défiler le chat libre vers le bas à chaque nouveau message.
  useEffect(() => {
    refineScrollRef.current?.scrollTo({ top: refineScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [refineMessages]);

  /** Applique une action renvoyée par l'IA (update/remove/add) à la liste d'items
   * générés — la même liste que "Accepter & envoyer" travaille déjà, donc toute
   * modification ici est immédiatement visible/envoyable sans étape supplémentaire. */
  const applyRefineAction = (action: any) => {
    if (action.op === "update") {
      setItems((prev) => prev.map((it, i) => (i === action.index ? { ...it, ...action.patch } : it)));
    } else if (action.op === "remove") {
      setItems((prev) => prev.filter((_, i) => i !== action.index));
      setSent((prev) => {
        const next: Record<number, boolean> = {};
        Object.entries(prev).forEach(([k, v]) => {
          const idx = Number(k);
          if (idx < action.index) next[idx] = v;
          else if (idx > action.index) next[idx - 1] = v;
        });
        return next;
      });
    } else if (action.op === "add") {
      setItems((prev) => [...prev, action.item as GenEntry]);
    }
  };

  /** Envoie le message libre de l'enseignant au chat borné (refine-teacher-content),
   * qui ne répond QUE sur les exercices/quiz déjà générés (voir le prompt système
   * côté edge function) — applique ensuite les éventuelles actions renvoyées
   * (enrichir/retirer/corriger un item) à la liste affichée. */
  const sendRefineMessage = async () => {
    const message = refineInput.trim();
    if (!message || refineSending) return;
    setRefineInput("");
    const nextHistory = [...refineMessages, { role: "user" as const, content: message }];
    setRefineMessages(nextHistory);
    setRefineSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("refine-teacher-content", {
        body: { items, message, conversationHistory: refineMessages },
      });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      const actions = Array.isArray(data?.actions) ? data.actions : [];
      actions.forEach(applyRefineAction);
      setRefineMessages([...nextHistory, { role: "assistant" as const, content: data?.reply || "…" }]);
    } catch (e: any) {
      setRefineMessages([...nextHistory, { role: "assistant" as const, content: `⚠️ ${e.message || "Erreur, réessayez."}` }]);
    } finally {
      setRefineSending(false);
    }
  };

  // --- Étape 1 (mode classe) : calcule les groupes A/B/C/D de la classe ---
  useEffect(() => {
    if (mode !== "class") return;
    (async () => {
      const ids = studentIds || [];
      if (ids.length === 0) { setGroups([]); setPhase("none"); return; }
      const { data: scores } = await supabase
        .from("student_scores")
        .select("user_id, lesson_id, current_level, total_answers")
        .in("user_id", ids);
      const rows = ((scores as any[]) || []);
      const byGroup: Record<StudentGroupLetter, string[]> = { A: [], B: [], C: [], D: [] };
      for (const sid of ids) {
        const own = rows.filter((r) => r.user_id === sid);
        const { group } = computeStudentGroup(own.map((r) => ({ lesson_id: r.lesson_id, current_level: r.current_level, total_answers: r.total_answers })));
        byGroup[group].push(sid);
      }
      const opts: GroupOption[] = GROUP_ORDER
        .filter((letter) => byGroup[letter].length > 0)
        .map((letter) => ({ letter, studentIds: byGroup[letter] }));
      setGroups(opts);
      setPhase("selectGroup");
    })();
  }, [mode, JSON.stringify(studentIds)]);

  // --- Étape 2 : détection des lacunes pour la cible sélectionnée (groupe ou élève) ---
  useEffect(() => {
    if (skipNextLacunesDetectionRef.current) { skipNextLacunesDetectionRef.current = false; return; }
    const ids = mode === "class" ? (selectedGroup?.studentIds || []) : (studentId ? [studentId] : []);
    if (mode === "class" && !selectedGroup) return;
    if (ids.length === 0) { setPhase("none"); return; }

    (async () => {
      setPhase("analyzing");
      const { data: scores } = await supabase
        .from("student_scores")
        .select("user_id, lesson_id, current_level, total_answers")
        .in("user_id", ids);
      const rows = ((scores as any[]) || []).filter((s) => s.lesson_id && (s.total_answers || 0) > 0);

      const byLesson: Record<string, { weakCount: number; total: number }> = {};
      for (const r of rows) {
        byLesson[r.lesson_id] = byLesson[r.lesson_id] || { weakCount: 0, total: 0 };
        byLesson[r.lesson_id].total += 1;
        if ((r.current_level || 0) < 40) byLesson[r.lesson_id].weakCount += 1;
      }

      const weakLessonIds: string[] = [];
      for (const [lid, v] of Object.entries(byLesson)) {
        if (mode === "class") {
          if (v.weakCount > v.total / 2) weakLessonIds.push(lid);
        } else if (v.weakCount > 0) weakLessonIds.push(lid);
      }

      if (weakLessonIds.length === 0) { setPhase("none"); return; }

      const { data: lessons } = await supabase.from("lessons").select("id, title, chapter_id").in("id", weakLessonIds);
      const chapterIds = Array.from(new Set(((lessons as any[]) || []).map((l) => l.chapter_id).filter(Boolean)));
      const { data: chaps } = await supabase.from("chapters").select("id, title").in("id", chapterIds.length ? chapterIds : ["00000000-0000-0000-0000-000000000000"]);
      const chapMap: Record<string, string> = {};
      for (const c of (chaps as any[]) || []) chapMap[c.id] = c.title;

      const w: WeakLesson[] = ((lessons as any[]) || []).map((l) => ({
        lessonId: l.id, title: l.title, chapterTitle: chapMap[l.chapter_id] || "", chapterId: l.chapter_id || null,
      }));
      setWeak(w);
      setSelectedLessonIds(w.map((l) => l.lessonId));
      setPhase("selectLacunes");
    })();
  }, [mode, selectedGroup, studentId]);

  /** Coche/décoche une leçon dans la liste des lacunes sélectionnées. */
  const toggleLesson = (id: string) => {
    setSelectedLessonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  /** Coche/décoche un type de contenu ("exercise" / "quiz") à générer. */
  const toggleType = (t: ContentTypeSel) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  /** Valide la sélection de leçons et passe à l'étape "types de contenu". */
  const goToTypes = () => {
    if (selectedLessonIds.length === 0) { toast.error("Sélectionnez au moins une leçon"); return; }
    setPhase("selectTypes");
  };
  /** Valide les types choisis et passe à l'étape "approche" (IA seule vs idées du prof). */
  const goToApproach = () => {
    if (types.length === 0) { toast.error("Choisissez exercices, quiz, ou les deux"); return; }
    setPhase("chooseApproach");
  };

  // --- Branche "l'IA génère tout" ---
  // aiExerciseCount / aiQuizCount s'appliquent à CHAQUE leçon choisie (pas un total
  // réparti) : "1 exercice et 1 quiz" avec 2 leçons donne 1+1 par leçon, soit 4 items.
  const runAiGeneration = async () => {
    setPhase("generating");
    try {
      const lessons = selectedLessons;
      const perLessonExercises = types.includes("exercise") ? aiExerciseCount : 0;
      const perLessonQuizzes = types.includes("quiz") ? aiQuizCount : 0;
      const total = (perLessonExercises + perLessonQuizzes) * lessons.length;
      setGenProgress({ done: 0, total });
      const results: GenEntry[] = [];
      const focusBase = mode === "class"
        ? `Ces élèves (groupe ${selectedGroup?.letter}) sont en difficulté sur cette leçon.`
        : `${targetName} est en difficulté sur cette leçon.`;
      for (const lesson of lessons) {
        if (perLessonExercises > 0) {
          const gen = await generateTeacherContent({
            contentType: "exercise", schoolLevel: schoolLevel || undefined,
            chapterTitle: lesson.chapterTitle, lessonTitle: lesson.title,
            count: perLessonExercises, difficultyMin: 1, difficultyMax: 3, focusNote: focusBase,
          });
          results.push(...gen.map((g) => ({ ...g, _type: "exercise" as const, _lessonTitle: lesson.title, _lessonId: lesson.lessonId, _chapterId: lesson.chapterId })));
          setGenProgress((p) => p && { done: p.done + perLessonExercises, total: p.total });
        }
        if (perLessonQuizzes > 0) {
          const gen = await generateTeacherContent({
            contentType: "quiz", schoolLevel: schoolLevel || undefined,
            chapterTitle: lesson.chapterTitle, lessonTitle: lesson.title,
            count: perLessonQuizzes, difficultyMin: 1, difficultyMax: 3, focusNote: focusBase,
          });
          results.push(...gen.map((g) => ({ ...g, _type: "quiz" as const, _lessonTitle: lesson.title, _lessonId: lesson.lessonId, _chapterId: lesson.chapterId })));
          setGenProgress((p) => p && { done: p.done + perLessonQuizzes, total: p.total });
        }
      }
      if (results.length === 0) { toast.error("Aucun contenu généré."); setPhase("aiCounts"); return; }
      setItems(results);
      setSent({});
      setPhase("results");
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération");
      setPhase("aiCounts");
    } finally {
      setGenProgress(null);
    }
  };

  // --- Branche "j'ai des idées" : construit la file d'items pour la leçon courante ---
  const startLessonIdeas = () => {
    const queue: { type: ContentTypeSel; indexInType: number }[] = [];
    if (types.includes("exercise")) for (let i = 0; i < currentPlan.exercise; i++) queue.push({ type: "exercise", indexInType: i });
    if (types.includes("quiz")) for (let i = 0; i < currentPlan.quiz; i++) queue.push({ type: "quiz", indexInType: i });
    setPlans((p) => ({ ...p, [selectedLessons[lessonIdx].lessonId]: currentPlan }));
    if (queue.length === 0) {
      advanceLesson();
      return;
    }
    setItemQueue(queue);
    setItemPos(0);
    setIdeaText("");
    setPhase("lessonIdea");
  };

  /** Passe à la leçon suivante (réinitialise le plan par défaut) ou, si c'était la
   * dernière, lance la génération finale de tous les items planifiés. */
  const advanceLesson = () => {
    if (lessonIdx + 1 < selectedLessons.length) {
      setLessonIdx((i) => i + 1);
      setCurrentPlan({ exercise: types.includes("exercise") ? 1 : 0, quiz: types.includes("quiz") ? 1 : 0 });
      setPhase("lessonCounts");
    } else {
      runIdeaGeneration();
    }
  };

  /** Enregistre l'idée saisie par le prof pour l'item courant de la file, puis avance
   * à l'item suivant (ou à la leçon suivante si la file est épuisée). */
  const submitIdea = () => {
    const lesson = selectedLessons[lessonIdx];
    const item = itemQueue[itemPos];
    const key = `${lesson.lessonId}:${item.type}:${item.indexInType}`;
    setIdeas((prev) => ({ ...prev, [key]: ideaText.trim() }));
    setIdeaText("");
    if (itemPos + 1 < itemQueue.length) {
      setItemPos((p) => p + 1);
    } else {
      advanceLesson();
    }
  };

  /** Génère un item IA par job planifié (une leçon × un type × une idée du prof, ou
   * vide si le prof a laissé l'IA libre), en s'appuyant sur les plans par leçon. */
  const runIdeaGeneration = async () => {
    setPhase("generating");
    try {
      const allPlans = { ...plans, [selectedLessons[lessonIdx]?.lessonId || ""]: currentPlan };
      const jobs: { lesson: WeakLesson; type: ContentTypeSel; idea: string }[] = [];
      for (const lesson of selectedLessons) {
        const plan = allPlans[lesson.lessonId] || { exercise: 0, quiz: 0 };
        if (types.includes("exercise")) for (let i = 0; i < plan.exercise; i++) jobs.push({ lesson, type: "exercise", idea: ideas[`${lesson.lessonId}:exercise:${i}`] || "" });
        if (types.includes("quiz")) for (let i = 0; i < plan.quiz; i++) jobs.push({ lesson, type: "quiz", idea: ideas[`${lesson.lessonId}:quiz:${i}`] || "" });
      }
      setGenProgress({ done: 0, total: jobs.length });
      const results: GenEntry[] = [];
      for (const job of jobs) {
        const focus = job.idea
          ? `Idée de l'enseignant à améliorer et compléter : "${job.idea}".`
          : `Génère un contenu de soutien pour cette leçon.`;
        const gen = await generateTeacherContent({
          contentType: job.type, schoolLevel: schoolLevel || undefined,
          chapterTitle: job.lesson.chapterTitle, lessonTitle: job.lesson.title,
          count: 1, difficultyMin: 1, difficultyMax: 3, focusNote: focus,
        });
        results.push(...gen.map((g) => ({ ...g, _type: job.type, _lessonTitle: job.lesson.title, _lessonId: job.lesson.lessonId, _chapterId: job.lesson.chapterId })));
        setGenProgress((p) => p && { done: p.done + 1, total: p.total });
      }
      if (results.length === 0) { toast.error("Aucun contenu généré."); setPhase("chooseApproach"); return; }
      setItems(results);
      setSent({});
      setPhase("results");
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération");
      setPhase("chooseApproach");
    } finally {
      setGenProgress(null);
    }
  };

  /** Démarre la branche "j'ai des idées" : réinitialise l'itération leçon par leçon. */
  const beginTeacherApproach = () => {
    setLessonIdx(0);
    setCurrentPlan({ exercise: types.includes("exercise") ? 1 : 0, quiz: types.includes("quiz") ? 1 : 0 });
    setPlans({});
    setIdeas({});
    setPhase("lessonCounts");
  };

  /** Applique les modifications faites par le prof (édition directe/LaTeX) à un item généré. */
  const updateItem = (idx: number, patch: Partial<GenEntry>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  /** Sauvegarde un item généré comme contenu du prof puis l'assigne aux élèves ciblés
   * (groupe entier en mode classe, ou l'élève seul en mode élève). */
  const sendOne = async (idx: number) => {
    const it = items[idx];
    if (targetStudentIds.length === 0) { toast.error("Aucun destinataire sélectionné"); return; }
    try {
      const id = await saveTeacherContent({
        teacherId, contentType: it._type,
        chapterId: it._chapterId, lessonId: it._lessonId,
        schoolLevel,
        title: it.title || it.question?.slice(0, 60),
        payload: it, difficulty: it.difficulty, source: "ai",
      });
      await assignContent({ contentId: id, assignedBy: teacherId, studentIds: targetStudentIds });
      setSent((s) => ({ ...s, [idx]: true }));
      toast.success(`Contenu envoyé à ${mode === "class" ? `${targetName} (groupe ${selectedGroup?.letter})` : targetName}`);
      setPreviewIdx(null);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    }
  };

  /** Remet le chatbot à l'écran initial ("Recommencer"), sans toucher à sessionId. */
  const restart = () => {
    setPhase(mode === "class" ? "selectGroup" : "analyzing");
    setSelectedGroup(null);
    setWeak([]);
    setSelectedLessonIds([]);
    setApproach(null);
    setItems([]);
    setSent({});
    setRefineMessages([]);
  };

  if (showHistory) {
    return (
      <Card>
        <CardContent className="p-0 h-[60vh]">
          <TeacherContentSessionHistory
            teacherId={teacherId}
            contentType="help"
            activeSessionId={sessionId}
            onSelect={loadSession}
            onNew={startNewSession}
            onClose={() => setShowHistory(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-end gap-1 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary rounded-xl">
            <History className="h-3.5 w-3.5" /> Historique
          </Button>
          <Button variant="ghost" size="sm" onClick={startNewSession} className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary rounded-xl">
            <Plus className="h-3.5 w-3.5" /> Nouveau
          </Button>
        </div>
        <div ref={scrollRef} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {(phase === "loadingGroups" || phase === "analyzing") && (
            <Bubble><span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analyse des performances…</span></Bubble>
          )}

          {phase === "none" && (
            <Bubble>
              {mode === "class"
                ? "Bonne nouvelle ! Aucune lacune majoritaire détectée pour ce groupe pour le moment."
                : `Aucune lacune notable détectée pour ${targetName} pour le moment.`}
            </Bubble>
          )}

          {phase === "selectGroup" && (
            <>
              <Bubble>Quel groupe voulez-vous aider ?</Bubble>
              <div className="pl-10 grid gap-2 sm:grid-cols-2">
                {groups.map((g) => (
                  <button
                    key={g.letter}
                    onClick={() => setSelectedGroup(g)}
                    className="p-3 rounded-xl border-2 border-border hover:border-primary text-left transition-all"
                  >
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${GROUP_INFO[g.letter].tone}`}>
                      Groupe {g.letter}
                    </span>
                    <p className="text-sm font-medium mt-1">{GROUP_INFO[g.letter].label}</p>
                    <p className="text-xs text-muted-foreground">{g.studentIds.length} élève{g.studentIds.length > 1 ? "s" : ""}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === "selectLacunes" && (
            <>
              <Bubble>
                {mode === "class"
                  ? `Le groupe ${selectedGroup?.letter} a des lacunes dans ces leçons. Sélectionnez celles que vous voulez traiter.`
                  : `${targetName} a des lacunes dans ces leçons. Sélectionnez celles que vous voulez traiter.`}
              </Bubble>
              <div className="pl-10 flex flex-col gap-2">
                {weak.map((w) => (
                  <label key={w.lessonId} className="flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={selectedLessonIds.includes(w.lessonId)} onCheckedChange={() => toggleLesson(w.lessonId)} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">{w.title}</span>
                      {w.chapterTitle && <span className="block text-xs text-muted-foreground">{w.chapterTitle}</span>}
                    </span>
                  </label>
                ))}
              </div>
              <div className="pl-10">
                <Button size="sm" onClick={goToTypes} className="gap-1"><Sparkles className="h-4 w-4" /> Continuer</Button>
              </div>
            </>
          )}

          {(phase === "selectTypes" || phase === "chooseApproach" || phase === "aiCounts" || phase === "lessonCounts" || phase === "lessonIdea" || phase === "generating" || phase === "results") && (
            <Bubble>Leçons choisies : {selectedLessons.map((l) => l.title).join(", ")}</Bubble>
          )}

          {phase === "selectTypes" && (
            <>
              <Bubble>Voulez-vous des exercices, des quiz, ou les deux ?</Bubble>
              <div className="pl-10 flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={types.includes("exercise")} onCheckedChange={() => toggleType("exercise")} /> Exercices
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={types.includes("quiz")} onCheckedChange={() => toggleType("quiz")} /> Quiz
                </label>
              </div>
              <div className="pl-10">
                <Button size="sm" onClick={goToApproach}>Continuer</Button>
              </div>
            </>
          )}

          {phase === "chooseApproach" && (
            <>
              <Bubble>Avez-vous des idées en tête pour ces exercices/quiz, ou voulez-vous que je génère tout moi-même ?</Bubble>
              <div className="pl-10 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => { setApproach("teacher"); beginTeacherApproach(); }}
                  className="p-3 rounded-xl border-2 border-border hover:border-primary text-left"
                >
                  <p className="text-sm font-medium">J'ai des idées</p>
                  <p className="text-xs text-muted-foreground">Vous proposez vos idées, l'IA les améliore et les rédige</p>
                </button>
                <button
                  onClick={() => { setApproach("ai"); setPhase("aiCounts"); }}
                  className="p-3 rounded-xl border-2 border-border hover:border-primary text-left"
                >
                  <p className="text-sm font-medium">Génère tout toi-même</p>
                  <p className="text-xs text-muted-foreground">L'IA choisit et rédige tout, vous validez ensuite</p>
                </button>
              </div>
            </>
          )}

          {phase === "aiCounts" && (
            <>
              <Bubble>Combien en voulez-vous, pour chacune des {selectedLessons.length} leçon{selectedLessons.length > 1 ? "s" : ""} choisie{selectedLessons.length > 1 ? "s" : ""} ?</Bubble>
              <div className="pl-10 grid grid-cols-2 gap-4 max-w-sm">
                {types.includes("exercise") && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Exercices / leçon</label>
                    <Input type="number" min={0} max={20} value={aiExerciseCount} onChange={(e) => setAiExerciseCount(Math.max(0, parseInt(e.target.value) || 0))} />
                  </div>
                )}
                {types.includes("quiz") && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Quiz / leçon</label>
                    <Input type="number" min={0} max={20} value={aiQuizCount} onChange={(e) => setAiQuizCount(Math.max(0, parseInt(e.target.value) || 0))} />
                  </div>
                )}
              </div>
              <p className="pl-10 text-xs text-muted-foreground">
                Soit {(types.includes("exercise") ? aiExerciseCount : 0) + (types.includes("quiz") ? aiQuizCount : 0)} item(s) × {selectedLessons.length} leçon{selectedLessons.length > 1 ? "s" : ""} au total.
              </p>
              <div className="pl-10">
                <Button size="sm" onClick={runAiGeneration} className="gap-1"><Sparkles className="h-4 w-4" /> Générer</Button>
              </div>
            </>
          )}

          {phase === "lessonCounts" && selectedLessons[lessonIdx] && (
            <>
              <Bubble>
                Lacune « <strong>{selectedLessons[lessonIdx].title}</strong> » — combien d'exercices/quiz pour cette leçon ?
              </Bubble>
              <div className="pl-10 grid grid-cols-2 gap-4 max-w-sm">
                {types.includes("exercise") && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Exercices</label>
                    <Input type="number" min={0} max={10} value={currentPlan.exercise} onChange={(e) => setCurrentPlan((p) => ({ ...p, exercise: Math.max(0, parseInt(e.target.value) || 0) }))} />
                  </div>
                )}
                {types.includes("quiz") && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Quiz</label>
                    <Input type="number" min={0} max={10} value={currentPlan.quiz} onChange={(e) => setCurrentPlan((p) => ({ ...p, quiz: Math.max(0, parseInt(e.target.value) || 0) }))} />
                  </div>
                )}
              </div>
              <div className="pl-10">
                <Button size="sm" onClick={startLessonIdeas}>Continuer</Button>
              </div>
            </>
          )}

          {phase === "lessonIdea" && selectedLessons[lessonIdx] && itemQueue[itemPos] && (
            <>
              <Bubble>
                Donne-moi ton idée pour {itemQueue[itemPos].type === "exercise" ? "l'exercice" : "le quiz"} {itemQueue[itemPos].indexInType + 1}
                {" "}(leçon « {selectedLessons[lessonIdx].title} »). Laisse vide si tu veux que je choisisse librement.
              </Bubble>
              <div className="pl-10 space-y-2">
                <Textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Ex : un exercice sur la dérivée d'une fonction composée avec un piège sur le signe…"
                  className="min-h-[80px]"
                />
                <Button size="sm" onClick={submitIdea}>Suivant</Button>
              </div>
            </>
          )}

          {phase === "generating" && (
            <Bubble>
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours{genProgress ? ` (${genProgress.done}/${genProgress.total})` : "…"}
              </span>
            </Bubble>
          )}

          {phase === "results" && (
            <>
              {/* Message générique quel que soit le mode : en mode élève, "envoyez au groupe"
                  n'aurait pas de sens puisqu'il n'y a qu'un seul destinataire. */}
              <Bubble>
                Voici les exercices et quiz générés. Visualisez, modifiez si besoin (directement ou en LaTeX), puis envoyez-les.
              </Bubble>
              <div className="space-y-3 pl-2">
                {items.map((it, idx) => (
                  <Card key={idx} className="border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{it._type === "quiz" ? "Quiz" : "Exercice"}</Badge>
                          {it._lessonTitle && <span className="text-xs text-muted-foreground">{it._lessonTitle}</span>}
                          {it.difficulty ? <span className="text-xs text-muted-foreground">Diff. {it.difficulty}/5</span> : null}
                        </p>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => setPreviewIdx(idx)}>
                            <Eye className="h-3.5 w-3.5" /> Visualiser
                          </Button>
                          <Button
                            size="sm" variant={sent[idx] ? "secondary" : "default"}
                            className="gap-1" disabled={sent[idx]} onClick={() => sendOne(idx)}
                          >
                            {sent[idx] ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                            {sent[idx] ? "Envoyé" : "Accepter & envoyer"}
                          </Button>
                        </div>
                      </div>
                      {it.title && <p className="font-medium text-sm">{it.title}</p>}
                      {it.statement && <p className="text-sm whitespace-pre-wrap line-clamp-3">{it.statement}</p>}
                      {it.question && <p className="text-sm whitespace-pre-wrap line-clamp-3">{it.question}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Chat libre borné : l'IA n'aide QUE sur les exercices/quiz ci-dessus
                  (voir le prompt système de refine-teacher-content) — elle peut les
                  enrichir, en retirer, ou corriger une réponse, mais refuse toute
                  question hors de ce périmètre. */}
              <div className="pl-2 pt-2 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" /> Discuter de ces exercices/quiz avec l'IA
                </div>
                {refineMessages.length > 0 && (
                  <div ref={refineScrollRef} className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {refineMessages.map((m, i) => (
                      m.role === "user" ? (
                        <div key={i} className="flex gap-2 items-start justify-end">
                          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[85%]">{m.content}</div>
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <Bubble key={i}>{m.content}</Bubble>
                      )
                    ))}
                    {refineSending && (
                      <Bubble><Loader2 className="h-4 w-4 animate-spin" /></Bubble>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={refineInput}
                    onChange={(e) => setRefineInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendRefineMessage(); } }}
                    placeholder="Ex : ajoute un exercice plus difficile sur cette leçon, corrige la réponse du 2e exercice…"
                    disabled={refineSending}
                  />
                  <Button size="sm" onClick={sendRefineMessage} disabled={refineSending || !refineInput.trim()} className="gap-1 shrink-0">
                    {refineSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="pl-2">
                <Button size="sm" variant="ghost" onClick={restart}>Recommencer</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Popup de visualisation "côté élève" + édition directe/LaTeX */}
      <Dialog open={previewIdx !== null} onOpenChange={(o) => !o && setPreviewIdx(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {previewIdx !== null && items[previewIdx] && (
            <PreviewEditor
              item={items[previewIdx]}
              onChange={(patch) => updateItem(previewIdx, patch)}
              onSend={() => sendOne(previewIdx)}
              sent={!!sent[previewIdx]}
              sendLabel={mode === "class" ? `Envoyer au groupe ${selectedGroup?.letter ?? ""}` : `Envoyer à ${targetName}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/** Popup d'aperçu "côté élève" d'un item généré + édition directe de l'énoncé/solution
 * (ou question/explication pour un quiz), avec bouton d'envoi final. */
function PreviewEditor({ item, onChange, onSend, sent, sendLabel }: {
  item: GenEntry; onChange: (patch: Partial<GenEntry>) => void; onSend: () => void; sent: boolean; sendLabel: string;
}) {
  const isQuiz = item._type === "quiz";
  return (
    <>
      <DialogHeader>
        <DialogTitle>Aperçu côté élève — {isQuiz ? "Quiz" : "Exercice"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          {item.title && <h3 className="font-semibold">{item.title}</h3>}
          <LessonMarkdown content={isQuiz ? (item.question || "") : (item.statement || "")} />
          {isQuiz && item.options && (
            <ul className="space-y-1.5">
              {item.options.map((o, i) => (
                <li key={i} className={`text-sm rounded-lg border px-3 py-2 ${o === item.correct_answer ? "border-green-500/50 bg-green-500/10" : ""}`}>
                  {o}
                </li>
              ))}
            </ul>
          )}
          {item.hint && <p className="text-xs text-amber-700 dark:text-amber-400">💡 {item.hint}</p>}
        </div>

        <RichContentField
          label={isQuiz ? "Question" : "Énoncé"}
          value={isQuiz ? (item.question || "") : (item.statement || "")}
          onChange={(v) => onChange(isQuiz ? { question: v } : { statement: v })}
          minHeight={120}
        />
        <RichContentField
          label={isQuiz ? "Explication" : "Solution"}
          value={isQuiz ? (item.explanation || "") : (item.solution || "")}
          onChange={(v) => onChange(isQuiz ? { explanation: v } : { solution: v })}
          minHeight={140}
        />
      </div>
      <DialogFooter>
        <Button onClick={onSend} disabled={sent} className="gap-1">
          <Send className="h-4 w-4" /> {sent ? "Envoyé" : sendLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
