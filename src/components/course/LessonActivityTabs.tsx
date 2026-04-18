import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, PenTool, BookOpen, Sparkles, Eye, Lightbulb, Rocket, ChevronRight, Lock, CheckCircle2, RefreshCw, Pencil, Dices, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptiveContent } from "@/hooks/useAdaptiveContent";
import { useActivityTimeTracker } from "@/hooks/useActivityTimeTracker";

export interface DBQuizQuestion {
  id: string;
  lesson_id?: string | null;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
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
type StepLevel = "decouvrir" | "comprendre" | "approfondir";

const REQUIRED_CORRECT = 3;

const stepConfig: { id: StepLevel; label: string; labelAr: string; icon: typeof Eye; color: string }[] = [
  { id: "decouvrir", label: "Découvrir", labelAr: "اكتشف", icon: Eye, color: "text-blue-500" },
  { id: "comprendre", label: "Comprendre", labelAr: "افهم", icon: Lightbulb, color: "text-yellow-500" },
  { id: "approfondir", label: "Approfondir", labelAr: "تعمّق", icon: Rocket, color: "text-purple-500" },
];

export function LessonActivityTabs({ dbQuizzes, dbExercises, chapterId, chapterTitle, lessonId, lessonTitle, onGenerateAI, onSectionChange, hiddenBackButton, readOnly, userId: propUserId, schoolLevel }: LessonActivityTabsProps) {
  const [activeSection, setActiveSection] = useState<ActivitySection>(null);
  const [activeStep, setActiveStep] = useState<StepLevel>("decouvrir");

  // Progression tracking for Découvrir (separate for exercises and quizzes)
  const [discoverCorrectEx, setDiscoverCorrectEx] = useState(0);
  const [discoverCorrectQz, setDiscoverCorrectQz] = useState(0);
  const [discoverTotalEx, setDiscoverTotalEx] = useState(0);
  const [discoverTotalQz, setDiscoverTotalQz] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // Persisted unlock state from DB
  const [persistedUnlockEx, setPersistedUnlockEx] = useState(false);
  const [persistedUnlockQz, setPersistedUnlockQz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Completed items tracking
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([]);
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);

  // State for randomized subsets (Limit 5)
  const [subsetDiscoverEx, setSubsetDiscoverEx] = useState<DBExercise[]>([]);
  const [subsetUnderstandEx, setSubsetUnderstandEx] = useState<DBExercise[]>([]);
  const [subsetDiscoverQz, setSubsetDiscoverQz] = useState<DBQuizQuestion[]>([]);
  const [subsetUnderstandQz, setSubsetUnderstandQz] = useState<DBQuizQuestion[]>([]);

  // State for notification and reload button
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);
  const [showReloadBtn, setShowReloadBtn] = useState(false);

  // AI adaptive content for "approfondir" step
  const adaptiveContent = useAdaptiveContent(
    lessonId || "", chapterId, propUserId || userId || "", schoolLevel || "", lessonTitle, chapterTitle
  );
  const [aiQuizAnswers, setAiQuizAnswers] = useState<Record<number, string>>({});
  const [aiQuizResults, setAiQuizResults] = useState<Record<number, boolean>>({});
  const [aiExerciseAnswers, setAiExerciseAnswers] = useState<Record<number, string>>({});
  const [aiExerciseResults, setAiExerciseResults] = useState<Record<number, boolean | null>>({});
  const [aiShowHints, setAiShowHints] = useState<Record<number, boolean>>({});

  // Time tracking: map activeSection to activity type
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

  // Reset showCorrectOnly on tab change
  useEffect(() => {
    setShowCorrectOnly(false);
  }, [activeStep, activeSection]);

  // Initialize random subsets on mount
  useEffect(() => {
    // Split pools from original source to maintain difficulty tiers
    const halfQuiz = Math.ceil(dbQuizzes.length / 2);
    const originDiscoverQz = dbQuizzes.slice(0, halfQuiz);
    const originUnderstandQz = dbQuizzes.slice(halfQuiz);

    const halfEx = Math.ceil(dbExercises.length / 2);
    const originDiscoverEx = dbExercises.slice(0, halfEx);
    const originUnderstandEx = dbExercises.slice(halfEx);

    // Apply filter
    const poolDiscoverQz = originDiscoverQz.filter(q => !completedQuizIds.includes(q.id));
    const poolUnderstandQz = originUnderstandQz.filter(q => !completedQuizIds.includes(q.id));

    const poolDiscoverEx = originDiscoverEx.filter(e => !completedExerciseIds.includes(e.id));
    const poolUnderstandEx = originUnderstandEx.filter(e => !completedExerciseIds.includes(e.id));

    setSubsetDiscoverQz([...poolDiscoverQz].sort(() => 0.5 - Math.random()).slice(0, 5));
    setSubsetUnderstandQz([...poolUnderstandQz].sort(() => 0.5 - Math.random()).slice(0, 5));
    setSubsetDiscoverEx([...poolDiscoverEx].sort(() => 0.5 - Math.random()).slice(0, 5));
    setSubsetUnderstandEx([...poolUnderstandEx].sort(() => 0.5 - Math.random()).slice(0, 5));
  }, [dbQuizzes, dbExercises]); // Removed completedExerciseIds and completedQuizIds dependencies to prevent auto-shuffle on answer

  // Load userId FIRST (critical for saving)
  useEffect(() => {
    const loadUser = async () => {
      console.log("👤 [LessonActivityTabs] Loading current user...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("✅ [LessonActivityTabs] User ID loaded:", user.id);
        setUserId(user.id);

        // Check subscription status
        const { data: sub } = await supabase
          .from("student_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_paused", false)
          .maybeSingle();

        if (sub) {
          // Simple calculation based on Account.tsx logic
          const now = new Date();
          const lastTick = new Date(sub.last_tick_at);
          const elapsed = (now.getTime() - lastTick.getTime()) / (1000 * 60 * 60 * 24);
          const totalUsed = (sub.days_used || 0) + elapsed;
          const remaining = (sub.total_days || 0) - totalUsed;

          if (remaining > 0) {
            setHasActiveSubscription(true);
            console.log("✅ [LessonActivityTabs] Active subscription found");
          }
        }
      } else {
        console.warn("⚠️ [LessonActivityTabs] No authenticated user found!");
      }
      setIsLoadingUser(false);
    };
    loadUser();
  }, []);

  // Load persisted unlock state on mount and when userId changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) {
        console.warn("⚠️ [loadProgress] userId not available yet, skipping load");
        return;
      }

      console.log("🔄 [LessonActivityTabs] Loading progress for chapter:", chapterId, "with userId:", userId);

      let progressQuery = supabase
        .from("student_scores")
        .select("id, assessment_data")
        .eq("user_id", userId)
        .eq("chapter_id", chapterId);

      progressQuery = lessonId
        ? progressQuery.eq("lesson_id", lessonId)
        : progressQuery.is("lesson_id", null);

      const { data, error } = await progressQuery;

      if (error) {
        console.error("❌ [LessonActivityTabs] Failed to load chapter unlock state:", error);
        return;
      }

      const rows = data || [];
      console.log("📊 [LessonActivityTabs] Loaded", rows.length, "progress rows for chapter", chapterId);

      if (rows.length > 0) {
        console.log("📋 [LessonActivityTabs] Progress data:", JSON.stringify(rows, null, 2));
      }

      const hasExercisesUnlocked = rows.some((row) => {
        const ad = (row.assessment_data || {}) as Record<string, unknown>;
        return Boolean(ad.exercises_unlocked);
      });

      const hasQuizzesUnlocked = rows.some((row) => {
        const ad = (row.assessment_data || {}) as Record<string, unknown>;
        return Boolean(ad.quizzes_unlocked);
      });

      // Also restore the actual correct answer counts
      const exercisesCorrectCount = rows.reduce((max, row) => {
        const ad = (row.assessment_data || {}) as Record<string, any>;
        return Math.max(max, ad.exercises_correct_count || 0);
      }, 0);

      const quizzesCorrectCount = rows.reduce((max, row) => {
        const ad = (row.assessment_data || {}) as Record<string, any>;
        return Math.max(max, ad.quizzes_correct_count || 0);
      }, 0);

      // Load completed IDs
      const completedEx: string[] = [];
      const completedQz: string[] = [];
      rows.forEach((row) => {
        const ad = (row.assessment_data || {}) as Record<string, any>;
        if (Array.isArray(ad.completed_exercises)) {
          completedEx.push(...ad.completed_exercises);
        }
        if (Array.isArray(ad.completed_quizzes)) {
          completedQz.push(...ad.completed_quizzes);
        }
      });

      // Deduplicate
      const uniqueEx = Array.from(new Set(completedEx));
      const uniqueQz = Array.from(new Set(completedQz));

      setCompletedExerciseIds(uniqueEx);
      setCompletedQuizIds(uniqueQz);
      console.log("✅ [LessonActivityTabs] Loaded completed items:", uniqueEx.length, "exercises,", uniqueQz.length, "quizzes");

      if (hasExercisesUnlocked) {
        console.log("🔓 [LessonActivityTabs] Setting exercises unlocked: true");
        setPersistedUnlockEx(true);
        // If unlocked, show at least the required correct count
        if (exercisesCorrectCount < REQUIRED_CORRECT) {
          setDiscoverCorrectEx(REQUIRED_CORRECT);
          console.log("📊 [LessonActivityTabs] Set exercises correct to", REQUIRED_CORRECT);
        } else {
          setDiscoverCorrectEx(exercisesCorrectCount);
          console.log("📊 [LessonActivityTabs] Set exercises correct to", exercisesCorrectCount);
        }
      } else if (exercisesCorrectCount > 0) {
        setDiscoverCorrectEx(exercisesCorrectCount);
        console.log("📊 [LessonActivityTabs] Set exercises correct to", exercisesCorrectCount);
      }

      if (hasQuizzesUnlocked) {
        console.log("🔓 [LessonActivityTabs] Setting quizzes unlocked: true");
        setPersistedUnlockQz(true);
        // If unlocked, show at least the required correct count
        if (quizzesCorrectCount < REQUIRED_CORRECT) {
          setDiscoverCorrectQz(REQUIRED_CORRECT);
          console.log("📊 [LessonActivityTabs] Set quizzes correct to", REQUIRED_CORRECT);
        } else {
          setDiscoverCorrectQz(quizzesCorrectCount);
          console.log("📊 [LessonActivityTabs] Set quizzes correct to", quizzesCorrectCount);
        }
      } else if (quizzesCorrectCount > 0) {
        setDiscoverCorrectQz(quizzesCorrectCount);
        console.log("📊 [LessonActivityTabs] Set quizzes correct to", quizzesCorrectCount);
      }

      // Initialize subsets filtering out completed items
      const halfQuiz = Math.ceil(dbQuizzes.length / 2);
      const originDiscoverQz = dbQuizzes.slice(0, halfQuiz);
      const originUnderstandQz = dbQuizzes.slice(halfQuiz);

      const halfEx = Math.ceil(dbExercises.length / 2);
      const originDiscoverEx = dbExercises.slice(0, halfEx);
      const originUnderstandEx = dbExercises.slice(halfEx);

      const poolDiscoverQz = originDiscoverQz.filter(q => !uniqueQz.includes(q.id));
      const poolUnderstandQz = originUnderstandQz.filter(q => !uniqueQz.includes(q.id));

      const poolDiscoverEx = originDiscoverEx.filter(e => !uniqueEx.includes(e.id));
      const poolUnderstandEx = originUnderstandEx.filter(e => !uniqueEx.includes(e.id));

      setSubsetDiscoverQz([...poolDiscoverQz].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSubsetUnderstandQz([...poolUnderstandQz].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSubsetDiscoverEx([...poolDiscoverEx].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSubsetUnderstandEx([...poolUnderstandEx].sort(() => 0.5 - Math.random()).slice(0, 5));
    };

    loadProgress();
  }, [chapterId, lessonId, triggerReload, userId, dbQuizzes, dbExercises]);

  // Save unlock to DB
  const persistUnlock = useCallback(async (type: "exercises" | "quizzes", correctCount?: number) => {
    console.log(`📤 [persistUnlock] Starting to save ${type} unlock, count:`, correctCount);

    // Get current user directly (don't rely on state!)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ [persistUnlock] No authenticated user found!");
      return;
    }


    const currentUserId = user.id;
    console.log(`📤 [persistUnlock] User ID: ${currentUserId}, Chapter ID: ${chapterId}, Type: ${type}, Count: ${correctCount}`);

    const field = type === "exercises" ? "exercises_unlocked" : "quizzes_unlocked";
    const countField = type === "exercises" ? "exercises_correct_count" : "quizzes_correct_count";

    // Query ALL rows for this user+chapter to debug what's going on
    const { data: allRows, error: scanError } = await supabase
      .from("student_scores")
      .select("id, lesson_id, assessment_data")
      .eq("user_id", currentUserId)
      .eq("chapter_id", chapterId);

    if (scanError) {
      console.warn("⚠️  [persistUnlock] Scan error:", scanError.message);
    } else {
      console.log(`📋 [persistUnlock] Found ${allRows?.length ?? 0} total rows for chapter (including lessons)`);
    }

    // Find the row scoped to the current lesson when available.
    // Fallback to chapter aggregate when lessonId is not provided.
    const targetRow = allRows?.find(r => lessonId ? r.lesson_id === lessonId : r.lesson_id === null);

    if (targetRow) {
      console.log("✅ [persistUnlock] Found existing chapter row via JS filter. ID:", targetRow.id);

      const existingData = (targetRow.assessment_data || {}) as Record<string, unknown>;
      const mergedData = {
        ...existingData,
        [field]: true,
        ...(correctCount !== undefined && { [countField]: correctCount })
      };

      console.log("📝 [persistUnlock] Updating existing row...");
      const { error: updateError } = await supabase
        .from("student_scores")
        .update({ assessment_data: mergedData as any })
        .eq("id", targetRow.id);

      if (updateError) {
        console.error("❌ [persistUnlock] Update failed:", updateError.message);
      } else {
        console.log("✅ [persistUnlock] Update success!");
      }
      return;
    }

    // No existing row found in JS scan, try INSERT
    console.log("📝 [persistUnlock] No chapter row found. Attempting INSERT...");

    // Check if we have other rows that might conflict if index is only (user, chapter)
    // If allRows has length > 0, we have lesson rows. 
    // If index is (user, chapter), we can't insert a second row even if lesson_id is null.
    // But error 23505 implies unique violation.

    const insertPayload = {
      user_id: currentUserId,
      chapter_id: chapterId,
      lesson_id: lessonId ?? null,
      assessment_data: {
        [field]: true,
        ...(correctCount !== undefined && { [countField]: correctCount })
      } as any,
    };

    const { error: insertError } = await supabase
      .from("student_scores")
      .insert([insertPayload]);

    if (insertError) {
      console.error("❌ [persistUnlock] INSERT failed:", insertError.message, insertError.code, insertError.details);

      // If code is 23505 (unique_violation), it means a row DOES exist but our SELECT missed it (RLS?)
      // OR it conflicts with another row (improper index?)
      if (insertError.code === '23505') {
        console.error("💀 [persistUnlock] Critical: Row exists (duplicate key) but was not found in SELECT. This is likely an RLS visibility issue or Index scope issue.");
      }
    } else {
      console.log("✅ [persistUnlock] Successfully inserted new row");
    }

  }, [chapterId, lessonId]);

  const persistItemCompletion = useCallback(async (type: "exercises" | "quizzes", itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentUserId = user.id;
    const field = type === "exercises" ? "completed_exercises" : "completed_quizzes";

    // Re-fetch current data to avoid overwriting (though optimistic UI update handles display)
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
        const newList = [...currentList, itemId];
        const { error: updateError } = await supabase
          .from("student_scores")
          .update({ assessment_data: { ...existingData, [field]: newList } })
          .eq("id", targetRow.id);

        if (updateError) {
          console.error("❌ Failed to update completion:", updateError);
        } else {
          console.log("✅ Saved completion:", itemId);
        }
      }
    } else {
      // Create new row
      const { error: insertError } = await supabase.from("student_scores").insert([{
        user_id: currentUserId,
        chapter_id: chapterId,
        lesson_id: lessonId ?? null,
        assessment_data: { [field]: [itemId] } as any
      }]);

      if (insertError) {
        console.error("❌ Failed to save new completion row:", insertError);
      } else {
        console.log("✅ Created new row for completion:", itemId);
      }
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

      await supabase
        .from("student_scores")
        .update({
          total_answers: nextTotal,
          correct_answers: nextCorrect,
          accuracy_rate: nextAccuracy,
        } as any)
        .eq("id", row.id);
      return;
    }

    await supabase
      .from("student_scores")
      .insert([{
        user_id: currentUserId,
        chapter_id: chapterId,
        lesson_id: lessonId ?? null,
        total_answers: 1,
        correct_answers: isCorrect ? 1 : 0,
        accuracy_rate: isCorrect ? 100 : 0,
      } as any]);
  }, [chapterId, lessonId, propUserId, userId]);


  /* 
   * REMOVED: Redundant useEffects that were causing race conditions with direct calls.
   * Persistence is now handled directly in handleDiscoverAnswer
   */
  // useEffect(() => { ... }, [persistedUnlockEx]);
  // useEffect(() => { ... }, [persistedUnlockQz]);

  const isUnlockedEx = persistedUnlockEx || discoverCorrectEx >= REQUIRED_CORRECT;
  const isUnlockedQz = persistedUnlockQz || discoverCorrectQz >= REQUIRED_CORRECT;

  const isUnlocked = activeSection === "exercises" ? isUnlockedEx : isUnlockedQz;
  const currentCorrect = activeSection === "exercises" ? discoverCorrectEx : discoverCorrectQz;

  // Handle visibility states
  useEffect(() => {
    // If it is unlocked and we are not currently showing the success animation (message),
    // then we must show the reload button.
    // This covers case: persisted from DB -> show button immediately.
    // This covers case: animation finished -> show button.
    if (isUnlocked && !showUnlockMessage) {
      setShowReloadBtn(true);
    } else if (!isUnlocked) {
      // If locked, reset everything.
      setShowReloadBtn(false);
      setShowUnlockMessage(false);
    }
  }, [isUnlocked, showUnlockMessage]);

  // Handle Reload Random Subset
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

  // Reload progress from DB (called when user switches sections to ensure fresh data)
  const reloadProgressFromDB = useCallback(async () => {
    console.log("🔄 [reloadProgressFromDB] Forcing reload of persisted unlock state");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("⚠️ [reloadProgressFromDB] No user found");
      return;
    }

    let progressQuery = supabase
      .from("student_scores")
      .select("id, assessment_data")
      .eq("user_id", user.id)
      .eq("chapter_id", chapterId);

    progressQuery = lessonId
      ? progressQuery.eq("lesson_id", lessonId)
      : progressQuery.is("lesson_id", null);

    const { data, error } = await progressQuery;

    if (error) {
      console.error("❌ [reloadProgressFromDB] Failed to load:", error);
      return;
    }

    const rows = data || [];
    console.log("✅ [reloadProgressFromDB] Refresh: Loaded", rows.length, "rows");

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

    if (hasExercisesUnlocked) {
      console.log("🔓 [reloadProgressFromDB] exercises_unlocked: true");
      setPersistedUnlockEx(true);
      if (exercisesCorrectCount < REQUIRED_CORRECT) {
        setDiscoverCorrectEx(REQUIRED_CORRECT);
      } else {
        setDiscoverCorrectEx(exercisesCorrectCount);
      }
    }
    if (hasQuizzesUnlocked) {
      console.log("🔓 [reloadProgressFromDB] quizzes_unlocked: true");
      setPersistedUnlockQz(true);
      if (quizzesCorrectCount < REQUIRED_CORRECT) {
        setDiscoverCorrectQz(REQUIRED_CORRECT);
      } else {
        setDiscoverCorrectQz(quizzesCorrectCount);
      }
    }
  }, [chapterId, lessonId]);

  const handleSectionChange = (section: ActivitySection) => {
    console.log("🖱️ [handleSectionChange] Changed to section:", section);
    setActiveSection(section);
    setActiveStep("decouvrir");

    // Reload progress from DB whenever user changes section
    if (section !== null) {
      console.log("📥 [handleSectionChange] Reloading progress from DB...");
      reloadProgressFromDB();
    }

    onSectionChange?.(section);
  };

  const handleUnderstandAnswer = useCallback((isCorrect: boolean, type: "exercise" | "quiz", itemId: string) => {
    persistAnswerStats(isCorrect);

    if (isCorrect) {
      if (type === "exercise") {
        setCompletedExerciseIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("exercises", itemId);
          const newCompleted = [...prev, itemId];
          // Remove from subset and replace
          setSubsetUnderstandEx(currentSubset => {
            const filtered = currentSubset.filter(e => e.id !== itemId);
            const halfEx = Math.ceil(dbExercises.length / 2);
            const pool = dbExercises.slice(halfEx).filter(e => !newCompleted.includes(e.id) && !filtered.some(f => f.id === e.id));
            const replacement = pool.sort(() => 0.5 - Math.random()).slice(0, 1);
            return [...filtered, ...replacement];
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
            const replacement = pool.sort(() => 0.5 - Math.random()).slice(0, 1);
            return [...filtered, ...replacement];
          });
          return newCompleted;
        });
      }
    }
  }, [persistItemCompletion, dbExercises, dbQuizzes, persistAnswerStats]);

  const handleDiscoverAnswer = useCallback((isCorrect: boolean, type: "exercise" | "quiz", itemId?: string) => {
    console.log(`📝 [handleDiscoverAnswer] ${type}: isCorrect=${isCorrect}, id=${itemId}`);
    persistAnswerStats(isCorrect);

    if (itemId && isCorrect) {
      if (type === "exercise") {
        setCompletedExerciseIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("exercises", itemId);
          const newCompleted = [...prev, itemId];
          // Remove from subset and replace with new item from pool
          setSubsetDiscoverEx(currentSubset => {
            const filtered = currentSubset.filter(e => e.id !== itemId);
            const halfEx = Math.ceil(dbExercises.length / 2);
            const pool = dbExercises.slice(0, halfEx).filter(e => !newCompleted.includes(e.id) && !filtered.some(f => f.id === e.id));
            const replacement = pool.sort(() => 0.5 - Math.random()).slice(0, 1);
            return [...filtered, ...replacement];
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
            const replacement = pool.sort(() => 0.5 - Math.random()).slice(0, 1);
            return [...filtered, ...replacement];
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
          console.log(`✅ [handleDiscoverAnswer] exercises: ${prev} → ${next} correct (need ${REQUIRED_CORRECT})`);

          if (next >= REQUIRED_CORRECT && !persistedUnlockEx) {
            console.log("🎉 [handleDiscoverAnswer] exercises: UNLOCKING!");
            setShowUnlockMessage(true);
            setTimeout(() => {
              setShowUnlockMessage(false);
            }, 20000);

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
          console.log(`✅ [handleDiscoverAnswer] quizzes: ${prev} → ${next} correct (need ${REQUIRED_CORRECT})`);

          if (next >= REQUIRED_CORRECT && !persistedUnlockQz) {
            console.log("🎉 [handleDiscoverAnswer] quizzes: UNLOCKING!");
            setShowUnlockMessage(true);
            setTimeout(() => {
              setShowUnlockMessage(false);
            }, 20000);

            setPersistedUnlockQz(true);
            persistUnlock("quizzes", next);
          }
          return next;
        });
      }
    }
  }, [persistUnlock, persistedUnlockEx, persistedUnlockQz, persistItemCompletion, dbExercises, dbQuizzes, persistAnswerStats]);

  // Render based on Random Subsets (limits to 5)
  const discoverQuizzes = subsetDiscoverQz;
  const understandQuizzes = subsetUnderstandQz;
  const discoverExercises = subsetDiscoverEx;
  const understandExercises = subsetUnderstandEx;
  const halfQuiz = Math.ceil(dbQuizzes.length / 2);
  const halfExercise = Math.ceil(dbExercises.length / 2);

  const visibleSteps = readOnly ? stepConfig.filter(s => s.id !== "approfondir") : stepConfig;

  if (activeSection === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
        <Card className="cursor-pointer group hover:shadow-lg hover:border-green-500/50 transition-all" onClick={() => handleSectionChange("revision")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Révision</h3>
              <p className="text-sm text-muted-foreground">Fiches de révision</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeSection === "revision") {
    return (

      <div className="mt-6 space-y-4">
        {!hiddenBackButton && <Button variant="outline" size="sm" onClick={() => handleSectionChange(null)}>← العودة</Button>}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /><span>Fiches de révision</span></CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-center py-8" dir="rtl">بطاقات المراجعة الخاصة بالدرس متوفرة في القسم الذكي أعلاه..</p></CardContent>
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
              onClick={() => {
                if (!isLocked) setActiveStep(step.id);
              }}
              disabled={isLocked}
              title=""
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
                  isActive
                    ? "bg-primary text-primary-foreground shadow-primary/20"
                    : isLocked
                      ? "bg-muted text-muted-foreground/70"
                      : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  {isLocked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
                </div>

                <div className="flex flex-col items-start gap-0.5">
                  <span className={cn(
                    "text-sm font-bold leading-none tracking-tight",
                    isActive ? "text-primary" : "text-foreground/80"
                  )}>
                    {step.label}
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium leading-none font-arabic",
                    isActive ? "text-primary/80" : "text-muted-foreground"
                  )}>
                    {step.labelAr}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={cn(
                "flex items-center justify-center transition-all bg-muted/50 rounded-md p-1.5",
                isActive && "bg-primary/10",
                isLocked && "opacity-0"
              )}>
                <Icon className={cn(
                  "w-4 h-4 transition-transform",
                  isActive ? step.color : "text-muted-foreground grayscale group-hover:grayscale-0"
                )} />
              </div>

              {/* Active Bottom Bar (Mobile) or Side/Glow (Desktop) */}
              {isActive && (
                <div className="absolute inset-x-0 -bottom-[1px] h-[3px] bg-primary rounded-full sm:hidden" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === "decouvrir" && (
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center justify-between text-blue-600 gap-2">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات تشخيصية" : "تمارين تمهيدية"}</span>
              </div>

              <div className="flex-1 flex justify-center gap-2">
                {/* Show Correct Answers Button */}
                {(completedExerciseIds.length > 0 || completedQuizIds.length > 0) && (
                  <Button
                    size="sm"
                    variant={showCorrectOnly ? "default" : "outline"}
                    onClick={(e) => { e.stopPropagation(); setShowCorrectOnly(!showCorrectOnly); }}
                    className={cn(
                      "gap-2 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105",
                      showCorrectOnly ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    )}
                    dir="rtl"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{showCorrectOnly ? "العودة للتمارين" : "إجابات صحيحة"}</span>
                  </Button>
                )}

                {showReloadBtn && !showCorrectOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReloadContent(); }}
                    className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                    title="تحميل أسئلة جديدة"
                    dir="rtl"
                  >
                    <Dices className="h-3.5 w-3.5" />
                    <span>مجموعة جديدة</span>
                  </Button>
                )}
              </div>

              <Badge variant="secondary" className={!showReloadBtn ? "ml-auto" : ""}>{
                showCorrectOnly
                  ? (isQuiz ? completedQuizIds.length : completedExerciseIds.length)
                  : (isQuiz ? discoverQuizzes.length : discoverExercises.length)
              } {isQuiz ? "أسئلة" : "تمارين"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showCorrectOnly ? (
              // Render ALL completed items
              <div className="space-y-3 animate-in fade-in zoom-in-50 duration-300">
                {isQuiz ? (
                  completedQuizIds.length > 0 ? (
                    dbQuizzes.filter(q => completedQuizIds.includes(q.id)).map((q, idx) => (
                      <CompletedQuizCard key={`completed-qz-${q.id}`} question={q} index={idx} />
                    ))
                  ) : <EmptyState text="لا توجد إجابات صحيحة بعد" />
                ) : (
                  completedExerciseIds.length > 0 ? (
                    dbExercises.filter(e => completedExerciseIds.includes(e.id)).map((ex, idx) => (
                      <CompletedExerciseCard key={`completed-ex-${ex.id}`} exercise={ex} index={idx} />
                    ))
                  ) : <EmptyState text="لا توجد تمارين صحيحة بعد" />
                )}
              </div>
            ) : (
              // Render Random Subset
              isQuiz ? (
                discoverQuizzes.length > 0 ? (
                  <div className="space-y-3" key={resetKey}>
                    {discoverQuizzes.map((q, idx) => (
                      <TrackedQuizCard key={`${q.id}-${resetKey}`} question={q} index={idx} readOnly={readOnly} onAnswer={(c) => handleDiscoverAnswer(c, "quiz", q.id)} />
                    ))}
                  </div>
                ) : <EmptyState text={completedQuizIds.length > 0 ? "أكملت جميع اسئله متعدده الاختيارات المتاحة!" : "لا توجد اسئله متعدده الاختيارات تشخيصية بعد"} />
              ) : (
                discoverExercises.length > 0 ? (
                  <div className="space-y-3" key={resetKey}>
                    {discoverExercises.map((ex, idx) => (
                      <TrackedExerciseCard key={`${ex.id}-${resetKey}`} exercise={ex} index={idx} readOnly={readOnly} onAnswer={(c) => handleDiscoverAnswer(c, "exercise", ex.id)} />
                    ))}
                  </div>
                ) : <EmptyState text={completedExerciseIds.length > 0 ? "أكملت جميع التمارين المتاحة!" : "لا توجد تمارين تمهيدية بعد"} />
              )
            )}
          </CardContent>
        </Card>
      )}

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
                  <Button
                    size="sm"
                    variant={showCorrectOnly ? "default" : "outline"}
                    onClick={(e) => { e.stopPropagation(); setShowCorrectOnly(!showCorrectOnly); }}
                    className={cn(
                      "gap-2 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105",
                      showCorrectOnly ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    )}
                    dir="rtl"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{showCorrectOnly ? "العودة للتمارين" : "إجابات صحيحة"}</span>
                  </Button>
                )}

                {!showCorrectOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReloadContent(); }}
                    className="gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/40 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                    title="تحميل أسئلة جديدة"
                    dir="rtl"
                  >
                    <Dices className="h-3.5 w-3.5" />
                    <span>مجموعة جديدة</span>
                  </Button>
                )}
              </div>

              <Badge variant="secondary" className={!showReloadBtn ? "ml-auto" : ""}>{
                showCorrectOnly
                  ? (isQuiz ? completedQuizIds.length : completedExerciseIds.length)
                  : (isQuiz ? subsetUnderstandQz.length : subsetUnderstandEx.length)
              } {isQuiz ? "أسئلة" : "تمارين"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showCorrectOnly ? (
              <div className="space-y-3 animate-in fade-in zoom-in-50 duration-300">
                {isQuiz ? (
                  completedQuizIds.length > 0 ? (
                    dbQuizzes.filter(q => completedQuizIds.includes(q.id)).map((q, idx) => (
                      <CompletedQuizCard key={`completed-qz-und-${q.id}`} question={q} index={idx} />
                    ))
                  ) : <EmptyState text="لا توجد إجابات صحيحة بعد" />
                ) : (
                  completedExerciseIds.length > 0 ? (
                    dbExercises.filter(e => completedExerciseIds.includes(e.id)).map((ex, idx) => (
                      <CompletedExerciseCard key={`completed-ex-und-${ex.id}`} exercise={ex} index={idx} />
                    ))
                  ) : <EmptyState text="لا توجد تمارين صحيحة بعد" />
                )}
              </div>
            ) : (
              isQuiz ? (
                subsetUnderstandQz.length > 0 ? (
                  <div className="space-y-3">
                    {subsetUnderstandQz.map((q, idx) => (
                      <TrackedQuizCard
                        key={`${q.id}-${resetKey}`}
                        question={q}
                        index={idx + halfQuiz}
                        readOnly={readOnly}
                        onAnswer={(c) => handleUnderstandAnswer(c, "quiz", q.id)}
                      />
                    ))}
                  </div>
                ) : <EmptyState text={completedQuizIds.length > 0 ? "أكملت جميع اسئله متعدده الاختيارات المتاحة!" : "لا توجد اسئله متعدده الاختيارات تطبيقية بعد"} />
              ) : (
                subsetUnderstandEx.length > 0 ? (
                  <div className="space-y-3">
                    {subsetUnderstandEx.map((ex, idx) => (
                      <TrackedExerciseCard
                        key={`${ex.id}-${resetKey}`}
                        exercise={ex}
                        index={idx + halfExercise}
                        readOnly={readOnly}
                        onAnswer={(c) => handleUnderstandAnswer(c, "exercise", ex.id)}
                      />
                    ))}
                  </div>
                ) : <EmptyState text={completedExerciseIds.length > 0 ? "أكملت جميع التمارين المتاحة!" : "لا توجد تمارين تطبيقية بعد"} />
              )
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "approfondir" && (
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-purple-600">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات ذكية" : "تمارين ذكية"} - إنشاء بالذكاء الاصطناعي</span>
              </div>
              {((isQuiz && adaptiveContent.quizzes.length > 0) || (!isQuiz && adaptiveContent.exercises.length > 0)) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (isQuiz) { setAiQuizAnswers({}); setAiQuizResults({}); }
                    else { setAiExerciseAnswers({}); setAiExerciseResults({}); }
                    adaptiveContent.resetSessionCounters();
                    adaptiveContent.generateContent(isQuiz ? "quiz" : "exercise");
                  }}
                  disabled={isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", (isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise) && "animate-spin")} />
                  تجديد
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise) ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : (isQuiz ? adaptiveContent.quizzes.length : adaptiveContent.exercises.length) === 0 ? (
              <div className="text-center py-8">
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Générer avec l'IA</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto" dir="rtl">
                  {isQuiz ? "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء اسئله متعدده الاختيارات متقدمة تناسب مستواك" : "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء تمارين متقدمة تناسب مستواك"}
                </p>
                <Button
                  size="lg"
                  onClick={() => adaptiveContent.generateContent(isQuiz ? "quiz" : "exercise")}
                  disabled={isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-purple-500/20"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  {(isQuiz ? adaptiveContent.loading.quiz : adaptiveContent.loading.exercise) ? "جاري الإنشاء..." : "Générer avec l'IA"}
                </Button>
              </div>
            ) : isQuiz ? (
              <div className="space-y-3">
                {adaptiveContent.quizzes.map((q, idx) => (
                  <Card key={idx} className={cn("transition-all", aiQuizResults[idx] === true && "border-green-500/50 bg-green-500/5", aiQuizResults[idx] === false && "border-red-500/50 bg-red-500/5")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3" dir="rtl">
                        <p className="font-medium flex-1">{idx + 1}. {q.question}</p>
                        <div className="flex items-center gap-0.5 shrink-0" title={`مستوى الصعوبة: ${q.difficulty || 3}/5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Pencil key={i} className={cn("h-4 w-4", i < (q.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <Button
                            key={oIdx}
                            variant={aiQuizAnswers[idx] === opt ? (aiQuizResults[idx] ? "default" : "destructive") : "outline"}
                            className={cn("justify-start text-right", opt === q.correct_answer && aiQuizResults[idx] !== undefined && "border-green-500 bg-green-500/10")}
                            onClick={() => {
                              if (aiQuizResults[idx] !== undefined) return;
                              setAiQuizAnswers(prev => ({ ...prev, [idx]: opt }));
                              const isCorrect = opt === q.correct_answer;
                              setAiQuizResults(prev => ({ ...prev, [idx]: isCorrect }));
                              adaptiveContent.recordAnswer(isCorrect, 0, "quiz");
                            }}
                            disabled={aiQuizResults[idx] !== undefined}
                            dir="rtl"
                          >
                            {aiQuizResults[idx] !== undefined && opt === q.correct_answer && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                            {aiQuizResults[idx] === false && aiQuizAnswers[idx] === opt && <XCircle className="h-4 w-4 mr-2" />}
                            {opt}
                          </Button>
                        ))}
                      </div>
                      {aiQuizResults[idx] !== undefined && q.explanation && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl">
                          <span className="font-medium">الشرح: </span>{q.explanation}
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
                        <h4 className="font-semibold flex-1">{idx + 1}. {ex.title}</h4>
                        <div className="flex items-center gap-0.5 shrink-0" title={`مستوى الصعوبة: ${ex.difficulty || 3}/5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Pencil key={i} className={cn("h-4 w-4", i < (ex.difficulty || 3) ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/20")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm" dir="rtl">{ex.statement}</p>
                      {ex.hints && ex.hints.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setAiShowHints(prev => ({ ...prev, [idx]: !prev[idx] }))} className="text-yellow-600">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          {aiShowHints[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          تلميحات
                        </Button>
                      )}
                      {aiShowHints[idx] && ex.hints?.map((hint, hIdx) => (
                        <p key={hIdx} className="text-xs text-muted-foreground bg-yellow-500/5 p-2 rounded" dir="rtl">💡 {hint}</p>
                      ))}
                      {aiExerciseResults[idx] === undefined && (
                        <div className="flex gap-2" dir="rtl">
                          <input className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background" placeholder="أدخل إجابتك..." value={aiExerciseAnswers[idx] || ""} onChange={(e) => setAiExerciseAnswers(prev => ({ ...prev, [idx]: e.target.value }))} dir="rtl" />
                          <Button size="sm" onClick={() => {
                            const userAnswer = aiExerciseAnswers[idx]?.trim();
                            if (!userAnswer) return;
                            const isCorrect = userAnswer === ex.expected_answer;
                            setAiExerciseResults(prev => ({ ...prev, [idx]: isCorrect }));
                            adaptiveContent.recordAnswer(isCorrect, 0, "exercise");
                          }}>تحقق</Button>
                        </div>
                      )}
                      {aiExerciseResults[idx] !== undefined && (
                        <div className={cn("p-2 rounded text-sm", aiExerciseResults[idx] ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
                          {aiExerciseResults[idx] ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${ex.expected_answer}`}
                        </div>
                      )}
                      {ex.solution && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">عرض الحل</summary>
                          <div className="p-3 bg-muted/50 rounded-lg mt-2" dir="rtl">{ex.solution}</div>
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

    </div >
  );
}

// --- Sub-components ---

const DifficultyIndicator = ({ level }: { level?: number }) => {
  if (!level) return null;
  return (
    <div className="flex gap-0.5 items-center mr-2 bg-yellow-50/50 px-1.5 py-0.5 rounded-full border border-yellow-100/50" title={`الصعوبة: ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Pencil
          key={i}
          className={cn(
            "w-3 h-3 transition-colors",
            i < level ? "text-yellow-500 fill-yellow-500" : "text-gray-200"
          )}
        />
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
          <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2" dir="rtl">
            <div><span className="font-medium">الإجابة الصحيحة: </span>{correctAnswer || "—"}</div>
            {explanation && <div><span className="font-medium">الشرح: </span>{explanation}</div>}
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
        <p className="text-sm text-right" dir="rtl">{exercise.statement}</p>
        <div className="flex items-center gap-2 justify-end">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">إجابة صحيحة</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading}>
          {loading ? "جاري التحميل..." : showSolution ? "إخفاء الحل" : "عرض الحل"}
        </Button>
        {showSolution && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2" dir="rtl">
            <div><span className="font-medium">الإجابة: </span>{expectedAnswer || "—"}</div>
            {solution && <div><span className="font-medium">الحل: </span>{solution}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedQuizCard({ question, index, readOnly, onAnswer }: { question: DBQuizQuestion; index: number; readOnly?: boolean; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (opt: string) => {
    if (readOnly || answered || submitting) return;
    setSelected(opt);
    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('check_quiz_answer', {
        _quiz_id: question.id,
        _user_answer: opt,
      });

      if (error) throw error;

      const result = data as { is_correct: boolean; explanation: string; correct_answer: string | null };
      setIsCorrect(result.is_correct);
      setCorrectAnswer(result.correct_answer);
      setExplanation(result.explanation || "");
      setAnswered(true);
      onAnswer(result.is_correct);
    } catch (err) {
      console.error("Error validating quiz:", err);
      // Fallback to local if correct_answer available (admin/pedago)
      if (question.correct_answer) {
        const correct = opt === question.correct_answer;
        setIsCorrect(correct);
        setCorrectAnswer(correct ? null : question.correct_answer);
        setExplanation(question.explanation || "");
        setAnswered(true);
        onAnswer(correct);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={cn("transition-all", answered && isCorrect && "border-green-500/50 bg-green-500/5", answered && !isCorrect && "border-red-500/50 bg-red-500/5")}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <p className="font-medium flex-1" dir="rtl">{index + 1}. {question.question}</p>
          <DifficultyIndicator level={question.difficulty} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options.map((opt, oIdx) => (
            <Button key={oIdx} variant={selected === opt ? (isCorrect ? "default" : "destructive") : "outline"}
              className={cn("justify-start text-right", correctAnswer && opt === correctAnswer && answered && "border-green-500 bg-green-500/10")}
              onClick={() => handleSelect(opt)} disabled={readOnly || answered || submitting} dir="rtl">{opt}</Button>
          ))}
        </div>
        {answered && explanation && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl"><span className="font-medium">الشرح: </span>{explanation}</div>
        )}
        {answered && !isCorrect && correctAnswer && (
          <div className="mt-2 p-2 rounded text-sm bg-green-500/10 text-green-700" dir="rtl">✅ الإجابة الصحيحة: {correctAnswer}</div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedExerciseCard({ exercise, index, readOnly, onAnswer }: { exercise: DBExercise; index: number; readOnly?: boolean; onAnswer: (correct: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [expectedAnswer, setExpectedAnswer] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('check_exercise_answer', {
        _exercise_id: exercise.id,
        _user_answer: answer.trim(),
      });

      if (error) throw error;

      const res = data as { is_correct: boolean; expected_answer: string; solution: string };
      setResult(res.is_correct);
      setExpectedAnswer(res.expected_answer);
      setSolution(res.solution);
      onAnswer(res.is_correct);
    } catch (err) {
      console.error("Error validating exercise:", err);
      // Fallback to local if data available (admin/pedago)
      if (exercise.expected_answer) {
        const isCorrect = answer.trim() === exercise.expected_answer || (exercise.accepted_answers || []).includes(answer.trim());
        setResult(isCorrect);
        setExpectedAnswer(exercise.expected_answer);
        setSolution(exercise.solution || "");
        onAnswer(isCorrect);
      }
    } finally {
      setSubmitting(false);
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
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">{index + 1}. {exercise.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-right" dir="rtl">{exercise.statement}</p>

            {!readOnly && result === null && (
              <div className="flex gap-2" dir="rtl">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                  placeholder="أدخل إجابتك..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  dir="rtl"
                />
                <Button size="sm" onClick={handleSubmit} disabled={submitting}>{submitting ? "..." : "تحقق"}</Button>
              </div>
            )}

            {result !== null && (
              <div className={cn("p-2 rounded text-sm", result ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
                {result ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${expectedAnswer}`}
              </div>
            )}

            {(solution || exercise.solution) && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "إخفاء الحل" : "عرض الحل"}</Button>
                {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">الحل: </span>{solution || exercise.solution}</div>}
              </>
            )}

            {!solution && !exercise.solution && result !== null && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "إخفاء الحل" : "عرض الحل"}</Button>
                {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">الحل: </span>{expectedAnswer}</div>}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function QuizQuestionCard({ question, index, readOnly }: { question: DBQuizQuestion; index: number; readOnly?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (opt: string) => {
    if (readOnly || answered || submitting) return;
    setSelected(opt);
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('check_quiz_answer', { _quiz_id: question.id, _user_answer: opt });
      if (error) throw error;
      const result = data as { is_correct: boolean; explanation: string; correct_answer: string | null };
      setIsCorrect(result.is_correct);
      setCorrectAnswer(result.correct_answer);
      setExplanation(result.explanation || "");
      setAnswered(true);
    } catch {
      if (question.correct_answer) {
        setIsCorrect(opt === question.correct_answer);
        setCorrectAnswer(opt === question.correct_answer ? null : question.correct_answer);
        setExplanation(question.explanation || "");
        setAnswered(true);
      }
    } finally { setSubmitting(false); }
  };

  return (
    <Card className={cn("transition-all", answered && isCorrect && "border-green-500/50 bg-green-500/5", answered && !isCorrect && "border-red-500/50 bg-red-500/5")}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <p className="font-medium flex-1" dir="rtl">{index + 1}. {question.question}</p>
          <DifficultyIndicator level={question.difficulty} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options.map((opt, oIdx) => (
            <Button key={oIdx} variant={selected === opt ? (isCorrect ? "default" : "destructive") : "outline"}
              className={cn("justify-start text-right", correctAnswer && opt === correctAnswer && answered && "border-green-500 bg-green-500/10")}
              onClick={() => handleSelect(opt)} disabled={readOnly || answered || submitting} dir="rtl">{opt}</Button>
          ))}
        </div>
        {answered && explanation && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl"><span className="font-medium">الشرح: </span>{explanation}</div>
        )}
        {answered && !isCorrect && correctAnswer && (
          <div className="mt-2 p-2 rounded text-sm bg-green-500/10 text-green-700" dir="rtl">✅ الإجابة الصحيحة: {correctAnswer}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ExerciseCard({ exercise, index, readOnly }: { exercise: DBExercise; index: number; readOnly?: boolean }) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [expectedAnswer, setExpectedAnswer] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('check_exercise_answer', { _exercise_id: exercise.id, _user_answer: answer.trim() });
      if (error) throw error;
      const res = data as { is_correct: boolean; expected_answer: string; solution: string };
      setResult(res.is_correct);
      setExpectedAnswer(res.expected_answer);
      setSolution(res.solution);
    } catch {
      if (exercise.expected_answer) {
        const isCorrect = answer.trim() === exercise.expected_answer || (exercise.accepted_answers || []).includes(answer.trim());
        setResult(isCorrect);
        setExpectedAnswer(exercise.expected_answer);
        setSolution(exercise.solution || "");
      }
    } finally { setSubmitting(false); }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold flex-1" dir="rtl">{index + 1}. {exercise.title}</h4>
          <DifficultyIndicator level={exercise.difficulty} />
        </div>
        <p className="text-sm" dir="rtl">{exercise.statement}</p>
        {!readOnly && result === null && (
          <div className="flex gap-2" dir="rtl">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background" placeholder="أدخل إجابتك..." value={answer} onChange={(e) => setAnswer(e.target.value)} dir="rtl" />
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>{submitting ? "..." : "تحقق"}</Button>
          </div>
        )}
        {result !== null && (
          <div className={cn("p-2 rounded text-sm", result ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
            {result ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${expectedAnswer}`}
          </div>
        )}
        {(solution || result !== null) && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "إخفاء الحل" : "عرض الحل"}</Button>
            {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">الحل: </span>{solution || expectedAnswer}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-8"><p className="text-muted-foreground" dir="rtl">{text}</p></div>;
}
