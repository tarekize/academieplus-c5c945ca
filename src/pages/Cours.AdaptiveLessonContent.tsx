import { AdaptiveLessonContainer } from "@/components/course/AdaptiveLessonContainer";
import { useLearningStyle } from "@/hooks/useLearningStyle";
import { Button } from "@/components/ui/button";
import { LessonFormDialog, DeleteLessonButton } from "@/components/course/PedagoCRUD";
import { GenerateQuizExercisesButton } from "@/components/course/QuizExerciseCRUD";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, PenTool, BookOpen, ArrowLeft, ChevronLeft } from "lucide-react";

import { useState, useEffect } from "react";

export function AdaptiveLessonContent({ chapter, canManage, fetchCourse, dbQuizzes, dbExercises, fetchQuizExercises, subjectId, progress, handleMarkComplete, handleDownloadPDF, handleChapterChange, chapters }) {
    const { learningStyle } = useLearningStyle();
    const [selectedLesson, setSelectedLesson] = useState(null);

    // Réinitialiser la leçon sélectionnée lors du changement de chapitre
    useEffect(() => {
        setSelectedLesson(null);
    }, [chapter.id]);

    const handleLessonClick = (lesson) => {
        setSelectedLesson(lesson);
    };

    const handleBackToList = () => {
        setSelectedLesson(null);
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
            {chapter.lessons?.map((lesson, idx) => (
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

    // Contenu adaptatif d'une leçon
    const renderAdaptiveLesson = () => (
        selectedLesson && (
            <AdaptiveLessonContainer
                lessonTitle={selectedLesson.title}
                lessonContent={chapter.content}
                learningStyle={learningStyle}
            />
        )
    );

    // Fallback si pas de leçon dans le chapitre
    const renderNoLesson = () => (
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            <div dangerouslySetInnerHTML={{ __html: chapter.content || "<p>Contenu non disponible</p>" }} />
        </div>
    );

    // Bouton retour vers la liste des leçons
    const renderBackButton = () => (
        <Button variant="outline" size="sm" onClick={handleBackToList} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour aux leçons
        </Button>
    );

    // ——— Logique d'affichage ———
    // Pas de leçons dans ce chapitre → fallback
    if (!chapter.lessons || chapter.lessons.length === 0) {
        return (
            <>
                {renderNoLesson()}
                {canManage && dbQuizzes.length === 0 && dbExercises.length === 0 && (
                    <div className="flex justify-center">
                        <GenerateQuizExercisesButton chapterId={chapter.id} onGenerated={fetchQuizExercises} />
                    </div>
                )}
                {renderActivityCards()}
                {renderNavigation()}
            </>
        );
    }

    // Style TEXTUEL :
    // • Liste des leçons d'abord
    // • Au clic sur une leçon → contenu textuel avec bouton "Voir les vidéos" en haut
    if (learningStyle === "textual") {
        return (
            <>
                {!selectedLesson ? (
                    renderLessonsList()
                ) : (
                    <>
                        {renderBackButton()}
                        {renderAdaptiveLesson()}
                    </>
                )}
                {canManage && !selectedLesson && dbQuizzes.length === 0 && dbExercises.length === 0 && (
                    <div className="flex justify-center mt-4">
                        <GenerateQuizExercisesButton chapterId={chapter.id} onGenerated={fetchQuizExercises} />
                    </div>
                )}
                {renderActivityCards()}
                {renderNavigation()}
            </>
        );
    }

    // Style VISUEL :
    // • Liste des leçons d'abord (titres seulement)
    // • Au clic sur une leçon → vidéos affichées avec bouton "Voir le texte" en haut
    if (learningStyle === "visual") {
        return (
            <>
                {!selectedLesson ? (
                    renderLessonsList()
                ) : (
                    <>
                        {renderBackButton()}
                        {renderAdaptiveLesson()}
                    </>
                )}
                {canManage && !selectedLesson && dbQuizzes.length === 0 && dbExercises.length === 0 && (
                    <div className="flex justify-center mt-4">
                        <GenerateQuizExercisesButton chapterId={chapter.id} onGenerated={fetchQuizExercises} />
                    </div>
                )}
                {renderActivityCards()}
                {renderNavigation()}
            </>
        );
    }

    // Style PRATIQUE ou non défini → même comportement que textuel
    return (
        <>
            {!selectedLesson ? (
                renderLessonsList()
            ) : (
                <>
                    {renderBackButton()}
                    {renderAdaptiveLesson()}
                </>
            )}
            {canManage && !selectedLesson && dbQuizzes.length === 0 && dbExercises.length === 0 && (
                <div className="flex justify-center mt-4">
                    <GenerateQuizExercisesButton chapterId={chapter.id} onGenerated={fetchQuizExercises} />
                </div>
            )}
            {renderActivityCards()}
            {renderNavigation()}
        </>
    );

    function renderActivityCards() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Card
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => window.location.hash = "#quiz"}
                >
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

                <Card
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => window.location.hash = "#exercises"}
                >
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

                <Card
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => window.location.hash = "#revision"}
                >
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
                <Button
                    variant="outline"
                    onClick={() => handleChapterChange("prev")}
                    disabled={chapters.findIndex(c => c.id === chapter.id) === 0}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Chapitre précédent
                </Button>
                <Button
                    onClick={() => handleChapterChange("next")}
                    disabled={chapters.findIndex(c => c.id === chapter.id) === chapters.length - 1}
                >
                    Chapitre suivant
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
            </div>
        );
    }
}
