import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, PenTool, ChevronLeft, Eye, Lightbulb, Plus, Pencil, Trash2 } from "lucide-react";
import { QuizFormDialog, DeleteQuizButton, ExerciseFormDialog, DeleteExerciseButton } from "./QuizExerciseCRUD";

interface DBQuiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

interface DBExercise {
  id: string;
  title: string;
  statement: string;
  expected_answer: string;
  accepted_answers: string[];
  solution: string;
  order_index: number;
}

const LEVELS = [
  { key: "discover", label: "Découvrir", labelAr: "اكتشف", step: 1, icon: Eye, color: "text-blue-500" },
  { key: "understand", label: "Comprendre", labelAr: "افهم", step: 2, icon: Lightbulb, color: "text-yellow-500" },
];

interface LessonEditorActivitiesProps {
  chapterId: string;
  lessonId?: string;
  lessonTitle?: string;
  onActiveChange?: (isActive: boolean) => void;
}

export function LessonEditorActivities({
  chapterId,
  lessonId,
  lessonTitle = "",
  onActiveChange,
}: LessonEditorActivitiesProps) {
  const [activeTab, setActiveTab] = useState<"exercises" | "quizzes" | null>(null);
  const [activeLevel, setActiveLevel] = useState<string>("discover");
  const [quizzes, setQuizzes] = useState<DBQuiz[]>([]);
  const [exercises, setExercises] = useState<DBExercise[]>([]);

  const handleTabChange = (tab: "exercises" | "quizzes" | null) => {
    setActiveTab(tab);
    onActiveChange?.(tab !== null);
  };

  const fetchData = useCallback(async () => {
    let qQuery = supabase.from("chapter_quizzes").select("*").eq("chapter_id", chapterId).order("order_index");
    let eQuery = supabase.from("chapter_exercises").select("*").eq("chapter_id", chapterId).order("order_index");

    if (lessonId) {
      qQuery = qQuery.eq("lesson_id", lessonId);
      eQuery = eQuery.eq("lesson_id", lessonId);
    }

    const [{ data: q }, { data: e }] = await Promise.all([qQuery, eQuery]);

    setQuizzes((q || []).map((item: any) => ({ ...item, options: Array.isArray(item.options) ? item.options : [], accepted_answers: Array.isArray(item.accepted_answers) ? item.accepted_answers : [] })));
    setExercises((e || []).map((item: any) => ({ ...item, accepted_answers: Array.isArray(item.accepted_answers) ? item.accepted_answers : [] })));
  }, [chapterId, lessonId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Split items by level - first half uncover, second understand
  const splitByLevel = <T extends any>(items: T[]) => {
    const mid = Math.ceil(items.length / 2);
    return {
      discover: items.slice(0, mid),
      understand: items.slice(mid),
    };
  };

  const exercisesByLevel = splitByLevel(exercises);
  const quizzesByLevel = splitByLevel(quizzes);

  // Tab buttons view
  if (!activeTab) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 mb-8">
        <Card
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent group"
          onClick={() => handleTabChange("exercises")}
        >
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
              <PenTool className="h-7 w-7 text-accent-foreground group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white" dir="rtl">تمارين (Exercices)</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1" dir="rtl">{exercises.length} تمارين متاحة</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary group"
          onClick={() => handleTabChange("quizzes")}
        >
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
              <Brain className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white" dir="rtl">اختبارات (Quizzes)</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1" dir="rtl">{quizzes.length} أسئلة متاحة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExercises = activeTab === "exercises";
  const discoverItems = isExercises ? (exercisesByLevel as any).discover : (quizzesByLevel as any).discover;
  const understandItems = isExercises ? (exercisesByLevel as any).understand : (quizzesByLevel as any).understand;

  return (
    <div className="mt-6 mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card rounded-xl border shadow-sm p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleTabChange(null)} className="h-9 px-4 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span dir="rtl" className="font-medium">العودة إلى محتوى الدرس</span>
          </Button>
          <div className="mr-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              {isExercises ? <PenTool className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
              <span dir="rtl">{isExercises ? "إدارة التمارين" : "إدارة الاختبارات"}</span>
            </h2>
            {lessonTitle && <p className="text-sm text-muted-foreground mt-1" dir="rtl">{lessonTitle}</p>}
          </div>
        </div>
      </div>

      <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 p-1">
          {LEVELS.map((level) => {
            const count = level.key === "discover" ? discoverItems.length : understandItems.length;
            const Icon = level.icon;
            return (
              <TabsTrigger
                key={level.key}
                value={level.key}
                className="flex items-center justify-center gap-2 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all h-full"
              >
                <Icon className={`h-4 w-4 ${level.color}`} />
                <span>{level.label}</span>
                <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5 flex items-center justify-center">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {LEVELS.map((level) => {
          const items = level.key === "discover" ? discoverItems : understandItems;
          const Icon = level.icon;

          return (
            <TabsContent key={level.key} value={level.key} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background shadow-xs border ${level.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" dir="rtl">{level.labelAr}</h3>
                    <p className="text-xs text-muted-foreground">{level.label}</p>
                  </div>
                </div>
                {isExercises ? (
                  <ExerciseFormDialog
                    chapterId={chapterId}
                    lessonId={lessonId}
                    onSaved={fetchData}
                    trigger={
                      <Button size="sm" className="gap-2 shadow-sm whitespace-nowrap">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline" dir="rtl">إضافة تمرين</span>
                      </Button>
                    }
                  />
                ) : (
                  <QuizFormDialog
                    chapterId={chapterId}
                    lessonId={lessonId}
                    onSaved={fetchData}
                    trigger={
                      <Button size="sm" className="gap-2 shadow-sm whitespace-nowrap">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline" dir="rtl">إضافة سؤال</span>
                      </Button>
                    }
                  />
                )}
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-xl border-muted bg-muted/10 text-center">
                  <div className={`p-4 rounded-full bg-background border shadow-sm mb-4 ${level.color}`}>
                    <Icon className="h-8 w-8 opacity-50" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground" dir="rtl">
                    لا توجد {isExercises ? "تمارين" : "اختبارات"} في هذا المستوى
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-md mt-2" dir="rtl">
                    ابدأ في إثراء هذا الدرس عن طريق إضافة {isExercises ? "أول تمرين لك" : "أول سؤال لك"}. سيساعد ذلك الطلاب على {level.labelAr}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((item: any, idx: number) => (
                    <Card key={item.id} className="group hover:border-primary/40 hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        {/* Status/Index indicator */}
                        <div className="bg-muted/40 sm:w-16 flex flex-row sm:flex-col items-center justify-center p-3 border-b sm:border-b-0 sm:border-r gap-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:block">
                            {isExercises ? "Exo" : "Qst"}
                          </span>
                          <span className="h-8 w-8 rounded-full bg-background border flex items-center justify-center font-bold text-primary shadow-sm">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 min-w-0" dir="rtl">
                          {isExercises ? (
                            <div className="space-y-2 text-right">
                              <h4 className="font-semibold text-base sm:text-lg text-foreground">{item.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed bg-muted/20 p-2 rounded-md border border-border/40">
                                {item.statement}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3 text-right">
                              <h4 className="font-semibold text-base sm:text-lg text-foreground">{item.question}</h4>
                              <div className="flex flex-wrap gap-2 justify-start">
                                {item.options?.map((opt: string, i: number) => (
                                  <span
                                    key={i}
                                    className={`px-2.5 py-1 text-xs rounded-full border ${opt === item.correct_answer
                                      ? "bg-green-500/10 text-green-700 border-green-500/30 font-medium"
                                      : "bg-muted/50 text-muted-foreground border-border"
                                      }`}
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 p-3 sm:border-l bg-muted/10 items-center justify-end sm:justify-start border-t sm:border-t-0">
                          {isExercises ? (
                            <>
                              <ExerciseFormDialog
                                chapterId={chapterId}
                                lessonId={lessonId}
                                onSaved={fetchData}
                                exercise={item}
                                trigger={
                                  <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors" title="Modifier">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <DeleteExerciseButton exerciseId={item.id} onDeleted={fetchData} />
                            </>
                          ) : (
                            <>
                              <QuizFormDialog
                                chapterId={chapterId}
                                lessonId={lessonId}
                                onSaved={fetchData}
                                quiz={item}
                                trigger={
                                  <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors" title="Modifier">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <DeleteQuizButton quizId={item.id} onDeleted={fetchData} />
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
