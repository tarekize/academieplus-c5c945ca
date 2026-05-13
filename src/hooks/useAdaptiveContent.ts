import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizItem {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty?: number;
}

interface ExerciseItem {
  title: string;
  statement: string;
  expected_answer: string;
  hints: string[];
  solution: string;
  difficulty?: number;
}

interface RevisionItem {
  concept: string;
  explanation: string;
  example: string;
  key_formula?: string;
}

interface StudentScore {
  current_level: number;
  reading_time_seconds: number;
  quiz_time_seconds: number;
  exercise_time_seconds: number;
  total_answers: number;
  correct_answers: number;
  accuracy_rate: number;
  streak: number;
}

interface LearningStyleScores {
  visual_score: number;
  textual_score: number;
  practical_score: number;
}

export function useAdaptiveContent(lessonId: string, chapterId: string, userId: string, schoolLevel: string, lessonTitle: string, chapterTitle: string) {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<StudentScore>({
    current_level: 50,
    reading_time_seconds: 0,
    quiz_time_seconds: 0,
    exercise_time_seconds: 0,
    total_answers: 0,
    correct_answers: 0,
    accuracy_rate: 0,
    streak: 0,
  });

  // Session-local x/y counter (resets when lesson changes or content regenerated)
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  // Message shown after the level is recalculated. Content is not regenerated here.
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const sessionCountersRef = useRef({ correct: 0, total: 0 });

  // Track session start composite level + concepts (for AI comment)
  const sessionStartLevelRef = useRef<number | null>(null);
  const sessionStartScoreRef = useRef<StudentScore | null>(null);
  const weakConceptsRef = useRef<string[]>([]);
  const strongConceptsRef = useRef<string[]>([]);
  const mistakesRef = useRef<Array<{ question: string; user_answer: string; correct_answer: string; type: "quiz" | "exercise" }>>([]);
  // AI comment is generated at most once per page-load session per lesson
  const commentGeneratedRef = useRef<boolean>(false);

  // Reset session counters when lesson changes
  useEffect(() => {
    setSessionCorrect(0);
    setSessionTotal(0);
    setLevelUpMessage(null);
    sessionCountersRef.current = { correct: 0, total: 0 };
    sessionStartLevelRef.current = null;
    sessionStartScoreRef.current = null;
    weakConceptsRef.current = [];
    strongConceptsRef.current = [];
    mistakesRef.current = [];
    commentGeneratedRef.current = false;
  }, [lessonId]);

  const buildFallbackComment = useCallback((levelBefore: number, levelAfter: number, correct: number, total: number) => {
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const lessonRef = lessonTitle ? `في درس "${lessonTitle}"` : 'في هذا الدرس';
    if (levelAfter < levelBefore) {
      return `📉 يبدو أنّك واجهت بعض الصعوبات ${lessonRef}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${accuracy}%)، وانخفض مستواك من ${levelBefore} إلى ${levelAfter} من 100.\n\nلا تقلق، هذا جزء طبيعي من التعلم. أعِد قراءة الدرس بتركيز وتوقّف عند الأمثلة المحلولة. ثم اضغط على "تجديد" للحصول على تمارين أسهل تساعدك على بناء أساس متين. 💪`;
    }
    if (levelAfter > levelBefore) {
      return `🌟 أحسنت! تقدّم واضح ${lessonRef}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${accuracy}%)، وارتفع مستواك من ${levelBefore} إلى ${levelAfter} من 100.\n\nاستمر بهذه الوتيرة وحافظ على المراجعة المنتظمة. اضغط على "تجديد" لتجرّب تمارين أكثر تحديًا وتثبّت ما تعلّمته. 🚀`;
    }
    return `🤖 أداء ثابت ${lessonRef}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${accuracy}%)، ومستواك مستقر عند ${levelAfter} من 100.\n\nركّز على الأسئلة التي ترددت فيها وراجع القاعدة المرتبطة بها. ثم اضغط "تجديد" لتمارين جديدة تساعدك على التقدّم خطوة إضافية. ✨`;
  }, [lessonTitle]);

  const saveLessonComment = useCallback(async (levelBefore: number, levelAfter: number, sessionCorrectCount: number, sessionTotalCount: number) => {
    if (!userId || !lessonId) return;

    // Send weak/strong concepts so AI can build per-lacune explanations
    const link = `/cours/math?chapitre=${chapterId}&lecon=${lessonId}`;
    let message = buildFallbackComment(levelBefore, levelAfter, sessionCorrectCount, sessionTotalCount);

    const weak = Array.from(new Set(weakConceptsRef.current)).slice(0, 5);
    const strong = Array.from(new Set(strongConceptsRef.current)).slice(0, 5);
    const mistakes = mistakesRef.current.slice(0, 5);

    try {
      const { data: cmt, error } = await supabase.functions.invoke("generate-lesson-comment", {
        body: {
          lesson_title: lessonTitle,
          chapter_title: chapterTitle,
          level_before: levelBefore,
          level_after: levelAfter,
          weak_concepts: weak,
          strong_concepts: strong,
          mistakes,
          session_correct: sessionCorrectCount,
          session_total: sessionTotalCount,
          lesson_link: link,
        },
      });

      if (!error && cmt?.message) message = cmt.message;
      if (error) console.warn("AI comment fallback used:", error.message);
    } catch (e) {
      console.warn("AI comment fallback used:", e);
    }

    // Delete previous comments for this lesson — only keep the latest one
    await supabase
      .from("ai_lesson_comments")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);

    const { error: insertError } = await supabase.from("ai_lesson_comments").insert({
      user_id: userId,
      lesson_id: lessonId,
      chapter_id: chapterId,
      lesson_title: lessonTitle,
      chapter_title: chapterTitle,
      level_before: levelBefore,
      level_after: levelAfter,
      level_delta: levelAfter - levelBefore,
      weak_concepts: Array.from(new Set(weakConceptsRef.current)).slice(0, 5),
      strong_concepts: Array.from(new Set(strongConceptsRef.current)).slice(0, 5),
      message,
      link_url: link,
    });

    if (insertError) console.error("AI comment insert error:", insertError);
  }, [buildFallbackComment, chapterId, chapterTitle, lessonId, lessonTitle, userId]);

  // Load existing AI content and score
  useEffect(() => {
    if (!lessonId || !userId) return;

    const loadExisting = async () => {
      const { data: scoreData } = await supabase
        .from("student_scores")
        .select("*")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (scoreData) {
        setScore({
          current_level: scoreData.current_level,
          reading_time_seconds: scoreData.reading_time_seconds,
          quiz_time_seconds: scoreData.quiz_time_seconds,
          exercise_time_seconds: scoreData.exercise_time_seconds,
          total_answers: scoreData.total_answers,
          correct_answers: scoreData.correct_answers,
          accuracy_rate: Number(scoreData.accuracy_rate),
          streak: scoreData.streak,
        });
      } else {
        // Check placement test level
        const { data: learningData } = await (supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> })
          .from("learning_styles")
          .select("visual_score, textual_score, practical_score")
          .eq("user_id", userId)
          .maybeSingle() as { data: LearningStyleScores | null };

        if (learningData) {
          const avg = Math.round((learningData.visual_score + learningData.textual_score + learningData.practical_score) / 3);
          setScore(prev => ({ ...prev, current_level: Math.min(100, Math.max(10, avg)) }));
        }
      }

      // Load existing AI content
      const { data: contentData } = await supabase
        .from("ai_generated_content")
        .select("content_type, content")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId);

      if (contentData) {
        for (const item of contentData) {
          const content = Array.isArray(item.content) ? item.content : [];
          if (item.content_type === "quiz") setQuizzes(content as unknown as QuizItem[]);
          if (item.content_type === "exercise") setExercises(content as unknown as ExerciseItem[]);
          if (item.content_type === "revision") setRevisions(content as unknown as RevisionItem[]);
        }
      }
    };

    loadExisting();
  }, [lessonId, userId]);

  // Composite level per spec (PDF "Phase 4 - Progression Adaptative IA"):
  // 35% exercise accuracy + 30% difficulty achieved + 20% reading time factor + 15% quiz accuracy
  const computeCompositeLevel = useCallback((s: StudentScore): number => {
    const exerciseAcc = s.accuracy_rate; // global proxy
    const quizAcc = s.accuracy_rate;
    const difficultyAchieved = s.current_level; // current ELO-like level
    // Reading time factor: target ~5min per lesson reading; cap at 100
    const readingFactor = Math.min(100, (s.reading_time_seconds / 300) * 100);
    const composite =
      0.35 * exerciseAcc +
      0.30 * difficultyAchieved +
      0.20 * readingFactor +
      0.15 * quizAcc;
    // Streak bonus (up to +5)
    const streakBonus = Math.min(5, s.streak);
    return Math.round(Math.min(100, Math.max(5, composite + streakBonus)));
  }, []);

  const generateContent = useCallback(async (contentType: "quiz" | "exercise" | "revision") => {
    setLoading(prev => ({ ...prev, [contentType]: true }));
    try {
      // Build avoid-list from previously generated content of same type to force variety
      const avoidList: string[] = [];
      if (contentType === "quiz") quizzes.forEach(q => q.question && avoidList.push(q.question));
      if (contentType === "exercise") exercises.forEach(e => (e.title || e.statement) && avoidList.push(e.title || e.statement));

      const compositeLevel = computeCompositeLevel(scoreRef.current);
      const seed = Math.floor(Math.random() * 1_000_000);

      const { data, error } = await supabase.functions.invoke("generate-adaptive-content", {
        body: {
          lesson_id: lessonId,
          chapter_id: chapterId,
          content_type: contentType,
          school_level: schoolLevel,
          difficulty_level: compositeLevel,
          lesson_title: lessonTitle,
          chapter_title: chapterTitle,
          accuracy_rate: scoreRef.current.accuracy_rate,
          quiz_accuracy: scoreRef.current.accuracy_rate,
          exercise_accuracy: scoreRef.current.accuracy_rate,
          streak: scoreRef.current.streak,
          avoid_list: avoidList,
          seed,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const content = data.content;
      // Guarantee 5 items (truncate if more)
      const items = Array.isArray(content) ? content.slice(0, 5) : [];

      if (contentType === "quiz") setQuizzes(items);
      if (contentType === "exercise") setExercises(items);
      if (contentType === "revision") setRevisions(items);

      // Save to DB - upsert
      const { data: existing } = await supabase
        .from("ai_generated_content")
        .select("id")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .eq("content_type", contentType)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("ai_generated_content")
          .update({ content: items, difficulty_level: compositeLevel })
          .eq("id", existing.id);
      } else {
        await supabase.from("ai_generated_content").insert({
          user_id: userId,
          lesson_id: lessonId,
          chapter_id: chapterId,
          content_type: contentType,
          content: items,
          difficulty_level: compositeLevel,
        });
      }

      toast({ title: "✅ تم إنشاء المحتوى", description: `5 ${contentType === "quiz" ? "أسئلة" : contentType === "exercise" ? "تمارين" : "بطاقات"} جديدة حسب مستواك (${compositeLevel}/100)` });
    } catch (err) {
      console.error("Generate error:", err);
      toast({ title: "خطأ", description: err instanceof Error ? err.message : "فشل في إنشاء المحتوى", variant: "destructive" });
    } finally {
      setLoading(prev => ({ ...prev, [contentType]: false }));
    }
  }, [lessonId, chapterId, schoolLevel, lessonTitle, chapterTitle, userId, toast, quizzes, exercises, computeCompositeLevel]);

  // Record answer + update score. New AI content is generated only from the manual "تجديد" button.
  const recordAnswer = useCallback(async (isCorrect: boolean, timeSeconds: number, type: "quiz" | "exercise", concept?: string) => {
    // Capture session start composite level once
    if (sessionStartLevelRef.current === null) {
      sessionStartScoreRef.current = { ...scoreRef.current };
      sessionStartLevelRef.current = computeCompositeLevel(scoreRef.current);
    }
    // Track concept (truncate text to keep prompt small)
    if (concept) {
      const c = concept.slice(0, 120);
      if (isCorrect) strongConceptsRef.current.push(c);
      else weakConceptsRef.current.push(c);
    }

    // Update session counters using a ref so rapid clicks don't use stale React state
    const newSessionTotal = sessionCountersRef.current.total + 1;
    const newSessionCorrect = sessionCountersRef.current.correct + (isCorrect ? 1 : 0);
    sessionCountersRef.current = { total: newSessionTotal, correct: newSessionCorrect };
    setSessionTotal(newSessionTotal);
    setSessionCorrect(newSessionCorrect);

    let finalScore: StudentScore | null = null;
    const oldCurrentLevel = scoreRef.current.current_level;

    setScore((prev) => {
      const newScore = { ...prev };
      newScore.total_answers += 1;

      if (isCorrect) {
        newScore.correct_answers += 1;
        newScore.streak += 1;
      } else {
        newScore.streak = 0;
      }

      if (newScore.total_answers > 0) {
        newScore.accuracy_rate = Math.round((newScore.correct_answers / newScore.total_answers) * 100);
      }

      if (type === "quiz") newScore.quiz_time_seconds += timeSeconds;
      else newScore.exercise_time_seconds += timeSeconds;

      // Dynamic level adjustment
      if (isCorrect && timeSeconds < 30) {
        newScore.current_level = Math.min(100, newScore.current_level + 3);
      } else if (isCorrect) {
        newScore.current_level = Math.min(100, newScore.current_level + 1);
      } else if (timeSeconds > 120) {
        newScore.current_level = Math.max(5, newScore.current_level - 4);
      } else {
        newScore.current_level = Math.max(5, newScore.current_level - 2);
      }

      finalScore = newScore;
      return newScore;
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    if (!finalScore) return;

    // Save to DB
    const { data: latestScore } = await supabase
      .from("student_scores")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    const scoreRow = {
      user_id: userId,
      lesson_id: lessonId,
      chapter_id: chapterId,
      current_level: finalScore.current_level,
      reading_time_seconds: finalScore.reading_time_seconds,
      quiz_time_seconds: finalScore.quiz_time_seconds,
      exercise_time_seconds: finalScore.exercise_time_seconds,
      total_answers: finalScore.total_answers,
      correct_answers: finalScore.correct_answers,
      accuracy_rate: finalScore.accuracy_rate,
      streak: finalScore.streak,
    };

    if (latestScore) {
      await supabase.from("student_scores").update(scoreRow).eq("id", latestScore.id);
    } else {
      await supabase.from("student_scores").insert(scoreRow);
    }

    // Every 5 session answers → update level and notify only. Do not regenerate content automatically.
    if (newSessionTotal > 0 && newSessionTotal % 5 === 0) {
      const sessionAccuracy = Math.round((newSessionCorrect / newSessionTotal) * 100);
      
      if (sessionAccuracy < 50) {
        // Failure notification
        const msg = `لديك ثغرات في هذا الدرس (${newSessionCorrect}/${newSessionTotal}). انقر على "مراجعة" لمراجعة البطاقات ثم "تجديد" لتمارين مكيّفة.`;
        setLevelUpMessage(msg);

        await supabase.from("student_notifications").insert({
          user_id: userId,
          lesson_id: lessonId,
          chapter_id: chapterId,
          notification_type: "performance_drop",
          title: "📉 انخفاض في الأداء",
          message: msg,
          diagnostic: `نسبة الإجابات الصحيحة: ${sessionAccuracy}% (${newSessionCorrect}/${newSessionTotal})`,
          advice: "اضغط على زر تجديد عندما تريد تمارين أو أسئلة جديدة مكيفة مع مستواك الحالي.",
        });
      } else if (sessionAccuracy >= 80) {
        // Success notification
        const msg = `تهانينا! أنت تتقن هذا المستوى (${newSessionCorrect}/${newSessionTotal}). انقر على "تجديد" للانتقال إلى تحديات أصعب!`;
        setLevelUpMessage(msg);

        await supabase.from("student_notifications").insert({
          user_id: userId,
          lesson_id: lessonId,
          chapter_id: chapterId,
          notification_type: "level_up",
          title: "🎉 مستوى ممتاز!",
          message: msg,
          diagnostic: `نسبة الإجابات الصحيحة: ${sessionAccuracy}%`,
          advice: "تم رفع مستوى الصعوبة. استمر في التقدم!",
        });
      } else {
        const msg = `تم تحليل أدائك (${newSessionCorrect}/${newSessionTotal}). اضغط على "تجديد" عندما تريد محتوى جديدًا حسب مستواك.`;
        setLevelUpMessage(msg);
      }

      // Notify user that level updated — but DO NOT auto-regenerate.
      // The student must click "تجديد" manually to get a new batch.
      toast({ title: "✅ تم تحديث مستواك", description: "اضغط على \"تجديد\" للحصول على تمارين جديدة حسب مستواك." });

      // Generate AI personalized comment ONCE per page-load session.
      // Subsequent level recalculations in the same session do NOT trigger a new comment.
      // The student must refresh / reopen the lesson to receive a new AI comment.
      if (!commentGeneratedRef.current) {
        commentGeneratedRef.current = true;
        const startScore = sessionStartScoreRef.current ?? scoreRef.current;
        const startLevel = sessionStartLevelRef.current ?? computeCompositeLevel(startScore);
        const endLevel = computeCompositeLevel(finalScore);
        await saveLessonComment(startLevel, endLevel, newSessionCorrect, newSessionTotal);
      }

      // Reset session counters for next batch (level keeps progressing, but no new comment)
      setSessionCorrect(0);
      setSessionTotal(0);
      sessionCountersRef.current = { correct: 0, total: 0 };
      sessionStartLevelRef.current = computeCompositeLevel(finalScore);
      sessionStartScoreRef.current = { ...finalScore };
      weakConceptsRef.current = [];
      strongConceptsRef.current = [];
    }

    return finalScore;
  }, [userId, lessonId, chapterId, toast, saveLessonComment, computeCompositeLevel]);

  const updateReadingTime = useCallback(async (seconds: number) => {
    const newScore = { ...scoreRef.current, reading_time_seconds: scoreRef.current.reading_time_seconds + seconds };
    setScore(newScore);

    const { data: existing } = await supabase
      .from("student_scores")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (existing) {
      await supabase.from("student_scores").update({ reading_time_seconds: newScore.reading_time_seconds }).eq("id", existing.id);
    } else {
      await supabase.from("student_scores").insert({
        user_id: userId,
        lesson_id: lessonId,
        chapter_id: chapterId,
        reading_time_seconds: newScore.reading_time_seconds,
        current_level: newScore.current_level,
      });
    }
  }, [userId, lessonId, chapterId]);

  const resetSessionCounters = useCallback(() => {
    setSessionCorrect(0);
    setSessionTotal(0);
    setLevelUpMessage(null);
    sessionCountersRef.current = { correct: 0, total: 0 };
    sessionStartLevelRef.current = null;
    sessionStartScoreRef.current = null;
    weakConceptsRef.current = [];
    strongConceptsRef.current = [];
  }, []);

  return {
    quizzes,
    exercises,
    revisions,
    loading,
    score,
    sessionCorrect,
    sessionTotal,
    levelUpMessage,
    generateContent,
    recordAnswer,
    updateReadingTime,
    resetSessionCounters,
  };
}

