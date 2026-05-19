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
  CheckCircle2, XCircle, Zap, RefreshCw, Activity, Sparkles, Award, ChevronRight,
} from "lucide-react";
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

const REFRESH_INTERVAL = 30000; // 30s auto-refresh

const makeUniqueChapterKey = (chapter: { title?: string | null; title_ar?: string | null; order_index?: number | null }) =>
  `${chapter.order_index ?? ""}|${(chapter.title_ar || chapter.title || "").replace(/\s+/g, " ").trim()}`;

export default function StudentDashboardContent({ userId, profile, hideActions }: StudentDashboardContentProps) {
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

  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero Header */}
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

      {/* Tabbed detailed sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-gradient-to-r from-secondary/60 via-secondary to-secondary/60 rounded-2xl shadow-inner gap-1.5">
          <TabsTrigger
            value="overview"
            className="group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 data-[state=active]:scale-[1.02] hover:bg-background/60"
          >
            <Target className="h-4 w-4 transition-transform group-data-[state=active]:rotate-12" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger
            value="chapters"
            className="group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:scale-[1.02] hover:bg-background/60"
          >
            <BookOpen className="h-4 w-4 transition-transform group-data-[state=active]:rotate-12" />
            <span>الفصول</span>
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 data-[state=active]:scale-[1.02] hover:bg-background/60"
          >
            <GraduationCap className="h-4 w-4 transition-transform group-data-[state=active]:rotate-12" />
            <span>الدروس</span>
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance rings */}
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
                          <PolarAngleAxis
                            dataKey="chapter"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
                          />
                          <Radar
                            name="التقدم"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.22}
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions sidebar */}
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
                    <Button variant="secondary" className="w-full justify-between gap-2 group" onClick={() => navigate("/liste-cours")}>
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> مراجعة</span>
                      <ChevronRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              <AICommentsCard userId={userId} />
            </div>
          </div>

        </TabsContent>

        {/* CHAPTERS TAB */}
        <TabsContent value="chapters" className="mt-6">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-l from-blue-500/10 via-blue-500/5 to-transparent border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                تفاصيل حسب الفصل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {chapterStats.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">لا توجد بيانات بعد. ابدأ بدراسة الدروس!</p>
                  {!hideActions && (
                    <Button className="mt-4" onClick={() => navigate("/liste-cours")}>
                      <BookOpen className="h-4 w-4 ml-2" /> ابدأ الآن
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapterStats.map((ch, i) => {
                    const chLevel = getLevelInfo(ch.level);
                    const chapterLessons = chapterLessonProgress.find((chapter) => chapter.chapterId === ch.chapterId);
                    const chSuccess = chapterLessons && chapterLessons.totalLessons > 0
                      ? Math.round((chapterLessons.completedLessons / chapterLessons.totalLessons) * 100)
                      : 0;
                    const completionPct = chSuccess;
                    return (
                      <div
                        key={ch.chapterId}
                        className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: chLevel.ring }} />
                        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: chLevel.ring }} />

                        <div className="relative p-4 md:p-5">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center font-bold text-primary text-sm border border-primary/10">
                                {String(i + 1).padStart(2, '0')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm md:text-base leading-tight truncate">{ch.chapterTitle}</h3>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(ch.totalTime)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${chLevel.bg} ${chLevel.color} border-0 shrink-0`}>
                              <Award className="h-3 w-3 ml-1" />
                              {chLevel.label}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                نسبة النجاح
                              </span>
                              <span className="font-bold text-emerald-600">{chSuccess}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                                style={{ width: `${chSuccess}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3 text-primary" />
                                التقدم
                              </span>
                              <span className="font-bold text-primary">
                                {chapterLessons?.completedLessons || 0}/{chapterLessons?.totalLessons || 0} درس
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-1000"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed">
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-muted-foreground">صحيحة:</span>
                              <span className="font-bold text-emerald-600">{ch.correctAnswers}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-muted-foreground">المجموع:</span>
                              <span className="font-bold">{ch.totalAnswers}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LESSONS TAB */}
        <TabsContent value="lessons" className="mt-6">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-l from-violet-500/10 via-violet-500/5 to-transparent border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-md shadow-violet-500/30">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                تقدم الدروس داخل كل فصل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {chapterLessonProgress.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">لا توجد دروس متاحة لهذا المستوى بعد.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {chapterLessonProgress.map((chapter, idx) => {
                    const pct = chapter.totalLessons > 0 ? Math.round((chapter.completedLessons / chapter.totalLessons) * 100) : 0;
                    return (
                      <AccordionItem
                        key={chapter.chapterId}
                        value={chapter.chapterId}
                        className="border rounded-2xl overflow-hidden bg-gradient-to-l from-card to-violet-500/[0.03] hover:shadow-md transition-shadow data-[state=open]:shadow-lg data-[state=open]:border-violet-500/30"
                      >
                        <AccordionTrigger className="hover:no-underline px-4 py-3.5 [&[data-state=open]>div>svg]:rotate-180">
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-violet-500/30">
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                              <div className="text-right flex-1 min-w-0">
                                <p className="font-bold text-sm md:text-base truncate">{chapter.chapterTitle}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  {chapter.completedLessons}/{chapter.totalLessons} دروس منتهية
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="hidden sm:block w-20 h-2 rounded-full bg-secondary overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                              <Badge className="bg-violet-500/10 text-violet-700 border-violet-500/20 min-w-[3rem] justify-center font-bold">
                                {pct}%
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {chapter.lessons.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2">لا توجد دروس داخل هذا الفصل.</p>
                          ) : (
                            <div className="space-y-2.5 pt-2 border-t">
                              {chapter.lessons.map((lesson, lessonIdx) => {
                                const statusColor = lesson.status === "completed"
                                  ? "from-emerald-500 to-emerald-600 shadow-emerald-500/30"
                                  : lesson.status === "in_progress"
                                    ? "from-amber-500 to-amber-600 shadow-amber-500/30"
                                    : "from-muted-foreground/40 to-muted-foreground/60 shadow-muted-foreground/20";
                                const overallColor = lesson.overallRate >= 80 ? "text-emerald-600" : lesson.overallRate >= 50 ? "text-amber-600" : "text-muted-foreground";
                                return (
                                  <button
                                    key={lesson.lessonId}
                                    type="button"
                                    onClick={() => navigate(`/cours/math?chapitre=${chapter.chapterId}&lecon=${lesson.lessonId}`)}
                                    className="group w-full border rounded-xl p-3.5 hover:bg-accent/30 hover:border-violet-500/40 hover:shadow-md transition-all text-right relative overflow-hidden"
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${statusColor} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                                          {lessonIdx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-sm truncate">{lesson.lessonTitleAr || lesson.lessonTitle}</p>
                                          <p className="text-[11px] text-muted-foreground truncate">{lesson.lessonTitle}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {getLessonStatusBadge(lesson.status)}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all rtl:rotate-180" />
                                      </div>
                                    </div>

                                    {/* Overall progress bar */}
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span className="text-muted-foreground">التقدم العام</span>
                                        <div className="flex items-center gap-2">
                                          {lesson.level !== null && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-700">
                                              <Brain className="h-3 w-3" />
                                              المستوى {lesson.level}/100
                                            </span>
                                          )}
                                          <span className={`font-bold ${overallColor}`}>{lesson.overallRate}%</span>
                                        </div>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all duration-700" style={{ width: `${lesson.overallRate}%` }} />
                                      </div>
                                    </div>

                                    {/* Stat tiles */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-2">
                                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold mb-1">
                                          <BookOpen className="h-3 w-3" /> القراءة
                                        </div>
                                        <p className="text-xs font-bold">{formatTime(lesson.readingSeconds)}</p>
                                      </div>
                                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-2">
                                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold mb-1">
                                          <FileText className="h-3 w-3" /> تمارين
                                        </div>
                                        <p className="text-xs font-bold">{lesson.exercisesDone}/{lesson.exercisesTotal}</p>
                                        <div className="h-1 rounded-full bg-secondary overflow-hidden mt-1">
                                          <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${lesson.exercisesRate}%` }} />
                                        </div>
                                      </div>
                                      <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-2">
                                        <div className="flex items-center gap-1 text-[10px] text-violet-600 font-semibold mb-1">
                                          <Brain className="h-3 w-3" /> اختبارات
                                        </div>
                                        <p className="text-xs font-bold">{lesson.quizzesDone}/{lesson.quizzesTotal}</p>
                                        <div className="h-1 rounded-full bg-secondary overflow-hidden mt-1">
                                          <div className="h-full bg-violet-500 transition-all duration-700" style={{ width: `${lesson.quizzesRate}%` }} />
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
