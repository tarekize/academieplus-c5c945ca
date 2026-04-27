import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, BookOpen, Clock, Pause, Play, PenTool, Loader2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

function DifficultyPencils({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 ml-2" title={`Difficulté ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <PenTool key={i} className={cn("h-3.5 w-3.5", i < level ? "text-primary fill-primary/20" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { QuizFormDialog, DeleteQuizButton } from "./QuizExerciseCRUD";
import { HtmlWithMath } from "./HtmlWithMath";

export interface DBQuizQuestion {
  id: string;
  lesson_id?: string | null;
  question: string;
  options: string[];
  correct_answer?: string;
  explanation: string | null;
  difficulty?: number;
  hint?: string | null;
}

interface ChapterMathQuizProps {
  questions: DBQuizQuestion[];
  chapterTitle: string;
  chapterId: string;
  onClose: () => void;
  canManage?: boolean;
  onRefresh?: () => void;
}

export const ChapterMathQuiz = ({ questions, chapterTitle, chapterId, onClose, canManage, onRefresh }: ChapterMathQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{ question: string; userAnswer: string; correct: boolean }[]>([]);
  const [showHint, setShowHint] = useState(false);

  const quizContentId = useMemo(() => `quiz-${chapterId}`, [chapterId]);
  const { formattedTime, isPaused, pause, resume } = useTimeTracking({
    contentType: "quiz", contentId: quizContentId, chapterId, autoStart: true, enabled: true,
  });

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('check_quiz_answer', {
        _quiz_id: currentQuestion.id,
        _user_answer: selectedAnswer,
      });

      if (error) throw error;

      const result = data as { is_correct: boolean; explanation: string; correct_answer: string | null };
      setIsCorrect(result.is_correct);
      setCorrectAnswer(result.correct_answer);
      setExplanation(result.explanation || currentQuestion.explanation || "");
      setHasAnswered(true);

      if (result.is_correct) setScore(prev => prev + 1);
      setAnswers(prev => [...prev, { question: currentQuestion.question, userAnswer: selectedAnswer, correct: result.is_correct }]);
    } catch (error) {
      console.error("Error validating answer:", error);
      // Fallback to client-side if RPC fails and correct_answer is available (admin/pedago)
      if (currentQuestion.correct_answer) {
        const correct = selectedAnswer === currentQuestion.correct_answer;
        setIsCorrect(correct);
        setCorrectAnswer(correct ? null : currentQuestion.correct_answer);
        setExplanation(currentQuestion.explanation || "");
        setHasAnswered(true);
        if (correct) setScore(prev => prev + 1);
        setAnswers(prev => [...prev, { question: currentQuestion.question, userAnswer: selectedAnswer, correct }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer("");
      setHasAnswered(false);
      setIsCorrect(false);
      setCorrectAnswer(null);
      setExplanation("");
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0); setSelectedAnswer(""); setHasAnswered(false);
    setScore(0); setShowResults(false); setAnswers([]);
    setIsCorrect(false); setCorrectAnswer(null); setExplanation("");
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">!انتهى الاختبار</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{chapterTitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">{score}/{questions.length}</div>
            <p className="text-muted-foreground">
              {percentage >= 80 ? "!عمل ممتاز 🎉" : percentage >= 60 ? "!أحسنت، واصل 👍" : "!واصل التدريب 💪"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex">
              <Clock className="h-4 w-4" /><span className="font-mono font-medium">{formattedTime}</span>
            </div>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {answers.map((answer, index) => (
              <div key={index} className={cn("p-3 rounded-lg flex items-start gap-3", answer.correct ? "bg-green-500/10" : "bg-red-500/10")}>
                {answer.correct ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />}
                <HtmlWithMath htmlContent={answer.question} className="text-sm" dir="rtl" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRestart} className="flex-1"><RotateCcw className="h-4 w-4 mr-2" />إعادة</Button>
            <Button onClick={onClose} className="flex-1"><BookOpen className="h-4 w-4 mr-2" />العودة للدرس</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center" dir="rtl">
        <p>لا توجد أسئلة متاحة لهذا الفصل.</p>
        {canManage && onRefresh && (
          <div className="mt-4 flex justify-center gap-2">
            <QuizFormDialog chapterId={chapterId} onSaved={onRefresh} />
          </div>
        )}
        <Button onClick={onClose} className="mt-4">العودة للدرس</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-semibold bg-muted px-3 py-1.5 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-mono">{formattedTime}</span>
              {isPaused && <span className="text-xs text-muted-foreground">(إيقاف)</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={isPaused ? resume : pause} className="gap-1">
              {isPaused ? <><Play className="h-4 w-4" />استئناف</> : <><Pause className="h-4 w-4" />إيقاف</>}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">سؤال {currentIndex + 1} / {questions.length}</div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">{chapterTitle}</span>
            {canManage && onRefresh && (
              <div className="flex gap-1">
                <QuizFormDialog chapterId={chapterId} onSaved={onRefresh} />
                <QuizFormDialog chapterId={chapterId} onSaved={onRefresh} quiz={{
                  id: currentQuestion.id, question: currentQuestion.question,
                  options: currentQuestion.options, correct_answer: currentQuestion.correct_answer || "",
                  explanation: currentQuestion.explanation,
                }} />
                <DeleteQuizButton quizId={currentQuestion.id} onDeleted={onRefresh} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2" dir="rtl"><HtmlWithMath htmlContent={currentQuestion.question} className="flex-1" />{currentQuestion.difficulty && <DifficultyPencils level={currentQuestion.difficulty} />}</h3>
          {currentQuestion.hint && (
            <div dir="rtl" className="space-y-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowHint(v => !v)} className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950">
                <Lightbulb className="h-4 w-4" />{showHint ? "إخفاء المساعدة" : "مساعدة"}
              </Button>
              {showHint && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    <HtmlWithMath htmlContent={currentQuestion.hint} className="text-sm" />
                  </div>
                </div>
              )}
            </div>
          )}
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={hasAnswered || isSubmitting} className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isThisCorrect = hasAnswered && correctAnswer !== null ? option === correctAnswer : hasAnswered && isCorrect && option === selectedAnswer;
              const isThisSelected = option === selectedAnswer;
              const isThisWrong = hasAnswered && isThisSelected && !isCorrect;
              const isThisTheCorrectOne = hasAnswered && !isCorrect && option === correctAnswer;
              return (
                <div key={index} className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                  (isThisCorrect || isThisTheCorrectOne) && "bg-green-500/10 border-green-500",
                  isThisWrong && "bg-red-500/10 border-red-500",
                  isThisSelected && !hasAnswered && "bg-primary/10 border-primary",
                  !isThisSelected && !isThisCorrect && !isThisWrong && !isThisTheCorrectOne && "border-border hover:bg-accent"
                )}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer" dir="rtl"><HtmlWithMath htmlContent={option} /></Label>
                  {(isThisCorrect || isThisTheCorrectOne) && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {isThisWrong && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              );
            })}
          </RadioGroup>

          {hasAnswered && (
            <div className={cn("p-4 rounded-lg", isCorrect ? "bg-green-500/10" : "bg-amber-500/10")} dir="rtl">
              <p className="font-medium mb-1">{isCorrect ? "✓ إجابة صحيحة!" : "✗ إجابة خاطئة"}</p>
              {explanation && <HtmlWithMath htmlContent={explanation} className="text-sm text-muted-foreground" />}
              {!isCorrect && correctAnswer && <div className="text-sm mt-2 font-medium flex gap-1"><span>الإجابة الصحيحة:</span><HtmlWithMath htmlContent={correctAnswer} /></div>}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">خروج</Button>
            {!hasAnswered ? (
              <Button onClick={handleSubmit} disabled={!selectedAnswer || isSubmitting} className="flex-1">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                تأكيد
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                {currentIndex < questions.length - 1 ? <>التالي <ArrowRight className="h-4 w-4 ml-2" /></> : "عرض النتائج"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
