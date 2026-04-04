import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, BookOpen, Sparkles, Eye, Lightbulb, Rocket, ChevronRight, Lock, CheckCircle2, RefreshCw, Pencil, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

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
  onGenerateAI: (type: "quiz" | "exercise") => void;
  onSectionChange?: (section: string | null) => void;
  hiddenBackButton?: boolean;
  readOnly?: boolean;
}

type ActivitySection = "exercises" | "quiz" | "revision" | null;
type StepLevel = "decouvrir" | "comprendre" | "approfondir";

const REQUIRED_CORRECT = 3;

const stepConfig: { id: StepLevel; label: string; labelAr: string; icon: typeof Eye; color: string }[] = [
  { id: "decouvrir", label: "Découvrir", labelAr: "اكتشف", icon: Eye, color: "text-blue-500" },
  { id: "comprendre", label: "Comprendre", labelAr: "افهم", icon: Lightbulb, color: "text-yellow-500" },
  { id: "approfondir", label: "Approfondir", labelAr: "تعمّق", icon: Rocket, color: "text-purple-500" },
];

export function LessonActivityTabs({ dbQuizzes, dbExercises, chapterId, chapterTitle, lessonId, lessonTitle, onGenerateAI, onSectionChange, hiddenBackButton, readOnly }: LessonActivityTabsProps) {
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
      console.log("ðŸ‘¤ [LessonActivityTabs] Loading current user...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("âœ… [LessonActivityTabs] User ID loaded:", user.id);
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
            console.log("âœ… [LessonActivityTabs] Active subscription found");
          }
        }
      } else {
        console.warn("âš ï¸ [LessonActivityTabs] No authenticated user found!");
      }
      setIsLoadingUser(false);
    };
    loadUser();
  }, []);

  // Load persisted unlock state on mount and when userId changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) {
        console.warn("âš ï¸ [loadProgress] userId not available yet, skipping load");
        return;
      }

      console.log("ðŸ”„ [LessonActivityTabs] Loading progress for chapter:", chapterId, "with userId:", userId);

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
        console.error("âŒ [LessonActivityTabs] Failed to load chapter unlock state:", error);
        return;
      }

      const rows = data || [];
      console.log("ðŸ“Š [LessonActivityTabs] Loaded", rows.length, "progress rows for chapter", chapterId);

      if (rows.length > 0) {
        console.log("ðŸ“‹ [LessonActivityTabs] Progress data:", JSON.stringify(rows, null, 2));
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
      console.log("âœ… [LessonActivityTabs] Loaded completed items:", uniqueEx.length, "exercises,", uniqueQz.length, "quizzes");

      if (hasExercisesUnlocked) {
        console.log("ðŸ”“ [LessonActivityTabs] Setting exercises unlocked: true");
        setPersistedUnlockEx(true);
        // If unlocked, show at least the required correct count
        if (exercisesCorrectCount < REQUIRED_CORRECT) {
          setDiscoverCorrectEx(REQUIRED_CORRECT);
          console.log("ðŸ“Š [LessonActivityTabs] Set exercises correct to", REQUIRED_CORRECT);
        } else {
          setDiscoverCorrectEx(exercisesCorrectCount);
          console.log("ðŸ“Š [LessonActivityTabs] Set exercises correct to", exercisesCorrectCount);
        }
      } else if (exercisesCorrectCount > 0) {
        setDiscoverCorrectEx(exercisesCorrectCount);
        console.log("ðŸ“Š [LessonActivityTabs] Set exercises correct to", exercisesCorrectCount);
      }

      if (hasQuizzesUnlocked) {
        console.log("ðŸ”“ [LessonActivityTabs] Setting quizzes unlocked: true");
        setPersistedUnlockQz(true);
        // If unlocked, show at least the required correct count
        if (quizzesCorrectCount < REQUIRED_CORRECT) {
          setDiscoverCorrectQz(REQUIRED_CORRECT);
          console.log("ðŸ“Š [LessonActivityTabs] Set quizzes correct to", REQUIRED_CORRECT);
        } else {
          setDiscoverCorrectQz(quizzesCorrectCount);
          console.log("ðŸ“Š [LessonActivityTabs] Set quizzes correct to", quizzesCorrectCount);
        }
      } else if (quizzesCorrectCount > 0) {
        setDiscoverCorrectQz(quizzesCorrectCount);
        console.log("ðŸ“Š [LessonActivityTabs] Set quizzes correct to", quizzesCorrectCount);
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
    console.log(`ðŸ“¤ [persistUnlock] Starting to save ${type} unlock, count:`, correctCount);

    // Get current user directly (don't rely on state!)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      console.error("âŒ [persistUnlock] No authenticated user found!");
      return;
    }


    const currentUserId = user.id;
    console.log(`ðŸ“¤ [persistUnlock] User ID: ${currentUserId}, Chapter ID: ${chapterId}, Type: ${type}, Count: ${correctCount}`);

    const field = type === "exercises" ? "exercises_unlocked" : "quizzes_unlocked";
    const countField = type === "exercises" ? "exercises_correct_count" : "quizzes_correct_count";

    // Query ALL rows for this user+chapter to debug what's going on
    const { data: allRows, error: scanError } = await supabase
      .from("student_scores")
      .select("id, lesson_id, assessment_data")
      .eq("user_id", currentUserId)
      .eq("chapter_id", chapterId);

    if (scanError) {
      console.warn("âš ï¸  [persistUnlock] Scan error:", scanError.message);
    } else {
      console.log(`ðŸ“‹ [persistUnlock] Found ${allRows?.length ?? 0} total rows for chapter (including lessons)`);
    }

    // Find the row scoped to the current lesson when available.
    // Fallback to chapter aggregate when lessonId is not provided.
    const targetRow = allRows?.find(r => lessonId ? r.lesson_id === lessonId : r.lesson_id === null);

    if (targetRow) {
      console.log("âœ… [persistUnlock] Found existing chapter row via JS filter. ID:", targetRow.id);

      const existingData = (targetRow.assessment_data || {}) as Record<string, unknown>;
      const mergedData = {
        ...existingData,
        [field]: true,
        ...(correctCount !== undefined && { [countField]: correctCount })
      };

      console.log("ðŸ“ [persistUnlock] Updating existing row...");
      const { error: updateError } = await supabase
        .from("student_scores")
        .update({ assessment_data: mergedData as any })
        .eq("id", targetRow.id);

      if (updateError) {
        console.error("âŒ [persistUnlock] Update failed:", updateError.message);
      } else {
        console.log("âœ… [persistUnlock] Update success!");
      }
      return;
    }

    // No existing row found in JS scan, try INSERT
    console.log("ðŸ“ [persistUnlock] No chapter row found. Attempting INSERT...");

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
      console.error("âŒ [persistUnlock] INSERT failed:", insertError.message, insertError.code, insertError.details);

      // If code is 23505 (unique_violation), it means a row DOES exist but our SELECT missed it (RLS?)
      // OR it conflicts with another row (improper index?)
      if (insertError.code === '23505') {
        console.error("ðŸ’€ [persistUnlock] Critical: Row exists (duplicate key) but was not found in SELECT. This is likely an RLS visibility issue or Index scope issue.");
      }
    } else {
      console.log("âœ… [persistUnlock] Successfully inserted new row");
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
          console.error("âŒ Failed to update completion:", updateError);
        } else {
          console.log("âœ… Saved completion:", itemId);
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
        console.error("âŒ Failed to save new completion row:", insertError);
      } else {
        console.log("âœ… Created new row for completion:", itemId);
      }
    }
  }, [chapterId, lessonId]);


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
    console.log("ðŸ”„ [reloadProgressFromDB] Forcing reload of persisted unlock state");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("âš ï¸ [reloadProgressFromDB] No user found");
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
      console.error("âŒ [reloadProgressFromDB] Failed to load:", error);
      return;
    }

    const rows = data || [];
    console.log("âœ… [reloadProgressFromDB] Refresh: Loaded", rows.length, "rows");

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
      console.log("ðŸ”“ [reloadProgressFromDB] exercises_unlocked: true");
      setPersistedUnlockEx(true);
      if (exercisesCorrectCount < REQUIRED_CORRECT) {
        setDiscoverCorrectEx(REQUIRED_CORRECT);
      } else {
        setDiscoverCorrectEx(exercisesCorrectCount);
      }
    }
    if (hasQuizzesUnlocked) {
      console.log("ðŸ”“ [reloadProgressFromDB] quizzes_unlocked: true");
      setPersistedUnlockQz(true);
      if (quizzesCorrectCount < REQUIRED_CORRECT) {
        setDiscoverCorrectQz(REQUIRED_CORRECT);
      } else {
        setDiscoverCorrectQz(quizzesCorrectCount);
      }
    }
  }, [chapterId, lessonId]);

  const handleSectionChange = (section: ActivitySection) => {
    console.log("ðŸ–±ï¸ [handleSectionChange] Changed to section:", section);
    setActiveSection(section);
    setActiveStep("decouvrir");

    // Reload progress from DB whenever user changes section
    if (section !== null) {
      console.log("ðŸ“¥ [handleSectionChange] Reloading progress from DB...");
      reloadProgressFromDB();
    }

    onSectionChange?.(section);
  };

  const handleUnderstandAnswer = useCallback((isCorrect: boolean, type: "exercise" | "quiz", itemId: string) => {
    if (isCorrect) {
      if (type === "exercise") {
        setCompletedExerciseIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("exercises", itemId);
          return [...prev, itemId];
        });
      } else {
        setCompletedQuizIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("quizzes", itemId);
          return [...prev, itemId];
        });
      }
    }
  }, [persistItemCompletion]);

  const handleDiscoverAnswer = useCallback((isCorrect: boolean, type: "exercise" | "quiz", itemId?: string) => {
    console.log(`ðŸ“ [handleDiscoverAnswer] ${type}: isCorrect=${isCorrect}, id=${itemId}`);

    if (itemId && isCorrect) {
      if (type === "exercise") {
        setCompletedExerciseIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("exercises", itemId);
          return [...prev, itemId];
        });
      } else {
        setCompletedQuizIds(prev => {
          if (prev.includes(itemId)) return prev;
          persistItemCompletion("quizzes", itemId);
          return [...prev, itemId];
        });
      }
    }

    if (type === "exercise") {
      setDiscoverTotalEx(prev => prev + 1);
      if (isCorrect) {
        setDiscoverCorrectEx(prev => {
          const next = prev + 1;
          console.log(`âœ… [handleDiscoverAnswer] exercises: ${prev} â†’ ${next} correct (need ${REQUIRED_CORRECT})`);

          if (next >= REQUIRED_CORRECT && !persistedUnlockEx) {
            console.log("ðŸŽ‰ [handleDiscoverAnswer] exercises: UNLOCKING!");
            // This is a NEW unlock -> Show animation
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
          console.log(`âœ… [handleDiscoverAnswer] quizzes: ${prev} â†’ ${next} correct (need ${REQUIRED_CORRECT})`);

          if (next >= REQUIRED_CORRECT && !persistedUnlockQz) {
            console.log("ðŸŽ‰ [handleDiscoverAnswer] quizzes: UNLOCKING!");
            // This is a NEW unlock -> Show animation
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
  }, [persistUnlock, persistedUnlockEx, persistedUnlockQz]);

  const handleReloadDiscover = () => {
    if (activeSection === "exercises") {
      setDiscoverCorrectEx(0);
      setDiscoverTotalEx(0);
    } else {
      setDiscoverCorrectQz(0);
      setDiscoverTotalQz(0);
    }
    setResetKey(prev => prev + 1);
  };

  // Render based on Random Subsets (limits to 5)
  const discoverQuizzes = subsetDiscoverQz;
  const understandQuizzes = subsetUnderstandQz;
  const discoverExercises = subsetDiscoverEx;
  const understandExercises = subsetUnderstandEx;
  const halfQuiz = Math.ceil(dbQuizzes.length / 2);
  const halfExercise = Math.ceil(dbExercises.length / 2);

  const visibleSteps = readOnly ? stepConfig.filter(s => s.id !== "approfondir") : stepConfig;

  const discoverItemCount = activeSection === "exercises" ? discoverExercises.length : discoverQuizzes.length;
  const currentTotal = activeSection === "exercises" ? discoverTotalEx : discoverTotalQz;
  const allAnswered = currentTotal >= discoverItemCount && discoverItemCount > 0;
  const failedDiscover = allAnswered && !isUnlocked;

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
        {!hiddenBackButton && <Button variant="outline" size="sm" onClick={() => handleSectionChange(null)}>â† Ø§Ù„Ø¹ÙˆØ¯Ø©</Button>}
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
        {!hiddenBackButton && <Button variant="outline" size="sm" onClick={() => handleSectionChange(null)}>â† Ø§Ù„Ø¹ÙˆØ¯Ø©</Button>}
        <div className="flex items-center gap-2">
          <SectionIcon className={cn("h-5 w-5", isQuiz ? "text-primary" : "text-orange-500")} />
          <h2 className="text-lg font-bold" dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات" : "تمارين"}</h2>
        </div>
      </div>

      {/* Progression Bar - Disappears after success and timeout */}
      {(!isUnlocked || showUnlockMessage) && (
        <Card className="border-blue-500/20 bg-blue-500/5 transition-all duration-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" dir="rtl">ØªÙ‚Ø¯Ù…Ùƒ ÙÙŠ Ù…Ø±Ø­Ù„Ø© "اكتشف"</span>
              <Badge variant={isUnlocked ? "default" : "secondary"} className={isUnlocked ? "bg-green-500" : ""}>
                {currentCorrect} / {REQUIRED_CORRECT} إجابات صحيحة
              </Badge>
            </div>
            <Progress value={(currentCorrect / REQUIRED_CORRECT) * 100} className="h-2" />
            {showUnlockMessage && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1" dir="rtl">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ØªÙ… ÙØªØ­ Ø§Ù„Ù…Ø±Ø§Ø­Ù„ Ø§Ù„ØªØ§Ù„ÙŠØ©! ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¢Ù† Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ "افهم" Ùˆ "تعمّق"
              </p>
            )}
            {failedDiscover && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-red-500" dir="rtl">Ù„Ù… تحقق {REQUIRED_CORRECT} إجابات صحيحة. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰!</p>
                <Button size="sm" variant="outline" onClick={handleReloadDiscover} className="gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step Stepper */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-1.5 bg-muted/40 rounded-xl border border-border/40 backdrop-blur-sm">
        {visibleSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          let isLocked = false;
          if (step.id === "comprendre") {
            isLocked = !isUnlocked;
          } else if (step.id === "approfondir") {
            // Requires 3 correct answers AND Active Subscription
            isLocked = !isUnlocked || (!hasActiveSubscription && !readOnly); // Keep readOnly logic if relevant, but here we enforce subscription
          }

          return (
            <button
              key={step.id}
              onClick={() => {
                if (!isLocked) setActiveStep(step.id);
              }}
              disabled={isLocked}
              title={isLocked ? (step.id === "approfondir" && isUnlocked && !hasActiveSubscription ? "Abonnement requis pour accÃ©der Ã  cette section" : "Terminez la phase précédente pour dÃ©bloquer") : ""}
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
                    <span>{showCorrectOnly ? "Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„تمارين" : "إجابات صحيحة"}</span>
                  </Button>
                )}

                {showReloadBtn && !showCorrectOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReloadContent(); }}
                    className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                    title="ØªØ­Ù…ÙŠÙ„ أسئلة Ø¬Ø¯ÙŠØ¯Ø©"
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
                  ) : <EmptyState text="Ù„Ø§ ØªÙˆØ¬Ø¯ إجابات صحيحة Ø¨Ø¹Ø¯" />
                ) : (
                  completedExerciseIds.length > 0 ? (
                    dbExercises.filter(e => completedExerciseIds.includes(e.id)).map((ex, idx) => (
                      <TrackedExerciseCard key={`completed-ex-${ex.id}`} exercise={ex} index={idx} readOnly={true} onAnswer={() => { }} />
                    ))
                  ) : <EmptyState text="Ù„Ø§ ØªÙˆØ¬Ø¯ تمارين ØµØ­ÙŠØ­Ø© Ø¨Ø¹Ø¯" />
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
                ) : <EmptyState text={completedExerciseIds.length > 0 ? "Ø£ÙƒÙ…Ù„Øª Ø¬Ù…ÙŠØ¹ Ø§Ù„تمارين Ø§Ù„Ù…ØªØ§Ø­Ø©!" : "Ù„Ø§ ØªÙˆØ¬Ø¯ تمارين ØªÙ…Ù‡ÙŠØ¯ÙŠØ© Ø¨Ø¹Ø¯"} />
              )
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "comprendre" && isUnlocked && (
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
                    <span>{showCorrectOnly ? "Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„تمارين" : "إجابات صحيحة"}</span>
                  </Button>
                )}

                {!showCorrectOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReloadContent(); }}
                    className="gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/40 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                    title="ØªØ­Ù…ÙŠÙ„ أسئلة Ø¬Ø¯ÙŠØ¯Ø©"
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
                  ) : <EmptyState text="Ù„Ø§ ØªÙˆØ¬Ø¯ إجابات صحيحة Ø¨Ø¹Ø¯" />
                ) : (
                  completedExerciseIds.length > 0 ? (
                    dbExercises.filter(e => completedExerciseIds.includes(e.id)).map((ex, idx) => (
                      <TrackedExerciseCard key={`completed-ex-und-${ex.id}`} exercise={ex} index={idx} readOnly={true} onAnswer={() => { }} />
                    ))
                  ) : <EmptyState text="Ù„Ø§ ØªÙˆØ¬Ø¯ تمارين ØµØ­ÙŠØ­Ø© Ø¨Ø¹Ø¯" />
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
                ) : <EmptyState text={completedExerciseIds.length > 0 ? "Ø£ÙƒÙ…Ù„Øª Ø¬Ù…ÙŠØ¹ Ø§Ù„تمارين Ø§Ù„Ù…ØªØ§Ø­Ø©!" : "Ù„Ø§ ØªÙˆØ¬Ø¯ تمارين ØªØ·Ø¨ÙŠÙ‚ÙŠØ© Ø¨Ø¹Ø¯"} />
              )
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "approfondir" && isUnlocked && (
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-purple-600">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span dir="rtl">{isQuiz ? "اسئله متعدده الاختيارات ذكية" : "تمارين ذكية"} - إنشاء بالذكاء الاصطناعي</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Générer avec l'IA</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto" dir="rtl">
                {isQuiz ? "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء اسئله متعدده الاختيارات متقدمة تناسب مستواك" : "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء تمارين متقدمة تناسب مستواك"}
              </p>
              <Button size="lg" onClick={() => onGenerateAI(isQuiz ? "quiz" : "exercise")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-purple-500/20">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                Générer avec l'IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {
        (activeStep === "comprendre" || activeStep === "approfondir") && !isUnlocked && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-8 text-center space-y-3">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-bold text-lg" dir="rtl">Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ù…Ù‚ÙÙ„Ø©</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto" dir="rtl">
                ÙŠØ¬Ø¨ Ø¹Ù„ÙŠÙƒ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¹Ù„Ù‰ {REQUIRED_CORRECT} أسئلة ØµØ­ÙŠØ­Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ ÙÙŠ Ù…Ø±Ø­Ù„Ø© "اكتشف" Ù„ÙØªØ­ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø±Ø­Ù„Ø©.
              </p>
              <Button variant="outline" onClick={() => setActiveStep("decouvrir")} className="gap-2">
                <Eye className="h-4 w-4" />
                Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ "اكتشف"
              </Button>
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}

// --- Sub-components ---

const DifficultyIndicator = ({ level }: { level?: number }) => {
  if (!level) return null;
  return (
    <div className="flex gap-0.5 items-center mr-2 bg-yellow-50/50 px-1.5 py-0.5 rounded-full border border-yellow-100/50" title={`Ø§Ù„ØµØ¹ÙˆØ¨Ø©: ${level}/5`}>
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
  return (
    <Card className="border-green-500/50 bg-green-500/5 transition-all hover:bg-green-500/10">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 order-2 sm:order-1 w-full text-right">
          <p className="font-medium text-lg leading-relaxed" dir="rtl">
            <span className="font-bold text-muted-foreground ml-2">{index + 1}.</span>
            {question.question}
          </p>
        </div>
        <div className="order-1 sm:order-2 shrink-0 flex flex-row sm:flex-col items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800 shadow-sm w-full sm:w-auto justify-between sm:justify-center">
          <span className="text-xs font-semibold uppercase text-green-600/70 dark:text-green-400/70">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©</span>
          <span className="font-bold text-lg" dir="rtl">{question.correct_answer}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackedQuizCard({ question, index, readOnly, onAnswer }: { question: DBQuizQuestion; index: number; readOnly?: boolean; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === question.correct_answer;
  const answered = selected !== null;

  const handleSelect = (opt: string) => {
    if (readOnly || answered) return;
    setSelected(opt);
    onAnswer(opt === question.correct_answer);
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
              className={cn("justify-start text-right", opt === question.correct_answer && answered && "border-green-500 bg-green-500/10")}
              onClick={() => handleSelect(opt)} disabled={readOnly || answered} dir="rtl">{opt}</Button>
          ))}
        </div>
        {answered && question.explanation && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl"><span className="font-medium">Ø§Ù„Ø´Ø±Ø­: </span>{question.explanation}</div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedExerciseCard({ exercise, index, readOnly, onAnswer }: { exercise: DBExercise; index: number; readOnly?: boolean; onAnswer: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const isCorrect = answer.trim() === exercise.expected_answer || exercise.accepted_answers.includes(answer.trim());
    setResult(isCorrect);
    onAnswer(isCorrect);
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
            <Button size="sm" onClick={handleSubmit}>تحقق</Button>
          </div>
        )}
        {result !== null && (
          <div className={cn("p-2 rounded text-sm", result ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
            {result ? "âœ… Ø¥Ø¬Ø§Ø¨Ø© ØµØ­ÙŠØ­Ø©!" : `âŒ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©: ${exercise.expected_answer}`}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø­Ù„" : "عرض الحل"}</Button>
        {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">Ø§Ù„Ø­Ù„: </span>{exercise.solution}</div>}
      </CardContent>
    </Card>
  );
}

function QuizQuestionCard({ question, index, readOnly }: { question: DBQuizQuestion; index: number; readOnly?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === question.correct_answer;
  const answered = selected !== null;

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
              className={cn("justify-start text-right", opt === question.correct_answer && answered && "border-green-500 bg-green-500/10")}
              onClick={() => !readOnly && !answered && setSelected(opt)} disabled={readOnly || answered} dir="rtl">{opt}</Button>
          ))}
        </div>
        {answered && question.explanation && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl"><span className="font-medium">Ø§Ù„Ø´Ø±Ø­: </span>{question.explanation}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ExerciseCard({ exercise, index, readOnly }: { exercise: DBExercise; index: number; readOnly?: boolean }) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const isCorrect = answer.trim() === exercise.expected_answer || exercise.accepted_answers.includes(answer.trim());
    setResult(isCorrect);
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
            <Button size="sm" onClick={handleSubmit}>تحقق</Button>
          </div>
        )}
        {result !== null && (
          <div className={cn("p-2 rounded text-sm", result ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
            {result ? "âœ… Ø¥Ø¬Ø§Ø¨Ø© ØµØ­ÙŠØ­Ø©!" : `âŒ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©: ${exercise.expected_answer}`}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø­Ù„" : "عرض الحل"}</Button>
        {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">Ø§Ù„Ø­Ù„: </span>{exercise.solution}</div>}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-8"><p className="text-muted-foreground" dir="rtl">{text}</p></div>;
}
