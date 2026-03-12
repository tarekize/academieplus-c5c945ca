import { Button } from "@/components/ui/button";
import { LessonFormDialog, DeleteLessonButton } from "@/components/course/PedagoCRUD";
import { GenerateQuizExercisesButton } from "@/components/course/QuizExerciseCRUD";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, PenTool, BookOpen, ArrowLeft, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TableOfContents } from "@/components/course/TableOfContents";
import { injectHeaderIds } from "@/lib/toc-utils";
import { AdaptiveActivities } from "@/components/course/AdaptiveActivities";

export function AdaptiveLessonContent({ chapter, canManage, fetchCourse, dbQuizzes, dbExercises, fetchQuizExercises, subjectId, progress, handleMarkComplete, handleDownloadPDF, handleChapterChange, chapters, onActivitySelect, userId, schoolLevel, showActivityCards, initialLessonId, onInitialLessonHandled }: any) {
    const navigate = useNavigate();
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [lessonContent, setLessonContent] = useState<string>("");
    const [loadingContent, setLoadingContent] = useState(false);
    const readingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const readingStartRef = useRef<number>(0);

    // Reset when chapter changes
    useEffect(() => {
        setSelectedLesson(null);
        setLessonContent("");
    }, [chapter.id]);

    // Auto-open lesson when coming from search
    useEffect(() => {
        if (initialLessonId && chapter.lessons) {
            const lesson = chapter.lessons.find((l: any) => l.id === initialLessonId);
            if (lesson) {
                handleLessonClick(lesson);
            }
            onInitialLessonHandled?.();
        }
    }, [initialLessonId, chapter.id]);

    const handleLessonClick = async (lesson: any) => {
        if (canManage) {
            // Pédagogue → navigate to lesson editor
            navigate(`/lecon/${lesson.id}`);
            return;
        }
        // Élève → show content inline
        setSelectedLesson(lesson);
        setLoadingContent(true);
        try {
            const { data } = await supabase
                .from("lessons")
                .select("content")
                .eq("id", lesson.id)
                .maybeSingle();
            setLessonContent(data?.content || "");
        } catch (err) {
            console.error(err);
            setLessonContent("");
        } finally {
            setLoadingContent(false);
        }
    };

    const handleBackToList = () => {
        setSelectedLesson(null);
        setLessonContent("");
    };

    // Liste des leçons
    const renderLessonsList = () => (
        <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">الدروس - Leçons</h3>
                {canManage && (
                    <LessonFormDialog chapterId={chapter.id} onSaved={fetchCourse} />
                )}
            </div>
            {chapter.lessons?.map((lesson: any, idx: number) => (
                <div
                    key={lesson.id}
                    className="w-full text-right p-4 border rounded-lg hover:bg-accent/10 transition-colors cursor-pointer flex items-center gap-3"
                    onClick={() => handleLessonClick(lesson)}
                >
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {idx + 1}
                    </span>
                    <div className="flex-1">
                        <p className="font-medium text-base">{lesson.titleAr}</p>
                        <p className="text-sm text-muted-foreground">{lesson.title}</p>
                    </div>
                    {canManage && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <LessonFormDialog
                                chapterId={chapter.id}
                                onSaved={fetchCourse}
                                lesson={{ id: lesson.id, title: lesson.title, title_ar: lesson.titleAr !== lesson.title ? lesson.titleAr : null }}
                            />
                            <DeleteLessonButton lessonId={lesson.id} onDeleted={fetchCourse} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // Student lesson content view
    const renderLessonContent = () => (
        <div>
            <Button variant="outline" size="sm" onClick={handleBackToList} className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour aux leçons
            </Button>

            {/* AI Adaptive Activities - Only for students */}
            {!canManage && userId && selectedLesson && (
                <AdaptiveActivities
                    lessonId={selectedLesson.id}
                    chapterId={chapter.id}
                    userId={userId}
                    schoolLevel={schoolLevel || ""}
                    lessonTitle={selectedLesson.titleAr || selectedLesson.title}
                    chapterTitle={chapter.title}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-8 mt-8">
                <Card className="flex-1 min-w-0">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">{selectedLesson?.titleAr || selectedLesson?.title}</h2>
                        {loadingContent ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : lessonContent ? (
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: injectHeaderIds(lessonContent) }}
                            />
                        ) : (
                            <p className="text-center text-muted-foreground py-12">
                                Aucun contenu disponible pour cette leçon.
                            </p>
                        )}
                    </CardContent>
                </Card>
                <div className="w-full lg:w-72 shrink-0">
                    <TableOfContents htmlContent={lessonContent} />
                </div>
            </div>
        </div>
    );

    // Fallback if no lessons
    const renderNoLesson = () => (
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            <div dangerouslySetInnerHTML={{ __html: chapter.content || "<p>Contenu non disponible</p>" }} />
        </div>
    );

    function renderActivityCards() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onActivitySelect?.("quiz")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold" dir="rtl">اختبارات</h3>
                            <p className="text-sm text-muted-foreground" dir="rtl">{dbQuizzes.length} أسئلة</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onActivitySelect?.("exercises")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                            <PenTool className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold" dir="rtl">تمارين</h3>
                            <p className="text-sm text-muted-foreground" dir="rtl">{dbExercises.length} تمارين</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onActivitySelect?.("revision")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Révision</h3>
                            <p className="text-sm text-muted-foreground">Fiches de révision</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    function renderNavigation() {
        return (
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => handleChapterChange("prev")} disabled={chapters.findIndex((c: any) => c.id === chapter.id) === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Chapitre précédent
                </Button>
                <Button onClick={() => handleChapterChange("next")} disabled={chapters.findIndex((c: any) => c.id === chapter.id) === chapters.length - 1}>
                    Chapitre suivant
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
            </div>
        );
    }

    // No lessons in chapter
    if (!chapter.lessons || chapter.lessons.length === 0) {
        return (
            <>
                {showActivityCards && renderActivityCards()}
                {canManage && (
                    <div className="flex justify-center mb-6">
                        <GenerateQuizExercisesButton chapterId={chapter.id} onGenerated={fetchQuizExercises} />
                    </div>
                )}
                {renderNoLesson()}
                {renderNavigation()}
            </>
        );
    }

    // Show activity cards for teachers always, or for students when no lesson is selected
    const shouldShowActivityCards = canManage || !selectedLesson;

    return (
        <>
            {shouldShowActivityCards && renderActivityCards()}
            {canManage && !selectedLesson && (
                <div className="flex justify-center mb-6">
                    <GenerateQuizExercisesButton chapterId={chapter.id} onGenerated={fetchQuizExercises} />
                </div>
            )}
            {!selectedLesson ? (
                renderLessonsList()
            ) : (
                renderLessonContent()
            )}
            {renderNavigation()}
        </>
    );
}
