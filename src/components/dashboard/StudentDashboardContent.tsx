import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { computeGlobal, applyDecay } from "@/lib/levelEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import {
  Clock, Target, TrendingUp, TrendingDown, GraduationCap, BookOpen, Brain, FileText,
  CheckCircle2, XCircle, Zap, RefreshCw, Activity, Sparkles, Award, ChevronRight, Bell, Bot,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import AICommentsCard from "./AICommentsCard";

interface StudentDashboardContentProps {
  userId: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    school_level: string | null;
    filiere?: string | null;
    email: string | null;
  };
  hideActions?: boolean;
  parentView?: boolean;
}

interface ChapterStat {
  chapterId: string;
  chapterTitle: string;
  totalTime: number;
  accuracy: number;
  level: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  lessonTitleAr: string | null;
  status: "never" | "in_progress" | "completed";
  readingSeconds: number;
  overallRate: number;
  exercisesDone: number;
  exercisesTotal: number;
  exercisesRate: number;
  quizzesDone: number;
  quizzesTotal: number;
  quizzesRate: number;
  level: number | null;
}

interface ChapterLessonProgress {
  chapterId: string;
  chapterTitle: string;
  lessons: LessonProgress[];
  completedLessons: number;
  totalLessons: number;
}

interface LessonCommentDialog {
  lessonId: string;
  chapterId: string | null;
  lessonTitle: string;
  chapterTitle: string | null;
  message: string;
  levelBefore: number;
  levelAfter: number;
  createdAt: string;
}

const SCHOOL_LEVELS: Record<string, string> = {
  "5eme_primaire": "5ème Primaire",
  "1ere_cem": "1ère CEM",
  "2eme_cem": "2ème CEM",
  "3eme_cem": "3ème CEM",
  "4eme_cem": "4ème CEM",
  premiere: "Première",
  seconde: "Seconde",
  terminale: "Terminale",
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}س ${m}د`;
  return `${m}د`;
}

function getLevelInfo(accuracy: number) {
  if (accuracy >= 80) return { label: "متقدم", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", ring: "hsl(152, 60%, 45%)" };
  if (accuracy >= 60) return { label: "جيد", color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20", ring: "hsl(217, 70%, 55%)" };
  if (accuracy >= 35) return { label: "متوسط", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", ring: "hsl(38, 80%, 55%)" };
  return { label: "يحتاج تحسين", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", ring: "hsl(0, 70%, 55%)" };
}

function buildLessonLacunaMessage(lessonTitle: string, level: number) {
  return `📌 يبدو أن لديك بعض النقص في درس **"${lessonTitle}"** (المستوى الحالي ${level}/100).

### 🎯 نصيحة سريعة
- راجع القاعدة الأساسية للدرس قبل حل التمارين.
- ركّز على فهم الطريقة خطوة بخطوة وليس حفظ الجواب.
- أعد حل تمرين بسيط ثم انتقل إلى تمرين أصعب.

اضغط على **"اذهب إلى الدرس"** للمراجعة الآن.`;
}

function buildChapterSuggestion(chapterTitle: string, lessons: LessonProgress[]) {
  if (lessons.length === 0) {
    return `لا توجد بيانات كافية بعد عن فصل "${chapterTitle}". ابدأ بدراسة الدروس للحصول على تحليل.`;
  }
  const leveled = lessons.filter((l) => l.level !== null);
  if (leveled.length === 0) {
    return `لم تبدأ بعد بحل التمارين في فصل "${chapterTitle}". ابدأ الآن لقياس مستواك.`;
  }
  const avg = Math.round(leveled.reduce((s, l) => s + (l.level || 0), 0) / leveled.length);
  const weak = lessons.filter((l) => l.level !== null && (l.level as number) < 50);
  if (weak.length > 0) {
    const names = weak.slice(0, 3).map((l) => l.lessonTitleAr || l.lessonTitle).join("، ");
    return `مستواك في فصل "${chapterTitle}" هو ${avg}/100. ننصحك بالتركيز على الدروس التي تحتاج دعماً: ${names}. راجع القواعد وأعد حل التمارين خطوة بخطوة.`;
  }
  if (avg >= 80) {
    return `أداء ممتاز في فصل "${chapterTitle}" بمستوى ${avg}/100! 🎉 أنت جاهز للانتقال إلى أنشطة أصعب أو فصل جديد.`;
  }
  return `أداء جيد في فصل "${chapterTitle}" بمستوى ${avg}/100. واصل التدريب للوصول إلى مستوى متقدم.`;
}

const REFRESH_INTERVAL = 30000; // 30s auto-refresh

const makeUniqueChapterKey = (chapter: { title?: string | null; title_ar?: string | null; order_index?: number | null }) =>
  `${chapter.order_index ?? ""}|${(chapter.title_ar || chapter.title || "").replace(/\s+/g, " ").trim()}`;

export default function StudentDashboardContent({ userId, profile, hideActions, parentView }: StudentDashboardContentProps) {
  const navigate = useNavigate();
  const [chapterStats, setChapterStats] = useState<ChapterStat[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [avgLevel, setAvgLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activityBreakdown, setActivityBreakdown] = useState({ reading: 0, quiz: 0, exercise: 0 });
  const [chapterLessonProgress, setChapterLessonProgress] = useState<ChapterLessonProgress[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [lessonComments, setLessonComments] = useState<Map<string, LessonCommentDialog>>(new Map());
  const [selectedLessonComment, setSelectedLessonComment] = useState<LessonCommentDialog | null>(null);
  // État de remédiation par leçon : true = résolu (toutes réponses correctes) → arrête le clignotement.
  const [remediationStatus, setRemediationStatus] = useState<Map<string, boolean>>(new Map());

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Utilisateur";

  const fetchScores = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const scoresPromise = supabase
        .from("student_scores")
        .select("*, chapter:chapters(title, title_ar)")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      const chaptersPromise = profile.school_level
        ? supabase
          .from("chapters")
          .select("id, title, title_ar, order_index, filiere_id, filiere:filieres(code)")
          .eq("school_level", profile.school_level as any)
          .order("order_index", { ascending: true })
        : Promise.resolve({ data: [] as any[] });

      const [{ data }, { data: levelChapters }] = await Promise.all([scoresPromise, chaptersPromise]);

      const filteredLevelChapters = (levelChapters || []).filter((chapter: any) => {
        const filiereCode = Array.isArray(chapter.filiere) ? chapter.filiere[0]?.code : chapter.filiere?.code;
        return profile.filiere ? !chapter.filiere_id || filiereCode === profile.filiere : !chapter.filiere_id;
      });

      const uniqueLevelChapters = filteredLevelChapters.filter((chapter: any, index: number, chapters: any[]) => {
        const key = makeUniqueChapterKey(chapter);
        return chapters.findIndex((candidate: any) => makeUniqueChapterKey(candidate) === key) === index;
      });

      const chapterIds = uniqueLevelChapters.map((ch: any) => ch.id);
      const allowedChapterIds = new Set(chapterIds);
      const lessonsPromise = chapterIds.length > 0
        ? supabase
          .from("lessons")
          .select("id, chapter_id, title, title_ar, order_index")
          .in("chapter_id", chapterIds)
          .order("order_index", { ascending: true })
        : Promise.resolve({ data: [] as any[] });

      const [{ data: lessonsData }] = await Promise.all([lessonsPromise]);

      const chapterMap = new Map<string, ChapterStat>();

      // Initialize with all chapters from student's level so table always shows full list.
      uniqueLevelChapters.forEach((ch: any) => {
        chapterMap.set(ch.id, {
          chapterId: ch.id,
          chapterTitle: ch.title_ar || ch.title || "—",
          totalTime: 0,
          accuracy: 0,
          level: 0,
          correctAnswers: 0,
          totalAnswers: 0,
        });
      });

      let totalReadTime = 0, totalQuizTime = 0, totalExTime = 0;
      let sumCorrect = 0, sumTotal = 0, maxStreak = 0;

      // Règle 5 — appliquer la décroissance temporelle (oubli) avant agrégation,
      // et persister la valeur dégradée dans la base pour cohérence.
      const decayedRows: Array<{ id: string; lesson_id: string | null; current_level: number; total_answers: number }> = [];
      const decayPersistPromises: Promise<unknown>[] = [];

      (data || []).forEach((s: any) => {
        const cId = s.chapter_id;
        if (profile.school_level && cId && !allowedChapterIds.has(cId)) {
          return;
        }

        // Decay
        const decayResult = applyDecay(s.current_level || 0, s.updated_at);
        const effectiveLevel = decayResult.level;
        if (decayResult.applied) {
          s.current_level = effectiveLevel;
          decayPersistPromises.push(
            (supabase.from("student_scores").update({ current_level: effectiveLevel }).eq("id", s.id) as unknown as Promise<unknown>)
          );
        }

        decayedRows.push({
          id: s.id,
          lesson_id: s.lesson_id || null,
          current_level: effectiveLevel,
          total_answers: s.total_answers || 0,
        });

        if (!cId) {
          totalReadTime += s.reading_time_seconds || 0;
          totalQuizTime += s.quiz_time_seconds || 0;
          totalExTime += s.exercise_time_seconds || 0;
          sumCorrect += s.correct_answers || 0;
          sumTotal += s.total_answers || 0;
          if ((s.streak || 0) > maxStreak) maxStreak = s.streak;
          return;
        }

        const existing = chapterMap.get(cId) || {
          chapterId: cId,
          chapterTitle: s.chapter?.title_ar || s.chapter?.title || "—",
          totalTime: 0, accuracy: 0, level: 0, correctAnswers: 0, totalAnswers: 0,
        };
        existing.totalTime += (s.reading_time_seconds || 0) + (s.quiz_time_seconds || 0) + (s.exercise_time_seconds || 0);
        existing.accuracy = Number(s.accuracy_rate) || existing.accuracy;
        existing.level = effectiveLevel || existing.level;
        existing.correctAnswers += s.correct_answers || 0;
        existing.totalAnswers += s.total_answers || 0;
        chapterMap.set(cId, existing);
        totalReadTime += s.reading_time_seconds || 0;
        totalQuizTime += s.quiz_time_seconds || 0;
        totalExTime += s.exercise_time_seconds || 0;
        sumCorrect += s.correct_answers || 0;
        sumTotal += s.total_answers || 0;
        if ((s.streak || 0) > maxStreak) maxStreak = s.streak;
      });

      // Fire decay updates without blocking UI
      if (decayPersistPromises.length > 0) {
        Promise.allSettled(decayPersistPromises).catch(() => undefined);
      }

      setChapterStats(Array.from(chapterMap.values()));
      setActivityBreakdown({ reading: totalReadTime, quiz: totalQuizTime, exercise: totalExTime });
      setTotalTime(totalReadTime + totalQuizTime + totalExTime);
      setTotalCorrect(sumCorrect);
      setTotalAnswers(sumTotal);

      // Règle 3 — niveau global pondéré par nombre de réponses (pas une moyenne plate).
      const globalResult = computeGlobal(decayedRows);
      setAvgLevel(globalResult.global);
      setStreak(maxStreak);

      // Build lesson progress by chapter (clickable details view)
      const exerciseCountByLesson = new Map<string, number>();
      const quizCountByLesson = new Map<string, number>();

      if ((lessonsData || []).length > 0) {
        const countPromises = (lessonsData || []).map(async (lesson: any) => {
          const [{ data: lessonExercises }, { data: lessonQuizzes }] = await Promise.all([
            supabase.rpc("get_student_exercises" as any, {
              _chapter_id: lesson.chapter_id,
              _lesson_id: lesson.id,
            }),
            supabase.rpc("get_student_quizzes" as any, {
              _chapter_id: lesson.chapter_id,
              _lesson_id: lesson.id,
            }),
          ]);

          return {
            lessonId: lesson.id as string,
            exercisesCount: (lessonExercises || []).length,
            quizzesCount: (lessonQuizzes || []).length,
          };
        });

        const counts = await Promise.all(countPromises);
        counts.forEach(({ lessonId, exercisesCount, quizzesCount }) => {
          exerciseCountByLesson.set(lessonId, exercisesCount);
          quizCountByLesson.set(lessonId, quizzesCount);
        });
      }

      const scoreRowsByLesson = new Map<string, any[]>();
      (data || []).forEach((row: any) => {
        if (!row.lesson_id) return;
        if (profile.school_level && row.chapter_id && !allowedChapterIds.has(row.chapter_id)) return;
        const current = scoreRowsByLesson.get(row.lesson_id) || [];
        current.push(row);
        scoreRowsByLesson.set(row.lesson_id, current);
      });

      const chapterProgressMap = new Map<string, ChapterLessonProgress>();
      uniqueLevelChapters.forEach((ch: any) => {
        chapterProgressMap.set(ch.id, {
          chapterId: ch.id,
          chapterTitle: ch.title_ar || ch.title || "—",
          lessons: [],
          completedLessons: 0,
          totalLessons: 0,
        });
      });

      (lessonsData || []).forEach((lesson: any) => {
        const rows = scoreRowsByLesson.get(lesson.id) || [];

        let readingSeconds = 0;
        let correctAnswers = 0;
        let totalLessonAnswers = 0;
        const completedExercisesSet = new Set<string>();
        const completedQuizzesSet = new Set<string>();

        let levelWeightedSum = 0;
        let levelWeightTotal = 0;
        rows.forEach((r: any) => {
          readingSeconds += r.reading_time_seconds || 0;
          correctAnswers += r.correct_answers || 0;
          totalLessonAnswers += r.total_answers || 0;

          const w = r.total_answers || 0;
          if (w > 0 && typeof r.current_level === "number") {
            levelWeightedSum += r.current_level * w;
            levelWeightTotal += w;
          } else if (typeof r.current_level === "number" && levelWeightTotal === 0) {
            // fallback: at least record the level even without answers
            levelWeightedSum += r.current_level;
            levelWeightTotal = Math.max(levelWeightTotal, 1);
          }

          const assessmentData = (r.assessment_data || {}) as Record<string, any>;
          if (Array.isArray(assessmentData.completed_exercises)) {
            assessmentData.completed_exercises.forEach((item: unknown) => {
              if (typeof item === "string") {
                completedExercisesSet.add(item);
                return;
              }
              if (item && typeof item === "object" && "id" in item && typeof (item as any).id === "string") {
                completedExercisesSet.add((item as any).id);
              }
            });
          }
          if (Array.isArray(assessmentData.completed_quizzes)) {
            assessmentData.completed_quizzes.forEach((item: unknown) => {
              if (typeof item === "string") {
                completedQuizzesSet.add(item);
                return;
              }
              if (item && typeof item === "object" && "id" in item && typeof (item as any).id === "string") {
                completedQuizzesSet.add((item as any).id);
              }
            });
          }
        });

        const exercisesTotal = exerciseCountByLesson.get(lesson.id) || 0;
        const quizzesTotal = quizCountByLesson.get(lesson.id) || 0;
        const exercisesDone = Math.min(completedExercisesSet.size, exercisesTotal);
        const quizzesDone = Math.min(completedQuizzesSet.size, quizzesTotal);

        const exercisesRate = exercisesTotal > 0 ? Math.round((exercisesDone / exercisesTotal) * 100) : 0;
        const quizzesRate = quizzesTotal > 0 ? Math.round((quizzesDone / quizzesTotal) * 100) : 0;
        const totalAssessments = exercisesTotal + quizzesTotal;
        const overallRate = totalAssessments > 0
          ? Math.round(((exercisesDone + quizzesDone) / totalAssessments) * 100)
          : 0;

        const hasActivityItems = exercisesTotal + quizzesTotal > 0;
        const isCompleted = hasActivityItems && exercisesRate === 100 && quizzesRate === 100;
        const isStarted = readingSeconds > 0 || totalLessonAnswers > 0 || exercisesDone > 0 || quizzesDone > 0;
        const lessonLevel = levelWeightTotal > 0 ? Math.round(levelWeightedSum / levelWeightTotal) : null;

        const lessonProgress: LessonProgress = {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonTitleAr: lesson.title_ar,
          status: isCompleted ? "completed" : isStarted ? "in_progress" : "never",
          readingSeconds,
          overallRate,
          exercisesDone,
          exercisesTotal,
          exercisesRate,
          quizzesDone,
          quizzesTotal,
          quizzesRate,
          level: lessonLevel,
        };

        const chapterProgress = chapterProgressMap.get(lesson.chapter_id);
        if (!chapterProgress) return;

        chapterProgress.lessons.push(lessonProgress);
        chapterProgress.totalLessons += 1;
        if (lessonProgress.status === "completed") {
          chapterProgress.completedLessons += 1;
        }
      });

      setChapterLessonProgress(Array.from(chapterProgressMap.values()));
      setLastUpdated(new Date());
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [userId, profile.school_level, profile.filiere]);

  const getLessonStatusBadge = (status: LessonProgress["status"]) => {
    if (status === "completed") {
      return <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">منتهية</Badge>;
    }
    if (status === "in_progress") {
      return <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">قيد التقدم</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground border border-border">غير مبدوءة</Badge>;
  };

  useEffect(() => { fetchScores(); }, [fetchScores]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => fetchScores(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchScores]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('student-scores-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_scores',
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchScores(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchScores]);

  // Auto-select first chapter
  useEffect(() => {
    if (!selectedChapterId && chapterStats.length > 0) {
      setSelectedChapterId(chapterStats[0].chapterId);
    }
  }, [chapterStats, selectedChapterId]);

  // Fetch AI lesson comments (for blinking notifications + dialog)
  useEffect(() => {
    const fetchLessonComments = async () => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("ai_lesson_comments")
        .select("lesson_id, chapter_id, lesson_title, chapter_title, message, level_before, level_after, created_at")
        .eq("user_id", userId)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false });
      const map = new Map<string, LessonCommentDialog>();
      (data || []).forEach((c: any) => {
        if (!c.lesson_id || map.has(c.lesson_id)) return;
        map.set(c.lesson_id, {
          lessonId: c.lesson_id,
          chapterId: c.chapter_id,
          lessonTitle: c.lesson_title || "درس",
          chapterTitle: c.chapter_title,
          message: c.message,
          levelBefore: c.level_before ?? 0,
          levelAfter: c.level_after ?? 0,
          createdAt: c.created_at,
        });
      });
      setLessonComments(map);
    };
    fetchLessonComments();

    // État de remédiation : une leçon résolue n'affiche plus de clignotement.
    const fetchRemediation = async () => {
      const { data } = await supabase
        .from("ai_generated_content")
        .select("lesson_id, content, updated_at")
        .eq("user_id", userId)
        .eq("content_type", "remediation")
        .order("updated_at", { ascending: false });
      const map = new Map<string, boolean>();
      (data || []).forEach((r: any) => {
        if (!r.lesson_id || map.has(r.lesson_id)) return;
        map.set(r.lesson_id, Boolean(r.content?.resolved));
      });
      setRemediationStatus(map);
    };
    fetchRemediation();

    const channel = supabase
      .channel("dashboard-lesson-comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_lesson_comments", filter: `user_id=eq.${userId}` }, () => fetchLessonComments())
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_generated_content", filter: `user_id=eq.${userId}` }, () => fetchRemediation())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const successRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const errorRate = totalAnswers > 0 ? 100 - successRate : 0;
  const totalErrors = totalAnswers - totalCorrect;
  const levelInfo = getLevelInfo(avgLevel);

  const totalActivity = activityBreakdown.reading + activityBreakdown.quiz + activityBreakdown.exercise || 1;
  const readPct = Math.round((activityBreakdown.reading / totalActivity) * 100);
  const quizPct = Math.round((activityBreakdown.quiz / totalActivity) * 100);
  const exPct = 100 - readPct - quizPct;

  const getChapterCompletionPct = (chapterId: string) => {
    const chapterLessons = chapterLessonProgress.find((chapter) => chapter.chapterId === chapterId);
    if (!chapterLessons || chapterLessons.totalLessons === 0) return 0;
    return Math.round((chapterLessons.completedLessons / chapterLessons.totalLessons) * 100);
  };

  const chapterRadarData = chapterStats.map((chapter, index) => {
    const completionPct = getChapterCompletionPct(chapter.chapterId);

    return {
      chapter: chapter.chapterTitle.length > 18 ? `${chapter.chapterTitle.slice(0, 18)}…` : chapter.chapterTitle,
      score: completionPct,
      fullTitle: chapter.chapterTitle,
      order: index + 1,
    };
  });

  const selectedChapter = chapterStats.find((c) => c.chapterId === selectedChapterId) || chapterStats[0];
  const selectedChapterLessons = chapterLessonProgress.find((c) => c.chapterId === selectedChapter?.chapterId);

  const lessonHasNotification = (lessonId: string, level: number | null) => {
    // Si une remédiation existe pour cette leçon, le clignotement dépend uniquement
    // de sa résolution : il reste tant que toutes les réponses ne sont pas correctes.
    if (remediationStatus.has(lessonId)) return !remediationStatus.get(lessonId);
    return lessonComments.has(lessonId) || (level !== null && level < 50);
  };

  const chapterHasNotification = (chapterId: string) => {
    const lp = chapterLessonProgress.find((c) => c.chapterId === chapterId);
    if (!lp) return false;
    return lp.lessons.some((l) => lessonHasNotification(l.lessonId, l.level));
  };

  const openLessonComment = (lesson: LessonProgress, chapterId: string | null, chapterTitle: string | null) => {
    const existing = lessonComments.get(lesson.lessonId);
    if (existing) {
      setSelectedLessonComment(existing);
      return;
    }
    setSelectedLessonComment({
      lessonId: lesson.lessonId,
      chapterId,
      lessonTitle: lesson.lessonTitleAr || lesson.lessonTitle,
      chapterTitle,
      message: buildLessonLacunaMessage(lesson.lessonTitleAr || lesson.lessonTitle, lesson.level ?? 0),
      levelBefore: lesson.level ?? 0,
      levelAfter: lesson.level ?? 0,
      createdAt: new Date().toISOString(),
    });
  };

  const chapterSuggestion = selectedChapter
    ? buildChapterSuggestion(selectedChapter.chapterTitle, selectedChapterLessons?.lessons || [])
    : "";

  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero Header */}
      {!parentView && (
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-6 md:p-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-4 ring-white/30 shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xl bg-white text-primary font-bold">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-primary-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs opacity-90">مرحباً بعودتك</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold mt-0.5">{fullName}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge className="bg-white/20 text-primary-foreground border-white/30 hover:bg-white/30">
                    <GraduationCap className="h-3 w-3 ml-1" />
                    {SCHOOL_LEVELS[profile.school_level || ""] || "—"}
                  </Badge>
                  {streak > 0 && (
                    <Badge className="bg-amber-400/90 text-amber-950 border-0 hover:bg-amber-400">
                      <Zap className="h-3 w-3 ml-1" />
                      سلسلة {streak}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-primary-foreground/90 text-left">
                <p className="text-[10px] opacity-75">آخر تحديث</p>
                <p className="text-xs font-medium">
                  {lastUpdated.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Button
                variant="secondary" size="icon"
                onClick={() => fetchScores()}
                disabled={isRefreshing}
                className="h-9 w-9 bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">نسبة النجاح</p>
            <p className="text-3xl font-bold text-emerald-600">{successRate}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${successRate}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{totalCorrect} إجابة صحيحة</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <TrendingDown className="h-4 w-4 text-red-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">نسبة الخطأ</p>
            <p className="text-3xl font-bold text-red-500">{errorRate}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${errorRate}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{totalErrors} إجابة خاطئة</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${levelInfo.bg}`}>
                <Award className={`h-5 w-5 ${levelInfo.color}`} />
              </div>
              <Zap className={`h-4 w-4 ${levelInfo.color} opacity-60`} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">المستوى الحالي</p>
            <p className={`text-3xl font-bold ${levelInfo.color}`}>{avgLevel}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avgLevel}%`, backgroundColor: levelInfo.ring }} />
            </div>
            <Badge variant="outline" className={`mt-2 text-[10px] ${levelInfo.color} border-current py-0`}>{levelInfo.label}</Badge>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <Activity className="h-4 w-4 text-blue-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">وقت الدراسة</p>
            <p className="text-3xl font-bold text-blue-600">{formatTime(totalTime)}</p>
            <p className="text-[10px] text-muted-foreground mt-3">{totalAnswers} إجابة إجمالية</p>
          </CardContent>
        </Card>
      </div>

      {/* أداؤك الإجمالي (الشبكة) + الذكاء الاصطناعي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              أداؤك الإجمالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="min-h-[360px] w-full max-w-3xl" dir="ltr">
                {chapterRadarData.length === 0 ? (
                  <div className="flex h-[360px] flex-col items-center justify-center text-center text-muted-foreground">
                    <Target className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">لا توجد فصول لعرضها بعد</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={360}>
                    <RadarChart data={chapterRadarData} outerRadius="72%">
                      <PolarGrid stroke="hsl(var(--border))" radialLines />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <PolarAngleAxis dataKey="chapter" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }} />
                      <Radar name="التقدم" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.22} strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!hideActions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-between gap-2 group" onClick={() => navigate("/liste-cours")}>
                  <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> فتح دروسي</span>
                  <ChevronRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                </Button>
                <Button variant="outline" className="w-full justify-between gap-2 group" onClick={() => navigate("/exams?niveau=terminale&subject=math")}>
                  <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> إجراء اختبار</span>
                  <ChevronRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                </Button>
              </CardContent>
            </Card>
          )}
          {!parentView && <AICommentsCard userId={userId} />}
        </div>
      </div>

      {/* اختيار الفصل */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-l from-blue-500/10 via-blue-500/5 to-transparent border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            اختر فصلاً
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {chapterStats.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد فصول متاحة بعد.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chapterStats.map((ch) => {
                const isActive = ch.chapterId === selectedChapter?.chapterId;
                const hasNotif = chapterHasNotification(ch.chapterId);
                return (
                  <button
                    key={ch.chapterId}
                    type="button"
                    onClick={() => setSelectedChapterId(ch.chapterId)}
                    className={`relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card hover:bg-accent/50 border-border"
                    }`}
                  >
                    {ch.chapterTitle}
                    {hasNotif && (
                      <span className="absolute -top-1.5 -left-1.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* لوحة الفصل المختار */}
      {selectedChapter && (
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-5 md:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-lg font-bold">{selectedChapter.chapterTitle}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {SCHOOL_LEVELS[profile.school_level || ""] || ""}
                </p>
              </div>
              <Badge className={`${getLevelInfo(selectedChapter.level).bg} ${getLevelInfo(selectedChapter.level).color} border-0`}>
                <Award className="h-3 w-3 ml-1" />
                {getLevelInfo(selectedChapter.level).label}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600" /> الوقت: {formatTime(selectedChapter.totalTime)}
              </div>
              <div className="rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" /> المستوى: {selectedChapter.level}/100
              </div>
              <div className="rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> الدروس: {selectedChapterLessons?.completedLessons || 0}/{selectedChapterLessons?.totalLessons || 0}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-violet-600" />
                دروس الفصل (التقدم حسب مستواك)
              </h4>
              {(!selectedChapterLessons || selectedChapterLessons.lessons.length === 0) ? (
                <p className="text-xs text-muted-foreground py-2">لا توجد دروس في هذا الفصل.</p>
              ) : (
                <div className="space-y-3">
                  {selectedChapterLessons.lessons.map((lesson) => {
                    const level = lesson.level ?? 0;
                    const info = getLevelInfo(level);
                    const hasNotif = lessonHasNotification(lesson.lessonId, lesson.level);
                    return (
                      <div key={lesson.lessonId} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {hasNotif && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (parentView) {
                                      openLessonComment(lesson, selectedChapter.chapterId, selectedChapter.chapterTitle);
                                    } else {
                                      navigate(`/remediation?lecon=${lesson.lessonId}&chapitre=${selectedChapter.chapterId}`);
                                    }
                                  }}
                                  className="relative flex h-2.5 w-2.5 shrink-0"
                                  title="معالجة الثغرات بتمارين موجّهة"
                                >
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(`/cours/math?chapitre=${selectedChapter.chapterId}&lecon=${lesson.lessonId}`)}
                                className="text-sm font-medium truncate hover:text-primary text-right min-w-0"
                              >
                                <span className="truncate">{lesson.lessonTitleAr || lesson.lessonTitle}</span>
                              </button>
                            </div>
                            <span className={`text-xs font-bold shrink-0 ${info.color}`}>{level}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${level}%`, backgroundColor: info.ring }} />
                          </div>
                        </div>
                        {hasNotif && (
                          <button
                            type="button"
                            onClick={() => {
                              if (parentView) {
                                openLessonComment(lesson, selectedChapter.chapterId, selectedChapter.chapterTitle);
                              } else {
                                navigate(`/remediation?lecon=${lesson.lessonId}&chapitre=${selectedChapter.chapterId}`);
                              }
                            }}
                            className="shrink-0 h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors relative"
                            title="معالجة الثغرات بتمارين موجّهة"
                          >
                            <Bell className="h-4 w-4 text-red-500" />
                            <span className="absolute -top-0.5 -left-0.5 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700 mb-1">اقتراح الذكاء الاصطناعي</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{chapterSuggestion}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* نافذة تعليق الذكاء الاصطناعي للدرس */}
      <Dialog open={!!selectedLessonComment} onOpenChange={(o) => !o && setSelectedLessonComment(null)}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              تعليق الذكاء الاصطناعي
            </DialogTitle>
            <DialogDescription className="text-right">
              {selectedLessonComment?.lessonTitle} {selectedLessonComment?.chapterTitle ? `— ${selectedLessonComment.chapterTitle}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedLessonComment && (
            <div className="space-y-4">
              <div className="ai-comment-markdown rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-5 text-sm leading-relaxed">
                <style>{`
                  .ai-comment-markdown h3 { font-size: 1rem; font-weight: 700; color: hsl(var(--primary)); margin: 0.9rem 0 0.5rem; padding-bottom: 0.3rem; border-bottom: 1px solid hsl(var(--border)); }
                  .ai-comment-markdown h4 { font-size: 0.95rem; font-weight: 700; margin: 0.8rem 0 0.4rem; padding: 0.35rem 0.6rem; background: hsl(var(--muted)); border-right: 3px solid hsl(var(--primary)); border-radius: 4px; }
                  .ai-comment-markdown p { margin: 0.45rem 0; line-height: 1.8; }
                  .ai-comment-markdown strong { color: hsl(var(--primary)); font-weight: 700; }
                  .ai-comment-markdown ul, .ai-comment-markdown ol { margin: 0.4rem 1.5rem 0.4rem 0; padding-right: 1rem; }
                  .ai-comment-markdown li { margin: 0.2rem 0; }
                  .ai-comment-markdown .katex-display { margin: 0.6rem 0; padding: 0.6rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 6px; overflow-x: auto; }
                `}</style>
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {selectedLessonComment.message}
                </ReactMarkdown>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    navigate(`/cours/math?chapitre=${selectedLessonComment.chapterId || ""}&lecon=${selectedLessonComment.lessonId}`);
                    setSelectedLessonComment(null);
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5 ml-1" />
                  اذهب إلى الدرس
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
