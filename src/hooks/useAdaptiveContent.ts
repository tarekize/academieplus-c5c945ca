import { useState, useEffect, useCallback } from "react";
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

  // Load existing AI content and score
  useEffect(() => {
    if (!lessonId || !userId) return;

    const loadExisting = async () => {
      // Load score
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
        // Check if student has a placement test level
        const { data: learningData } = await supabase
          .from("learning_styles")
          .select("visual_score, textual_score, practical_score")
          .eq("user_id", userId)
          .maybeSingle();
        
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
          difficulty_level: score.current_level,
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
          .update({ content, difficulty_level: score.current_level })
          .eq("id", existing.id);
      } else {
        await supabase.from("ai_generated_content").insert({
          user_id: userId,
          lesson_id: lessonId,
          chapter_id: chapterId,
          content_type: contentType,
          content,
          difficulty_level: score.current_level,
        });
      }

      toast({ title: "✅ تم إنشاء المحتوى", description: "تم إنشاء المحتوى بنجاح حسب مستواك" });
    } catch (err: any) {
      console.error("Generate error:", err);
      toast({ title: "خطأ", description: err.message || "فشل في إنشاء المحتوى", variant: "destructive" });
    } finally {
      setLoading(prev => ({ ...prev, [contentType]: false }));
    }
  }, [lessonId, chapterId, schoolLevel, score.current_level, lessonTitle, chapterTitle, userId, toast]);

  // Update score after answering
  const recordAnswer = useCallback(async (isCorrect: boolean, timeSeconds: number, type: "quiz" | "exercise") => {
    const newScore = { ...score };
    newScore.total_answers += 1;
    if (isCorrect) {
      newScore.correct_answers += 1;
      newScore.streak += 1;
    } else {
      newScore.streak = 0;
    }
    newScore.accuracy_rate = Math.round((newScore.correct_answers / newScore.total_answers) * 100);
    
    if (type === "quiz") newScore.quiz_time_seconds += timeSeconds;
    else newScore.exercise_time_seconds += timeSeconds;

    // Dynamic level adjustment
    if (isCorrect && timeSeconds < 30) {
      // Fast correct → increase level
      newScore.current_level = Math.min(100, newScore.current_level + 3);
    } else if (isCorrect) {
      newScore.current_level = Math.min(100, newScore.current_level + 1);
    } else if (timeSeconds > 120) {
      // Slow wrong → decrease more
      newScore.current_level = Math.max(5, newScore.current_level - 4);
    } else {
      newScore.current_level = Math.max(5, newScore.current_level - 2);
    }

    setScore(newScore);

    // Upsert to DB
    const { data: existing } = await supabase
      .from("student_scores")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    const scoreRow = {
      user_id: userId,
      lesson_id: lessonId,
      chapter_id: chapterId,
      current_level: newScore.current_level,
      reading_time_seconds: newScore.reading_time_seconds,
      quiz_time_seconds: newScore.quiz_time_seconds,
      exercise_time_seconds: newScore.exercise_time_seconds,
      total_answers: newScore.total_answers,
      correct_answers: newScore.correct_answers,
      accuracy_rate: newScore.accuracy_rate,
      streak: newScore.streak,
    };

    if (existing) {
      await supabase.from("student_scores").update(scoreRow).eq("id", existing.id);
    } else {
      await supabase.from("student_scores").insert(scoreRow);
    }

    // Check for performance drop → notification
    if (newScore.accuracy_rate < 40 && newScore.total_answers >= 5) {
      await supabase.from("student_notifications").insert({
        user_id: userId,
        lesson_id: lessonId,
        chapter_id: chapterId,
        notification_type: "performance_drop",
        title: "📉 انخفاض في الأداء",
        message: "لاحظنا انخفاضًا في أدائك. لا تقلق، سنساعدك!",
        diagnostic: `نسبة الإجابات الصحيحة: ${newScore.accuracy_rate}%. يجب التركيز على هذا الدرس.`,
        advice: "لقد أعدنا إنشاء تمارين واختبارات مكيفة مع مستواك الحالي لمساعدتك على التحسن.",
      });
    }

    // Auto-regenerate if level changed significantly (every 5 level points)
    const oldBracket = Math.floor(score.current_level / 10);
    const newBracket = Math.floor(newScore.current_level / 10);
    if (oldBracket !== newBracket && newScore.total_answers >= 3) {
      // Regenerate content at new level
      toast({ title: "🔄 تحديث المستوى", description: "جاري إعادة إنشاء المحتوى حسب مستواك الجديد..." });
    }

    return newScore;
  }, [score, userId, lessonId, chapterId, toast]);

  const updateReadingTime = useCallback(async (seconds: number) => {
    const newScore = { ...score, reading_time_seconds: score.reading_time_seconds + seconds };
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
  }, [score, userId, lessonId, chapterId]);

  return {
    quizzes,
    exercises,
    revisions,
    loading,
    score,
    generateContent,
    recordAnswer,
    updateReadingTime,
  };
}
