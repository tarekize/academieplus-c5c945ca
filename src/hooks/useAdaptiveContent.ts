import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { computeDelta, applyDelta, computeComposite, applyDecay } from "@/lib/levelEngine";

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
    const intro = levelAfter < levelBefore
      ? `📉 يبدو أنّك واجهت بعض الصعوبات ${lessonRef}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${accuracy}%)، وانخفض مستواك من ${levelBefore} إلى ${levelAfter} من 100.`
      : levelAfter > levelBefore
        ? `🌟 أحسنت! تقدّم واضح ${lessonRef}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${accuracy}%)، وارتفع مستواك من ${levelBefore} إلى ${levelAfter} من 100.`
        : `🤖 أداء ثابت ${lessonRef}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${accuracy}%)، ومستواك مستقر عند ${levelAfter} من 100.`;

    return `${intro}\n\n### 🎯 مثال لمعالجة lacune\n**القاعدة:** راجع الفكرة الخاطئة بطريقة عملية: نحدّد المطلوب، نختار القاعدة المناسبة، نطبقها على مثال جديد، ثم نتحقق من النتيجة.\n\n#### مثال جديد) تمرين مشابه\nلتكن الدالة $f(x)=3x^2-4x+1$. أوجد دالة أصلية $F$ للدالة $f$ على $\\mathbb{R}$.\n\n**الحل المفصّل:**\n1. نبحث عن $F$ بحيث يكون $F'(x)=f(x)$.\n2. دالة أصلية لـ $3x^2$ هي $x^3$ لأن $(x^3)'=3x^2$.\n3. دالة أصلية لـ $-4x$ هي $-2x^2$ لأن $(-2x^2)'=-4x$.\n4. دالة أصلية لـ $1$ هي $x$ لأن $(x)'=1$.\n5. نضيف ثابتاً $C$ لأن مشتقة الثابت تساوي $0$.\n\n**الجواب:** $$F(x)=x^3-2x^2+x+C,\\quad C\\in\\mathbb{R}$$\n\nاضغط **"تجديد"** للحصول على تمارين مكيّفة لمستواك. 💪`;
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
        // Règle 5 — décroissance temporelle (oubli) appliquée à l'ouverture de session
        const decayResult = applyDecay(scoreData.current_level, scoreData.updated_at);

        setScore({
          current_level: decayResult.level,
          reading_time_seconds: scoreData.reading_time_seconds,
          quiz_time_seconds: scoreData.quiz_time_seconds,
          exercise_time_seconds: scoreData.exercise_time_seconds,
          total_answers: scoreData.total_answers,
          correct_answers: scoreData.correct_answers,
          accuracy_rate: Number(scoreData.accuracy_rate),
          streak: scoreData.streak,
        });

        if (decayResult.applied) {
          await supabase
            .from("student_scores")
            .update({ current_level: decayResult.level })
            .eq("id", scoreData.id);
        }
      }
      // Règle 4 — pas de seed depuis learning_styles (mesure le style, pas les acquis).
      // Le niveau initial reste 50 par défaut. Un éventuel test de placement futur pourra
      // alimenter score.current_level via student_scores.assessment_data.placement_score.

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

  // Règle 2 — composite (sans reading_time ni streak) :
  //   0.40 × taux pondéré difficulté + 0.35 × current_level + 0.25 × quiz_accuracy
  // Note: faute d'historique des 30 dernières réponses, on approxime le taux pondéré
  // par accuracy_rate. Le streak est gardé pour l'affichage uniquement.
  const computeCompositeLevel = useCallback((s: StudentScore): number => {
    return computeComposite({
      currentLevel: s.current_level,
      weightedAccuracy: s.accuracy_rate,
      quizAccuracy: s.accuracy_rate,
    });
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
  const recordAnswer = useCallback(async (
    isCorrect: boolean,
    timeSeconds: number,
    type: "quiz" | "exercise",
    concept?: string,
    mistakeDetails?: { user_answer: string; correct_answer: string },
    difficulty?: number,
  ) => {
    // Capture session start composite level once
    if (sessionStartLevelRef.current === null) {
      sessionStartScoreRef.current = { ...scoreRef.current };
      sessionStartLevelRef.current = computeCompositeLevel(scoreRef.current);
    }
    // Track concept (truncate text to keep prompt small)
    if (concept) {
      const c = concept.slice(0, 200);
      if (isCorrect) {
        strongConceptsRef.current.push(c);
      } else {
        weakConceptsRef.current.push(c);
        if (mistakeDetails) {
          mistakesRef.current.push({
            question: c,
            user_answer: String(mistakeDetails.user_answer ?? "").slice(0, 200),
            correct_answer: String(mistakeDetails.correct_answer ?? "").slice(0, 200),
            type,
          });
        }
      }
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

      // Règle 1 — Ajustement ELO pondéré par difficulté + temps
      const delta = computeDelta({
        isCorrect,
        timeSec: timeSeconds,
        difficulty,
        currentLevel: newScore.current_level,
      });
      newScore.current_level = applyDelta(newScore.current_level, delta);

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
      } else if (sessionAccuracy >= 80) {
        // Success notification
        const msg = `تهانينا! أنت تتقن هذا المستوى (${newSessionCorrect}/${newSessionTotal}). انقر على "تجديد" للانتقال إلى تحديات أصعب!`;
        setLevelUpMessage(msg);
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
      mistakesRef.current = [];
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
    mistakesRef.current = [];
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

