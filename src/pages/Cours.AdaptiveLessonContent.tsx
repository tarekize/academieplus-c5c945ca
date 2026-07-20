import { createPortal } from "react-dom";
import { Capacitor } from "@capacitor/core";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LessonMarkdown from "@/components/course/LessonMarkdown";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import { LessonFormDialog, DeleteLessonButton } from "@/components/course/PedagoCRUD";
import { EnrichChapterButton } from "@/components/course/EnrichChapterButton";
import { CompleteChapterActivitiesButton } from "@/components/course/CompleteChapterActivitiesButton";

import { Card, CardContent } from "@/components/ui/card";
import { Brain, PenTool, BookOpen, ArrowLeft, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TableOfContents } from "@/components/course/TableOfContents";
import { injectHeaderIds } from "@/lib/toc-utils";
import { LessonActivityTabs } from "@/components/course/LessonActivityTabs";
import { ChapterRevision } from "@/components/course/ChapterRevision";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AdaptiveLessonContent({ chapter, canManage, fetchCourse, dbQuizzes, dbExercises, fetchQuizExercises, subjectId, progress, handleMarkComplete, handleDownloadPDF, handleChapterChange, chapters, onActivitySelect, userId, schoolLevel, showActivityCards, initialLessonId, onInitialLessonHandled, onBackToChapters, onBackToLessons, readOnly }: any) {
    const navigate = useNavigate();
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [lessonContent, setLessonContent] = useState<string>("");
    const [loadingContent, setLoadingContent] = useState(false);
    const readingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const readingStartRef = useRef<number>(0);
    const [activeSectionLabel, setActiveSectionLabel] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<"exercises" | "quiz" | "revision" | null>(null);
    const [activityResetKey, setActivityResetKey] = useState(0);
    const [showRevision, setShowRevision] = useState(false);
    const [tocOpen, setTocOpen] = useState(false);
    const isNativeApp = Capacitor.isNativePlatform();

    // Reset when chapter changes
    useEffect(() => {
        setSelectedLesson(null);
        setLessonContent("");
        setActiveSectionLabel(null);
        setActiveSection(null);
        setShowRevision(false);
        setTocOpen(false);
    }, [chapter.id]);

    useEffect(() => {
        if (selectedLesson?.id) {
            fetchQuizExercises?.(selectedLesson.id);
            return;
        }

        // Keep chapter-level cards isolated from lesson-specific activities.
        fetchQuizExercises?.(null);
    }, [selectedLesson?.id, fetchQuizExercises]);

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
        setActiveSectionLabel(null);
        setActiveSection(null);

        const cachedContent = lesson.content || "";
        setLessonContent(cachedContent);

        if (cachedContent) {
            setLoadingContent(false);
            return;
        }

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
        setActiveSectionLabel(null);
        setActiveSection(null);
        setActivityResetKey(k => k + 1);
        onBackToLessons?.();
    };

    // Unified breadcrumb for all states
    const renderBreadcrumb = () => {
        const sectionLabels: Record<string, string> = {
            exercises: "تمارين",
            quiz: "اسئله متعدده الاختيارات",
            revision: "Révision",
        };

        return (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/10 mb-6">
                <Breadcrumb>
                    <BreadcrumbList className="flex-wrap">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <button
                                    type="button"
                                    className="cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => { onBackToChapters?.(); }}
                                >
                                    Chapitres
                                </button>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {!selectedLesson ? (
                                <BreadcrumbPage>{chapter.title}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <button
                                        type="button"
                                        className="cursor-pointer hover:text-primary transition-colors"
                                        onClick={handleBackToList}
                                    >
                                        {chapter.title}
                                    </button>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {selectedLesson && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {!activeSectionLabel ? (
                                        <BreadcrumbPage>{selectedLesson.titleAr || selectedLesson.title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <button
                                                type="button"
                                                className="cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => {
                                                    setActiveSectionLabel(null);
                                                    setActiveSection(null);
                                                    setActivityResetKey(k => k + 1);
                                                }}
                                            >
                                                {selectedLesson.titleAr || selectedLesson.title}
                                            </button>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </>
                        )}
                        {activeSectionLabel && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{activeSectionLabel}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        );
    };

    // Liste des leçons
    const renderLessonsList = () => (
        <div className="mt-2 space-y-2">
            {renderBreadcrumb()}
            {chapter.content && (
                <Card className="glass-card border-0">
                    <CardContent className="p-6">
                        <HtmlWithMath
                            className="prose prose-sm dark:prose-invert max-w-none"
                            htmlContent={chapter.content}
                        />
                    </CardContent>
                </Card>
            )}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-display text-lg font-extrabold">الدروس - Leçons</h3>
                {canManage && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <EnrichChapterButton
                            chapterId={chapter.id}
                            chapterTitle={chapter.titleAr || chapter.title}
                            lessonsCount={chapter.lessons?.length || 0}
                            lessons={chapter.lessons || []}
                            onDone={fetchCourse}
                        />
                        <CompleteChapterActivitiesButton
                            chapterId={chapter.id}
                            chapterTitleAr={chapter.titleAr || chapter.title}
                            lessons={chapter.lessons || []}
                            onDone={() => { fetchCourse?.(); fetchQuizExercises?.(null); }}
                        />
                        <LessonFormDialog chapterId={chapter.id} onSaved={fetchCourse} />
                    </div>
                )}
            </div>
            <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-2.5"
            >
                {chapter.lessons?.map((lesson: any, idx: number) => (
                    <motion.div
                        key={lesson.id}
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="group w-full text-right p-4 border border-border/60 rounded-2xl bg-card/60 hover:bg-violet/5 hover:border-violet/30 hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-3 active:scale-[0.99]"
                        onClick={() => handleLessonClick(lesson)}
                    >
                        <span className="w-9 h-9 rounded-xl bg-[image:var(--gradient-violet)] flex items-center justify-center text-white text-sm font-bold shrink-0 transition-transform duration-300 group-hover:scale-110">
                            {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-base truncate">{lesson.titleAr}</p>
                            <p className="text-sm text-muted-foreground truncate">{lesson.title}</p>
                        </div>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
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
                    </motion.div>
                ))}

                {/* Chapter-level revision card */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="group w-full p-4 mt-2 border-2 border-mint/30 rounded-2xl hover:bg-mint/5 hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-3 bg-gradient-to-r from-mint/5 to-transparent active:scale-[0.99]"
                    onClick={() => setShowRevision(true)}
                >
                    <span className="w-10 h-10 rounded-xl bg-[image:var(--gradient-mint)] flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <BookOpen className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                        <p className="font-bold text-base flex items-center gap-2">
                            Révision
                            <Sparkles className="h-4 w-4 text-mint" />
                        </p>
                        <p className="text-sm text-muted-foreground">Fiches de révision (résumé schématique du chapitre par IA)</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-mint/70 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
                </motion.div>
            </motion.div>
        </div>
    );

    // Student lesson content view
    const renderLessonContent = () => {
        const lessonContentNode = /<\s*(html|body|head|!doctype)/i.test(lessonContent) ? (
            <HtmlWithMath
                className="lesson-markdown html-with-math prose prose-sm dark:prose-invert max-w-none"
                htmlContent={injectHeaderIds(lessonContent)} />
        ) : (
            <LessonMarkdown content={lessonContent} dir="rtl" />
        );

        return (
            <div>
                {renderBreadcrumb()}

                {/* Activity tabs always on top for students */}
                {!canManage && selectedLesson && (
                    <LessonActivityTabs
                        key={activityResetKey}
                        dbQuizzes={dbQuizzes}
                        dbExercises={dbExercises}
                        chapterId={chapter.id}
                        chapterTitle={chapter.title}
                        lessonId={selectedLesson.id}
                        lessonTitle={selectedLesson.titleAr || selectedLesson.title}
                        readOnly={readOnly}
                        userId={userId}
                        schoolLevel={schoolLevel}
                        onSectionChange={(section) => {
                            const sectionLabels: Record<string, string> = {
                                exercises: "تمارين",
                                quiz: "اسئله متعدده الاختيارات",
                                revision: "Révision",
                            };
                            setActiveSection(section as "exercises" | "quiz" | "revision" | null);
                            if (section !== null) {
                                setActiveSectionLabel(sectionLabels[section] || section);
                            } else {
                                setActiveSectionLabel(null);
                            }
                        }}
                        hiddenBackButton
                    />
                )}

                {/* Course content should be hidden when an activity section is open. */}
                {activeSection === null && (
                    <div className="flex flex-col lg:flex-row gap-8 mt-6">
                        <Card className="flex-1 min-w-0 glass-card border-0">
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <h2 className="font-display text-xl font-extrabold min-w-0 flex-1">{selectedLesson?.titleAr || selectedLesson?.title}</h2>
                                    {lessonContent && !isNativeApp && (
                                        <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                                            <SheetTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="fixed right-4 top-20 z-50 lg:hidden shrink-0 gap-2 rounded-full border-primary/20 bg-primary/5 px-4 py-3 text-primary shadow-xl shadow-primary/10 backdrop-blur-md hover:bg-primary hover:text-primary-foreground"
                                                    aria-label="فهرس المحتويات"
                                                >
                                                    <span>فهرس المحتويات</span>
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="bottom" className="h-[82vh] rounded-t-3xl border-t p-0">
                                                <div className="flex h-full flex-col p-5">
                                                    <SheetHeader className="text-right sm:text-right">
                                                        <SheetTitle className="flex items-center gap-2 justify-end text-right">
                                                            <span>فهرس المحتويات</span>
                                                        </SheetTitle>
                                                    </SheetHeader>
                                                    <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                                                        <TableOfContents htmlContent={lessonContent} compact className="h-full overflow-y-auto pr-1" />
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    )}
                                </div>
                                {/* Native app only: the trigger is portaled straight to <body> because
                                    this Card has backdrop-filter (glass-card), and a `filter`/`backdrop-filter`
                                    ancestor creates a new containing block for `position: fixed` descendants —
                                    so a fixed button nested here would actually be pinned to the Card's own
                                    box (and scroll away with it) instead of staying put on screen. */}
                                {lessonContent && isNativeApp && createPortal(
                                    <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                                        <SheetTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="fixed right-4 top-20 z-50 shrink-0 gap-2 rounded-full border-primary/20 bg-primary/5 px-4 py-3 text-primary shadow-xl shadow-primary/10 backdrop-blur-md hover:bg-primary hover:text-primary-foreground"
                                                aria-label="فهرس المحتويات"
                                            >
                                                <span>فهرس المحتويات</span>
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="bottom" className="h-[82vh] rounded-t-3xl border-t p-0">
                                            <div className="flex h-full flex-col p-5">
                                                <SheetHeader className="text-right sm:text-right">
                                                    <SheetTitle className="flex items-center gap-2 justify-end text-right">
                                                        <span>فهرس المحتويات</span>
                                                    </SheetTitle>
                                                </SheetHeader>
                                                <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                                                    <TableOfContents htmlContent={lessonContent} compact className="h-full overflow-y-auto pr-1" />
                                                </div>
                                            </div>
                                        </SheetContent>
                                    </Sheet>,
                                    document.body
                                )}
                                {loadingContent ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                    </div>
                                ) : lessonContent ? (
                                    <div className={cn(
                                        "lesson-content-scroll overflow-x-auto overscroll-x-contain pb-2",
                                        isNativeApp && "touch-pan-x touch-pan-y"
                                    )}>
                                        {lessonContentNode}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">
                                        Aucun contenu disponible pour cette leçon.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <div className="hidden lg:block w-full lg:w-72 shrink-0">
                            <TableOfContents htmlContent={lessonContent} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Fallback if no lessons
    const renderNoLesson = () => (
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            <HtmlWithMath htmlContent={chapter.content || "<p>Contenu non disponible</p>"} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99]" onClick={() => onActivitySelect?.("quiz")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                            <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold" dir="rtl">اسئله متعدده الاختيارات</h3>
                            <p className="text-sm text-muted-foreground" dir="rtl">{dbQuizzes.length} أسئلة</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99]" onClick={() => onActivitySelect?.("exercises")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                            <PenTool className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold" dir="rtl">تمارين</h3>
                            <p className="text-sm text-muted-foreground" dir="rtl">{dbExercises.length} تمارين</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99]" onClick={() => onActivitySelect?.("revision")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                            <BookOpen className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Révision</h3>
                            <p className="text-sm text-muted-foreground">Fiches de révision</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderActivityCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99]" onClick={() => onActivitySelect?.("quiz")}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold" dir="rtl">اسئله متعدده الاختيارات</h3>
                        <p className="text-sm text-muted-foreground" dir="rtl">{dbQuizzes.length} أسئلة</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99]" onClick={() => onActivitySelect?.("exercises")}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <PenTool className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold" dir="rtl">تمارين</h3>
                        <p className="text-sm text-muted-foreground" dir="rtl">{dbExercises.length} تمارين</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.99]" onClick={() => onActivitySelect?.("revision")}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Révision</h3>
                        <p className="text-sm text-muted-foreground">Fiches de révision</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    function renderNavigation() {
        const currentLessonIndex = selectedLesson
            ? chapter.lessons?.findIndex((l: any) => l.id === selectedLesson.id) ?? -1
            : -1;
        const isFirstLesson = currentLessonIndex === 0;
        const isLastLesson = currentLessonIndex === chapter.lessons?.length - 1;
        const currentChapterIndex = chapters.findIndex((c: any) => c.id === chapter.id);

        const scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        // When a lesson is selected - lesson-based navigation
        if (selectedLesson && chapter.lessons && chapter.lessons.length > 0) {
            return (
                <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-border/50">
                    {/* Previous lesson button - only show if not first lesson */}
                    {!isFirstLesson ? (
                        <Button
                            variant="outline"
                            className="rounded-full gap-2 active:scale-95 transition-transform"
                            onClick={() => {
                                const prevLesson = chapter.lessons[currentLessonIndex - 1];
                                handleLessonClick(prevLesson);
                                scrollToTop();
                            }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Leçon précédente
                        </Button>
                    ) : (
                        <div /> // Spacer for alignment
                    )}

                    {/* Next lesson button - only show if not last lesson */}
                    {!isLastLesson ? (
                        <Button
                            className="rounded-full gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
                            onClick={() => {
                                const nextLesson = chapter.lessons[currentLessonIndex + 1];
                                handleLessonClick(nextLesson);
                                scrollToTop();
                            }}
                        >
                            Leçon suivante
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                    ) : currentChapterIndex < chapters.length - 1 ? (
                        // When on last lesson, show "Chapter next" button
                        <Button
                            className="rounded-full gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
                            onClick={() => {
                                handleChapterChange("next");
                                scrollToTop();
                            }}
                        >
                            Chapitre suivant
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                    ) : null}
                </div>
            );
        }

        // Chapter navigation - when no lesson is selected
        return (
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
                <Button
                    variant="outline"
                    className="rounded-full gap-2 active:scale-95 transition-transform disabled:opacity-40"
                    onClick={() => handleChapterChange("prev")}
                    disabled={currentChapterIndex === 0}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Chapitre précédent
                </Button>
                <Button
                    className="rounded-full gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-40"
                    onClick={() => handleChapterChange("next")}
                    disabled={currentChapterIndex === chapters.length - 1}
                >
                    Chapitre suivant
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
            </div>
        );
    }

    // No lessons in chapter
    if (!chapter.lessons || chapter.lessons.length === 0) {
        if (canManage) {
            // Pédagogue → afficher la liste des leçons (vide) avec le bouton d'ajout
            return (
                <>
                    {renderLessonsList()}
                    {renderNavigation()}
                </>
            );
        }
        return (
            <>
                {showActivityCards && renderActivityCards()}
                {renderNoLesson()}
                {renderNavigation()}
            </>
        );
    }

    if (showRevision) {
        return (
            <>
                {renderBreadcrumb()}
                <ChapterRevision chapter={chapter} onBack={() => setShowRevision(false)} />
            </>
        );
    }

    return (
        <>
            {!selectedLesson ? (
                renderLessonsList()
            ) : (
                renderLessonContent()
            )}
            {renderNavigation()}
        </>
    );
}

