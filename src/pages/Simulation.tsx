import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mathSecondeChapters, ChapterQuizQuestion } from "@/data/mathSecondeChapters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ExamQuestion extends ChapterQuizQuestion {
  chapterTitle: string;
}

const Simulation = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<{ score: number; total_questions: number } | null>(null);
  const [attemptSaved, setAttemptSaved] = useState(false);
  // L'examen (et son chrono) ne démarre qu'après l'écran d'introduction —
  // évite un démarrage à froid où le compte à rebours de 30 min s'enclenche
  // avant même que l'élève ait vu les règles.
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (subjectId) {
      fetchQuestions();
    }
  }, [subjectId]);

  useEffect(() => {
    if (!loading && examStarted && !showResults && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, examStarted, showResults, timeRemaining]);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      if (subjectId) {
        const { data: lastAttempt } = await supabase
          .from("exam_attempts")
          .select("score, total_questions")
          .eq("student_id", user.id)
          .eq("subject_id", subjectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setPreviousAttempt(lastAttempt);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_level")
        .eq("id", user.id)
        .single();

      // Use static data for math seconde
      if (subjectId === "math" && profile?.school_level === "seconde") {
        const allQuestions: ExamQuestion[] = [];
        mathSecondeChapters.forEach(chapter => {
          chapter.quizzes.forEach(quiz => {
            allQuestions.push({
              ...quiz,
              chapterTitle: chapter.chapterTitle
            });
          });
        });
        
        // Shuffle and limit to 20 questions
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 20));
      } else {
        setQuestions([]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: t("simulation.loadError"),
        description: t("simulation.loadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (showResult) return;
    
    setSelectedAnswer(option);
    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setShowResult(true);
    
    const newAnswers = [...answers, { correct: isCorrect, time: Date.now() - startTime }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        finishExam();
      }
    }, 2000);
  };

  const finishExam = () => {
    setShowResults(true);
  };

  // Persiste la tentative une fois les résultats affichés (score final connu).
  useEffect(() => {
    if (!showResults || attemptSaved || !userId || !subjectId || questions.length === 0) return;
    setAttemptSaved(true);
    const score = answers.filter(a => a.correct).length;
    const duration = Math.floor((Date.now() - startTime) / 1000);
    supabase.from("exam_attempts").insert({
      student_id: userId,
      subject_id: subjectId,
      score,
      total_questions: questions.length,
      duration_seconds: duration,
    }).then(({ error }) => {
      if (error) console.error("Error saving exam attempt:", error);
    });
  }, [showResults, attemptSaved, userId, subjectId, questions.length, answers, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t("simulation.noQuestionsTitle")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("simulation.noQuestionsDesc")}
        </p>
        <Button onClick={() => navigate("/liste-cours")}>
          {t("simulation.backToCatalog")}
        </Button>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-background">
        <Card className="max-w-lg w-full p-8 text-center">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl">{t("simulation.introTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-5">
            <p className="text-muted-foreground">{t("simulation.introDesc", { count: questions.length })}</p>
            <ul className="text-sm space-y-2.5 bg-muted/50 rounded-lg p-4 text-left" dir="auto">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                {t("simulation.introRuleTime")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {t("simulation.introRuleAnswer")}
              </li>
              <li className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 text-primary shrink-0" />
                {t("simulation.introRuleLeave")}
              </li>
            </ul>
            <Button size="lg" className="w-full" onClick={() => setExamStarted(true)}>
              {t("simulation.introStart")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const score = answers.filter(a => a.correct).length;
    const percentage = Math.round((score / questions.length) * 100);
    const duration = Math.floor((Date.now() - startTime) / 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-3xl">{t("simulation.resultsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`text-6xl font-bold ${percentage >= 50 ? 'text-mint' : 'text-coral'}`}>
                {percentage}%
              </div>

              {previousAttempt && previousAttempt.total_questions > 0 && (() => {
                const previousPercentage = Math.round((previousAttempt.score / previousAttempt.total_questions) * 100);
                const delta = percentage - previousPercentage;
                return (
                  <p className={`text-sm font-medium ${delta > 0 ? 'text-mint' : delta < 0 ? 'text-coral' : 'text-muted-foreground'}`}>
                    {delta === 0
                      ? t("simulation.vsLastAttemptEqual")
                      : t("simulation.vsLastAttempt", { delta: delta > 0 ? `+${delta}` : delta })}
                  </p>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-mint/10 rounded-lg">
                  <p className="text-2xl font-bold text-mint">{score}</p>
                  <p className="text-sm text-muted-foreground">{t("simulation.correctAnswers")}</p>
                </div>
                <div className="p-4 bg-coral/10 rounded-lg">
                  <p className="text-2xl font-bold text-coral">{questions.length - score}</p>
                  <p className="text-sm text-muted-foreground">{t("simulation.wrongAnswers")}</p>
                </div>
              </div>

              <p className="text-muted-foreground">
                {t("simulation.duration", { minutes: Math.floor(duration / 60), seconds: duration % 60 })}
              </p>

              <div className="flex gap-4 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/liste-cours")}>
                  {t("simulation.backToCatalog")}
                </Button>
                <Button onClick={() => {
                  setCurrentIndex(0);
                  setAnswers([]);
                  setShowResults(false);
                  setTimeRemaining(30 * 60);
                  setAttemptSaved(false);
                  setExamStarted(false);
                  fetchQuestions();
                }}>
                  {t("simulation.restart")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => setShowLeaveConfirm(true)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("simulation.leave")}
          </Button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
            timeRemaining < 300 ? 'bg-coral/10 text-coral' : 'bg-muted'
          }`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t("simulation.questionOf", { current: currentIndex + 1, total: questions.length })}
              </span>
              <span className="text-sm font-medium">
                {t("simulation.correctCount", { count: answers.filter(a => a.correct).length })}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">{currentQuestion.chapterTitle}</p>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                let buttonClass = "w-full justify-start text-left p-4 h-auto";
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += " bg-mint/20 border-mint text-mint";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += " bg-coral/20 border-coral text-coral";
                  }
                } else if (isSelected) {
                  buttonClass += " border-primary bg-primary/10";
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonClass}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                  >
                    <span className="mr-3 w-6 h-6 rounded-full border flex items-center justify-center text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                    {showResult && isCorrect && (
                      <Check className="ml-auto h-5 w-5 text-mint" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <X className="ml-auto h-5 w-5 text-coral" />
                    )}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {showResult && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" dir="auto">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {t("simulation.movingToNext")}
            </div>
          )}

          {showResult && (
            <Card className="p-4 bg-muted/50">
              <p className="text-sm">
                <strong>{t("simulation.explanation")}</strong> {currentQuestion.explanation}
              </p>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("simulation.confirmLeave")}</AlertDialogTitle>
            <AlertDialogDescription>{t("simulation.confirmLeaveDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/liste-cours")}>
              {t("simulation.leave")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Simulation;
