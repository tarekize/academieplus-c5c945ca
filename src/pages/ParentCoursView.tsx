import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { courseService } from "@/services/courseService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DBQuizQuestion } from "@/components/course/ChapterMathQuiz";
import { DBExercise } from "@/components/course/ChapterMathExercises";
import { AdaptiveLessonContent } from "./Cours.AdaptiveLessonContent";

interface Chapter {
  id: string;
  title: string;
  order_index: number;
  content: string;
  lessons?: { id: string; title: string; titleAr: string; content?: string }[];
}

// Vue "lecture seule" des cours d'un enfant pour son parent, accédée depuis
// le tableau de bord parent via /parent-cours/:childId.
const ParentCoursView = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "content">("grid");
  const [dbQuizzes, setDbQuizzes] = useState<DBQuizQuestion[]>([]);
  const [dbExercises, setDbExercises] = useState<DBExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Charge le profil de l'enfant (childId vient de l'URL) puis ses chapitres
  // de cours. Avant toute lecture, on vérifie qu'un lien parent_child_links
  // relie bien l'utilisateur connecté à cet enfant : sans ce contrôle, un
  // parent authentifié pourrait consulter le nom, le niveau scolaire et le
  // contenu de cours de N'IMPORTE QUEL enfant en changeant l'UUID dans
  // l'URL /parent-cours/:childId (défense en profondeur, la donnée reste de
  // toute façon soumise à la RLS côté serveur).
  const fetchData = useCallback(async () => {
    if (!childId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: link } = await supabase
        .from("parent_child_links")
        .select("id")
        .eq("parent_id", session.user.id)
        .eq("child_id", childId)
        .maybeSingle();

      if (!link) {
        toast.error("Erreur", { description: "Cet enfant n'est pas lié à votre compte." });
        navigate("/parent-dashboard");
        return;
      }

      // Fetch child profile
      const { data: childProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name, school_level, filiere")
        .eq("id", childId)
        .single();

      if (!childProfile?.school_level) {
        toast.error("Erreur", { description: "Niveau scolaire non défini" });
        navigate("/parent-dashboard");
        return;
      }

      const parts = [childProfile.first_name, childProfile.last_name].filter(Boolean);
      setChildName(parts.join(" ") || "Enfant");
      setSchoolLevel(childProfile.school_level);

      const dbChapters = await courseService.getChaptersWithLessons(
        childProfile.school_level as any,
        childProfile.filiere || null,
        "math"
      );

      const mapped: Chapter[] = dbChapters.map((ch) => ({
        id: ch.id,
        title: ch.title_ar ? `${ch.title} - ${ch.title_ar}` : ch.title,
        order_index: ch.order_index,
        content: `<h2>${ch.title_ar || ch.title}</h2><p>${ch.description || `${ch.lessons.length} leçons`}</p>`,
        lessons: ch.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          titleAr: l.title_ar || l.title,
          content: l.content || "",
        })),
      }));

      setChapters(mapped);
      if (mapped.length > 0) setActiveChapter(mapped[0]);
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur", { description: "Impossible de charger les cours" });
    } finally {
      setLoading(false);
    }
  }, [childId, navigate]);

  // Charge quiz/exercices du chapitre actif (et éventuellement d'une leçon
  // précise) via les RPC dédiées côté serveur, en lecture seule pour le parent.
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

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchQuizExercises(); }, [fetchQuizExercises]);

  // Passe au chapitre précédent/suivant dans l'ordre affiché.
  const handleChapterChange = (direction: "prev" | "next") => {
    if (!chapters.length || !activeChapter) return;
    const idx = chapters.findIndex((c) => c.id === activeChapter.id);
    if (direction === "prev" && idx > 0) setActiveChapter(chapters[idx - 1]);
    if (direction === "next" && idx < chapters.length - 1) setActiveChapter(chapters[idx + 1]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Aucun cours disponible</h2>
        <p className="text-muted-foreground mb-6">Aucun cours n'est disponible pour le niveau de cet enfant.</p>
        <Button onClick={() => navigate("/parent-dashboard")}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/parent-dashboard")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Cours de {childName} — {schoolLevel}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-display text-2xl font-extrabold">Mathématiques</h1>
            <span className="text-sm text-muted-foreground">{chapters.length} chapitres</span>
          </div>
        </div>

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border">
              <h2 className="text-lg font-semibold mb-1">Cours de {childName}</h2>
              <p className="text-sm text-muted-foreground mb-4">Consultez les cours, exercices et quiz de votre enfant (lecture seule)</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un chapitre..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters
                .filter(ch => !searchQuery || ch.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((chapter, index) => (
                  <Card
                    key={chapter.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => { setActiveChapter(chapter); setViewMode("content"); }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1">{chapter.title}</span>
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

        {/* Content view */}
        {viewMode === "content" && activeChapter && (
          <div className="space-y-6">
            <AdaptiveLessonContent
              onBackToChapters={() => setViewMode("grid")}
              chapter={activeChapter}
              canManage={false}
              fetchCourse={fetchData}
              dbQuizzes={dbQuizzes}
              dbExercises={dbExercises}
              fetchQuizExercises={fetchQuizExercises}
              subjectId="math"
              progress={{}}
              handleMarkComplete={() => { }}
              handleDownloadPDF={() => { }}
              handleChapterChange={handleChapterChange}
              chapters={chapters}
              onActivitySelect={() => { }}
              userId={childId}
              schoolLevel={schoolLevel}
              showActivityCards={false}
              readOnly
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentCoursView;
