import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, CheckCircle2, PenTool } from "lucide-react";
import { mathExercises } from "@/data/mathSeconde";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface MathExercisesProps {
  onClose: () => void;
}

export const MathExercises = ({ onClose }: MathExercisesProps) => {
  const [currentExercise, setCurrentExercise] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const exercise = currentExercise !== null ? mathExercises[currentExercise] : null;

  const markAsCompleted = (id: string) => {
    setCompletedExercises(prev => new Set(prev).add(id));
  };

  if (currentExercise !== null && exercise) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentExercise(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
            <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
              {exercise.category}
            </span>
          </div>
          <CardTitle className="text-xl mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <PenTool className="h-5 w-5 text-orange-500" />
            </div>
            Exercice {currentExercise + 1} : {exercise.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Énoncé */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Énoncé
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      {children}
                    </pre>
                  )
                }}
              >
                {exercise.statement}
              </ReactMarkdown>
            </div>
          </div>

          {/* Correction avec Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="correction" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Afficher la correction
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="prose prose-sm dark:prose-invert max-w-none mt-2">
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => (
                        <strong className="text-primary">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ),
                      table: ({ children }) => (
                        <table className="border-collapse border border-border w-full my-2">
                          {children}
                        </table>
                      ),
                      th: ({ children }) => (
                        <th className="border border-border px-3 py-2 bg-muted text-left">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border px-3 py-2">
                          {children}
                        </td>
                      )
                    }}
                  >
                    {exercise.solution}
                  </ReactMarkdown>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => markAsCompleted(exercise.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marquer comme compris
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-3">
            {currentExercise > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentExercise(currentExercise - 1)}
                className="flex-1"
              >
                Exercice précédent
              </Button>
            )}
            {currentExercise < mathExercises.length - 1 && (
              <Button 
                onClick={() => setCurrentExercise(currentExercise + 1)}
                className="flex-1"
              >
                Exercice suivant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Liste des exercices
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            Exercices de Mathématiques
          </CardTitle>
          <Button variant="outline" onClick={onClose}>
            Retour au cours
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">
          10 exercices pour s'entraîner sur le programme de Seconde
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {mathExercises.map((ex, index) => {
            const isCompleted = completedExercises.has(ex.id);
            
            return (
              <button
                key={ex.id}
                onClick={() => setCurrentExercise(index)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all hover:shadow-md",
                  "flex items-center justify-between gap-4",
                  isCompleted ? "bg-green-500/5 border-green-500/30" : "hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isCompleted ? "bg-green-500 text-white" : "bg-muted"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{ex.title}</h4>
                    <span className="text-sm text-muted-foreground">{ex.category}</span>
                  </div>
                </div>
                <span className="text-primary">→</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
