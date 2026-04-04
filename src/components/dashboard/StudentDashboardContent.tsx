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
  advanced: { label: "متقدم", color: "bg-primary text-primary-foreground" },
  intermediate: { label: "متوسط", color: "bg-accent text-accent-foreground" },
  beginner: { label: "مبتدئ", color: "bg-secondary text-secondary-foreground" },
  needs_work: { label: "يحتاج عمل", color: "bg-destructive text-destructive-foreground" },
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

  useEffect(() => { fetchScores(); }, [userId]);

  const fetchScores = async () => {
    const { data } = await supabase
      .from("student_scores")
      .select("*, chapter:chapters(title, title_ar)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: true });

    if (!data || data.length === 0) return;

    const chapterMap = new Map<string, ChapterStat>();
    let totalReadTime = 0, totalQuizTime = 0, totalExTime = 0;

    data.forEach((s: any) => {
      const cId = s.chapter_id || "unknown";
      const existing = chapterMap.get(cId) || {
        chapterId: cId,
        chapterTitle: s.chapter?.title_ar || s.chapter?.title || "—",
        totalTime: 0, quizAccuracy: 0, exerciseAccuracy: 0, level: 0,
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

    const total = totalReadTime + totalQuizTime + totalExTime;
    setTotalTime(total);
    const totalAns = data.reduce((s: number, d: any) => s + (d.total_answers || 0), 0);
    setTotalAnswers(totalAns);
    const acc = Math.round(data.reduce((s: number, d: any) => s + Number(d.accuracy_rate || 0), 0) / data.length);
    setAvgAccuracy(acc);
    const lvl = Math.round(data.reduce((s: number, d: any) => s + (d.current_level || 0), 0) / data.length);
    setAvgLevel(lvl);
  };

  // SVG chart helpers
  const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 1);
  const chartW = 600;
  const chartH = 180;
  const padding = 30;
  const plotW = chartW - padding * 2;
  const plotH = chartH - padding * 2;
  const barWidth = plotW / Math.max(dailyData.length, 1) * 0.6;
  const barGap = plotW / Math.max(dailyData.length, 1) * 0.4;

  const totalActivity = activityBreakdown.reading + activityBreakdown.quiz + activityBreakdown.exercise || 1;
  const readPct = Math.round((activityBreakdown.reading / totalActivity) * 100);
  const quizPct = Math.round((activityBreakdown.quiz / totalActivity) * 100);
  const exPct = 100 - readPct - quizPct;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinutes = dailyData.find(d => d.date === todayStr)?.minutes || 0;
  const engagementPct = Math.min(100, Math.round((todayMinutes / 60) * 100));
  const avgPerDay = dailyData.length > 0 ? Math.round(dailyData.reduce((s, d) => s + d.minutes, 0) / dailyData.length) : 0;

  // Level ring SVG
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (avgLevel / 100) * ringCircumference;

  const stats = [
    { icon: Clock, label: "وقت الدراسة", value: formatTime(totalTime), color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "متوسط يومي", value: `${avgPerDay} min`, color: "text-accent", bg: "bg-accent/10" },
    { icon: Target, label: "دقة الإجابات", value: `${avgAccuracy}%`, color: "text-primary", bg: "bg-primary/10" },
    { icon: GraduationCap, label: "المستوى", value: SCHOOL_LEVELS[profile.school_level || ""] || "—", color: "text-muted-foreground", bg: "bg-muted" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome + Stats */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 pb-2">
            <h2 className="text-2xl font-bold text-foreground">مرحباً {profile.first_name || fullName} 👋</h2>
            <p className="text-sm text-muted-foreground mt-1">ملخص نشاطك التعليمي</p>
          </div>
          <CardContent className="p-6 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
                  <div className={`p-2.5 rounded-lg ${s.bg} mb-2`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolution & Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              التطور والتوزيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">الوقت (دقائق) — آخر 14 يوماً</p>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" style={{ maxHeight: 200 }}>
                  {/* Grid */}
                  {[0, 0.5, 1].map(f => {
                    const y = padding + plotH - f * plotH;
                    return (
                      <g key={f}>
                        <line x1={padding} y1={y} x2={padding + plotW} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />
                        <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{Math.round(maxMinutes * f)}</text>
                      </g>
                    );
                  })}
                  {/* Bars */}
                  {dailyData.map((d, i) => {
                    const x = padding + i * (plotW / dailyData.length) + barGap / 2;
                    const barH = (d.minutes / maxMinutes) * plotH;
                    const y = padding + plotH - barH;
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width={barWidth} height={barH} rx={3} fill="hsl(var(--primary))" opacity={d.date === todayStr ? 1 : 0.6} />
                        {i % 2 === 0 && (
                          <text x={x + barWidth / 2} y={chartH - 4} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">
                            {d.date.slice(8)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Activity + Level Ring */}
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">توزيع النشاط</p>
                <div className="space-y-3">
                  {[
                    { label: "قراءة الدروس", icon: BookOpen, pct: readPct, color: "bg-primary" },
                    { label: "اسئله متعدده الاختيارات", icon: Brain, pct: quizPct, color: "bg-accent" },
                    { label: "تمارين", icon: FileText, pct: exPct, color: "bg-muted-foreground/50" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5"><item.icon className="h-3 w-3" /> {item.label}</span>
                        <span className="text-muted-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Level Ring */}
                <div className="flex items-center justify-center pt-2">
                  <div className="relative">
                    <svg width="130" height="130" viewBox="0 0 130 130">
                      <circle cx="65" cy="65" r={ringRadius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
                      <circle
                        cx="65" cy="65" r={ringRadius} fill="none"
                        stroke="hsl(var(--primary))" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        transform="rotate(-90 65 65)"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{avgLevel}%</span>
                      <span className="text-[10px] text-muted-foreground">المستوى العام</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">تفاصيل حسب الفصل</CardTitle>
          </CardHeader>
          <CardContent>
            {chapterStats.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">لا توجد بيانات بعد. ابدأ بدراسة الدروس!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>الفصل</TableHead>
                      <TableHead>الوقت</TableHead>
                      <TableHead>اختبار</TableHead>
                      <TableHead>تمارين</TableHead>
                      <TableHead>المستوى</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapterStats.map((ch, i) => {
                      const badge = getLevelBadge(ch.level);
                      return (
                        <TableRow key={ch.chapterId}>
                          <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{ch.chapterTitle}</TableCell>
                          <TableCell className="text-sm">{formatTime(ch.totalTime)}</TableCell>
                          <TableCell className="text-sm">{ch.quizAccuracy}%</TableCell>
                          <TableCell className="text-sm">{ch.exerciseAccuracy}%</TableCell>
                          <TableCell>
                            <Badge className={`${badge.color} text-xs`}>{badge.label}</Badge>
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
          <CardContent className="p-5">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>التفاعل اليومي</span>
              <span>{todayMinutes} / 60 min</span>
            </div>
            <Progress value={engagementPct} className="h-2.5" />
            <p className="text-[10px] text-muted-foreground mt-1 text-center">الهدف: 1 ساعة يومياً</p>
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

        {/* Total Answers */}
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-primary">{totalAnswers}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الإجابات</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
