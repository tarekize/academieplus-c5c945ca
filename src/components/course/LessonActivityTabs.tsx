import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, PenTool, BookOpen, Sparkles, Eye, Lightbulb, Rocket, ChevronRight, Lock, CheckCircle2, RefreshCw, Pencil, Dices, XCircle, ChevronDown, ChevronUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptiveContent } from "@/hooks/useAdaptiveContent";
import { useActivityTimeTracker } from "@/hooks/useActivityTimeTracker";
import { HtmlWithMath } from "./HtmlWithMath";
import { MarkdownSolution } from "./MarkdownSolution";
import { MathKeyboard } from "./MathKeyboard";
import { cleanMathStatement, statementHasMath } from "@/lib/mathStatement";
import { MyClassContent } from "./MyClassContent";

export interface DBQuizQuestion {
  id: string;
  lesson_id?: string | null;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  hint?: string | null;
  difficulty?: number;
}

export interface DBExercise {
  id: string;
  lesson_id?: string | null;
  title: string;
  statement: string;
  expected_answer: string;
  accepted_answers: string[];
  solution: string;
  difficulty?: number;
  hint?: string;
}

interface LessonActivityTabsProps {
  dbQuizzes: DBQuizQuestion[];
  dbExercises: DBExercise[];
  chapterId: string;
  chapterTitle: string;
  lessonId?: string;
  lessonTitle: string;
  onGenerateAI?: (type: "quiz" | "exercise") => void;
  onSectionChange?: (section: string | null) => void;
  hiddenBackButton?: boolean;
  readOnly?: boolean;
  userId?: string;
  schoolLevel?: string;
}

type ActivitySection = "exercises" | "quiz" | "revision" | null;
type StepLevel = "decouvrir" | "comprendre" | "approfondir" | "maclasse";
type AnswerPayload = { correct: boolean; concept?: string; userAnswer?: string; correctAnswer?: string; difficulty?: number };

const REQUIRED_CORRECT = 3;

const stepConfig: { id: StepLevel; label: string; labelAr: string; icon: typeof Eye; color: string }[] = [
  { id: "decouvrir", label: "Découvrir", labelAr: "اكتشف", icon: Eye, color: "text-blue-500" },
  { id: "comprendre", label: "Comprendre", labelAr: "افهم", icon: Lightbulb, color: "text-yellow-500" },
  { id: "approfondir", label: "Approfondir", labelAr: "تعمّق", icon: Rocket, color: "text-purple-500" },
];

export function LessonActivityTabs({ dbQuizzes, dbExercises, chapterId, chapterTitle, lessonId, lessonTitle, onGenerateAI, onSectionChange, hiddenBackButton, readOnly, userId: propUserId, schoolLevel }: LessonActivityTabsProps) {
  const [activeSection, setActiveSection] = useState<ActivitySection>(null);
  const [activeStep, setActiveStep] = useState<StepLevel>("decouvrir");

  const [discoverCorrectEx, setDiscoverCorrectEx] = useState(0);
  const [discoverCorrectQz, setDiscoverCorrectQz] = useState(0);
  const [discoverTotalEx, setDiscoverTotalEx] = useState(0);
  const [discoverTotalQz, setDiscoverTotalQz] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const [persistedUnlockEx, setPersistedUnlockEx] = useState(false);
  const [persistedUnlockQz, setPersistedUnlockQz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([]);
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);

  const [subsetDiscoverEx, setSubsetDiscoverEx] = useState<DBExercise[]>([]);
  const [subsetUnderstandEx, setSubsetUnderstandEx] = useState<DBExercise[]>([]);
  const [subsetDiscoverQz, setSubsetDiscoverQz] = useState<DBQuizQuestion[]>([]);
  const [subsetUnderstandQz, setSubsetUnderstandQz] = useState<DBQuizQuestion[]>([]);

  const [showUnlockMessage, setShowUnlockMessage] = useState(false);
  const [showReloadBtn, setShowReloadBtn] = useState(false);

  const adaptiveContent = useAdaptiveContent(
    lessonId || "", chapterId, propUserId || userId || "", schoolLevel || "", lessonTitle, chapterTitle
  );
  const [aiQuizAnswers, setAiQuizAnswers] = useState<Record<number, string>>({});
  const [aiQuizSelected, setAiQuizSelected] = useState<Record<number, string>>({});
  const [aiQuizResults, setAiQuizResults] = useState<Record<number, boolean>>({});
  const [aiQuizLocked, setAiQuizLocked] = useState<Record<number, boolean>>({});
  const [aiExerciseAnswers, setAiExerciseAnswers] = useState<Record<number, string>>({});
  const [aiExerciseResults, setAiExerciseResults] = useState<Record<number, boolean | null>>({});
  const [aiExerciseLocked, setAiExerciseLocked] = useState<Record<number, boolean>>({});
  const [aiShowHints, setAiShowHints] = useState<Record<number, boolean>>({});
  const aiLockTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => () => { Object.values(aiLockTimersRef.current).forEach(clearTimeout); }, []);



  const currentActivityType = activeSection === "exercises" ? "exercise" as const
    : activeSection === "quiz" ? "quiz" as const
      : "reading" as const;

  useActivityTimeTracker({
    userId: userId || propUserId || null,
    chapterId,
    lessonId: lessonId || null,
    activityType: currentActivityType,
    enabled: !!chapterId,
  });

  useEffect(() => {
    setShowCorrectOnly(false);
  }, [activeStep, activeSection]);

  useEffect(() => {
    const halfQuiz = Math.ceil(dbQuizzes.length / 2);
    const originDiscoverQz = dbQuizzes.slice(0, halfQuiz);
    const originUnderstandQz = dbQuizzes.slice(halfQuiz);

    const halfEx = Math.ceil(dbExercises.length / 2);
    const originDiscoverEx = dbExercises.slice(0, halfEx);
    const originUnderstandEx = dbExercises.slice(halfEx);

    const poolDiscoverQz = originDiscoverQz.filter(q => !completedQuizIds.includes(q.id));
    const poolUnderstandQz = originUnderstandQz.filter(q => !completedQuizIds.includes(q.id));
    const poolDiscoverEx = originDiscoverEx.filter(e => !completedExerciseIds.includes(e.id));
    const poolUnderstandEx = originUnderstandEx.filter(e => !completedExerciseIds.includes(e.id));

    setSubsetDiscoverQz([...poolDiscoverQz].sort(() => 0.5 - Math.random()).slice(0, 5));
    setSubsetUnderstandQz([...poolUnderstandQz].sort(() => 0.5 - Math.random()).slice(0, 5));
    setSubsetDiscoverEx([...poolDiscoverEx].sort(() => 0.5 - Math.random()).slice(0, 5));
    setSubsetUnderstandEx([...poolUnderstandEx].sort(() => 0.5 - Math.random()).slice(0, 5));
  }, [dbQuizzes, dbExercises]);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: sub } = await supabase
          .from("student_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_paused", false)
          .maybeSingle();

        if (sub) {
          const now = new Date();
          const lastTick = new Date(sub.last_tick_at);
          const elapsed = (now.getTime() - lastTick.getTime()) / (1000 * 60 * 60 * 24);
          const totalUsed = (sub.days_used || 0) + elapsed;
          const remaining = (sub.total_days || 0) - totalUsed;
          if (remaining > 0) setHasActiveSubscription(true);
        }
      }
      setIsLoadingUser(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) return;

      let progressQuery = supabase
        .from("student_scores")
        .select("id, assessment_data")
        .eq("user_id", userId)
        .eq("chapter_id", chapterId);

      progressQuery = lessonId
        ? progressQuery.eq("lesson_id", lessonId)
        : progressQuery.is("lesson_id", null);

      const { data, error } = await progressQuery;
      if (error) return;

      const rows = data || [];

      const hasExercisesUnlocked = rows.some((row) => {
        const ad = (row.assessment_data || {}) as Record<string, unknown>;
        return Boolean(ad.exercises_unlocked);
      });

      const hasQuizzesUnlocked = rows.some((row) => {
        const ad = (row.assessment_data || {}) as Record<string, unknown>;
        return Boolean(ad.quizzes_unlocked);
      });

      const exercisesCorrectCount = rows.reduce((max, row) => {
        const ad = (row.assessment_data || {}) as Record<string, any>;
        return Math.max(max, ad.exercises_correct_count || 0);
      }, 0);

      const quizzesCorrectCount = rows.reduce((max, row) => {
        const ad = (row.assessment_data || {}) as Record<string, any>;
        return Math.max(max, ad.quizzes_correct_count || 0);
      }, 0);

      const completedEx: string[] = [];
      const completedQz: string[] = [];
      rows.forEach((row) => {
        const ad = (row.assessment_data || {}) as Record<string, any>;
        if (Array.isArray(ad.completed_exercises)) completedEx.push(...ad.completed_exercises);
        if (Array.isArray(ad.completed_quizzes)) completedQz.push(...ad.completed_quizzes);
      });

      const uniqueEx = Array.from(new Set(completedEx));
      const uniqueQz = Array.from(new Set(completedQz));

      setCompletedExerciseIds(uniqueEx);
      setCompletedQuizIds(uniqueQz);

      if (hasExercisesUnlocked) {
        setPersistedUnlockEx(true);
        setDiscoverCorrectEx(exercisesCorrectCount < REQUIRED_CORRECT ? REQUIRED_CORRECT : exercisesCorrectCount);
      } else if (exercisesCorrectCount > 0) {
        setDiscoverCorrectEx(exercisesCorrectCount);
      }

      if (hasQuizzesUnlocked) {
        setPersistedUnlockQz(true);
        setDiscoverCorrectQz(quizzesCorrectCount < REQUIRED_CORRECT ? REQUIRED_CORRECT : quizzesCorrectCount);
      } else if (quizzesCorrectCount > 0) {
        setDiscoverCorrectQz(quizzesCorrectCount);
      }

      const halfQuiz = Math.ceil(dbQuizzes.length / 2);
      const halfEx = Math.ceil(dbExercises.length / 2);

      setSubsetDiscoverQz([...dbQuizzes.slice(0, halfQuiz).filter(q => !uniqueQz.includes(q.id))].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSubsetUnderstandQz([...dbQuizzes.slice(halfQuiz).filter(q => !uniqueQz.includes(q.id))].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSubsetDiscoverEx([...dbExercises.slice(0, halfEx).filter(e => !uniqueEx.includes(e.id))].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSubsetUnderstandEx([...dbExercises.slice(halfEx).filter(e => !uniqueEx.includes(e.id))].sort(() => 0.5 - Math.random()).slice(0, 5));
    };

    loadProgress();
  }, [chapterId, lessonId, triggerReload, userId, dbQuizzes, dbExercises]);

  const persistUnlock = useCallback(async (type: "exercises" | "quizzes", correctCount?: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentUserId = user.id;
    const field = type === "exercises" ? "exercises_unlocked" : "quizzes_unlocked";
    const countField = type === "exercises" ? "exercises_correct_count" : "quizzes_correct_count";

    const { data: allRows } = await supabase
      .from("student_scores")
      .select("id, lesson_id, assessment_data")
      .eq("user_id", currentUserId)
      .eq("chapter_id", chapterId);

    const targetRow = allRows?.find(r => lessonId ? r.lesson_id === lessonId : r.lesson_id === null);

    if (targetRow) {
      const existingData = (targetRow.assessment_data || {}) as Record<string, unknown>;
      const mergedData = {
        ...existingData,
        [field]: true,
        ...(correctCount !== undefined && { [countField]: correctCount })
      };
      await supabase.from("student_scores").update({ assessment_data: mergedData as any }).eq("id", targetRow.id);
      return;
    }

    await supabase.from("student_scores").insert([{
      user_id: currentUserId,
      chapter_id: chapterId,
      lesson_id: lessonId ?? null,
      assessment_data: {
        [field]: true,
        ...(correctCount !== undefined && { [countField]: correctCount })
      } as any,
    }]);
  }, [chapterId, lessonId]);

  const persistItemCompletion = useCallback(async (type: "exercises" | "quizzes", itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentUserId = user.id;
    const field = type === "exercises" ? "completed_exercises" : "completed_quizzes";

    const { data: rows } = await supabase
      .from("student_scores")
      .select("id, lesson_id, assessment_data")
      .eq("user_id", currentUserId)
      .eq("chapter_id", chapterId);

    const targetRow = rows?.find(r => lessonId ? r.lesson_id === lessonId : r.lesson_id === null);

    if (targetRow) {
      const existingData = (targetRow.assessment_data || {}) as Record<string, any>;
      const currentList: string[] = Array.isArray(existingData[field]) ? existingData[field] : [];
      if (!currentList.includes(itemId)) {
        await supabase.from("student_scores")
          .update({ assessment_data: { ...existingData, [field]: [...currentList, itemId] } })
          .eq("id", targetRow.id);
      }
    } else {
      await supabase.from("student_scores").insert([{
        user_id: currentUserId,
        chapter_id: chapterId,
        lesson_id: lessonId ?? null,
        assessment_data: { [field]: [itemId] } as any
      }]);
    }
  }, [chapterId, lessonId]);

  const persistAnswerStats = useCallback(async (isCorrect: boolean) => {
    const localUserId = propUserId || userId;
    let currentUserId = localUserId;

    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId = user.id;
    }

    let query = supabase
      .from("student_scores")
      .select("id, correct_answers, total_answers")
      .eq("user_id", currentUserId)
      .eq("chapter_id", chapterId);

    query = lessonId ? query.eq("lesson_id", lessonId) : query.is("lesson_id", null);
    const { data: rows } = await query;
    const row = rows?.[0] as any;

    if (row) {
      const nextTotal = (row.total_answers || 0) + 1;
      const nextCorrect = (row.correct_answers || 0) + (isCorrect ? 1 : 0);
      const nextAccuracy = nextTotal > 0 ? Math.round((nextCorrect / nextTotal) * 100) : 0;
      await supabase.from("student_scores").update({ total_answers: nextTotal, correct_answers: nextCorrect, accuracy_rate: nextAccuracy } as any).eq("id", row.id);
      return;
    }

    await supabase.from("student_scores").insert([{
      user_id: currentUserId,
      chapter_id: chapterId,
      lesson_id: lessonId ?? null,
      total_answers: 1,
      correct_answers: isCorrect ? 1 : 0,
      accuracy_rate: isCorrect ? 100 : 0,
    } as any]);
  }, [chapterId, lessonId, propUserId, userId]);

  const isUnlockedEx = persistedUnlockEx || discoverCorrectEx >= REQUIRED_CORRECT;
  const isUnlockedQz = persistedUnlockQz || discoverCorrectQz >= REQUIRED_CORRECT;
  const isUnlocked = activeSection === "exercises" ? isUnlockedEx : isUnlockedQz;
  const currentCorrect = activeSection === "exercises" ? discoverCorrectEx : discoverCorrectQz;

  useEffect(() => {
    if (isUnlocked && !showUnlockMessage) {
      setShowReloadBtn(true);
    } else if (!isUnlocked) {
      setShowReloadBtn(false);
      setShowUnlockMessage(false);
    }
  }, [isUnlocked, showUnlockMessage]);

  const handleReloadContent = () => {
    if (activeSection === 'exercises') {
      const halfEx = Math.ceil(dbExercises.length / 2);
      if (activeStep === 'decouvrir') {
        const pool = dbExercises.slice(0, halfEx).filter(e => !completedExerciseIds.includes(e.id));
        setSubsetDiscoverEx([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
      } else if (activeStep === 'comprendre') {
        const pool = dbExercises.slice(halfEx).filter(e => !completedExerciseIds.includes(e.id));
        setSubsetUnderstandEx([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
      }
    } else {
      const halfQuiz = Math.ceil(dbQuizzes.length / 2);
      if (activeStep === 'decouvrir') {
        const pool = dbQuizzes.slice(0, halfQuiz).filter(q => !completedQuizIds.includes(q.id));
        setSubsetDiscoverQz([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
      } else if (activeStep === 'comprendre') {
        const pool = dbQuizzes.slice(halfQuiz).filter(q => !completedQuizIds.includes(q.id));
        setSubsetUnderstandQz([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
      }
    }
  };

  const reloadProgressFromDB = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let progressQuery = supabase
      .from("student_scores")
      .select("id, assessment_data")
      .eq("user_id", user.id)
      .eq("chapter_id", chapterId);

    progressQuery = lessonId
      ? progressQuery.eq("lesson_id", lessonId)
      : progressQuery.is("lesson_id", null);

    const { data, error } = await progressQuery;
    if (error) return;

    const rows = data || [];

    const hasExercisesUnlocked = rows.some((row) => Boolean((row.assessment_data as any)?.exercises_unlocked));
    const hasQuizzesUnlocked = rows.some((row) => Boolean((row.assessment_data as any)?.quizzes_unlocked));

    const exercisesCorrectCount = rows.reduce((max, row) => Math.max(max, (row.assessment_data as any)?.exercises_correct_count || 0), 0);
    const quizzesCorrectCount = rows.reduce((max, row) => Math.max(max, (row.assessment_data as any)?.quizzes_correct_count || 0), 0);

    if (hasExercisesUnlocked) {
      setPersistedUnlockEx(true);
      setDiscoverCorrectEx(exercisesCorrectCount < REQUIRED_CORRECT ? REQUIRED_CORRECT : exercisesCorrectCount);
    }
    if (hasQuizzesUnlocked) {
      setPersistedUnlockQz(true);
      setDiscoverCorrectQz(quizzesCorrectCount < REQUIRED_CORRECT ? REQUIRED_CORRECT : quizzesCorrectCount);
    }
  }, [chapterId, lessonId]);

  const handleSectionChange = (section: ActivitySection) => {
    setActiveSection(section);
    setActiveStep("decouvrir");
    if (section !== null) reloadProgressFromDB();
    onSectionChange?.(section);
  };

  const handleUnderstandAnswer = useCallback((answer: AnswerPayload, type: "exercise" | "quiz", itemId: string) => {
    const isCorrect = answer.correct;
    adaptiveContent.recordAnswer(
      isCorrect,
      0,
      type,
      answer.concept,
      isCorrect ? undefined : { user_answer: answer.userAnswer || "إجابة غير صحيحة", correct_answer: answer.correctAnswer || "راجع الحل الصحيح" },
      answer.difficulty,
    );

    if (isCorrect) {
      if (type === "exercise") {
        setCompletedExerciseIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("exercises", itemId);
          const newCompleted = [...prev, itemId];
          setSubsetUnderstandEx(currentSubset => {
            const filtered = currentSubset.filter(e => e.id !== itemId);
            const halfEx = Math.ceil(dbExercises.length / 2);
            const pool = dbExercises.slice(halfEx).filter(e => !newCompleted.includes(e.id) && !filtered.some(f => f.id === e.id));
            return [...filtered, ...pool.sort(() => 0.5 - Math.random()).slice(0, 1)];
          });
          return newCompleted;
        });
      } else {
        setCompletedQuizIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("quizzes", itemId);
          const newCompleted = [...prev, itemId];
          setSubsetUnderstandQz(currentSubset => {
            const filtered = currentSubset.filter(q => q.id !== itemId);
            const halfQuiz = Math.ceil(dbQuizzes.length / 2);
            const pool = dbQuizzes.slice(halfQuiz).filter(q => !newCompleted.includes(q.id) && !filtered.some(f => f.id === q.id));
            return [...filtered, ...pool.sort(() => 0.5 - Math.random()).slice(0, 1)];
          });
          return newCompleted;
        });
      }
    }
  }, [persistItemCompletion, dbExercises, dbQuizzes, adaptiveContent]);

  const handleDiscoverAnswer = useCallback((answer: AnswerPayload, type: "exercise" | "quiz", itemId?: string) => {
    const isCorrect = answer.correct;
    adaptiveContent.recordAnswer(
      isCorrect,
      0,
      type,
      answer.concept,
      isCorrect ? undefined : { user_answer: answer.userAnswer || "إجابة غير صحيحة", correct_answer: answer.correctAnswer || "راجع الحل الصحيح" },
      answer.difficulty,
    );

    if (itemId && isCorrect) {
      if (type === "exercise") {
        setCompletedExerciseIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("exercises", itemId);
          const newCompleted = [...prev, itemId];
          setSubsetDiscoverEx(currentSubset => {
            const filtered = currentSubset.filter(e => e.id !== itemId);
            const halfEx = Math.ceil(dbExercises.length / 2);
            const pool = dbExercises.slice(0, halfEx).filter(e => !newCompleted.includes(e.id) && !filtered.some(f => f.id === e.id));
            return [...filtered, ...pool.sort(() => 0.5 - Math.random()).slice(0, 1)];
          });
          return newCompleted;
        });
      } else {
        setCompletedQuizIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("quizzes", itemId);
          const newCompleted = [...prev, itemId];
          setSubsetDiscoverQz(currentSubset => {
            const filtered = currentSubset.filter(q => q.id !== itemId);
            const halfQuiz = Math.ceil(dbQuizzes.length / 2);
            const pool = dbQuizzes.slice(0, halfQuiz).filter(q => !newCompleted.includes(q.id) && !filtered.some(f => f.id === q.id));
            return [...filtered, ...pool.sort(() => 0.5 - Math.random()).slice(0, 1)];
          });
          return newCompleted;
        });
      }
    }

    if (type === "exercise") {
      setDiscoverTotalEx(prev => prev + 1);
      if (isCorrect) {
        setDiscoverCorrectEx(prev => {
          const next = prev + 1;
          if (next >= REQUIRED_CORRECT && !persistedUnlockEx) {
            setShowUnlockMessage(true);
            setTimeout(() => setShowUnlockMessage(false), 20000);
            setPersistedUnlockEx(true);
            persistUnlock("exercises", next);
          }
          return next;
        });
      }
    } else {
      setDiscoverTotalQz(prev => prev + 1);
      if (isCorrect) {
        setDiscoverCorrectQz(prev => {
          const next = prev + 1;
          if (next >= REQUIRED_CORRECT && !persistedUnlockQz) {
            setShowUnlockMessage(true);
            setTimeout(() => setShowUnlockMessage(false), 20000);
            setPersistedUnlockQz(true);
            persistUnlock("quizzes", next);
          }
          return next;
        });
      }
    }
  }, [persistUnlock, persistedUnlockEx, persistedUnlockQz, persistItemCompletion, dbExercises, dbQuizzes, adaptiveContent]);

  const discoverQuizzes = subsetDiscoverQz;
  const understandQuizzes = subsetUnderstandQz;
  const discoverExercises = subsetDiscoverEx;
  const understandExercises = subsetUnderstandEx;
  const halfQuiz = Math.ceil(dbQuizzes.length / 2);
  const halfExercise = Math.ceil(dbExercises.length / 2);

  const visibleSteps = readOnly ? stepConfig.filter(s => s.id !== "approfondir") : stepConfig;

  if (activeSection === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="cursor-pointer group hover:shadow-lg hover:border-primary/50 transition-all" onClick={() => handleSectionChange("exercises")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="h-7 w-7 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" dir="rtl">تمارين</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{dbExercises.length} تمارين{!readOnly && " + ذكاء اصطناعي"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer group hover:shadow-lg hover:border-primary/50 transition-all" onClick={() => handleSectionChange("quiz")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" dir="rtl">اسئله متعدده الاختيارات</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{dbQuizzes.length} أسئلة{!readOnly && " + ذكاء اصطناعي"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isQuiz = activeSection === "quiz";
  const SectionIcon = isQuiz ? Brain : PenTool;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        {!hiddenBackButton && <Button variant="outline" size="sm" onClick={() => handleSectionChange(null)}>← العودة</Button>}
        <div className="flex items-center gap-2">
          <SectionIcon className={cn("h-5 w-5", isQuiz ? "text-primary" : "text-orange-500")} />
          <h2 className="text-lg font-bold" dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات" : "تمارين"}</h2>
        </div>
      </div>

      {/* Step Stepper */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-1.5 bg-muted/40 rounded-xl border border-border/40 backdrop-blur-sm">
        {visibleSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isLocked = false;

          return (
            <button
              key={step.id}
              onClick={() => { if (!isLocked) setActiveStep(step.id); }}
              disabled={isLocked}
              className={cn(
                "relative flex items-center justify-between sm:justify-start gap-4 px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-300 w-full group",
                isActive
                  ? "bg-background shadow-md shadow-primary/5 ring-1 ring-border/60 text-foreground scale-[1.02]"
                  : isLocked
                    ? "opacity-50 cursor-not-allowed text-muted-foreground bg-transparent"
                    : "hover:bg-background/60 text-muted-foreground hover:text-foreground hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors shadow-sm",
                  isActive ? "bg-primary text-primary-foreground shadow-primary/20"
                    : isLocked ? "bg-muted text-muted-foreground/70"
                      : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  {isLocked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className={cn("text-sm font-bold leading-none tracking-tight", isActive ? "text-primary" : "text-foreground/80")}>{step.label}</span>
                  <span className={cn("text-[10px] font-medium leading-none font-arabic", isActive ? "text-primary/80" : "text-muted-foreground")}>{step.labelAr}</span>
                </div>
              </div>
              <div className={cn("flex items-center justify-center transition-all bg-muted/50 rounded-md p-1.5", isActive && "bg-primary/10", isLocked && "opacity-0")}>
                <Icon className={cn("w-4 h-4 transition-transform", isActive ? step.color : "text-muted-foreground grayscale group-hover:grayscale-0")} />
              </div>
              {isActive && <div className="absolute inset-x-0 -bottom-[1px] h-[3px] bg-primary rounded-full sm:hidden" />}
            </button>
          );
        })}
      </div>

      {/* Découvrir */}
      {activeStep === "decouvrir" && (
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center justify-between text-blue-600 gap-2">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات تشخيصية" : "تمارين تمهيدية"}</span>
              </div>
              <div className="flex-1 flex justify-center gap-2">
                {(completedExerciseIds.length > 0 || completedQuizIds.length > 0) && (
                  <Button size="sm" variant={showCorrectOnly ? "default" : "outline"}
                    onClick={(e) => { e.stopPropagation(); setShowCorrectOnly(!showCorrectOnly); }}
                    className={cn("gap-2 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105",
                      showCorrectOnly ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100")}
                    dir="rtl">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{showCorrectOnly ? "العودة للتمارين" : "إجابات صحيحة"}</span>
                  </Button>
                )}
                {showReloadBtn && !showCorrectOnly && (
                  <Button size="sm" variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReloadContent(); }}
                    className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                    dir="rtl">
                    <Dices className="h-3.5 w-3.5" />
                    <span>مجموعة جديدة</span>
                  </Button>
                )}
              </div>
              <Badge variant="secondary" className={!showReloadBtn ? "ml-auto" : ""}>
                {showCorrectOnly
                  ? (isQuiz ? completedQuizIds.length : completedExerciseIds.length)
                  : (isQuiz ? discoverQuizzes.length : discoverExercises.length)
                } {isQuiz ? "أسئلة" : "تمارين"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showCorrectOnly ? (
              <div className="space-y-3 animate-in fade-in zoom-in-50 duration-300">
                {isQuiz ? (
                  completedQuizIds.length > 0
                    ? dbQuizzes.filter(q => completedQuizIds.includes(q.id)).map((q, idx) => <CompletedQuizCard key={`completed-qz-${q.id}`} question={q} index={idx} />)
                    : <EmptyState text="لا توجد إجابات صحيحة بعد" />
                ) : (
                  completedExerciseIds.length > 0
                    ? dbExercises.filter(e => completedExerciseIds.includes(e.id)).map((ex, idx) => <CompletedExerciseCard key={`completed-ex-${ex.id}`} exercise={ex} index={idx} />)
                    : <EmptyState text="لا توجد تمارين صحيحة بعد" />
                )}
              </div>
            ) : (
              isQuiz ? (
                discoverQuizzes.length > 0
                  ? <div className="space-y-3" key={resetKey}>{discoverQuizzes.map((q, idx) => <TrackedQuizCard key={`${q.id}-${resetKey}`} question={q} index={idx} readOnly={readOnly} onAnswer={(payload) => handleDiscoverAnswer(payload, "quiz", q.id)} />)}</div>
                  : <EmptyState text={completedQuizIds.length > 0 ? "أكملت جميع اسئله متعدده الاختيارات المتاحة!" : "لا توجد اسئله متعدده الاختيارات تشخيصية بعد"} />
              ) : (
                discoverExercises.length > 0
                  ? <div className="space-y-3" key={resetKey}>{discoverExercises.map((ex, idx) => <TrackedExerciseCard key={`${ex.id}-${resetKey}`} exercise={ex} index={idx} readOnly={readOnly} onAnswer={(payload) => handleDiscoverAnswer(payload, "exercise", ex.id)} />)}</div>
                  : <EmptyState text={completedExerciseIds.length > 0 ? "أكملت جميع التمارين المتاحة!" : "لا توجد تمارين تمهيدية بعد"} />
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Comprendre */}
      {activeStep === "comprendre" && (
        <Card className="border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center justify-between text-yellow-600 gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                <span dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات تطبيقية" : "تمارين تطبيقية"}</span>
              </div>
              <div className="flex-1 flex justify-center gap-2">
                {(completedExerciseIds.length > 0 || completedQuizIds.length > 0) && (
                  <Button size="sm" variant={showCorrectOnly ? "default" : "outline"}
                    onClick={(e) => { e.stopPropagation(); setShowCorrectOnly(!showCorrectOnly); }}
                    className={cn("gap-2 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105",
                      showCorrectOnly ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100")}
                    dir="rtl">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{showCorrectOnly ? "العودة للتمارين" : "إجابات صحيحة"}</span>
                  </Button>
                )}
                {!showCorrectOnly && (
                  <Button size="sm" variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReloadContent(); }}
                    className="gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/40 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                    dir="rtl">
                    <Dices className="h-3.5 w-3.5" />
                    <span>مجموعة جديدة</span>
                  </Button>
                )}
              </div>
              <Badge variant="secondary" className={!showReloadBtn ? "ml-auto" : ""}>
                {showCorrectOnly
                  ? (isQuiz ? completedQuizIds.length : completedExerciseIds.length)
                  : (isQuiz ? subsetUnderstandQz.length : subsetUnderstandEx.length)
                } {isQuiz ? "أسئلة" : "تمارين"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showCorrectOnly ? (
              <div className="space-y-3 animate-in fade-in zoom-in-50 duration-300">
                {isQuiz ? (
                  completedQuizIds.length > 0
                    ? dbQuizzes.filter(q => completedQuizIds.includes(q.id)).map((q, idx) => <CompletedQuizCard key={`completed-qz-und-${q.id}`} question={q} index={idx} />)
                    : <EmptyState text="لا توجد إجابات صحيحة بعد" />
                ) : (
                  completedExerciseIds.length > 0
                    ? dbExercises.filter(e => completedExerciseIds.includes(e.id)).map((ex, idx) => <CompletedExerciseCard key={`completed-ex-und-${ex.id}`} exercise={ex} index={idx} />)
                    : <EmptyState text="لا توجد تمارين صحيحة بعد" />
                )}
              </div>
            ) : (
              isQuiz ? (
                subsetUnderstandQz.length > 0
                  ? <div className="space-y-3">{subsetUnderstandQz.map((q, idx) => <TrackedQuizCard key={`${q.id}-${resetKey}`} question={q} index={idx + halfQuiz} readOnly={readOnly} onAnswer={(payload) => handleUnderstandAnswer(payload, "quiz", q.id)} />)}</div>
                  : <EmptyState text={completedQuizIds.length > 0 ? "أكملت جميع اسئله متعدده الاختيارات المتاحة!" : "لا توجد اسئله متعدده الاختيارات تطبيقية بعد"} />
              ) : (
                subsetUnderstandEx.length > 0
                  ? <div className="space-y-3">{subsetUnderstandEx.map((ex, idx) => <TrackedExerciseCard key={`${ex.id}-${resetKey}`} exercise={ex} index={idx + halfExercise} readOnly={readOnly} onAnswer={(payload) => handleUnderstandAnswer(payload, "exercise", ex.id)} />)}</div>
                  : <EmptyState text={completedExerciseIds.length > 0 ? "أكملت جميع التمارين المتاحة!" : "لا توجد تمارين تطبيقية بعد"} />
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Approfondir */}
      {activeStep === "approfondir" && (
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-purple-600">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات ذكية" : "تمارين ذكية"} - إنشاء بالذكاء الاصطناعي</span>
              </div>
              {((isQuiz && adaptiveContent.quizzes.length > 0) || (!isQuiz && adaptiveContent.exercises.length > 0)) && (
                <Button size="sm" variant="outline"
                  onClick={() => {
                    if (isQuiz) { setAiQuizAnswers({}); setAiQuizSelected({}); setAiQuizResults({}); setAiQuizLocked({}); }
                    else { setAiExerciseAnswers({}); setAiExerciseResults({}); setAiExerciseLocked({}); }
                    adaptiveContent.resetSessionCounters();
                    adaptiveContent.generateContent(isQuiz ? "quiz" : "exercise");
                  }}
                  disabled={isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise}>
                  <RefreshCw className={cn("h-4 w-4 mr-2", (isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise) && "animate-spin")} />
                  تجديد
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise) ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
            ) : (isQuiz ? adaptiveContent.quizzes.length : adaptiveContent.exercises.length) === 0 ? (
              <div className="text-center py-8">
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Générer avec l'IA</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto" dir="rtl">
                  {isQuiz ? "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء اسئله متعدده الاختيارات متقدمة تناسب مستواك" : "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء تمارين متقدمة تناسب مستواك"}
                </p>
                <Button size="lg"
                  onClick={() => adaptiveContent.generateContent(isQuiz ? "quiz" : "exercise")}
                  disabled={isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-purple-500/20">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  {(isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise) ? "جاري الإنشاء..." : "Générer avec l'IA"}
                </Button>
              </div>
            ) : isQuiz ? (
              <div className="space-y-3">
                {adaptiveContent.quizzes.map((q, idx) => (
                  <Card key={idx} className={cn("transition-all", aiQuizResults[idx] === true && "border-green-500/50 bg-green-500/5", aiQuizLocked[idx] && "border-red-500/50 bg-red-500/5")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3" dir="rtl">
                        <div className="flex-1 font-medium flex gap-2">
                          <span>{idx + 1}.</span>
                          <HtmlWithMath htmlContent={cleanMathStatement(q.question)} className="flex-1" />
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => <Pencil key={i} className={cn("h-4 w-4", i < (q.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const solvedQ = aiQuizResults[idx] === true;
                          const lockedQ = aiQuizLocked[idx];
                          const isSelected = aiQuizSelected[idx] === opt;
                          let variant: "default" | "destructive" | "secondary" | "outline" = "outline";
                          if (solvedQ && isSelected) variant = "default";
                          else if (lockedQ && isSelected) variant = "destructive";
                          else if (isSelected) variant = "secondary";
                          return (
                            <Button key={oIdx}
                              variant={variant}
                              className={cn("justify-start text-right", !solvedQ && !lockedQ && isSelected && "ring-2 ring-primary")}
                              onClick={() => {
                                if (solvedQ || lockedQ) return;
                                setAiQuizSelected(prev => ({ ...prev, [idx]: opt }));
                              }}
                              disabled={solvedQ || lockedQ}
                              dir="rtl">
                              <HtmlWithMath htmlContent={cleanMathStatement(opt)} className="flex-1 text-right" />
                            </Button>
                          );
                        })}
                      </div>
                      {aiQuizResults[idx] !== true && (
                        <div className="mt-3 flex justify-end" dir="rtl">
                          <Button size="sm" disabled={!aiQuizSelected[idx] || aiQuizLocked[idx]}
                            onClick={() => {
                              const opt = aiQuizSelected[idx];
                              if (!opt || aiQuizLocked[idx]) return;
                              const isCorrect = opt === q.correct_answer;
                              setAiQuizAnswers(prev => ({ ...prev, [idx]: opt }));
                              if (isCorrect) {
                                setAiQuizResults(prev => ({ ...prev, [idx]: true }));
                              } else {
                                // Règle: rouge 3s, puis on rend la main pour réessayer, sans révéler la réponse.
                                setAiQuizLocked(prev => ({ ...prev, [idx]: true }));
                                const key = `q-${idx}`;
                                if (aiLockTimersRef.current[key]) clearTimeout(aiLockTimersRef.current[key]);
                                aiLockTimersRef.current[key] = setTimeout(() => {
                                  setAiQuizLocked(prev => ({ ...prev, [idx]: false }));
                                  setAiQuizSelected(prev => { const n = { ...prev }; delete n[idx]; return n; });
                                }, 3000);
                              }
                              adaptiveContent.recordAnswer(isCorrect, 0, "quiz", q.question, isCorrect ? undefined : { user_answer: opt, correct_answer: q.correct_answer }, q.difficulty);
                            }}>
                            تأكيد
                          </Button>
                        </div>
                      )}
                      {aiQuizLocked[idx] && (
                        <div className="mt-3 p-3 rounded border border-red-300 dark:border-red-700 bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-2 text-sm font-medium" dir="rtl">
                          <XCircle className="h-4 w-4" />
                          <span>إجابة غير صحيحة. ستتمكن من إعادة المحاولة بعد لحظات…</span>
                        </div>
                      )}
                      {aiQuizResults[idx] === true && q.explanation && (
                        <div className="mt-4 bg-white/50 dark:bg-black/20 p-4 rounded border border-gray-200 dark:border-gray-700" dir="rtl">
                          <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> الشرح:
                          </p>
                          <HtmlWithMath htmlContent={q.explanation} className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {adaptiveContent.exercises.map((ex, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3" dir="rtl">
                        <div className="flex-1 font-semibold flex gap-2">
                          <span>{idx + 1}.</span>
                          <HtmlWithMath htmlContent={cleanMathStatement(ex.title)} className="flex-1" />
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => <Pencil key={i} className={cn("h-4 w-4", i < (ex.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />)}
                        </div>
                      </div>
                      <HtmlWithMath htmlContent={cleanMathStatement(ex.statement)} className="text-sm text-right" dir="rtl" />
                      {ex.hints && ex.hints.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setAiShowHints(prev => ({ ...prev, [idx]: !prev[idx] }))} className="text-yellow-600">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          {aiShowHints[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          تلميحات
                        </Button>
                      )}
                      {aiShowHints[idx] && ex.hints?.map((hint: string, hIdx: number) => (
                        <div key={hIdx} className="text-xs text-muted-foreground bg-yellow-500/5 p-2 rounded flex gap-1" dir="rtl">
                          <span>💡</span>
                          <HtmlWithMath htmlContent={cleanMathStatement(hint)} className="flex-1" />
                        </div>
                      ))}
                      {aiExerciseResults[idx] !== true && (
                        <div className="flex gap-2 items-center" dir="rtl">
                          <input id={`ai-exo-input-${idx}`}
                            className={cn("flex-1 border rounded-lg px-3 py-2 text-sm bg-background transition-colors", aiExerciseLocked[idx] && "border-red-500 ring-2 ring-red-500/40 bg-red-500/5")}
                            placeholder={aiExerciseLocked[idx] ? "إجابة خاطئة، حاول مجدداً..." : "أدخل إجابتك..."}
                            value={aiExerciseAnswers[idx] || ""}
                            disabled={aiExerciseLocked[idx]}
                            onChange={(e) => setAiExerciseAnswers(prev => ({ ...prev, [idx]: e.target.value }))} dir="rtl" />
                          <Button size="sm" disabled={aiExerciseLocked[idx] || !aiExerciseAnswers[idx]?.trim()} onClick={() => {
                            const userAnswer = aiExerciseAnswers[idx]?.trim();
                            if (!userAnswer || aiExerciseLocked[idx]) return;
                            const norm = (s: string) => (s || "").toLowerCase().trim().replace(/\s+/g, "");
                            const isCorrect = norm(userAnswer) === norm(ex.expected_answer || "");
                            if (isCorrect) {
                              setAiExerciseResults(prev => ({ ...prev, [idx]: true }));
                            } else {
                              // Règle: rouge 3s, puis on rend la main pour retaper, sans révéler la réponse.
                              setAiExerciseLocked(prev => ({ ...prev, [idx]: true }));
                              const key = `e-${idx}`;
                              if (aiLockTimersRef.current[key]) clearTimeout(aiLockTimersRef.current[key]);
                              aiLockTimersRef.current[key] = setTimeout(() => {
                                setAiExerciseLocked(prev => ({ ...prev, [idx]: false }));
                              }, 3000);
                            }
                            adaptiveContent.recordAnswer(isCorrect, 0, "exercise", `${ex.title || ''} — ${ex.statement || ''}`.trim(), isCorrect ? undefined : { user_answer: userAnswer, correct_answer: ex.expected_answer }, ex.difficulty);
                          }}>تحقق</Button>
                          {!aiExerciseLocked[idx] && (
                            <MathKeyboard onInsert={(sym) => {
                              const el = document.getElementById(`ai-exo-input-${idx}`) as HTMLInputElement | null;
                              const current = aiExerciseAnswers[idx] || "";
                              if (el) {
                                const start = el.selectionStart ?? current.length;
                                const end = el.selectionEnd ?? current.length;
                                const next = current.slice(0, start) + sym + current.slice(end);
                                setAiExerciseAnswers(prev => ({ ...prev, [idx]: next }));
                                requestAnimationFrame(() => { el.focus(); const pos = start + sym.length; el.setSelectionRange(pos, pos); });
                              } else {
                                setAiExerciseAnswers(prev => ({ ...prev, [idx]: current + sym }));
                              }
                            }} />
                          )}
                        </div>
                      )}
                      {aiExerciseLocked[idx] && (
                        <div className="p-2 rounded text-sm bg-red-500/10 text-red-700 flex items-center gap-2" dir="rtl">
                          <XCircle className="h-4 w-4" />
                          <span>إجابة غير صحيحة. ستتمكن من إعادة المحاولة بعد لحظات…</span>
                        </div>
                      )}
                      {aiExerciseResults[idx] === true && (
                        <div className="p-2 rounded text-sm bg-green-500/10 text-green-700 flex items-center gap-2" dir="rtl">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>✅ إجابة صحيحة!</span>
                        </div>
                      )}
                      {ex.solution && (
                        <details className="text-sm group">
                          <summary className="cursor-pointer flex items-center gap-2 text-primary hover:text-primary/80 font-semibold py-2 px-3 bg-primary/5 hover:bg-primary/10 rounded-lg border border-primary/20 transition-colors">
                            <BookOpen className="h-4 w-4" />
                            <span>📖 عرض الحل المفصل</span>
                          </summary>
                          <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm" dir="rtl">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200 dark:border-blue-800">
                              <Sparkles className="h-4 w-4 text-blue-600" />
                              <h5 className="font-bold text-blue-900 dark:text-blue-100">الحل خطوة بخطوة</h5>
                            </div>
                            <HtmlWithMath
                              htmlContent={cleanMathStatement(ex.solution)}
                              className="prose prose-sm dark:prose-invert max-w-none text-right leading-relaxed text-gray-800 dark:text-gray-200 [&_p]:mb-2 [&_ol]:list-decimal [&_ul]:list-disc [&_li]:mb-1"
                            />
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Sub-components ---

const DifficultyIndicator = ({ level }: { level?: number }) => {
  if (!level) return null;
  return (
    <div className="flex gap-0.5 items-center mr-2 bg-yellow-50/50 px-1.5 py-0.5 rounded-full border border-yellow-100/50" title={`الصعوبة: ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Pencil key={i} className={cn("w-3 h-3 transition-colors", i < level ? "text-yellow-500 fill-yellow-500" : "text-gray-200")} />
      ))}
    </div>
  );
};

function CompletedQuizCard({ question, index }: { question: DBQuizQuestion; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(question.correct_answer || null);
  const [explanation, setExplanation] = useState<string | null>(question.explanation || null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!showAnswer && !correctAnswer) {
      setLoading(true);
      try {
        const { data } = await supabase.rpc('check_quiz_answer', { _quiz_id: question.id, _user_answer: '__fetch__' });
        const res = data as { correct_answer?: string; explanation?: string } | null;
        if (res) {
          setCorrectAnswer(res.correct_answer || null);
          setExplanation(res.explanation || null);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    setShowAnswer(!showAnswer);
  };

  return (
    <Card className="border-green-500/50 bg-green-500/5 transition-all hover:bg-green-500/10">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <p className="font-medium flex-1 text-right" dir="rtl">
            <span className="font-bold text-muted-foreground ml-2">{index + 1}.</span>
            {question.question}
          </p>
          <DifficultyIndicator level={question.difficulty} />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">إجابة صحيحة</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading}>
          {loading ? "جاري التحميل..." : showAnswer ? "إخفاء الحل" : "عرض الحل"}
        </Button>
        {showAnswer && (
          <div className="mt-4 space-y-3" dir="rtl">
            <div className="p-3 rounded border border-green-200 dark:border-green-700 text-sm bg-green-500/10 text-green-800 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">الإجابة الصحيحة: </span>
              {correctAnswer ? <HtmlWithMath htmlContent={correctAnswer} /> : "—"}
            </div>
            {explanation && (
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                <p className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BookOpen className="h-4 w-4" /> الشرح:
                </p>
                <HtmlWithMath htmlContent={explanation} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompletedExerciseCard({ exercise, index }: { exercise: DBExercise; index: number }) {
  const [showSolution, setShowSolution] = useState(false);
  const [expectedAnswer, setExpectedAnswer] = useState<string | null>(exercise.expected_answer || null);
  const [solution, setSolution] = useState<string | null>(exercise.solution || null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!showSolution && !expectedAnswer) {
      setLoading(true);
      try {
        const { data } = await supabase.rpc('check_exercise_answer', { _exercise_id: exercise.id, _user_answer: '__fetch__' });
        const res = data as { expected_answer?: string; solution?: string } | null;
        if (res) {
          setExpectedAnswer(res.expected_answer || null);
          setSolution(res.solution || null);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    setShowSolution(!showSolution);
  };

  return (
    <Card className="border-green-500/50 bg-green-500/5 transition-all hover:bg-green-500/10">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold flex-1 text-right" dir="rtl">{index + 1}. {exercise.title}</h4>
          <DifficultyIndicator level={exercise.difficulty} />
        </div>
        <HtmlWithMath htmlContent={cleanMathStatement(exercise.statement)} className="text-sm border-t pt-2 text-right" dir="rtl" />

        <div className="flex items-center gap-2 justify-end">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">إجابة صحيحة</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading}>
          {loading ? "جاري التحميل..." : showSolution ? "إخفاء الحل" : "عرض الحل"}
        </Button>
        {showSolution && (
          <div className="space-y-2" dir="rtl">
            <div className="p-3 bg-muted/50 rounded-lg text-sm"><span className="font-medium">الإجابة: </span>{expectedAnswer || "—"}</div>
            {solution && <MarkdownSolution content={solution} compact />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedQuizCard({ question, index, readOnly, onAnswer }: { question: DBQuizQuestion; index: number; readOnly?: boolean; onAnswer: (answer: AnswerPayload) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, []);

  const notifyAnswer = (payload: AnswerPayload) => {
    if (payload.correct) {
      completionTimerRef.current = setTimeout(() => onAnswer(payload), 2000);
      return;
    }
    onAnswer(payload);
  };

  // Select an option (no submission yet — Règle: bouton "تأكيد" obligatoire).
  const handleSelect = (opt: string) => {
    if (readOnly || solved || locked || submitting) return;
    setSelected(opt);
  };

  const handleValidate = async () => {
    if (readOnly || solved || locked || submitting || !selected) return;
    const opt = selected;
    setSubmitting(true);

    const apply = (isCorrect: boolean, expl: string, correctAnswer: string | null) => {
      if (isCorrect) {
        setSolved(true);
        setExplanation(expl || "");
        notifyAnswer({ correct: true, concept: question.question, userAnswer: opt, correctAnswer: correctAnswer || question.correct_answer, difficulty: question.difficulty });
      } else {
        // Règle: rouge 3s, puis on rend la main pour réessayer, sans révéler la réponse.
        setLocked(true);
        notifyAnswer({ correct: false, concept: question.question, userAnswer: opt, correctAnswer: correctAnswer || question.correct_answer, difficulty: question.difficulty });
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          setLocked(false);
          setSelected(null);
        }, 3000);
      }
    };

    try {
      const { data, error } = await supabase.rpc('check_quiz_answer', { _quiz_id: question.id, _user_answer: opt });
      if (error) throw error;
      const result = data as { is_correct: boolean; explanation: string; correct_answer: string | null };
      apply(result.is_correct, result.explanation || "", result.correct_answer);
    } catch (err) {
      console.error("Error validating quiz:", err);
      if (question.correct_answer) {
        const correct = opt === question.correct_answer;
        apply(correct, question.explanation || "", question.correct_answer);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={cn("transition-all", solved && "border-green-500/50 bg-green-500/5", locked && "border-red-500/50 bg-red-500/5")}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="font-medium flex-1 flex gap-2 items-start" dir="rtl">
            <span className="shrink-0">{index + 1}.</span>
            <HtmlWithMath htmlContent={question.question} className="flex-1 text-right" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <DifficultyIndicator level={question.difficulty} />
            {!solved && question.hint && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHint(v => !v)}
                className="gap-2 h-7 text-xs border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950 font-semibold"
              >
                <Lightbulb className="h-3 w-3" />
                {showHint ? "إخفاء المساعدة" : "💡 مساعدة"}
              </Button>
            )}
          </div>
        </div>

        {showHint && !solved && question.hint && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 text-sm" dir="rtl">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 text-amber-900 dark:text-amber-200">
                <span className="font-semibold block mb-1">تلميح:</span>
                <HtmlWithMath htmlContent={question.hint} className="text-right" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options.map((opt, oIdx) => {
            const isSelected = selected === opt;
            let variant: "default" | "destructive" | "secondary" | "outline" = "outline";
            if (solved && isSelected) variant = "default";
            else if (locked && isSelected) variant = "destructive";
            else if (isSelected) variant = "secondary";
            return (
              <Button key={oIdx}
                variant={variant}
                className={cn("justify-start text-right", !solved && !locked && isSelected && "ring-2 ring-primary")}
                onClick={() => handleSelect(opt)}
                disabled={readOnly || solved || locked || submitting}
                dir="rtl"><HtmlWithMath htmlContent={opt} /></Button>
            );
          })}
        </div>

        {!solved && (
          <div className="mt-3 flex justify-end" dir="rtl">
            <Button size="sm" onClick={handleValidate} disabled={readOnly || locked || submitting || !selected}>
              {submitting ? "..." : "تأكيد"}
            </Button>
          </div>
        )}

        {locked && (
          <div className="mt-3 p-3 rounded border border-red-300 dark:border-red-700 bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-2 text-sm font-medium" dir="rtl">
            <XCircle className="h-4 w-4" />
            <span>إجابة غير صحيحة. ستتمكن من إعادة المحاولة بعد لحظات…</span>
          </div>
        )}

        {solved && (
          <div className="mt-3 p-3 rounded border border-green-300 dark:border-green-700 bg-green-500/10 text-green-800 dark:text-green-300 flex items-center gap-2 text-sm font-semibold" dir="rtl">
            <CheckCircle2 className="h-4 w-4" />
            <span>✅ إجابة صحيحة! أحسنت 🎉</span>
          </div>
        )}

        {solved && explanation && (
          <div className="mt-4 bg-white/50 dark:bg-black/20 p-4 rounded border border-gray-200 dark:border-gray-700" dir="rtl">
            <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> الشرح:
            </p>
            <HtmlWithMath htmlContent={explanation} className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedExerciseCard({ exercise, index, readOnly, onAnswer }: { exercise: DBExercise; index: number; readOnly?: boolean; onAnswer: (answer: AnswerPayload) => void }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, []);

  const notifyAnswer = (payload: AnswerPayload) => {
    if (payload.correct) {
      completionTimerRef.current = setTimeout(() => {
        setOpen(false);
        onAnswer(payload);
      }, 2000);
      return;
    }
    onAnswer(payload);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || submitting || locked || solved) return;
    setSubmitting(true);

    const apply = (isCorrect: boolean, sol: string) => {
      if (sol) setSolution(sol);
      if (isCorrect) {
        setSolved(true);
        notifyAnswer({ correct: true, concept: `${exercise.title || ''} — ${exercise.statement || ''}`.trim(), userAnswer: answer.trim(), correctAnswer: exercise.expected_answer, difficulty: exercise.difficulty });
      } else {
        // Règle: rouge 3s, puis on rend la main pour retaper, sans révéler la réponse.
        setLocked(true);
        notifyAnswer({ correct: false, concept: `${exercise.title || ''} — ${exercise.statement || ''}`.trim(), userAnswer: answer.trim(), correctAnswer: exercise.expected_answer, difficulty: exercise.difficulty });
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => setLocked(false), 3000);
      }
    };

    try {
      const { data, error } = await supabase.rpc('check_exercise_answer', { _exercise_id: exercise.id, _user_answer: answer.trim() });
      if (error) throw error;
      const res = data as { is_correct: boolean; expected_answer: string; solution: string };
      apply(res.is_correct, res.solution);
    } catch (err) {
      console.error("Error validating exercise:", err);
      if (exercise.expected_answer) {
        const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "");
        const isCorrect = norm(answer) === norm(exercise.expected_answer) || (exercise.accepted_answers || []).some(a => norm(a) === norm(answer));
        apply(isCorrect, exercise.solution || "");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevealSolution = async () => {
    const next = !revealed;
    setRevealed(next);
    if (next && !solution && !exercise.solution) {
      try {
        const { data } = await supabase.rpc('check_exercise_answer', { _exercise_id: exercise.id, _user_answer: "__reveal__" });
        const res = data as { solution?: string } | null;
        if (res?.solution) setSolution(res.solution);
      } catch (err) {
        console.error("Error loading solution:", err);
      }
    }
  };

  return (
    <>
      <Card className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={() => setOpen(true)}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-3">
            <h4 className="font-semibold flex-1 text-right" dir="rtl">{index + 1}. {exercise.title}</h4>
            <DifficultyIndicator level={exercise.difficulty} />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right" dir="rtl">اضغط لفتح التمرين</p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">{index + 1}. {exercise.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(() => {
              const cleaned = cleanMathStatement(exercise.statement);
              return statementHasMath(cleaned) ? (
                <HtmlWithMath htmlContent={cleaned} className="text-sm border-t pt-2 text-right" dir="rtl" />
              ) : (
                <p className="text-sm border-t pt-2 text-right" dir="rtl">{cleaned}</p>
              );
            })()}
            {exercise.hint && (
              <HintBlock hint={exercise.hint} />
            )}
            {!readOnly && !solved && (
              <div className="flex gap-2 items-center" dir="rtl">
                <input
                  id={`exo-input-${exercise.id}`}
                  className={cn("flex-1 border rounded-lg px-3 py-2 text-sm bg-background transition-colors", locked && "border-red-500 ring-2 ring-red-500/40 bg-red-500/5")}
                  placeholder={locked ? "إجابة خاطئة، حاول مجدداً..." : "أدخل إجابتك..."}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={locked || submitting}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !locked && !submitting && answer.trim()) handleSubmit(); }}
                  dir="rtl"
                />
                <Button size="sm" onClick={handleSubmit} disabled={locked || submitting || !answer.trim()}>{submitting ? "..." : "تحقق"}</Button>
                {!locked && (
                  <MathKeyboard
                    onInsert={(sym) => {
                      const el = document.getElementById(`exo-input-${exercise.id}`) as HTMLInputElement | null;
                      if (el) {
                        const start = el.selectionStart ?? answer.length;
                        const end = el.selectionEnd ?? answer.length;
                        const next = answer.slice(0, start) + sym + answer.slice(end);
                        setAnswer(next);
                        requestAnimationFrame(() => {
                          el.focus();
                          const pos = start + sym.length;
                          el.setSelectionRange(pos, pos);
                        });
                      } else {
                        setAnswer((prev) => prev + sym);
                      }
                    }}
                  />
                )}
              </div>
            )}
            {locked && (
              <div className="p-3 rounded border border-red-300 dark:border-red-700 bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-2 text-sm font-medium" dir="rtl">
                <XCircle className="h-4 w-4" />
                <span>إجابة غير صحيحة. ستتمكن من إعادة المحاولة بعد لحظات…</span>
              </div>
            )}
            {solved && (
              <div className="p-3 rounded border border-green-300 dark:border-green-700 bg-green-500/10 text-green-800 dark:text-green-300 flex items-center gap-2 text-sm font-semibold" dir="rtl">
                <CheckCircle2 className="h-4 w-4" />
                <span>✅ إجابة صحيحة! أحسنت 🎉</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleRevealSolution}>{revealed ? "إخفاء الحل" : "📖 عرض الحل المفصل"}</Button>
            {revealed && (solution || exercise.solution) && (
              <MarkdownSolution content={(solution || exercise.solution) as string} compact />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function HintBlock({ hint }: { hint: string }) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div dir="rtl" className="mt-2 mb-3">
      <Button type="button" variant="outline" size="sm"
        onClick={() => setShowHint(v => !v)}
        className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950 mb-2">
        <Lightbulb className="h-4 w-4" />
        {showHint ? "إخفاء المساعدة" : "مساعدة"}
      </Button>
      {showHint && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
            <HtmlWithMath htmlContent={hint} className="text-sm flex-1" />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-8"><p className="text-muted-foreground" dir="rtl">{text}</p></div>;
}