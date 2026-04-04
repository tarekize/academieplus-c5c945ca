import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, BookOpen } from "lucide-react";
import { mathQuizQuestions, QuizQuestion } from "@/data/mathSeconde";
import { cn } from "@/lib/utils";
import 'katex/dist/katex.min.css';

interface MathQuizProps {
  onClose: () => void;
}

export const MathQuiz = ({ onClose }: MathQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{ question: string; userAnswer: string; correct: boolean }[]>([]);

  const currentQuestion = mathQuizQuestions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const progress = ((currentIndex + 1) / mathQuizQuestions.length) * 100;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setHasAnswered(true);
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    if (correct) {
      setScore(prev => prev + 1);
    }
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: selectedAnswer,
      correct
    }]);
  };

  const handleNext = () => {
    if (currentIndex < mathQuizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer("");
      setHasAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer("");
    setHasAnswered(false);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
  };

  if (showResults) {
    const percentage = Math.round((score / mathQuizQuestions.length) * 100);
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Quiz terminé !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">{score}/{mathQuizQuestions.length}</div>
            <p className="text-muted-foreground">
              {percentage >= 80 ? "Excellent travail ! 🎉" : 
               percentage >= 60 ? "Bien joué ! Continue comme ça 👍" : 
               "Continue à t'entraîner ! 💪"}
            </p>
          </div>

          <Progress value={percentage} className="h-3" />

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {answers.map((answer, index) => (
              <div 
                key={index}
                className={cn(
                  "p-3 rounded-lg flex items-start gap-3",
                  answer.correct ? "bg-green-500/10" : "bg-red-500/10"
                )}
              >
                {answer.correct ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : 
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                }
                <span className="text-sm">{answer.question}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRestart} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
            <Button onClick={onClose} className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              Retour au cours
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentIndex + 1}/{mathQuizQuestions.length}
          </span>
          <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
            {currentQuestion.category}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
        
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          disabled={hasAnswered}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => {
            const isThisCorrect = hasAnswered && option === currentQuestion.correctAnswer;
            const isThisSelected = option === selectedAnswer;
            const isThisWrong = hasAnswered && isThisSelected && !isThisCorrect;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                  isThisCorrect && "bg-green-500/10 border-green-500",
                  isThisWrong && "bg-red-500/10 border-red-500",
                  isThisSelected && !hasAnswered && "bg-primary/10 border-primary",
                  !isThisSelected && !isThisCorrect && !isThisWrong && "border-border hover:bg-accent"
                )}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer font-mono"
                >
                  {option}
                </Label>
                {isThisCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {isThisWrong && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            );
          })}
        </RadioGroup>

        {hasAnswered && (
          <div className={cn(
            "p-4 rounded-lg",
            isCorrect ? "bg-green-500/10" : "bg-amber-500/10"
          )}>
            <p className="font-medium mb-1">
              {isCorrect ? "✓ Bonne réponse !" : "✗ Réponse incorrecte"}
            </p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            {!isCorrect && (
              <p className="text-sm mt-2 font-medium">
                Bonne réponse : <span className="font-mono">{currentQuestion.correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Quitter
          </Button>
          {!hasAnswered ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedAnswer}
              className="flex-1"
            >
              Valider
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {currentIndex < mathQuizQuestions.length - 1 ? (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Voir les résultats"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
