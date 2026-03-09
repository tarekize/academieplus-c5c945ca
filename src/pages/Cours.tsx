import { useEffect, useState, useCallback } from "react";
import { AdaptiveLessonContent } from "./Cours.AdaptiveLessonContent";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { courseService, Chapter as DBChapter, Lesson as DBLesson } from "@/services/courseService";
import { ChapterMathQuiz, DBQuizQuestion } from "@/components/course/ChapterMathQuiz";
import { ChapterMathExercises, DBExercise } from "@/components/course/ChapterMathExercises";
import { GenerateQuizExercisesButton } from "@/components/course/QuizExerciseCRUD";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, LogOut, User as UserIcon, MessageCircle, X, BookOpen, Play, PenTool, Brain, Download, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/course/NotificationBell";
import ChatBot from "@/components/ChatBot";
import ITSRecommendations from "@/components/its/ITSRecommendations";
import { ChapterFormDialog, DeleteChapterButton, LessonFormDialog, DeleteLessonButton } from "@/components/course/PedagoCRUD";
import { useToast } from "@/hooks/use-toast";
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
  const [searchParams] = useSearchParams();
  const adminNiveau = searchParams.get("niveau");
  const adminFiliere = searchParams.get("filiere");
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
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; }[]>([]);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [filiereId, setFiliereId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbQuizzes, setDbQuizzes] = useState<DBQuizQuestion[]>([]);
  const [dbExercises, setDbExercises] = useState<DBExercise[]>([]);

  const subject = subjectId ? staticSubjects[subjectId] || { id: subjectId, name: subjectId, icon: "📖" } : null;



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
            title: ch.title_ar ? `${ch.title} - ${ch.title_ar}` : ch.title,
            order_index: ch.order_index,
            content: `<h2>${ch.title_ar || ch.title}</h2>${ch.title_ar ? `<h3>${ch.title}</h3>` : ""}<p>${ch.description || `Ce chapitre contient ${ch.lessons.length} leçons.`}</p>`,
            lessons: ch.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              titleAr: l.title_ar || l.title,
            })),
          }));

          setChapters(mappedChapters);
          if (mappedChapters.length > 0) {
            setActiveChapter(mappedChapters[0]);
            setActiveChapterIndex(0);
          }
        } else {
          setChapters([]);
        }
      } else {
        setChapters([]);
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

  // Load quizzes/exercises from DB when active chapter changes
  const fetchQuizExercises = useCallback(async () => {
    if (!activeChapter) return;
    const [{ data: quizzes }, { data: exercises }] = await Promise.all([
      supabase.from("chapter_quizzes").select("id, question, options, correct_answer, explanation").eq("chapter_id", activeChapter.id).order("order_index"),
      supabase.from("chapter_exercises").select("id, title, statement, expected_answer, accepted_answers, solution").eq("chapter_id", activeChapter.id).order("order_index"),
    ]);
    setDbQuizzes((quizzes || []).map(q => ({ ...q, options: Array.isArray(q.options) ? q.options as string[] : [] })));
    setDbExercises((exercises || []).map(e => ({ ...e, accepted_answers: Array.isArray(e.accepted_answers) ? e.accepted_answers as string[] : [] })));
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
    } else if (direction === "next" && currentIndex < chapters.length - 1) {
      setActiveChapter(chapters[currentIndex + 1]);
      setActiveChapterIndex(currentIndex + 1);
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
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(activeChapter.title, 20, 20);

      doc.setFontSize(12);
      const content = activeChapter.content?.replace(/<[^>]*>/g, '') || 'Contenu non disponible';
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines.slice(0, 40), 20, 35);

      doc.save(`${activeChapter.title}.pdf`);

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
              {profile?.id && <NotificationBell userId={profile.id} />}
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

      <main className="container mx-auto px-4 pt-24 pb-8">

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.filter((chapter) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                const titleMatch = chapter.title.toLowerCase().includes(q);
                const lessonMatch = chapter.lessons?.some(l => 
                  l.title.toLowerCase().includes(q) || l.titleAr.toLowerCase().includes(q)
                );
                return titleMatch || lessonMatch;
              }).map((chapter, index) => (
                <Card
                  key={chapter.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${progress[chapter.id] ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}
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
          </div>
        )}

        {/* Content view - Chapter details */}
        {!activeActivity && viewMode === "content" && activeChapter && (
          <div className="space-y-6">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" onClick={() => setViewMode("grid")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux chapitres
              </Button>
            </div>

            {/* Affichage adaptatif de la leçon */}
            <AdaptiveLessonContent
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
            />
          </div>
        )}



      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
      >
        {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] z-50">
          <ChatBot
            messages={chatMessages}
            setMessages={setChatMessages}
            schoolLevel={profile?.school_level}
          />
        </div>
      )}
    </div>
  );
};

export default Cours;
