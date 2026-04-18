import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Clock, Target, TrendingUp, TrendingDown, GraduationCap, BookOpen, Brain, FileText,
  CheckCircle2, XCircle, Zap, RefreshCw, Activity, Sparkles, Award, ChevronRight,
} from "lucide-react";

interface StudentDashboardContentProps {
  userId: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    school_level: string | null;
    email: string | null;
  };
  hideActions?: boolean;
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
          .select("id, title, title_ar, order_index")
          .eq("school_level", profile.school_level as any)
          .order("order_index", { ascending: true })
        : Promise.resolve({ data: [] as any[] });

      const [{ data }, { data: levelChapters }] = await Promise.all([scoresPromise, chaptersPromise]);

      const chapterIds = (levelChapters || []).map((ch: any) => ch.id);
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
      (levelChapters || []).forEach((ch: any) => {
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
      let sumCorrect = 0, sumTotal = 0, sumLevel = 0, maxStreak = 0;

      (data || []).forEach((s: any) => {
        const cId = s.chapter_id;
        if (!cId) {
          // Skip score rows not linked to a chapter in chapter details table.
          totalReadTime += s.reading_time_seconds || 0;
          totalQuizTime += s.quiz_time_seconds || 0;
          totalExTime += s.exercise_time_seconds || 0;
          sumCorrect += s.correct_answers || 0;
          sumTotal += s.total_answers || 0;
          sumLevel += s.current_level || 0;
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
        existing.level = s.current_level || existing.level;
        existing.correctAnswers += s.correct_answers || 0;
        existing.totalAnswers += s.total_answers || 0;
        chapterMap.set(cId, existing);
        totalReadTime += s.reading_time_seconds || 0;
        totalQuizTime += s.quiz_time_seconds || 0;
        totalExTime += s.exercise_time_seconds || 0;
        sumCorrect += s.correct_answers || 0;
        sumTotal += s.total_answers || 0;
        sumLevel += s.current_level || 0;
        if ((s.streak || 0) > maxStreak) maxStreak = s.streak;
      });

      setChapterStats(Array.from(chapterMap.values()));
      setActivityBreakdown({ reading: totalReadTime, quiz: totalQuizTime, exercise: totalExTime });
      setTotalTime(totalReadTime + totalQuizTime + totalExTime);
      setTotalCorrect(sumCorrect);
      setTotalAnswers(sumTotal);
      setAvgLevel((data || []).length > 0 ? Math.round(sumLevel / (data || []).length) : 0);
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
        const current = scoreRowsByLesson.get(row.lesson_id) || [];
        current.push(row);
        scoreRowsByLesson.set(row.lesson_id, current);
      });

      const chapterProgressMap = new Map<string, ChapterLessonProgress>();
      (levelChapters || []).forEach((ch: any) => {
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

        rows.forEach((r: any) => {
          readingSeconds += r.reading_time_seconds || 0;
          correctAnswers += r.correct_answers || 0;
          totalLessonAnswers += r.total_answers || 0;

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
  }, [userId, profile.school_level]);

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

  // Level ring
  const ringRadius = 56;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (avgLevel / 100) * ringCircumference;

  // Success ring
  const sRingRadius = 40;
  const sRingCircumference = 2 * Math.PI * sRingRadius;
  const sRingOffset = sRingCircumference - (successRate / 100) * sRingCircumference;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">مرحباً {profile.first_name || fullName} 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">لوحة المتابعة الدراسية</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Button
            variant="ghost" size="icon"
            onClick={() => fetchScores()}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Success Rate */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-emerald-600">{successRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">نسبة النجاح</p>
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${successRate}%` }} />
            </div>
            <p className="text-[10px] text-emerald-600 mt-1">{totalCorrect} إجابة صحيحة</p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-2xl font-bold text-red-500">{errorRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">نسبة الخطأ</p>
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${errorRate}%` }} />
            </div>
            <p className="text-[10px] text-red-500 mt-1">{totalErrors} إجابة خاطئة</p>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card className={`${levelInfo.border} ${levelInfo.bg}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${levelInfo.bg}`}>
                <Zap className={`h-4 w-4 ${levelInfo.color}`} />
              </div>
              <span className={`text-2xl font-bold ${levelInfo.color}`}>{avgLevel}%</span>
            </div>
            <p className="text-xs text-muted-foreground">المستوى الحالي</p>
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avgLevel}%`, backgroundColor: levelInfo.ring }} />
            </div>
            <Badge variant="outline" className={`mt-1 text-[10px] ${levelInfo.color} border-current`}>{levelInfo.label}</Badge>
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{formatTime(totalTime)}</span>
            </div>
            <p className="text-xs text-muted-foreground">وقت الدراسة</p>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] text-blue-600">{totalAnswers} إجابة إجمالية</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] text-amber-600">سلسلة: {streak}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Overview: Level Ring + Success/Error Ring */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                نظرة عامة على الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level Ring */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r={ringRadius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
                      <circle
                        cx="70" cy="70" r={ringRadius} fill="none"
                        stroke={levelInfo.ring} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        transform="rotate(-90 70 70)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${levelInfo.color}`}>{avgLevel}%</span>
                      <span className="text-[10px] text-muted-foreground">المستوى العام</span>
                    </div>
                  </div>
                  <Badge className={`mt-3 ${levelInfo.bg} ${levelInfo.color} border-0`}>{levelInfo.label}</Badge>
                </div>

                {/* Success/Error Breakdown */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center gap-6">
                    {/* Success mini ring */}
                    <div className="relative">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r={sRingRadius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
                        <circle
                          cx="48" cy="48" r={sRingRadius} fill="none"
                          stroke="hsl(152, 60%, 45%)" strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={sRingCircumference}
                          strokeDashoffset={sRingOffset}
                          transform="rotate(-90 48 48)"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-emerald-600">{successRate}%</span>
                        <span className="text-[8px] text-muted-foreground">نجاح</span>
                      </div>
                    </div>

                    {/* Error mini ring */}
                    <div className="relative">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r={sRingRadius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
                        <circle
                          cx="48" cy="48" r={sRingRadius} fill="none"
                          stroke="hsl(0, 70%, 55%)" strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={sRingCircumference}
                          strokeDashoffset={sRingCircumference - (errorRate / 100) * sRingCircumference}
                          transform="rotate(-90 48 48)"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-red-500">{errorRate}%</span>
                        <span className="text-[8px] text-muted-foreground">خطأ</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">{totalCorrect} صحيحة من {totalAnswers} إجابة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                توزيع النشاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "قراءة الدروس", icon: BookOpen, pct: readPct, color: "bg-blue-500", textColor: "text-blue-600", time: activityBreakdown.reading },
                  { label: "اختبارات", icon: Brain, pct: quizPct, color: "bg-violet-500", textColor: "text-violet-600", time: activityBreakdown.quiz },
                  { label: "تمارين", icon: FileText, pct: exPct, color: "bg-amber-500", textColor: "text-amber-600", time: activityBreakdown.exercise },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <item.icon className={`h-4 w-4 ${item.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.pct}% — {formatTime(item.time)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chapter Details Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                تفاصيل حسب الفصل
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">#</TableHead>
                        <TableHead className="text-right">الفصل</TableHead>
                        <TableHead className="text-right">الوقت</TableHead>
                        <TableHead className="text-right">نسبة النجاح</TableHead>
                        <TableHead className="text-right">المستوى</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chapterStats.map((ch, i) => {
                        const chLevel = getLevelInfo(ch.level);
                        const chapterLessons = chapterLessonProgress.find((chapter) => chapter.chapterId === ch.chapterId);
                        const chSuccess = chapterLessons && chapterLessons.totalLessons > 0
                          ? Math.round((chapterLessons.completedLessons / chapterLessons.totalLessons) * 100)
                          : 0;
                        return (
                          <TableRow key={ch.chapterId}>
                            <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{ch.chapterTitle}</TableCell>
                            <TableCell className="text-sm">{formatTime(ch.totalTime)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${chSuccess}%` }} />
                                </div>
                                <span className="text-xs">{chSuccess}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${chLevel.color} border-current text-xs`}>{chLevel.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clickable Chapter -> Lesson Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                تقدم الدروس داخل كل فصل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chapterLessonProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">لا توجد دروس متاحة لهذا المستوى بعد.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {chapterLessonProgress.map((chapter) => (
                    <AccordionItem key={chapter.chapterId} value={chapter.chapterId}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pl-4">
                          <div className="text-right">
                            <p className="font-medium">{chapter.chapterTitle}</p>
                            <p className="text-xs text-muted-foreground">{chapter.completedLessons}/{chapter.totalLessons} دروس منتهية</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {chapter.totalLessons > 0 ? Math.round((chapter.completedLessons / chapter.totalLessons) * 100) : 0}%
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {chapter.lessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">لا توجد دروس داخل هذا الفصل.</p>
                        ) : (
                          <div className="space-y-2">
                            {chapter.lessons.map((lesson) => (
                              <button
                                key={lesson.lessonId}
                                type="button"
                                onClick={() => navigate(`/cours/math?chapitre=${chapter.chapterId}&lecon=${lesson.lessonId}`)}
                                className="w-full border rounded-lg p-3 hover:bg-accent/30 transition-colors text-right"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div>
                                    <p className="font-medium">{lesson.lessonTitleAr || lesson.lessonTitle}</p>
                                    <p className="text-xs text-muted-foreground">{lesson.lessonTitle}</p>
                                  </div>
                                  {getLessonStatusBadge(lesson.status)}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="bg-muted/40 rounded px-2 py-1">القراءة: {formatTime(lesson.readingSeconds)}</div>
                                  <div className="bg-muted/40 rounded px-2 py-1">تمارين: {lesson.exercisesDone}/{lesson.exercisesTotal} ({lesson.exercisesRate}%)</div>
                                  <div className="bg-muted/40 rounded px-2 py-1">اختبارات: {lesson.quizzesDone}/{lesson.quizzesTotal} ({lesson.quizzesRate}%)</div>
                                  <div className="bg-muted/40 rounded px-2 py-1">نجاح عام: {lesson.overallRate}%</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-6 pb-4 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-background shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg text-foreground">{fullName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
              <Badge variant="outline" className="mt-2">
                {SCHOOL_LEVELS[profile.school_level || ""] || profile.school_level || "—"}
              </Badge>
            </div>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ملخص الأداء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> إجابات صحيحة
                </span>
                <span className="text-sm font-bold text-emerald-600">{totalCorrect}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-500" /> إجابات خاطئة
                </span>
                <span className="text-sm font-bold text-red-500">{totalErrors}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> إجمالي الإجابات
                </span>
                <span className="text-sm font-bold">{totalAnswers}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> نسبة النجاح
                </span>
                <span className="text-sm font-bold text-emerald-600">{successRate}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" /> نسبة الخطأ
                </span>
                <span className="text-sm font-bold text-red-500">{errorRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {!hideActions && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start gap-2" onClick={() => navigate("/liste-cours")}>
                  <BookOpen className="h-4 w-4" /> فتح دروسي
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/liste-cours")}>
                  <Brain className="h-4 w-4" /> إجراء اختبار
                </Button>
                <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate("/liste-cours")}>
                  <FileText className="h-4 w-4" /> مراجعة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
