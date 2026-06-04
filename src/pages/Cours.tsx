import { useEffect, useState, useCallback, useRef } from "react";
import { AdaptiveLessonContent } from "./Cours.AdaptiveLessonContent";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { courseService, Chapter as DBChapter, Lesson as DBLesson } from "@/services/courseService";
import { ChapterMathQuiz, DBQuizQuestion } from "@/components/course/ChapterMathQuiz";
import { ChapterMathExercises, DBExercise } from "@/components/course/ChapterMathExercises";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, LogOut, User as UserIcon, MessageCircle, X, BookOpen, Play, PenTool, Brain, Download, Check, Search, BarChart3, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

import ChatBot from "@/components/ChatBot";
import ITSRecommendations from "@/components/its/ITSRecommendations";
import { ChapterFormDialog, DeleteChapterButton, LessonFormDialog, DeleteLessonButton } from "@/components/course/PedagoCRUD";
import { useToast } from "@/hooks/use-toast";
import { Rnd } from 'react-rnd';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Static subject data
const staticSubjects: Record<string, { id: string; name: string; icon: string }> = {
  "math": { id: "math", name: "Mathématiques", icon: "📐" },
};

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
  const [loading, setLoading] = useState(true);
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
        title: "Erreur",
        description: "Impossible de charger le cours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [subjectId, adminNiveau, adminFiliere, navigate, toast]);

  useEffect(() => {
    if (!chapters.length) return;

    if (!chapitreParam) {
      const activeChapterStillExists = activeChapter
        ? chapters.some((chapter) => chapter.id === activeChapter.id)
        : false;

      if (!activeChapterStillExists) {
        setActiveChapter(chapters[0]);
        setActiveChapterIndex(0);
      }
      return;
    }

    const targetChapterIndex = chapters.findIndex((chapter) => chapter.id === chapitreParam);
    if (targetChapterIndex === -1) return;

    const targetChapter = chapters[targetChapterIndex];

    if (activeChapter?.id !== targetChapter.id) {
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

  const handleMarkComplete = async () => {
    if (!activeChapter) return;

    setProgress(prev => ({
      ...prev,
      [activeChapter.id]: !prev[activeChapter.id]
    }));

    toast({
      title: progress[activeChapter.id] ? "Marqué comme non complété" : "Chapitre complété !",
      description: progress[activeChapter.id] ? "" : "Continuez comme ça ! 🎉",
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getFullName = (profile: Profile | null): string => {
    if (!profile) return "Utilisateur";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
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
        toast({ title: "Erreur", description: "Veuillez autoriser les pop-ups", variant: "destructive" });
        return;
      }
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${activeChapter.title}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{font-size:24px;border-bottom:2px solid #333;padding-bottom:10px}</style></head><body><h1>${activeChapter.title}</h1><p style="line-height:1.6;white-space:pre-wrap">${content}</p><script>window.onload=function(){window.print()}<\/script></body></html>`);
      printWindow.document.close();

      toast({
        title: "PDF téléchargé",
        description: "Le chapitre a été téléchargé avec succès",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (chapters.length === 0 && !canManage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Cours non disponible</h2>
        <p className="text-muted-foreground mb-6">
          Aucun cours n'est disponible pour cette matière et ce niveau.
        </p>
        <Button onClick={() => navigate("/liste-cours")}>Retour à la liste des cours</Button>
      </div>
    );
  }

  const fullName = getFullName(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/liste-cours")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {schoolLevel && getSchoolLevelName(schoolLevel)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-4 pt-24 pb-8 transition-all duration-300 ${isChatOpen ? 'lg:pr-[420px] blur-[2px] saturate-75 opacity-80' : ''}`}>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">{subject?.name || "Cours"}</h1>
            <span className="text-sm text-muted-foreground">
              {Object.values(progress).filter(Boolean).length}/{chapters.length} chapitres terminés
            </span>
          </div>
          <Progress
            value={(Object.values(progress).filter(Boolean).length / chapters.length) * 100}
            className="h-2"
          />
        </div>

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
              <h2 className="text-xl font-bold" dir="rtl">مراجعة - {activeChapter.title}</h2>
              <Button variant="outline" onClick={() => setActiveActivity(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة للدرس
              </Button>
            </div>
            {dbQuizzes.length > 0 ? (
              <div className="space-y-4">
                {dbQuizzes.map((q, idx) => (
                  <Card key={q.id}>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-1" dir="rtl">بطاقة {idx + 1}</p>
                      <p className="text-lg font-medium mb-3" dir="rtl">{q.question}</p>
                      <details className="cursor-pointer">
                        <summary className="text-primary text-sm" dir="rtl">عرض الإجابة</summary>
                        <p className="mt-2 p-3 bg-muted/50 rounded-lg" dir="rtl">{q.correct_answer}</p>
                        {q.explanation && <p className="mt-1 text-sm text-muted-foreground" dir="rtl">{q.explanation}</p>}
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground" dir="rtl">لا توجد بطاقات مراجعة. قم بإضافة أسئلة أولاً.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Grid view - Chapter selection */}
        {!activeActivity && viewMode === "grid" && (
          <div className="space-y-4">
            {/* Back to levels button for pedago/admin */}
            <div className="flex gap-2 flex-wrap">
              {canManage && (
                <Button variant="outline" className="gap-2" onClick={() => navigate("/liste-cours")}>
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux niveaux
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(`/exams?niveau=${schoolLevel}&subject=${subjectId || "math"}`)}
              >
                <FileText className="h-4 w-4" />
                الاختبارات
              </Button>
            </div>
            {/* Search bar */}
            <div className="bg-card rounded-xl p-6 border">
              <h2 className="text-lg font-semibold mb-1">
                Matières de {schoolLevel && getSchoolLevelName(schoolLevel)}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Découvre tous les cours de ta classe et prépare-toi à réussir ! 🚀
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un chapitre ou une leçon..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

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
                      <p className="text-lg text-muted-foreground">Tapez un mot-clé pour rechercher</p>
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
                      <p className="text-lg text-muted-foreground">Aucun cours trouvé pour "{searchQuery}"</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(({ lesson, chapter, chapterIndex, matchSource, snippet }) => (
                      <Card
                        key={`${chapter.id}-${lesson.id}`}
                        className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
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
                            {matchSource === 'chapter-title' ? 'Chapitre' : matchSource === 'lesson-title' ? 'Titre leçon' : 'Contenu'}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              }

              // Default: show chapters grid
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chapters.map((chapter, index) => (
                    <Card
                      key={chapter.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${progress[chapter.id] ? 'border-green-500/50 bg-green-500/5' : ''}`}
                      onClick={() => {
                        setActiveChapter(chapter);
                        setActiveChapterIndex(index);
                        setViewMode("content");
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="flex-1">{chapter.title}</span>
                          {progress[chapter.id] && (
                            <Check className="h-5 w-5 text-green-500" />
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
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {chapter.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
          <button
            onClick={() => { setIsChatOpen(!isChatOpen); setIsChatExpanded(false); }}
            className={`fixed bottom-6 z-[60] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${isChatOpen
              ? isChatExpanded
                ? 'right-6 bg-white text-[#0A2551] border border-slate-200 hover:bg-slate-50'
                : 'right-6 lg:right-[430px] bg-white text-[#0A2551] border border-slate-200 hover:bg-slate-50'
              : 'right-6 bg-[#0A2551] text-white hover:bg-[#0A2551]/90'
              }`}
          >
            {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </button>

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
              <div className="fixed top-16 bottom-0 right-0 z-50 w-full transition-all duration-300">
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
                  <div className="w-full h-full shadow-2xl rounded-2xl overflow-hidden bg-background">
                    {chatBotNode}
                  </div>
                </Rnd>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default Cours;
