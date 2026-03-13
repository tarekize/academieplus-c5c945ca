import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, ChevronLeft } from "lucide-react";
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
  { key: "discover", label: "Découvrir", labelAr: "اكتشف", step: 1 },
  { key: "understand", label: "Comprendre", labelAr: "افهم", step: 2 },
];

export function LessonEditorActivities({ chapterId }: { chapterId: string }) {
  const [activeTab, setActiveTab] = useState<"exercises" | "quizzes" | null>(null);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<DBQuiz[]>([]);
  const [exercises, setExercises] = useState<DBExercise[]>([]);

  const fetchData = useCallback(async () => {
    const [{ data: q }, { data: e }] = await Promise.all([
      supabase.from("chapter_quizzes").select("*").eq("chapter_id", chapterId).order("order_index"),
      supabase.from("chapter_exercises").select("*").eq("chapter_id", chapterId).order("order_index"),
    ]);
    setQuizzes((q || []).map((item: any) => ({ ...item, options: Array.isArray(item.options) ? item.options : [], accepted_answers: Array.isArray(item.accepted_answers) ? item.accepted_answers : [] })));
    setExercises((e || []).map((item: any) => ({ ...item, accepted_answers: Array.isArray(item.accepted_answers) ? item.accepted_answers : [] })));
  }, [chapterId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Split items by level based on order_index: first half = discover, second half = understand
  const splitByLevel = <T extends { order_index: number }>(items: T[]) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30"
          onClick={() => setActiveTab("exercises")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <PenTool className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold" dir="rtl">تمارين</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{exercises.length} تمارين</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30"
          onClick={() => setActiveTab("quizzes")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold" dir="rtl">اختبارات</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{quizzes.length} أسئلة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level selection view
  if (!activeLevel) {
    return (
      <div className="mt-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          رجوع
        </Button>
        <h3 className="text-lg font-semibold" dir="rtl">
          {activeTab === "exercises" ? "تمارين" : "اختبارات"} — اختر المستوى
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEVELS.map((level) => {
            const count = activeTab === "exercises"
              ? (exercisesByLevel as any)[level.key]?.length || 0
              : (quizzesByLevel as any)[level.key]?.length || 0;
            return (
              <Card
                key={level.key}
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30"
                onClick={() => setActiveLevel(level.key)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">{level.step}</span>
                  </div>
                  <h4 className="font-semibold">{level.label}</h4>
                  <p className="text-sm text-muted-foreground" dir="rtl">{level.labelAr}</p>
                  <p className="text-xs text-muted-foreground mt-2">{count} {activeTab === "exercises" ? "تمارين" : "أسئلة"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // CRUD list view
  const levelLabel = LEVELS.find(l => l.key === activeLevel);
  const isExercises = activeTab === "exercises";
  const items = isExercises
    ? (exercisesByLevel as any)[activeLevel] || []
    : (quizzesByLevel as any)[activeLevel] || [];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setActiveLevel(null)} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          رجوع
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {levelLabel?.label} — {levelLabel?.labelAr}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" dir="rtl">
          {isExercises ? "تمارين" : "اختبارات"} ({items.length})
        </h3>
        {isExercises ? (
          <ExerciseFormDialog chapterId={chapterId} onSaved={fetchData} />
        ) : (
          <QuizFormDialog chapterId={chapterId} onSaved={fetchData} />
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground" dir="rtl">
          <p>لا توجد {isExercises ? "تمارين" : "اختبارات"} بعد في هذا المستوى</p>
          <p className="text-sm mt-1">أضف {isExercises ? "تمرين" : "سؤال"} جديد باستخدام الزر أعلاه</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-start gap-3" dir="rtl">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0 mt-1">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {isExercises ? (
                    <>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.statement}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{item.question}</p>
                      {item.explanation && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.explanation}</p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {isExercises ? (
                    <>
                      <ExerciseFormDialog chapterId={chapterId} onSaved={fetchData} exercise={item} />
                      <DeleteExerciseButton exerciseId={item.id} onDeleted={fetchData} />
                    </>
                  ) : (
                    <>
                      <QuizFormDialog chapterId={chapterId} onSaved={fetchData} quiz={item} />
                      <DeleteQuizButton quizId={item.id} onDeleted={fetchData} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
