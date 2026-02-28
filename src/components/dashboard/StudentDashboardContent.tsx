import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Clock, Target, TrendingUp, GraduationCap, BookOpen, Brain, FileText,
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
  /** Hide course access buttons (for parent view) */
  hideActions?: boolean;
}

interface ChapterStat {
  chapterId: string;
  chapterTitle: string;
  totalTime: number;
  quizAccuracy: number;
  exerciseAccuracy: number;
  level: number;
}

interface DayEntry {
  date: string;
  minutes: number;
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  advanced: { label: "متقدم / Avancé", color: "bg-primary text-primary-foreground" },
  intermediate: { label: "متوسط / Intermédiaire", color: "bg-accent text-accent-foreground" },
  beginner: { label: "مبتدئ / Débutant", color: "bg-secondary text-secondary-foreground" },
  needs_work: { label: "يحتاج عمل / À travailler", color: "bg-destructive text-destructive-foreground" },
};

function getLevelBadge(accuracy: number) {
  if (accuracy >= 80) return LEVEL_LABELS.advanced;
  if (accuracy >= 60) return LEVEL_LABELS.intermediate;
  if (accuracy >= 35) return LEVEL_LABELS.beginner;
  return LEVEL_LABELS.needs_work;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
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

export default function StudentDashboardContent({ userId, profile, hideActions }: StudentDashboardContentProps) {
  const navigate = useNavigate();
  const [chapterStats, setChapterStats] = useState<ChapterStat[]>([]);
  const [dailyData, setDailyData] = useState<DayEntry[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [avgLevel, setAvgLevel] = useState(0);
  const [activityBreakdown, setActivityBreakdown] = useState({ reading: 0, quiz: 0, exercise: 0 });

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Utilisateur";

  useEffect(() => {
    fetchScores();
  }, [userId]);

  const fetchScores = async () => {
    const { data } = await supabase
      .from("student_scores")
      .select("*, chapter:chapters(title, title_ar)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: true });

    if (!data || data.length === 0) return;

    // Aggregate per chapter
    const chapterMap = new Map<string, ChapterStat>();
    let totalReadTime = 0, totalQuizTime = 0, totalExTime = 0;

    data.forEach((s: any) => {
      const cId = s.chapter_id || "unknown";
      const existing = chapterMap.get(cId) || {
        chapterId: cId,
        chapterTitle: s.chapter?.title_ar || s.chapter?.title || "—",
        totalTime: 0,
        quizAccuracy: 0,
        exerciseAccuracy: 0,
        level: 0,
      };
      existing.totalTime += (s.reading_time_seconds || 0) + (s.quiz_time_seconds || 0) + (s.exercise_time_seconds || 0);
      existing.quizAccuracy = Number(s.accuracy_rate) || existing.quizAccuracy;
      existing.exerciseAccuracy = Number(s.accuracy_rate) || existing.exerciseAccuracy;
      existing.level = s.current_level;
      chapterMap.set(cId, existing);

      totalReadTime += s.reading_time_seconds || 0;
      totalQuizTime += s.quiz_time_seconds || 0;
      totalExTime += s.exercise_time_seconds || 0;
    });

    setChapterStats(Array.from(chapterMap.values()));
    setActivityBreakdown({ reading: totalReadTime, quiz: totalQuizTime, exercise: totalExTime });

    // Daily aggregation (last 14 days)
    const now = new Date();
    const dayMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    data.forEach((s: any) => {
      const day = s.updated_at?.slice(0, 10);
      if (day && dayMap.has(day)) {
        dayMap.set(day, (dayMap.get(day) || 0) + (s.reading_time_seconds || 0) + (s.quiz_time_seconds || 0) + (s.exercise_time_seconds || 0));
      }
    });
    setDailyData(Array.from(dayMap.entries()).map(([date, seconds]) => ({ date, minutes: Math.round(seconds / 60) })));

    // Overall stats
    const total = totalReadTime + totalQuizTime + totalExTime;
    setTotalTime(total);
    const totalAns = data.reduce((s: number, d: any) => s + (d.total_answers || 0), 0);
    setTotalAnswers(totalAns);
    const acc = Math.round(data.reduce((s: number, d: any) => s + Number(d.accuracy_rate || 0), 0) / data.length);
    setAvgAccuracy(acc);
    const lvl = Math.round(data.reduce((s: number, d: any) => s + (d.current_level || 0), 0) / data.length);
    setAvgLevel(lvl);
  };

  // SVG chart helper
  const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 1);
  const chartW = 600;
  const chartH = 200;
  const padding = 30;
  const plotW = chartW - padding * 2;
  const plotH = chartH - padding * 2;

  const points = dailyData.map((d, i) => {
    const x = padding + (i / Math.max(dailyData.length - 1, 1)) * plotW;
    const y = padding + plotH - (d.minutes / maxMinutes) * plotH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${padding + plotH} L ${points[0]?.x || 0} ${padding + plotH} Z`;

  const totalActivity = activityBreakdown.reading + activityBreakdown.quiz + activityBreakdown.exercise || 1;
  const readPct = Math.round((activityBreakdown.reading / totalActivity) * 100);
  const quizPct = Math.round((activityBreakdown.quiz / totalActivity) * 100);
  const exPct = 100 - readPct - quizPct;

  // Engagement: target 1h/day, calculate today's time
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinutes = dailyData.find(d => d.date === todayStr)?.minutes || 0;
  const engagementPct = Math.min(100, Math.round((todayMinutes / 60) * 100));

  const avgPerDay = dailyData.length > 0 ? Math.round(dailyData.reduce((s, d) => s + d.minutes, 0) / dailyData.length) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - 2/3 */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">مرحباً {profile.first_name || fullName} 👋</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{formatTime(totalTime)}</p>
                  <p className="text-xs text-muted-foreground">وقت الدراسة الإجمالي</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                <div className="p-2 rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{avgPerDay} min</p>
                  <p className="text-xs text-muted-foreground">متوسط يومي</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{avgAccuracy}%</p>
                  <p className="text-xs text-muted-foreground">دقة الإجابات</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
                <div className="p-2 rounded-lg bg-muted">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{SCHOOL_LEVELS[profile.school_level || ""] || profile.school_level || "—"}</p>
                  <p className="text-xs text-muted-foreground">المستوى الدراسي</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evolution & Activity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              التطور والتوزيع - Évolution & répartition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SVG Chart - last 14 days */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">الوقت المستغرق / 14 يوماً الأخيرة</p>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" style={{ maxHeight: 220 }}>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(f => {
                    const y = padding + plotH - f * plotH;
                    return (
                      <g key={f}>
                        <line x1={padding} y1={y} x2={padding + plotW} y2={y} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                        <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">{Math.round(maxMinutes * f)}</text>
                      </g>
                    );
                  })}
                  {/* Area */}
                  {points.length > 1 && (
                    <path d={areaPath} fill="hsl(var(--primary) / 0.1)" />
                  )}
                  {/* Line */}
                  {points.length > 1 && (
                    <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* Dots */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth="2" />
                      {i % 2 === 0 && (
                        <text x={p.x} y={chartH - 5} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
                          {p.date.slice(5)}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* Activity Breakdown */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-3">توزيع النشاط</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-primary" /> قراءة الدروس</span>
                      <span className="text-muted-foreground">{readPct}%</span>
                    </div>
                    <Progress value={readPct} className="h-2.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-accent" /> اختبارات</span>
                      <span className="text-muted-foreground">{quizPct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${quizPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> تمارين</span>
                      <span className="text-muted-foreground">{exPct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-muted-foreground/40 transition-all" style={{ width: `${exPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Level gauge */}
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-muted-foreground mb-1">المستوى العام</p>
                  <p className="text-3xl font-bold text-primary">{avgLevel}%</p>
                  <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avgLevel}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Details Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تفاصيل حسب الفصل - Détails par chapitre</CardTitle>
          </CardHeader>
          <CardContent>
            {chapterStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد بيانات بعد. ابدأ بدراسة الدروس!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>الفصل</TableHead>
                      <TableHead>الوقت الإجمالي</TableHead>
                      <TableHead>نسبة نجاح الاختبار</TableHead>
                      <TableHead>نسبة نجاح التمارين</TableHead>
                      <TableHead>المستوى</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapterStats.map((ch, i) => {
                      const badge = getLevelBadge(ch.level);
                      return (
                        <TableRow key={ch.chapterId}>
                          <TableCell className="font-medium">{i + 1}</TableCell>
                          <TableCell className="font-medium">{ch.chapterTitle}</TableCell>
                          <TableCell>{formatTime(ch.totalTime)}</TableCell>
                          <TableCell>{ch.quizAccuracy}%</TableCell>
                          <TableCell>{ch.exerciseAccuracy}%</TableCell>
                          <TableCell>
                            <Badge className={badge.color}>{badge.label}</Badge>
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
      </div>

      {/* Sidebar - 1/3 */}
      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge variant="outline" className="mt-2">
              {SCHOOL_LEVELS[profile.school_level || ""] || profile.school_level || "—"}
            </Badge>

            {/* Engagement bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>التفاعل اليومي</span>
                <span>{todayMinutes} min / 60 min</span>
              </div>
              <Progress value={engagementPct} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">الهدف: 1 ساعة يومياً</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {!hideActions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/liste-cours")}>
                <BookOpen className="h-4 w-4" /> فتح دروسي - Ouvrir mes cours
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/liste-cours")}>
                <Brain className="h-4 w-4" /> إجراء اختبار - Faire un quiz
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate("/revision")}>
                <FileText className="h-4 w-4" /> مراجعة - Réviser
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats summary card */}
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">{totalAnswers}</p>
              <p className="text-sm text-muted-foreground">إجمالي الإجابات</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
