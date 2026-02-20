import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mathSecondeChapters, ChapterQuizQuestion } from "@/data/mathSecondeChapters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExamQuestion extends ChapterQuizQuestion {
  chapterTitle: string;
}

const Simulation = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    if (subjectId) {
      fetchQuestions();
    }
  }, [subjectId]);

  useEffect(() => {
    if (!loading && !showResults && timeRemaining > 0) {
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
  }, [loading, showResults, timeRemaining]);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
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
        title: "Erreur",
        description: "Impossible de charger l'examen",
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
        <h2 className="text-2xl font-bold mb-4">Aucune question disponible</h2>
        <p className="text-muted-foreground mb-6">
          Les simulations d'examen ne sont pas encore disponibles pour cette matière et ce niveau.
        </p>
        <Button onClick={() => navigate("/liste-cours")}>
          Retour au catalogue
        </Button>
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
              <CardTitle className="text-3xl">Résultats de l'examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`text-6xl font-bold ${percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {percentage}%
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{score}</p>
                  <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{questions.length - score}</p>
                  <p className="text-sm text-muted-foreground">Mauvaises réponses</p>
                </div>
              </div>

              <p className="text-muted-foreground">
                Temps: {Math.floor(duration / 60)} min {duration % 60} sec
              </p>

              <div className="flex gap-4 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/liste-cours")}>
                  Retour au catalogue
                </Button>
                <Button onClick={() => {
                  setCurrentIndex(0);
                  setAnswers([]);
                  setShowResults(false);
                  setTimeRemaining(30 * 60);
                  fetchQuestions();
                }}>
                  Recommencer
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
            onClick={() => {
              if (confirm("Êtes-vous sûr de vouloir quitter l'examen ?")) {
                navigate("/liste-cours");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quitter
          </Button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
            timeRemaining < 300 ? 'bg-red-500/10 text-red-600' : 'bg-muted'
          }`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1} sur {questions.length}
              </span>
              <span className="text-sm font-medium">
                {answers.filter(a => a.correct).length} correctes
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
                    buttonClass += " bg-green-500/20 border-green-500 text-green-700";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += " bg-red-500/20 border-red-500 text-red-700";
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
                      <Check className="ml-auto h-5 w-5 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <X className="ml-auto h-5 w-5 text-red-600" />
                    )}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {showResult && (
            <Card className="p-4 bg-muted/50">
              <p className="text-sm">
                <strong>Explication:</strong> {currentQuestion.explanation}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;