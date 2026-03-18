import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizItem {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface ExerciseItem {
  title: string;
  statement: string;
  expected_answer: string;
  hints: string[];
  solution: string;
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
  // Track if we just triggered auto-refresh
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Reset session counters when lesson changes
  useEffect(() => {
    setSessionCorrect(0);
    setSessionTotal(0);
    setLevelUpMessage(null);
  }, [lessonId]);

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
        // Check placement test level stored in the global student score row
        const { data: learningData } = await supabase
          .from("student_scores")
          .select("current_level")
          .eq("user_id", userId)
          .is("lesson_id", null)
          .maybeSingle();

        if (learningData) {
          setScore(prev => ({ ...prev, current_level: Math.min(100, Math.max(10, learningData.current_level)) }));
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
          const content = item.content as any[];
          if (item.content_type === "quiz") setQuizzes(content);
          if (item.content_type === "exercise") setExercises(content);
          if (item.content_type === "revision") setRevisions(content);
        }
      }
    };

    loadExisting();
  }, [lessonId, userId]);

  const generateContent = useCallback(async (contentType: "quiz" | "exercise" | "revision") => {
    setLoading(prev => ({ ...prev, [contentType]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-adaptive-content", {
        body: {
          lesson_id: lessonId,
          chapter_id: chapterId,
          content_type: contentType,
          school_level: schoolLevel,
          difficulty_level: scoreRef.current.current_level,
          lesson_title: lessonTitle,
          chapter_title: chapterTitle,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const content = data.content;

      if (contentType === "quiz") setQuizzes(content);
      if (contentType === "exercise") setExercises(content);
      if (contentType === "revision") setRevisions(content);

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
          .update({ content, difficulty_level: scoreRef.current.current_level })
          .eq("id", existing.id);
      } else {
        await supabase.from("ai_generated_content").insert({
          user_id: userId,
          lesson_id: lessonId,
          chapter_id: chapterId,
          content_type: contentType,
          content,
          difficulty_level: scoreRef.current.current_level,
        });
      }

      toast({ title: "✅ تم إنشاء المحتوى", description: "تم إنشاء المحتوى بنجاح حسب مستواك" });
    } catch (err: any) {
      console.error("Generate error:", err);
      toast({ title: "خطأ", description: err.message || "فشل في إنشاء المحتوى", variant: "destructive" });
    } finally {
      setLoading(prev => ({ ...prev, [contentType]: false }));
    }
  }, [lessonId, chapterId, schoolLevel, lessonTitle, chapterTitle, userId, toast]);

  // Record answer + update score + auto-refresh every 5 session answers
  const recordAnswer = useCallback(async (isCorrect: boolean, timeSeconds: number, type: "quiz" | "exercise") => {
    // Update session counters
    const newSessionTotal = sessionTotal + 1;
    const newSessionCorrect = sessionCorrect + (isCorrect ? 1 : 0);
    setSessionTotal(newSessionTotal);
    if (isCorrect) setSessionCorrect(prev => prev + 1);

    let finalScore: StudentScore | null = null;
    let oldCurrentLevel = scoreRef.current.current_level;

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

    // Every 5 session answers → auto-refresh with smart notification
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
          advice: "لقد أعدنا إنشاء تمارين واختبارات مكيفة مع مستواك الحالي لمساعدتك على التحسن.",
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
        const msg = `تم تحليل أدائك (${newSessionCorrect}/${newSessionTotal}). يتم تحديث المحتوى حسب مستواك الجديد.`;
        setLevelUpMessage(msg);
      }

      // Auto-regenerate content for the active type
      toast({ title: "🔄 تحديث المستوى", description: "جاري إعادة إنشاء المحتوى حسب مستواك الجديد..." });

      // Reset session counters for next batch
      setSessionCorrect(0);
      setSessionTotal(0);

      setTimeout(async () => {
        await generateContent(type);
        if (type === "quiz") await generateContent("exercise");
        else await generateContent("quiz");
      }, 1000);
    }

    return finalScore;
  }, [userId, lessonId, chapterId, toast, generateContent, sessionTotal, sessionCorrect]);

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
