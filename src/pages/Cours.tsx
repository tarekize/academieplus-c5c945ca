import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { AdaptiveLessonContent } from "./Cours.AdaptiveLessonContent";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { courseService, Chapter as DBChapter, Lesson as DBLesson } from "@/services/courseService";
import { ChapterMathQuiz, DBQuizQuestion } from "@/components/course/ChapterMathQuiz";
import { ChapterMathExercises, DBExercise } from "@/components/course/ChapterMathExercises";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, MessageCircle, X, BookOpen, Play, PenTool, Brain, Download, Check, Search, BarChart3, FileText, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

import ChatBot from "@/components/ChatBot";
import ITSRecommendations from "@/components/its/ITSRecommendations";
import { ChapterFormDialog, DeleteChapterButton, LessonFormDialog, DeleteLessonButton } from "@/components/course/PedagoCRUD";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Rnd } from 'react-rnd';
import { useIsMobile } from "@/hooks/use-mobile";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Capacitor } from "@capacitor/core";
import { SUBJECTS } from "@/lib/subjects";

// Static subject data dérivée du catalogue partagé (src/lib/subjects.ts)
const staticSubjects: Record<string, { id: string; name: string; icon: string }> =
  Object.fromEntries(SUBJECTS.map((s) => [s.id, { id: s.id, name: s.name, icon: s.icon }]));

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  filiere: string | null;
  email: string | null;
}

interface Lesson {
  id: string;
  title: string;
  titleAr: string;
  content?: string;
}

interface Chapter {
  id: string;
  title: string;
  order_index: number;
  content: string;
  lessons?: Lesson[];
}

const Cours = () => {
  const { subjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const adminNiveau = searchParams.get("niveau");
  const adminFiliere = searchParams.get("filiere");
  const chapitreParam = searchParams.get("chapitre");
  const leconParam = searchParams.get("lecon");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [schoolLevel, setSchoolLevel] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"grid" | "content">("grid");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 400, height: typeof window !== 'undefined' ? window.innerHeight - 120 : 600 });
  const [chatPos, setChatPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0, y: 80 });

  useEffect(() => {
    if (isChatExpanded) {
      setChatSize(prev => ({ ...prev, width: 800 }));
      setChatPos(prev => ({ ...prev, x: Math.max(0, typeof window !== 'undefined' ? window.innerWidth - 820 : 0) }));
    } else {
      setChatSize(prev => ({ ...prev, width: 400 }));
      setChatPos(prev => ({ ...prev, x: Math.max(0, typeof window !== 'undefined' ? window.innerWidth - 420 : 0) }));
    }
  }, [isChatExpanded]);

  const isMobile = useIsMobile();
  const isNativeApp = Capacitor.isNativePlatform();
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; }[]>([]);
  const [chatChapterId, setChatChapterId] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [filiereId, setFiliereId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialLessonId, setInitialLessonId] = useState<string | null>(null);
  const [dbQuizzes, setDbQuizzes] = useState<DBQuizQuestion[]>([]);
  const [dbExercises, setDbExercises] = useState<DBExercise[]>([]);
  const [contentResetKey, setContentResetKey] = useState(0);
  const lastSyncedLessonParamRef = useRef<string | null>(null);

  const subject = subjectId ? staticSubjects[subjectId] || { id: subjectId, name: subjectId, icon: "📖" } : null;

  // Reset chat when chapter changes
  useEffect(() => {
    if (activeChapter) {
      if (chatChapterId !== activeChapter.id) {
        setChatMessages([]);
        setChatChapterId(activeChapter.id);
      }
    }
  }, [activeChapter?.id]);



  const fetchCourse = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, school_level, filiere, email")
        .eq("id", user.id)
        .single();

      setProfile(profileData as Profile | null);

      // Check if user can manage content (admin or pedago)
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roles = rolesData?.map(r => r.role) || [];
      setCanManage(roles.includes("admin") || roles.includes("pedago"));

      // Use admin query params if present, otherwise use profile data
      const effectiveLevel = adminNiveau || profileData?.school_level || "";
      const effectiveFiliere = adminFiliere || (adminNiveau ? null : profileData?.filiere) || null;
      setSchoolLevel(effectiveLevel);

      // Si l'utilisateur n'a pas de niveau scolaire défini et n'est pas admin, marquer pour redirection
      if (!effectiveLevel && !roles.includes("admin") && !roles.includes("pedago")) {
        setNeedsProfileCompletion(true);
        return;
      }

      // Resolve filiere_id for CRUD
      if (effectiveFiliere && effectiveLevel) {
        const { data: fData } = await supabase
          .from("filieres")
          .select("id")
          .eq("code", effectiveFiliere)
          .eq("school_level", effectiveLevel as any)
          .maybeSingle();
        setFiliereId(fData?.id || null);
      }

      // Fetch chapters from database
      if (subjectId && effectiveLevel) {
        const dbChapters = await courseService.getChaptersWithLessons(
          effectiveLevel as any,
          effectiveFiliere,
          subjectId
        );

        if (dbChapters.length > 0) {
          // Map database chapters to component format
          const mappedChapters: Chapter[] = dbChapters.map((ch) => ({
            id: ch.id,
            title: ch.title_ar || ch.title,
            order_index: ch.order_index,
            content: `<h2>${ch.title_ar || ch.title}</h2>${ch.description ? `<p>${ch.description}</p>` : ""}`,
            lessons: ch.lessons.map((l) => ({
              id: l.id,
              title: l.title_ar || l.title,
              titleAr: l.title_ar || l.title,
              content: l.content || "",
            })),
          }));

          setChapters(mappedChapters);
        } else {
          setChapters([]);
          setActiveChapter(null);
          setActiveChapterIndex(0);
        }
      } else {
        setChapters([]);
        setActiveChapter(null);
        setActiveChapterIndex(0);
      }

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: t("cours.errorTitle"),
        description: t("cours.loadError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [subjectId, adminNiveau, adminFiliere, navigate, toast]);

  useEffect(() => {
    if (!chapters.length) return;

    if (!chapitreParam) {
      const freshActiveChapter = activeChapter
        ? chapters.find((chapter) => chapter.id === activeChapter.id)
        : undefined;

      if (!freshActiveChapter) {
        setActiveChapter(chapters[0]);
        setActiveChapterIndex(0);
      } else if (freshActiveChapter !== activeChapter) {
        // Rafraîchit la référence (ex: nouvelle leçon ajoutée) même si l'id n'a pas changé
        setActiveChapter(freshActiveChapter);
      }
      return;
    }

    const targetChapterIndex = chapters.findIndex((chapter) => chapter.id === chapitreParam);
    if (targetChapterIndex === -1) return;

    const targetChapter = chapters[targetChapterIndex];

    if (activeChapter !== targetChapter) {
      setActiveChapter(targetChapter);
    }

    if (activeChapterIndex !== targetChapterIndex) {
      setActiveChapterIndex(targetChapterIndex);
    }

    if (viewMode !== "content") {
      setViewMode("content");
    }

    if (lastSyncedLessonParamRef.current !== leconParam) {
      setInitialLessonId(leconParam);
      lastSyncedLessonParamRef.current = leconParam;
    }
  }, [
    chapters,
    chapitreParam,
    leconParam,
    activeChapter?.id,
    activeChapterIndex,
    viewMode,
  ]);

  // Load quizzes/exercises from DB for a lesson, or chapter-level content when lessonId is null
  const fetchQuizExercises = useCallback(async (lessonId?: string | null) => {
    if (!activeChapter) return;

    const quizzesPromise = supabase.rpc('get_student_quizzes' as any, {
      _chapter_id: activeChapter.id,
      ...(lessonId ? { _lesson_id: lessonId } : {}),
    });

    const exercisesPromise = supabase.rpc('get_student_exercises' as any, {
      _chapter_id: activeChapter.id,
      ...(lessonId ? { _lesson_id: lessonId } : {}),
    });

    const [{ data: quizzes }, { data: exercises }] = await Promise.all([
      quizzesPromise,
      exercisesPromise,
    ]);

    setDbQuizzes(((quizzes as any[]) || []).map(q => ({ ...q, options: Array.isArray(q.options) ? q.options as string[] : [] })));
    setDbExercises(((exercises as any[]) || []).map(e => ({ ...e })));
  }, [activeChapter]);

  useEffect(() => { fetchQuizExercises(); }, [fetchQuizExercises]);

  // Realtime subscription for chapters and lessons changes
  useEffect(() => {
    const channel = supabase
      .channel('curriculum-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, () => { fetchCourse(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => { fetchCourse(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapter_quizzes' }, () => { fetchQuizExercises(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapter_exercises' }, () => { fetchQuizExercises(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCourse, fetchQuizExercises]);

  // Redirect admin/pedago without niveau param back to level selection
  useEffect(() => {
    if (!loading && canManage && !adminNiveau) {
      navigate("/liste-cours", { replace: true });
    }
  }, [loading, canManage, adminNiveau, navigate]);

  // Initial fetch
  useEffect(() => {
    if (subjectId) {
      fetchCourse();
    }
  }, [subjectId, fetchCourse]);

  // Rediriger vers complete-profile si school_level manquant
  useEffect(() => {
    if (needsProfileCompletion) {
      navigate('/complete-profile', { replace: true });
    }
  }, [needsProfileCompletion, navigate]);

  const handleMarkComplete = async () => {
    if (!activeChapter) return;

    setProgress(prev => ({
      ...prev,
      [activeChapter.id]: !prev[activeChapter.id]
    }));

    toast({
      title: progress[activeChapter.id] ? t("cours.chapterUncompleted") : t("cours.chapterCompleted"),
      description: progress[activeChapter.id] ? "" : t("cours.chapterCompletedDesc"),
    });
  };

  const handleChapterChange = (direction: "prev" | "next") => {
    if (!chapters.length || !activeChapter) return;

    const currentIndex = chapters.findIndex((c) => c.id === activeChapter.id);
    if (direction === "prev" && currentIndex > 0) {
      setActiveChapter(chapters[currentIndex - 1]);
      setActiveChapterIndex(currentIndex - 1);
      setInitialLessonId(null);
    } else if (direction === "next" && currentIndex < chapters.length - 1) {
      setActiveChapter(chapters[currentIndex + 1]);
      setActiveChapterIndex(currentIndex + 1);
      setInitialLessonId(null);
    }
  };

  const getSchoolLevelName = (level: string) => {
    const labels: Record<string, string> = {
      "6eme": "6ème",
      "5eme": "5ème",
      "4eme": "4ème",
      "3eme": "3ème",
      seconde: "Seconde",
      premiere: "Première",
      terminale: "Terminale",
    };
    return labels[level] || level;
  };

  const handleDownloadPDF = async () => {
    if (!activeChapter) return;

    try {
      const content = activeChapter.content?.replace(/<[^>]*>/g, '') || 'Contenu non disponible';
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: t("cours.errorTitle"), description: t("cours.popupBlocked"), variant: "destructive" });
        return;
      }
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${activeChapter.title}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{font-size:24px;border-bottom:2px solid #333;padding-bottom:10px}</style></head><body><h1>${activeChapter.title}</h1><p style="line-height:1.6;white-space:pre-wrap">${content}</p><script>window.onload=function(){window.print()}<\/script></body></html>`);
      printWindow.document.close();

      toast({
        title: t("cours.pdfDownloaded"),
        description: t("cours.pdfDownloadedDesc"),
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: t("cours.errorTitle"),
        description: t("cours.pdfError"),
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (chapters.length === 0 && !canManage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t("cours.courseUnavailable")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("cours.courseUnavailableDesc")}
        </p>
        <Button onClick={() => navigate("/liste-cours")}>{t("cours.backToCourseList")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen student-shell">
      <AppHeader />

      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${!canManage ? 'pb-28' : ''} ${isChatOpen ? 'lg:pr-[420px] blur-[2px] saturate-75 opacity-80' : ''}`}>

        {/* Subject hero + progress */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className="glass-card p-5 md:p-7">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[image:var(--gradient-violet)] flex items-center justify-center text-2xl shadow-md shrink-0">
                {subject?.icon || "📖"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-foreground truncate">{subject?.name || "Cours"}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("cours.chaptersCompleted", { completed: Object.values(progress).filter(Boolean).length, total: chapters.length })}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={(Object.values(progress).filter(Boolean).length / chapters.length) * 100}
                className="h-2.5"
              />
            </div>
          </div>
        </motion.div>

        {/* Active activity view */}
        {activeActivity === "quiz" && activeChapter && (
          <ChapterMathQuiz
            questions={dbQuizzes}
            chapterTitle={activeChapter.title}
            chapterId={activeChapter.id}
            onClose={() => setActiveActivity(null)}
            canManage={canManage}
            onRefresh={fetchQuizExercises}
          />
        )}

        {activeActivity === "exercises" && activeChapter && (
          <ChapterMathExercises
            exercises={dbExercises}
            chapterTitle={activeChapter.title}
            chapterId={activeChapter.id}
            onClose={() => setActiveActivity(null)}
            canManage={canManage}
            onRefresh={fetchQuizExercises}
          />
        )}

        {activeActivity === "revision" && activeChapter && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold" dir="rtl">مراجعة - {activeChapter.title}</h2>
              <Button variant="outline" onClick={() => setActiveActivity(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة للدرس
              </Button>
            </div>
            {dbQuizzes.length > 0 ? (
              <div className="space-y-4">
                {dbQuizzes.map((q, idx) => (
                  <Card key={q.id} className="glass-card border-0 animate-pop-in">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-violet mb-1" dir="rtl">بطاقة {idx + 1}</p>
                      <p className="text-lg font-medium mb-3" dir="rtl">{q.question}</p>
                      <details className="cursor-pointer">
                        <summary className="text-primary text-sm font-semibold" dir="rtl">عرض الإجابة</summary>
                        <p className="mt-2 p-3 bg-mint/10 rounded-lg" dir="rtl">{q.correct_answer}</p>
                        {q.explanation && <p className="mt-1 text-sm text-muted-foreground" dir="rtl">{q.explanation}</p>}
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-0">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground" dir="rtl">لا توجد بطاقات مراجعة. قم بإضافة أسئلة أولاً.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Grid view - Chapter selection */}
        {!activeActivity && viewMode === "grid" && (
          <div className="space-y-5">
            {/* Search + subject actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    Matières de {schoolLevel && getSchoolLevelName(schoolLevel)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Découvre tous les cours de ta classe et prépare-toi à réussir ! 🚀
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  {canManage && (
                    <Button
                      variant="outline"
                      className="rounded-full gap-2 active:scale-95 transition-transform"
                      onClick={() => navigate(`/liste-cours?matiere=${subjectId || "math"}`)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t("cours.backToLevels")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-full gap-2 border-accent/30 bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-lg hover:shadow-accent/25 active:scale-95 transition-all duration-300"
                    onClick={() => navigate(`/exams?niveau=${schoolLevel}&subject=${subjectId || "math"}${adminFiliere ? `&filiere=${adminFiliere}` : ''}`)}
                  >
                    <FileText className="h-4 w-4" />
                    الاختبارات
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("cours.searchPlaceholder")}
                  className="pl-9 rounded-xl h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>

            <ITSRecommendations />
            {canManage && (
              <div className="flex justify-end">
                <ChapterFormDialog
                  schoolLevel={schoolLevel}
                  filiereId={filiereId}
                  subject={subjectId || "math"}
                  onSaved={fetchCourse}
                />
              </div>
            )}
            {(() => {
              const normalize = (str: string) =>
                str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

              const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

              // Arabic/French stopwords to ignore during search
              const stopwords = new Set([
                // Arabic
                'و', 'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هو', 'هي', 'هذا', 'هذه',
                'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'ان', 'أن', 'كان', 'لا', 'ما',
                'لم', 'قد', 'بين', 'أو', 'ثم', 'حتى', 'كل', 'غير', 'بعد', 'قبل',
                'لكن', 'اذا', 'إذا', 'عند', 'حيث',
                // French
                'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'en',
                'au', 'aux', 'ce', 'ces', 'son', 'sa', 'ses', 'sur', 'par', 'pour',
                'avec', 'dans', 'est', 'sont', 'pas', 'ne', 'que', 'qui', 'dont',
              ]);

              // Strip Arabic prefixes/suffixes to get approximate root
              const stemArabic = (word: string): string => {
                let s = word;
                // Remove common prefixes: ال، و، ب، ك، ف، لل
                if (s.startsWith('وال')) s = s.slice(3);
                else if (s.startsWith('بال')) s = s.slice(3);
                else if (s.startsWith('كال')) s = s.slice(3);
                else if (s.startsWith('فال')) s = s.slice(3);
                else if (s.startsWith('لل')) s = s.slice(2);
                else if (s.startsWith('ال')) s = s.slice(2);
                else if (s.length > 3 && ['و', 'ب', 'ك', 'ف', 'ل'].includes(s[0])) s = s.slice(1);
                // Remove common suffixes: ة، ات، ية، ين، ون، ها، هم
                if (s.endsWith('ية') && s.length > 4) s = s.slice(0, -2);
                else if (s.endsWith('ات') && s.length > 4) s = s.slice(0, -2);
                else if (s.endsWith('ين') && s.length > 4) s = s.slice(0, -2);
                else if (s.endsWith('ون') && s.length > 4) s = s.slice(0, -2);
                else if (s.endsWith('ة') && s.length > 3) s = s.slice(0, -1);
                return s;
              };

              // Check if a character is Arabic
              const isArabic = (str: string) => /[\u0600-\u06FF]/.test(str);

              const levenshtein = (a: string, b: string): number => {
                const m = a.length, n = b.length;
                if (m === 0) return n;
                if (n === 0) return m;
                if (Math.abs(m - n) > 3) return Math.max(m, n); // early exit
                const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
                for (let i = 0; i <= m; i++) dp[i][0] = i;
                for (let j = 0; j <= n; j++) dp[0][j] = j;
                for (let i = 1; i <= m; i++) {
                  for (let j = 1; j <= n; j++) {
                    dp[i][j] = Math.min(
                      dp[i - 1][j] + 1,
                      dp[i][j - 1] + 1,
                      dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                    );
                  }
                }
                return dp[m][n];
              };

              // Extract meaningful keywords from a query, removing stopwords
              const extractKeywords = (query: string): string[] => {
                return normalize(query)
                  .split(/\s+/)
                  .filter(w => w.length > 1 && !stopwords.has(w));
              };

              // Flexible word match: exact, substring, stem, or Levenshtein
              const wordMatchScore = (textWord: string, queryWord: string): number => {
                if (textWord === queryWord) return 100;
                if (textWord.includes(queryWord) || queryWord.includes(textWord)) return 85;

                // Arabic stem matching
                if (isArabic(queryWord)) {
                  const stemQ = stemArabic(queryWord);
                  const stemT = stemArabic(textWord);
                  if (stemQ === stemT) return 90;
                  if (stemT.includes(stemQ) || stemQ.includes(stemT)) return 80;
                  if (stemQ.length >= 2 && stemT.length >= 2) {
                    const d = levenshtein(stemQ, stemT);
                    const maxDist = stemQ.length <= 3 ? 1 : 2;
                    if (d <= maxDist) return Math.max(10, 70 - d * 15);
                  }
                }

                // Levenshtein on full words
                if (queryWord.length >= 3) {
                  const maxDist = queryWord.length <= 4 ? 1 : queryWord.length <= 7 ? 2 : 3;
                  const d = levenshtein(textWord, queryWord);
                  if (d <= maxDist) return Math.max(10, 65 - d * 15);
                }
                return 0;
              };

              // Score how well a text matches the WHOLE phrase/concept
              const phraseSearch = (text: string, keywords: string[]): { match: boolean; score: number } => {
                if (keywords.length === 0) return { match: false, score: 0 };
                const t = normalize(text);
                const textWords = t.split(/\s+/).filter(w => w.length > 1);
                if (textWords.length === 0) return { match: false, score: 0 };

                // 1) Full phrase match (highest score)
                const fullQuery = keywords.join(' ');
                if (t.includes(fullQuery)) return { match: true, score: 100 };

                // 2) All keywords must match — phrase-level coherence
                const keywordScores: number[] = [];
                const matchPositions: number[] = []; // track where each keyword matched

                for (const kw of keywords) {
                  let bestScore = 0;
                  let bestPos = -1;

                  for (let i = 0; i < textWords.length; i++) {
                    const s = wordMatchScore(textWords[i], kw);
                    if (s > bestScore) {
                      bestScore = s;
                      bestPos = i;
                    }
                  }

                  if (bestScore === 0) {
                    // This keyword doesn't match at all → the phrase doesn't match
                    return { match: false, score: 0 };
                  }
                  keywordScores.push(bestScore);
                  matchPositions.push(bestPos);
                }

                // All keywords matched → calculate score
                const avgScore = keywordScores.reduce((a, b) => a + b, 0) / keywordScores.length;

                // 3) Proximity bonus: keywords appearing close together = better match
                let proximityBonus = 0;
                if (matchPositions.length > 1) {
                  const sorted = [...matchPositions].sort((a, b) => a - b);
                  const span = sorted[sorted.length - 1] - sorted[0];
                  // If all keywords within 10 words of each other, big bonus
                  if (span <= keywords.length + 2) proximityBonus = 20;
                  else if (span <= keywords.length + 8) proximityBonus = 10;
                  else if (span <= 20) proximityBonus = 5;
                }

                return { match: true, score: Math.min(100, avgScore + proximityBonus) };
              };

              const getSnippet = (text: string, keywords: string[]): string => {
                const plain = stripHtml(text);
                const t = normalize(plain);
                const textWords = t.split(/\s+/);
                let bestPos = -1;

                // Find position of first keyword match
                for (const kw of keywords) {
                  for (let i = 0; i < textWords.length; i++) {
                    if (wordMatchScore(textWords[i], kw) > 0) {
                      // Convert word index to character position
                      let charPos = 0;
                      for (let j = 0; j < i; j++) charPos += textWords[j].length + 1;
                      bestPos = charPos;
                      break;
                    }
                  }
                  if (bestPos !== -1) break;
                }

                if (bestPos === -1) return plain.substring(0, 120) + "...";
                const start = Math.max(0, bestPos - 40);
                const end = Math.min(plain.length, bestPos + 80);
                return (start > 0 ? "..." : "") + plain.substring(start, end) + (end < plain.length ? "..." : "");
              };

              type SearchResult = {
                lesson: Lesson;
                chapter: Chapter;
                chapterIndex: number;
                score: number;
                matchSource: 'chapter-title' | 'lesson-title' | 'lesson-content';
                snippet?: string;
              };

              const isSearching = searchQuery.trim().length > 0;

              if (isSearching) {
                const keywords = extractKeywords(searchQuery);
                if (keywords.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">{t("cours.typeKeywordToSearch")}</p>
                    </div>
                  );
                }

                const results: SearchResult[] = [];

                chapters.forEach((chapter, chapterIndex) => {
                  const chapterTitleResult = phraseSearch(chapter.title, keywords);

                  chapter.lessons?.forEach(lesson => {
                    const titleFr = phraseSearch(lesson.title, keywords);
                    const titleAr = phraseSearch(lesson.titleAr, keywords);
                    const contentPlain = lesson.content ? stripHtml(lesson.content) : '';
                    const contentResult = contentPlain ? phraseSearch(contentPlain, keywords) : { match: false, score: 0 };

                    let bestScore = 0;
                    let matchSource: SearchResult['matchSource'] = 'lesson-title';
                    let snippet: string | undefined;

                    if (titleFr.match && titleFr.score > bestScore) { bestScore = titleFr.score; matchSource = 'lesson-title'; }
                    if (titleAr.match && titleAr.score > bestScore) { bestScore = titleAr.score; matchSource = 'lesson-title'; }
                    if (contentResult.match && contentResult.score > bestScore) {
                      bestScore = contentResult.score;
                      matchSource = 'lesson-content';
                      snippet = getSnippet(lesson.content || '', keywords);
                    }
                    if (chapterTitleResult.match && chapterTitleResult.score > bestScore) {
                      bestScore = chapterTitleResult.score;
                      matchSource = 'chapter-title';
                    }

                    if (bestScore > 0) {
                      results.push({ lesson, chapter, chapterIndex, score: bestScore, matchSource, snippet });
                    }
                  });

                  // Chapter with no lessons
                  if (chapterTitleResult.match && (!chapter.lessons || chapter.lessons.length === 0)) {
                    results.push({
                      lesson: { id: chapter.id, title: chapter.title, titleAr: '' },
                      chapter, chapterIndex,
                      score: chapterTitleResult.score,
                      matchSource: 'chapter-title',
                    });
                  }
                });

                // Sort by score descending
                results.sort((a, b) => b.score - a.score);

                if (results.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">{t("cours.noCourseFoundFor", { query: searchQuery })}</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(({ lesson, chapter, chapterIndex, matchSource, snippet }) => (
                      <Card
                        key={`${chapter.id}-${lesson.id}`}
                        className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/40 active:scale-[0.99]"
                        onClick={() => {
                          setActiveChapter(chapter);
                          setActiveChapterIndex(chapterIndex);
                          setInitialLessonId(lesson.id !== chapter.id ? lesson.id : null);
                          setViewMode("content");
                          setSearchQuery("");
                        }}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <span className="flex-1">{lesson.titleAr || lesson.title}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-1">
                            📖 {chapter.title}
                          </p>
                          {matchSource === 'lesson-content' && snippet && (
                            <p className="text-xs text-muted-foreground/80 italic line-clamp-2">
                              "{snippet}"
                            </p>
                          )}
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${matchSource === 'chapter-title' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : matchSource === 'lesson-title' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            }`}>
                            {matchSource === 'chapter-title' ? t("cours.matchChapter") : matchSource === 'lesson-title' ? t("cours.matchLessonTitle") : t("cours.matchContent")}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              }

              // Default: show chapters grid
              const badgePalette = [
                "from-blue-500/15 to-blue-600/5 text-blue-600",
                "from-purple-500/15 to-purple-600/5 text-purple-600",
                "from-emerald-500/15 to-emerald-600/5 text-emerald-600",
                "from-indigo-500/15 to-indigo-600/5 text-indigo-600",
              ];

              return (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter.id}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Card
                        className={`group relative overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99] ${progress[chapter.id] ? 'border-green-500/40 bg-green-500/5' : ''}`}
                        onClick={() => {
                          setActiveChapter(chapter);
                          setActiveChapterIndex(index);
                          setViewMode("content");
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardHeader className="relative pb-2">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-br shrink-0 transition-transform duration-300 group-hover:scale-110 ${badgePalette[index % badgePalette.length]}`}>
                              {index + 1}
                            </span>
                            <span className="flex-1">{chapter.title}</span>
                            {progress[chapter.id] && (
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                            )}
                            {canManage && (
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <ChapterFormDialog
                                  schoolLevel={schoolLevel}
                                  filiereId={filiereId}
                                  subject={subjectId || "math"}
                                  onSaved={fetchCourse}
                                  chapter={{ id: chapter.id, title: chapter.title.split(' - ')[0], title_ar: chapter.title.includes(' - ') ? chapter.title.split(' - ')[1] : null, description: null, order_index: chapter.order_index }}
                                />
                                <DeleteChapterButton chapterId={chapter.id} onDeleted={fetchCourse} />
                              </div>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                          <p className="text-sm text-muted-foreground line-clamp-2 ml-[52px]">
                            {chapter.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              );
            })()}
          </div>
        )}

        {/* Content view - Chapter details */}
        {!activeActivity && viewMode === "content" && activeChapter && (
          <div className="space-y-6">
            {/* Affichage adaptatif de la leçon */}
            <AdaptiveLessonContent
              key={`${activeChapter.id}-${contentResetKey}`}
              onBackToChapters={() => {
                setViewMode("grid");
                setInitialLessonId(null);
                // Clear chapitre/lecon URL params to prevent useEffect from re-forcing content view
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("chapitre");
                newParams.delete("lecon");
                setSearchParams(newParams, { replace: true });
              }}
              onBackToLessons={() => {
                setInitialLessonId(null);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("lecon");
                setSearchParams(newParams, { replace: true });
              }}
              chapter={activeChapter}
              canManage={canManage}
              fetchCourse={fetchCourse}
              dbQuizzes={dbQuizzes}
              dbExercises={dbExercises}
              fetchQuizExercises={fetchQuizExercises}
              subjectId={subjectId}
              progress={progress}
              handleMarkComplete={handleMarkComplete}
              handleDownloadPDF={handleDownloadPDF}
              handleChapterChange={handleChapterChange}
              chapters={chapters}
              onActivitySelect={setActiveActivity}
              userId={profile?.id}
              schoolLevel={schoolLevel}
              showActivityCards={canManage}
              initialLessonId={initialLessonId}
              onInitialLessonHandled={() => setInitialLessonId(null)}
            />
          </div>
        )}
      </main>

      {/* Floating Chat Button - Only show when a chapter is active and user is not admin/pedago */}
      {viewMode === "content" && !canManage && (
        <>
          <div
            className={`fixed z-[60] transition-all duration-300 ${isNativeApp ? 'bottom-24' : 'bottom-6'} ${isChatOpen
              ? isChatExpanded ? 'right-6' : 'right-6 lg:right-[430px]'
              : 'right-6'
              }`}
          >
            {!isChatOpen && (
              <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" aria-hidden />
            )}
            <button
              onClick={() => { setIsChatOpen(!isChatOpen); setIsChatExpanded(false); }}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isChatOpen
                ? 'bg-card text-primary border border-border shadow-lg'
                : 'bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-elegant)]'
                }`}
            >
              <MessageCircle
                className={`h-6 w-6 absolute transition-all duration-300 ${isChatOpen ? 'opacity-0 scale-50 -rotate-45' : 'opacity-100 scale-100 rotate-0'}`}
              />
              <X
                className={`h-6 w-6 absolute transition-all duration-300 ${isChatOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-45'}`}
              />
            </button>
            {!isChatOpen && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm ring-2 ring-background">
                <Sparkles className="h-3 w-3" />
              </span>
            )}
          </div>

          {/* Chat Panel */}
          {isChatOpen && (() => {
            const chatBotNode = (
              <ChatBot
                messages={chatMessages}
                setMessages={setChatMessages}
                schoolLevel={profile?.school_level}
                chapterId={activeChapter?.id || null}
                isExpanded={isChatExpanded}
                onToggleExpand={() => setIsChatExpanded(prev => !prev)}
                allChapters={chapters.map(ch => ({
                  id: ch.id,
                  title: ch.title,
                  lessons: (ch.lessons || []).map(l => ({ id: l.id, title: l.title })),
                }))}
                chapterContext={activeChapter ? {
                  title: activeChapter.title,
                  lessonsContent: (activeChapter.lessons || []).map(l => `${l.title}: ${l.content || ''}`).join('\n'),
                } : null}
                onNavigate={(path) => {
                  const targetUrl = new URL(path, window.location.origin);
                  const targetChapterId = targetUrl.searchParams.get("chapitre");
                  const targetLessonId = targetUrl.searchParams.get("lecon");

                  setIsChatOpen(false);

                  if (targetChapterId) {
                    const targetChapterIndex = chapters.findIndex((chapter) => chapter.id === targetChapterId);

                    if (targetChapterIndex >= 0) {
                      setActiveChapter(chapters[targetChapterIndex]);
                      setActiveChapterIndex(targetChapterIndex);
                      setViewMode("content");
                      setInitialLessonId(targetLessonId);
                      setContentResetKey(k => k + 1);
                    }
                  }

                  const newParams = new URLSearchParams(searchParams);
                  if (targetChapterId) newParams.set("chapitre", targetChapterId);
                  else newParams.delete("chapitre");
                  if (targetLessonId) newParams.set("lecon", targetLessonId);
                  else newParams.delete("lecon");
                  setSearchParams(newParams, { replace: true });
                }}
              />
            );

            return isMobile ? (
              <div className="fixed top-16 bottom-0 right-0 z-50 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                {chatBotNode}
              </div>
            ) : (
              <div className="fixed inset-0 pointer-events-none z-50">
                <Rnd
                  size={chatSize}
                  position={chatPos}
                  onDragStop={(e, d) => setChatPos({ x: d.x, y: d.y })}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setChatSize({
                      width: parseInt(ref.style.width, 10),
                      height: parseInt(ref.style.height, 10)
                    });
                    setChatPos(position);
                  }}
                  minWidth={320}
                  minHeight={400}
                  bounds="parent"
                  dragHandleClassName="chatbot-drag-handle"
                  className="pointer-events-auto"
                >
                  <div className="w-full h-full shadow-[var(--shadow-elegant)] rounded-2xl overflow-hidden bg-background animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
                    {chatBotNode}
                  </div>
                </Rnd>
              </div>
            );
          })()}
        </>
      )}
      {!canManage && <BottomNav />}
    </div>
  );
};

export default Cours;
