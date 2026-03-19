import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, BookOpen, Sparkles, Eye, Lightbulb, Rocket, ChevronRight, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface DBQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty?: number;
}

export interface DBExercise {
  id: string;
  title: string;
  statement: string;
  expected_answer: string;
  accepted_answers: string[];
  solution: string;
  difficulty?: number;
}

interface LessonActivityTabsProps {
  dbQuizzes: DBQuizQuestion[];
  dbExercises: DBExercise[];
  chapterId: string;
  chapterTitle: string;
  lessonTitle: string;
  onGenerateAI: (type: "quiz" | "exercise") => void;
  onSectionChange?: (section: string | null) => void;
  hiddenBackButton?: boolean;
  readOnly?: boolean;
}

type ActivitySection = "exercises" | "quiz" | "revision" | null;
type StepLevel = "decouvrir" | "comprendre" | "approfondir";

const REQUIRED_CORRECT = 3;

const stepConfig: { id: StepLevel; label: string; labelAr: string; icon: typeof Eye; color: string }[] = [
  { id: "decouvrir", label: "Découvrir", labelAr: "اكتشف", icon: Eye, color: "text-blue-500" },
  { id: "comprendre", label: "Comprendre", labelAr: "افهم", icon: Lightbulb, color: "text-yellow-500" },
  { id: "approfondir", label: "Approfondir", labelAr: "تعمّق", icon: Rocket, color: "text-purple-500" },
];

export function LessonActivityTabs({ dbQuizzes, dbExercises, chapterId, chapterTitle, lessonTitle, onGenerateAI, onSectionChange, hiddenBackButton, readOnly }: LessonActivityTabsProps) {
  const [activeSection, setActiveSection] = useState<ActivitySection>(null);
  const [activeStep, setActiveStep] = useState<StepLevel>("decouvrir");

  // Progression tracking for Découvrir (separate for exercises and quizzes)
  const [discoverCorrectEx, setDiscoverCorrectEx] = useState(0);
  const [discoverCorrectQz, setDiscoverCorrectQz] = useState(0);
  const [discoverTotalEx, setDiscoverTotalEx] = useState(0);
  const [discoverTotalQz, setDiscoverTotalQz] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const isUnlocked = activeSection === "exercises"
    ? discoverCorrectEx >= REQUIRED_CORRECT
    : discoverCorrectQz >= REQUIRED_CORRECT;

  const currentCorrect = activeSection === "exercises" ? discoverCorrectEx : discoverCorrectQz;

  const handleSectionChange = (section: ActivitySection) => {
    setActiveSection(section);
    setActiveStep("decouvrir");
    onSectionChange?.(section);
  };

  const handleDiscoverAnswer = useCallback((isCorrect: boolean, type: "exercise" | "quiz") => {
    if (type === "exercise") {
      setDiscoverTotalEx(prev => prev + 1);
      if (isCorrect) setDiscoverCorrectEx(prev => prev + 1);
    } else {
      setDiscoverTotalQz(prev => prev + 1);
      if (isCorrect) setDiscoverCorrectQz(prev => prev + 1);
    }
  }, []);

  const handleReloadDiscover = () => {
    if (activeSection === "exercises") {
      setDiscoverCorrectEx(0);
      setDiscoverTotalEx(0);
    } else {
      setDiscoverCorrectQz(0);
      setDiscoverTotalQz(0);
    }
    setResetKey(prev => prev + 1);
  };

  // Split DB content into discover/understand tiers
  const halfQuiz = Math.ceil(dbQuizzes.length / 2);
  const discoverQuizzes = dbQuizzes.slice(0, halfQuiz);
  const understandQuizzes = dbQuizzes.slice(halfQuiz);

  const halfExercise = Math.ceil(dbExercises.length / 2);
  const discoverExercises = dbExercises.slice(0, halfExercise);
  const understandExercises = dbExercises.slice(halfExercise);

  const visibleSteps = readOnly ? stepConfig.filter(s => s.id !== "approfondir") : stepConfig;

  const discoverItemCount = activeSection === "exercises" ? discoverExercises.length : discoverQuizzes.length;
  const currentTotal = activeSection === "exercises" ? discoverTotalEx : discoverTotalQz;
  const allAnswered = currentTotal >= discoverItemCount && discoverItemCount > 0;
  const failedDiscover = allAnswered && !isUnlocked;

  if (activeSection === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="cursor-pointer group hover:shadow-lg hover:border-primary/50 transition-all" onClick={() => handleSectionChange("exercises")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="h-7 w-7 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" dir="rtl">تمارين</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{dbExercises.length} تمارين{!readOnly && " + ذكاء اصطناعي"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer group hover:shadow-lg hover:border-primary/50 transition-all" onClick={() => handleSectionChange("quiz")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" dir="rtl">اختبارات</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{dbQuizzes.length} أسئلة{!readOnly && " + ذكاء اصطناعي"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer group hover:shadow-lg hover:border-green-500/50 transition-all" onClick={() => handleSectionChange("revision")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Révision</h3>
              <p className="text-sm text-muted-foreground">Fiches de révision</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeSection === "revision") {
    return (
      <div className="mt-6 space-y-4">
        {!hiddenBackButton && <Button variant="outline" size="sm" onClick={() => handleSectionChange(null)}>← العودة</Button>}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /><span>Fiches de révision</span></CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-center py-8" dir="rtl">بطاقات المراجعة الخاصة بالدرس متوفرة في القسم الذكي أعلاه.</p></CardContent>
        </Card>
      </div>
    );
  }

  const isQuiz = activeSection === "quiz";
  const SectionIcon = isQuiz ? Brain : PenTool;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        {!hiddenBackButton && <Button variant="outline" size="sm" onClick={() => handleSectionChange(null)}>← العودة</Button>}
        <div className="flex items-center gap-2">
          <SectionIcon className={cn("h-5 w-5", isQuiz ? "text-primary" : "text-orange-500")} />
          <h2 className="text-lg font-bold" dir="rtl">{isQuiz ? "اختبارات" : "تمارين"}</h2>
        </div>
      </div>

      {/* Progression Bar */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" dir="rtl">تقدمك في مرحلة "اكتشف"</span>
            <Badge variant={isUnlocked ? "default" : "secondary"} className={isUnlocked ? "bg-green-500" : ""}>
              {currentCorrect} / {REQUIRED_CORRECT} إجابات صحيحة
            </Badge>
          </div>
          <Progress value={(currentCorrect / REQUIRED_CORRECT) * 100} className="h-2" />
          {isUnlocked && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1" dir="rtl">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تم فتح المراحل التالية! يمكنك الآن الانتقال إلى "افهم" و "تعمّق"
            </p>
          )}
          {failedDiscover && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-red-500" dir="rtl">لم تحقق {REQUIRED_CORRECT} إجابات صحيحة. حاول مرة أخرى!</p>
              <Button size="sm" variant="outline" onClick={handleReloadDiscover} className="gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                إعادة المحاولة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {visibleSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isLocked = (step.id === "comprendre" || step.id === "approfondir") && !isUnlocked;
          return (
            <button
              key={step.id}
              onClick={() => !isLocked && setActiveStep(step.id)}
              disabled={isLocked}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap relative",
                isLocked ? "border-border/50 bg-muted/30 opacity-60 cursor-not-allowed"
                  : isActive ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                  : "border-border hover:border-primary/30 hover:bg-muted/50 cursor-pointer"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                isLocked ? "bg-muted text-muted-foreground"
                  : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {isLocked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <Icon className={cn("h-4 w-4", isLocked ? "text-muted-foreground" : step.color)} />
              <div className="text-left">
                <p className={cn("text-sm font-semibold", isLocked ? "text-muted-foreground" : isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">{step.labelAr}</p>
              </div>
              {isLocked && <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold">🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === "decouvrir" && (
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Eye className="h-5 w-5" />
              <span dir="rtl">{isQuiz ? "اختبارات تشخيصية" : "تمارين تمهيدية"}</span>
              <Badge variant="secondary" className="ml-auto">{isQuiz ? discoverQuizzes.length : discoverExercises.length} {isQuiz ? "أسئلة" : "تمارين"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isQuiz ? (
              discoverQuizzes.length > 0 ? (
                <div className="space-y-3" key={resetKey}>
                  {discoverQuizzes.map((q, idx) => (
                    <TrackedQuizCard key={`${q.id}-${resetKey}`} question={q} index={idx} readOnly={readOnly} onAnswer={(c) => handleDiscoverAnswer(c, "quiz")} />
                  ))}
                </div>
              ) : <EmptyState text="لا توجد اختبارات تشخيصية بعد" />
            ) : (
              discoverExercises.length > 0 ? (
                <div className="space-y-3" key={resetKey}>
                  {discoverExercises.map((ex, idx) => (
                    <TrackedExerciseCard key={`${ex.id}-${resetKey}`} exercise={ex} index={idx} readOnly={readOnly} onAnswer={(c) => handleDiscoverAnswer(c, "exercise")} />
                  ))}
                </div>
              ) : <EmptyState text="لا توجد تمارين تمهيدية بعد" />
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "comprendre" && isUnlocked && (
        <Card className="border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Lightbulb className="h-5 w-5" />
              <span dir="rtl">{isQuiz ? "اختبارات تطبيقية" : "تمارين تطبيقية"}</span>
              <Badge variant="secondary" className="ml-auto">{isQuiz ? understandQuizzes.length : understandExercises.length} {isQuiz ? "أسئلة" : "تمارين"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isQuiz ? (
              understandQuizzes.length > 0 ? (
                <div className="space-y-3">{understandQuizzes.map((q, idx) => <QuizQuestionCard key={q.id} question={q} index={idx + halfQuiz} readOnly={readOnly} />)}</div>
              ) : <EmptyState text="لا توجد اختبارات تطبيقية بعد" />
            ) : (
              understandExercises.length > 0 ? (
                <div className="space-y-3">{understandExercises.map((ex, idx) => <ExerciseCard key={ex.id} exercise={ex} index={idx + halfExercise} readOnly={readOnly} />)}</div>
              ) : <EmptyState text="لا توجد تمارين تطبيقية بعد" />
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "approfondir" && isUnlocked && (
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-purple-600">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span dir="rtl">{isQuiz ? "اختبارات ذكية" : "تمارين ذكية"} - إنشاء بالذكاء الاصطناعي</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto" dir="rtl">
              {isQuiz ? "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء اختبارات متقدمة تناسب مستواك" : "اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بإنشاء تمارين متقدمة تناسب مستواك"}
            </p>
            <Button size="lg" onClick={() => onGenerateAI(isQuiz ? "quiz" : "exercise")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-purple-500/20">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Générer avec l'IA
            </Button>
          </CardContent>
        </Card>
      )}

      {(activeStep === "comprendre" || activeStep === "approfondir") && !isUnlocked && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-3">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-lg" dir="rtl">هذه المرحلة مقفلة</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto" dir="rtl">
              يجب عليك الإجابة على {REQUIRED_CORRECT} أسئلة صحيحة على الأقل في مرحلة "اكتشف" لفتح هذه المرحلة.
            </p>
            <Button variant="outline" onClick={() => setActiveStep("decouvrir")} className="gap-2">
              <Eye className="h-4 w-4" />
              العودة إلى "اكتشف"
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Sub-components ---

function TrackedQuizCard({ question, index, readOnly, onAnswer }: { question: DBQuizQuestion; index: number; readOnly?: boolean; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === question.correct_answer;
  const answered = selected !== null;

  const handleSelect = (opt: string) => {
    if (readOnly || answered) return;
    setSelected(opt);
    onAnswer(opt === question.correct_answer);
  };

  return (
    <Card className={cn("transition-all", answered && isCorrect && "border-green-500/50 bg-green-500/5", answered && !isCorrect && "border-red-500/50 bg-red-500/5")}>
      <CardContent className="p-4">
        <p className="font-medium mb-3" dir="rtl">{index + 1}. {question.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options.map((opt, oIdx) => (
            <Button key={oIdx} variant={selected === opt ? (isCorrect ? "default" : "destructive") : "outline"}
              className={cn("justify-start text-right", opt === question.correct_answer && answered && "border-green-500 bg-green-500/10")}
              onClick={() => handleSelect(opt)} disabled={readOnly || answered} dir="rtl">{opt}</Button>
          ))}
        </div>
        {answered && question.explanation && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl"><span className="font-medium">الشرح: </span>{question.explanation}</div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedExerciseCard({ exercise, index, readOnly, onAnswer }: { exercise: DBExercise; index: number; readOnly?: boolean; onAnswer: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const isCorrect = answer.trim() === exercise.expected_answer || exercise.accepted_answers.includes(answer.trim());
    setResult(isCorrect);
    onAnswer(isCorrect);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h4 className="font-semibold" dir="rtl">{index + 1}. {exercise.title}</h4>
        <p className="text-sm" dir="rtl">{exercise.statement}</p>
        {!readOnly && result === null && (
          <div className="flex gap-2" dir="rtl">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background" placeholder="أدخل إجابتك..." value={answer} onChange={(e) => setAnswer(e.target.value)} dir="rtl" />
            <Button size="sm" onClick={handleSubmit}>تحقق</Button>
          </div>
        )}
        {result !== null && (
          <div className={cn("p-2 rounded text-sm", result ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
            {result ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${exercise.expected_answer}`}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "إخفاء الحل" : "عرض الحل"}</Button>
        {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">الحل: </span>{exercise.solution}</div>}
      </CardContent>
    </Card>
  );
}

function QuizQuestionCard({ question, index, readOnly }: { question: DBQuizQuestion; index: number; readOnly?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === question.correct_answer;
  const answered = selected !== null;

  return (
    <Card className={cn("transition-all", answered && isCorrect && "border-green-500/50 bg-green-500/5", answered && !isCorrect && "border-red-500/50 bg-red-500/5")}>
      <CardContent className="p-4">
        <p className="font-medium mb-3" dir="rtl">{index + 1}. {question.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options.map((opt, oIdx) => (
            <Button key={oIdx} variant={selected === opt ? (isCorrect ? "default" : "destructive") : "outline"}
              className={cn("justify-start text-right", opt === question.correct_answer && answered && "border-green-500 bg-green-500/10")}
              onClick={() => !readOnly && !answered && setSelected(opt)} disabled={readOnly || answered} dir="rtl">{opt}</Button>
          ))}
        </div>
        {answered && question.explanation && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl"><span className="font-medium">الشرح: </span>{question.explanation}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ExerciseCard({ exercise, index, readOnly }: { exercise: DBExercise; index: number; readOnly?: boolean }) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const isCorrect = answer.trim() === exercise.expected_answer || exercise.accepted_answers.includes(answer.trim());
    setResult(isCorrect);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h4 className="font-semibold" dir="rtl">{index + 1}. {exercise.title}</h4>
        <p className="text-sm" dir="rtl">{exercise.statement}</p>
        {!readOnly && result === null && (
          <div className="flex gap-2" dir="rtl">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background" placeholder="أدخل إجابتك..." value={answer} onChange={(e) => setAnswer(e.target.value)} dir="rtl" />
            <Button size="sm" onClick={handleSubmit}>تحقق</Button>
          </div>
        )}
        {result !== null && (
          <div className={cn("p-2 rounded text-sm", result ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")} dir="rtl">
            {result ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${exercise.expected_answer}`}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>{revealed ? "إخفاء الحل" : "عرض الحل"}</Button>
        {revealed && <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl"><span className="font-medium">الحل: </span>{exercise.solution}</div>}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-8"><p className="text-muted-foreground" dir="rtl">{text}</p></div>;
}
