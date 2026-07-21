import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestionProps {
  questionId: string;
  question: string;
  options: string[];
  explanation?: string;
  onAnswer: (isCorrect: boolean) => void;
  showResult?: boolean;
}

export const QuizQuestion = ({
  questionId,
  question,
  options,
  explanation,
  onAnswer,
  showResult = false
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [serverExplanation, setServerExplanation] = useState<string>("");
  const [validating, setValidating] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAnswer || validating) return;
    
    setValidating(true);
    try {
      // Appeler l'edge function pour valider la réponse
      const { data, error } = await supabase.functions.invoke('validate-quiz-answer', {
        body: {
          question_id: questionId,
          user_answer: selectedAnswer
        }
      });

      if (error) throw error;

      setIsCorrect(data.is_correct);
      setCorrectAnswer(data.correct_answer || selectedAnswer);
      setServerExplanation(data.explanation || explanation || "");
      setHasAnswered(true);
      onAnswer(data.is_correct);
    } catch (error) {
      console.error('Error validating answer:', error);
    } finally {
      setValidating(false);
    }
  };

  const isIncorrect = hasAnswered && !isCorrect;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{question}</h3>
          
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={hasAnswered}
            className="space-y-3"
          >
            {options.map((option, index) => {
              const isThisCorrect = hasAnswered && option === correctAnswer;
              const isThisSelected = option === selectedAnswer;
              const isThisWrong = hasAnswered && isThisSelected && !isThisCorrect;

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                    isThisCorrect
                      ? "bg-mint/10 border-mint"
                      : isThisWrong
                      ? "bg-coral/10 border-coral"
                      : isThisSelected
                      ? "bg-primary/10 border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                  {isThisCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-mint" />
                  )}
                  {isThisWrong && (
                    <XCircle className="h-5 w-5 text-coral" />
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {hasAnswered && serverExplanation && (
          <div className={`p-4 rounded-lg ${
            isCorrect ? "bg-mint/10" : "bg-amber/10"
          }`}>
            <p className="text-sm font-medium mb-1">Explication :</p>
            <p className="text-sm">{serverExplanation}</p>
            {!isCorrect && correctAnswer && (
              <p className="text-sm mt-2 font-medium">
                Bonne réponse : {correctAnswer}
              </p>
            )}
          </div>
        )}

        {!hasAnswered && (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || validating}
            className="w-full"
          >
            {validating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Validation...</> : "Valider"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
