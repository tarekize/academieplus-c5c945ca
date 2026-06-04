import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight, Bot, CheckCircle2, XCircle, PenTool, Brain, Target, Loader2, Lightbulb, PartyPopper,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import { useToast } from "@/hooks/use-toast";

interface RemediationExercise {
  title: string;
  statement: string;
  expected_answer: string;
  accepted_answers?: string[];
  hint?: string;
  solution: string;
  concept?: string;
  difficulty?: number;
}

interface RemediationQuiz {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  concept?: string;
  difficulty?: number;
}

const MD = ({ children }: { children: string }) => (
  <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
    {children}
  </ReactMarkdown>
);

function normalizeAnswer(s: string) {
  let v = (s || "")
    .replace(/\$/g, "")
    .toLowerCase()
    .trim();

  // Canonicalise les représentations de l'infini (∞, \infty, infty, inf, infinity)
  v = v
    .replace(/∞/g, "infinity")
    .replace(/\\infty/g, "infinity")
    .replace(/\binfty\b/g, "infinity")
    .replace(/\binf\b/g, "infinity");

  // Retire les commandes LaTeX restantes (\to, \frac, ...) en gardant leur nom
  v = v.replace(/\\[a-zA-Z]+/g, (m) => m.slice(1));

  v = v
    .replace(/[{}\s]/g, "")
    .replace(/,/g, ".")
    .trim();

  // Normalise le signe : "infinity" sans signe devient "+infinity"
  if (v === "infinity") v = "+infinity";

  return v;
}

function isAnswerCorrect(userAnswer: string, exercise: RemediationExercise) {
  const u = normalizeAnswer(userAnswer);
  if (!u) return false;
  const candidates = [exercise.expected_answer, ...(exercise.accepted_answers || [])].filter(Boolean);
  return candidates.some((c) => {
    const n = normalizeAnswer(c);
    return n && (u === n || u.includes(n) || n.includes(u));
  });
}

export default function LessonRemediation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const lessonId = params.get("lecon") || "";
  const chapterId = params.get("chapitre") || "";

  const [userId, setUserId] = useState<string | null>(null);
  const [schoolLevel, setSchoolLevel] = useState<string | null>(null);
  const [effChapterId, setEffChapterId] = useState<string>(chapterId);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [aiComment, setAiComment] = useState<string>("");
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [lessonLevel, setLessonLevel] = useState<number>(40);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [exercises, setExercises] = useState<RemediationExercise[]>([]);
  const [quizzes, setQuizzes] = useState<RemediationQuiz[]>([]);

  // Per-item answer state
  const [exAnswers, setExAnswers] = useState<Record<number, string>>({});
  const [exResults, setExResults] = useState<Record<number, boolean>>({});
  const [quizPicks, setQuizPicks] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [regenEx, setRegenEx] = useState<Record<number, boolean>>({});
  const [regenQuiz, setRegenQuiz] = useState<Record<number, boolean>>({});

  // Refs to avoid stale closures inside async handlers
  const rowIdRef = useRef<string | null>(null);
  const exercisesRef = useRef<RemediationExercise[]>([]);
  const quizzesRef = useRef<RemediationQuiz[]>([]);
  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);
  useEffect(() => { quizzesRef.current = quizzes; }, [quizzes]);

  // Persiste l'état des activités (exercices/quiz/résolu) — une seule ligne par leçon.
  const persist = useCallback(async (
    exs: RemediationExercise[],
    qzs: RemediationQuiz[],
    res: boolean,
    chapIdArg?: string,
    uidArg?: string,
  ) => {
    const uid = uidArg || userId;
    const chap = chapIdArg || effChapterId;
    if (!uid || !chap || !lessonId) return;
    const payload = { exercises: exs, quizzes: qzs, resolved: res };
    if (rowIdRef.current) {
      await supabase.from("ai_generated_content")
        .update({ content: payload as any, updated_at: new Date().toISOString() })
        .eq("id", rowIdRef.current);
    } else {
      const { data } = await supabase.from("ai_generated_content").insert({
        user_id: uid,
        chapter_id: chap,
        lesson_id: lessonId,
        content_type: "remediation",
        content: payload as any,
        difficulty_level: lessonLevel,
      }).select("id").maybeSingle();
      if (data?.id) rowIdRef.current = data.id;
    }
  }, [userId, effChapterId, lessonId, lessonLevel]);

  // Génère le lot initial (3 exercices + 2 quiz) puis le persiste.
  const generateAndSave = useCallback(async (
    level: number, weak: string[], lTitle: string, cTitle: string, sLevel: string, chapId: string, uid: string,
  ) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-remediation", {
        body: {
          school_level: sLevel,
          level,
          lesson_title: lTitle,
          chapter_title: cTitle,
          weak_concepts: weak,
          seed: Math.floor(Math.random() * 1_000_000),
        },
      });
      if (error) throw error;
      const exs = Array.isArray(data?.exercises) ? data.exercises : [];
      const qzs = Array.isArray(data?.quizzes) ? data.quizzes : [];
      setExercises(exs);
      setQuizzes(qzs);
      setExAnswers({});
      setExResults({});
      setQuizPicks({});
      setQuizSubmitted({});
      setResolved(false);
      if (exs.length > 0 || qzs.length > 0) {
        await persist(exs, qzs, false, chapId, uid);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "تعذّر توليد التمارين",
        description: "حدث خطأ أثناء التوليد. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [persist, toast]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      rowIdRef.current = null;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const uid = session.user.id;
      setUserId(uid);

      const [{ data: profile }, { data: lesson }, { data: comment }, { data: score }] = await Promise.all([
        supabase.from("profiles").select("school_level").eq("id", uid).maybeSingle(),
        lessonId
          ? supabase.from("lessons").select("title, title_ar, chapter_id").eq("id", lessonId).maybeSingle()
          : Promise.resolve({ data: null }),
        lessonId
          ? supabase.from("ai_lesson_comments")
              .select("message, weak_concepts, lesson_title, chapter_title, level_after")
              .eq("user_id", uid).eq("lesson_id", lessonId)
              .order("created_at", { ascending: false }).limit(1).maybeSingle()
          : Promise.resolve({ data: null }),
        lessonId
          ? supabase.from("student_scores").select("current_level")
              .eq("user_id", uid).eq("lesson_id", lessonId)
              .order("updated_at", { ascending: false }).limit(1).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const sLevel = (profile?.school_level as string) || "terminale";
      setSchoolLevel(sLevel);

      const lTitle = (lesson?.title_ar || lesson?.title || comment?.lesson_title || "الدرس") as string;
      setLessonTitle(lTitle);

      let cTitle = (comment?.chapter_title || "") as string;
      const resolvedChapterId = chapterId || (lesson?.chapter_id as string) || "";
      setEffChapterId(resolvedChapterId);
      if (!cTitle && resolvedChapterId) {
        const { data: chap } = await supabase.from("chapters").select("title, title_ar").eq("id", resolvedChapterId).maybeSingle();
        cTitle = (chap?.title_ar || chap?.title || "") as string;
      }
      setChapterTitle(cTitle);

      setAiComment((comment?.message as string) || "");

      let weak: string[] = [];
      const rawWeak = comment?.weak_concepts;
      if (Array.isArray(rawWeak)) {
        weak = rawWeak.map((c: unknown) => String(c).trim()).filter(Boolean);
      }
      setWeakConcepts(weak);

      const lvl = (score?.current_level ?? comment?.level_after ?? 40) as number;
      setLessonLevel(lvl);

      // Charger les activités déjà générées (pas de re-génération à chaque visite).
      let existing: { id: string; content: any } | null = null;
      if (lessonId) {
        const { data } = await supabase.from("ai_generated_content")
          .select("id, content")
          .eq("user_id", uid)
          .eq("content_type", "remediation")
          .eq("lesson_id", lessonId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        existing = (data as any) || null;
      }

      const savedExs = Array.isArray(existing?.content?.exercises) ? existing!.content.exercises : [];
      const savedQzs = Array.isArray(existing?.content?.quizzes) ? existing!.content.quizzes : [];

      if (existing && (savedExs.length > 0 || savedQzs.length > 0)) {
        rowIdRef.current = existing.id;
        setExercises(savedExs);
        setQuizzes(savedQzs);
        setResolved(Boolean(existing.content?.resolved));
        setLoading(false);
      } else {
        setLoading(false);
        await generateAndSave(lvl, weak, lTitle, cTitle, sLevel, resolvedChapterId, uid);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, chapterId]);

  // Quand toutes les questions sont correctes : marquer résolu.

  const maybeResolve = useCallback(async (
    exRes: Record<number, boolean>,
    qSub: Record<number, boolean>,
    qPicks: Record<number, string>,
    exs: RemediationExercise[],
    qzs: RemediationQuiz[],
  ) => {
    const allEx = exs.length > 0 && exs.every((_, i) => exRes[i] === true);
    const allQ = qzs.every((q, i) => qSub[i] && normalizeAnswer(qPicks[i] || "") === normalizeAnswer(q.correct_answer));
    if (allEx && allQ) {
      setResolved(true);
      await persist(exs, qzs, true);
      await clearNotifications();
      toast({ title: "أحسنت! 🎉", description: "عالجت كل الثغرات بنجاح. تم إيقاف التنبيه." });
    }
  }, [persist, clearNotifications, toast]);

  // Sur erreur d'un exercice : générer un exercice similaire (même lacune) à refaire.
  const regenerateExercise = useCallback(async (idx: number, ex: RemediationExercise) => {
    if (!schoolLevel) return;
    setRegenEx((p) => ({ ...p, [idx]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-remediation", {
        body: {
          mode: "single", kind: "exercise",
          school_level: schoolLevel, level: lessonLevel,
          lesson_title: lessonTitle, chapter_title: chapterTitle,
          target_concept: ex.concept || weakConcepts[0] || "",
          weak_concepts: weakConcepts,
          seed: Math.floor(Math.random() * 1_000_000),
        },
      });
      if (error) throw error;
      const fresh = Array.isArray(data?.exercises) ? data.exercises[0] : null;
      if (fresh) {
        const newExs = exercisesRef.current.map((e, i) => (i === idx ? fresh : e));
        setExercises(newExs);
        setExAnswers((p) => ({ ...p, [idx]: "" }));
        setExResults((p) => { const n = { ...p }; delete n[idx]; return n; });
        await persist(newExs, quizzesRef.current, false);
        toast({ title: "تمرين جديد مشابه", description: "حاول مرة أخرى على نفس الثغرة." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "تعذّر توليد تمرين جديد", description: "حاول التحقق مجدداً.", variant: "destructive" });
    } finally {
      setRegenEx((p) => ({ ...p, [idx]: false }));
    }
  }, [schoolLevel, lessonLevel, lessonTitle, chapterTitle, weakConcepts, persist, toast]);

  // Sur erreur d'un quiz : générer un quiz similaire (même lacune) à refaire.
  const regenerateQuiz = useCallback(async (idx: number, q: RemediationQuiz) => {
    if (!schoolLevel) return;
    setRegenQuiz((p) => ({ ...p, [idx]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-remediation", {
        body: {
          mode: "single", kind: "quiz",
          school_level: schoolLevel, level: lessonLevel,
          lesson_title: lessonTitle, chapter_title: chapterTitle,
          target_concept: q.concept || weakConcepts[0] || "",
          weak_concepts: weakConcepts,
          seed: Math.floor(Math.random() * 1_000_000),
        },
      });
      if (error) throw error;
      const fresh = Array.isArray(data?.quizzes) ? data.quizzes[0] : null;
      if (fresh) {
        const newQzs = quizzesRef.current.map((e, i) => (i === idx ? fresh : e));
        setQuizzes(newQzs);
        setQuizPicks((p) => { const n = { ...p }; delete n[idx]; return n; });
        setQuizSubmitted((p) => { const n = { ...p }; delete n[idx]; return n; });
        await persist(exercisesRef.current, newQzs, false);
        toast({ title: "سؤال جديد مشابه", description: "حاول مرة أخرى على نفس الثغرة." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "تعذّر توليد سؤال جديد", description: "حاول التأكيد مجدداً.", variant: "destructive" });
    } finally {
      setRegenQuiz((p) => ({ ...p, [idx]: false }));
    }
  }, [schoolLevel, lessonLevel, lessonTitle, chapterTitle, weakConcepts, persist, toast]);

  const checkExercise = async (idx: number, ex: RemediationExercise) => {
    const correct = isAnswerCorrect(exAnswers[idx] || "", ex);
    const newResults = { ...exResults, [idx]: correct };
    setExResults(newResults);
    if (correct) {
      await maybeResolve(newResults, quizSubmitted, quizPicks, exercisesRef.current, quizzesRef.current);
    } else {
      await regenerateExercise(idx, ex);
    }
  };

  const submitQuiz = async (idx: number) => {
    const q = quizzes[idx];
    const correct = normalizeAnswer(quizPicks[idx] || "") === normalizeAnswer(q.correct_answer);
    const newSub = { ...quizSubmitted, [idx]: true };
    setQuizSubmitted(newSub);
    if (correct) {
      await maybeResolve(exResults, newSub, quizPicks, exercisesRef.current, quizzesRef.current);
    } else {
      await regenerateQuiz(idx, q);
    }
  };

  const lacunesList = useMemo(() => {
    const fromConcepts = weakConcepts.length > 0 ? weakConcepts : [];
    const fromActivities = [
      ...exercises.map((e) => e.concept || ""),
      ...quizzes.map((q) => q.concept || ""),
    ].filter(Boolean);
    return Array.from(new Set([...fromConcepts, ...fromActivities])).slice(0, 8);
  }, [weakConcepts, exercises, quizzes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            رجوع
          </Button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{lessonTitle}</h1>
          {chapterTitle && <p className="text-sm text-muted-foreground mt-1">{chapterTitle}</p>}
        </div>

        {resolved && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-700">
            <PartyPopper className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">أجبت عن كل التمارين والأسئلة بشكل صحيح. تم إيقاف التنبيه عن هذا الدرس.</p>
          </div>
        )}

        {/* AI comment */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              تعليق الذكاء الاصطناعي على هذا الدرس
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="ai-comment-markdown rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-4 text-sm leading-relaxed">
              <style>{`
                .ai-comment-markdown h3 { font-size: 1rem; font-weight: 700; color: hsl(var(--primary)); margin: 0.9rem 0 0.5rem; }
                .ai-comment-markdown p { margin: 0.45rem 0; line-height: 1.8; }
                .ai-comment-markdown strong { color: hsl(var(--primary)); font-weight: 700; }
                .ai-comment-markdown ul, .ai-comment-markdown ol { margin: 0.4rem 1.5rem 0.4rem 0; }
              `}</style>
              <MD>{aiComment || `لاحظنا بعض النقص في درس "${lessonTitle}". إليك تمارين موجّهة لمعالجة ثغراتك دون رفع الصعوبة.`}</MD>
            </div>

            {lacunesList.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-red-500" />
                  الثغرات المستهدفة
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lacunesList.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-[11px] border-red-500/30 text-red-600 bg-red-500/5">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {generating && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm">يُولّد الذكاء الاصطناعي تمارين موجّهة لثغراتك…</p>
          </div>
        )}

        {!generating && (exercises.length > 0 || quizzes.length > 0) && (
          <>
            {/* Exercises */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <PenTool className="h-5 w-5 text-orange-500" />
                تمارين ({exercises.length})
              </h2>
              {exercises.map((ex, idx) => {
                const result = exResults[idx];
                const regen = regenEx[idx];
                return (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          {ex.title}
                        </CardTitle>
                        {ex.concept && <Badge variant="outline" className="text-[10px]">{ex.concept}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm"><MD>{ex.statement}</MD></div>

                      {ex.hint && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="hint" className="border-0">
                            <AccordionTrigger className="py-1 text-xs text-amber-600 hover:no-underline">
                              <span className="flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> تلميح</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-xs text-muted-foreground">
                              <MD>{ex.hint}</MD>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="اكتب جوابك هنا…"
                          value={exAnswers[idx] || ""}
                          onChange={(e) => setExAnswers((p) => ({ ...p, [idx]: e.target.value }))}
                          className="flex-1"
                          disabled={regen}
                        />
                        <Button onClick={() => checkExercise(idx, ex)} disabled={!exAnswers[idx] || regen}>
                          {regen ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحقّق"}
                        </Button>
                      </div>

                      {regen && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          إجابة غير صحيحة — يُولّد تمرين مشابه جديد…
                        </div>
                      )}

                      {!regen && result !== undefined && (
                        <div className={`flex items-center gap-2 text-sm font-medium ${result ? "text-emerald-600" : "text-red-500"}`}>
                          {result ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {result ? "إجابة صحيحة! 🎉" : `إجابة غير صحيحة. الجواب المنتظر: ${ex.expected_answer}`}
                        </div>
                      )}

                      <Accordion type="single" collapsible>
                        <AccordionItem value="sol" className="border rounded-lg">
                          <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> الحل المفصّل</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <HtmlWithMath htmlContent={ex.solution} className="text-sm leading-relaxed [&_strong]:text-primary" />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quizzes */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                اختبارات قصيرة ({quizzes.length})
              </h2>
              {quizzes.map((q, idx) => {
                const submitted = quizSubmitted[idx];
                const pick = quizPicks[idx];
                const regen = regenQuiz[idx];
                const pickCorrect = submitted && normalizeAnswer(pick || "") === normalizeAnswer(q.correct_answer);
                return (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="prose prose-sm dark:prose-invert max-w-none"><MD>{q.question}</MD></span>
                        </CardTitle>
                        {q.concept && <Badge variant="outline" className="text-[10px] shrink-0">{q.concept}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isPicked = pick === opt;
                          const isCorrect = normalizeAnswer(opt) === normalizeAnswer(q.correct_answer);
                          let cls = "border-border hover:bg-accent/50";
                          if (submitted) {
                            if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10";
                            else if (isPicked) cls = "border-red-500 bg-red-500/10";
                          } else if (isPicked) {
                            cls = "border-primary bg-primary/10";
                          }
                          return (
                            <button
                              key={oi}
                              type="button"
                              disabled={submitted || regen}
                              onClick={() => setQuizPicks((p) => ({ ...p, [idx]: opt }))}
                              className={`w-full text-right rounded-lg border px-3 py-2 text-sm transition-all flex items-center justify-between gap-2 ${cls}`}
                            >
                              <span className="prose prose-sm dark:prose-invert max-w-none"><MD>{opt}</MD></span>
                              {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                              {submitted && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {regen && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          إجابة غير صحيحة — يُولّد سؤال مشابه جديد…
                        </div>
                      )}

                      {!submitted && !regen ? (
                        <Button size="sm" onClick={() => submitQuiz(idx)} disabled={!pick}>تأكيد</Button>
                      ) : (
                        !regen && submitted && (
                          <>
                            {!pickCorrect && (
                              <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                                <XCircle className="h-4 w-4" /> إجابة غير صحيحة.
                              </div>
                            )}
                            {q.explanation && (
                              <div className="rounded-lg bg-muted/60 p-3 text-xs leading-relaxed">
                                <p className="font-semibold mb-1">الشرح</p>
                                <div className="prose prose-sm dark:prose-invert max-w-none"><MD>{q.explanation}</MD></div>
                              </div>
                            )}
                          </>
                        )
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {!generating && exercises.length === 0 && quizzes.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <p className="mb-3">لم نتمكن من توليد تمارين الآن.</p>
              <Button
                onClick={() => schoolLevel && userId && generateAndSave(lessonLevel, weakConcepts, lessonTitle, chapterTitle, schoolLevel, effChapterId, userId)}
              >
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
