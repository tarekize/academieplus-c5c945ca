import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, PenTool, Send, Eye, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useTimeTracking, formatTime } from "@/hooks/useTimeTracking";
import { ExerciseFormDialog, DeleteExerciseButton } from "./QuizExerciseCRUD";
import { supabase } from "@/integrations/supabase/client";

export interface DBExercise {
  id: string;
  lesson_id?: string | null;
  title: string;
  statement: string;
  expected_answer?: string;
  accepted_answers?: string[];
  solution?: string;
  difficulty?: number;
}

function DifficultyPencils({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 ml-2" title={`DifficultÃ© ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <PenTool key={i} className={cn("h-3.5 w-3.5", i < level ? "text-primary fill-primary/20" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

interface ChapterMathExercisesProps {
  exercises: DBExercise[];
  chapterTitle: string;
  chapterId: string;
  onClose: () => void;
  canManage?: boolean;
  onRefresh?: () => void;
}

export const ChapterMathExercises = ({ exercises, chapterTitle, chapterId, onClose, canManage, onRefresh }: ChapterMathExercisesProps) => {
  const [currentExercise, setCurrentExercise] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { submitted: boolean; correct: boolean; expected_answer?: string }>>({});
  const [showCorrection, setShowCorrection] = useState<Record<string, boolean>>({});
  const [exerciseSolutions, setExerciseSolutions] = useState<Record<string, string>>({});
  const [exerciseTimes, setExerciseTimes] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exercise = currentExercise !== null ? exercises[currentExercise] : null;

  const currentExerciseContentId = useMemo(() => {
    if (currentExercise === null) return "";
    return `exercise-${chapterId}-${currentExercise}`;
  }, [chapterId, currentExercise]);

  const { formattedTime: currentExerciseTime, elapsedSeconds } = useTimeTracking({
    contentType: "exercise", contentId: currentExerciseContentId, chapterId, autoStart: true, enabled: currentExercise !== null,
  });

  useEffect(() => {
    if (currentExerciseContentId && elapsedSeconds > 0) {
      setExerciseTimes(prev => ({ ...prev, [currentExerciseContentId]: elapsedSeconds }));
    }
  }, [currentExerciseContentId, elapsedSeconds]);

  const handleSubmit = async (ex: DBExercise) => {
    const userAnswer = userAnswers[ex.id]?.trim() || "";
    if (!userAnswer) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('check_exercise_answer', {
        _exercise_id: ex.id,
        _user_answer: userAnswer,
      });

      if (error) throw error;

      const result = data as { is_correct: boolean; expected_answer: string; solution: string };
      setSubmittedAnswers(prev => ({ ...prev, [ex.id]: { submitted: true, correct: result.is_correct, expected_answer: result.expected_answer } }));
      setExerciseSolutions(prev => ({ ...prev, [ex.id]: result.solution }));
    } catch (error) {
      console.error("Error validating exercise:", error);
      // Fallback to client-side if available (admin/pedago with full data)
      if (ex.accepted_answers) {
        const userLower = userAnswer.toLowerCase();
        const isCorrect = ex.accepted_answers.some(
          accepted => userLower === accepted.toLowerCase().trim() ||
            userLower.includes(accepted.toLowerCase().trim()) ||
            accepted.toLowerCase().trim().includes(userLower)
        );
        setSubmittedAnswers(prev => ({ ...prev, [ex.id]: { submitted: true, correct: isCorrect, expected_answer: ex.expected_answer } }));
        if (ex.solution) setExerciseSolutions(prev => ({ ...prev, [ex.id]: ex.solution! }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = (id: string) => submittedAnswers[id]?.submitted || false;
  const isCorrectFn = (id: string) => submittedAnswers[id]?.correct || false;
  const getExpectedAnswer = (id: string) => submittedAnswers[id]?.expected_answer;
  const toggleCorrection = (id: string) => setShowCorrection(prev => ({ ...prev, [id]: !prev[id] }));

  if (currentExercise !== null && exercise) {
    const submitted = isSubmitted(exercise.id);
    const correct = isCorrectFn(exercise.id);
    const expectedAnswer = getExpectedAnswer(exercise.id);
    const correctionVisible = showCorrection[exercise.id];
    const solution = exerciseSolutions[exercise.id];

    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentExercise(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù‚Ø§Ø¦Ù…Ø©
            </Button>
            <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
              ØªÙ…Ø±ÙŠÙ† {currentExercise + 1}/{exercises.length}
            </span>
          </div>
          <CardTitle className="text-xl mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <PenTool className="h-5 w-5 text-orange-500" />
              </div>
              <span dir="rtl">{exercise.title}</span>
              {exercise.difficulty && <DifficultyPencils level={exercise.difficulty} />}
            </div>
            <div className="flex items-center gap-2">
              {canManage && onRefresh && (
                <div className="flex gap-1">
                  <ExerciseFormDialog chapterId={chapterId} onSaved={onRefresh} exercise={exercise} />
                  <DeleteExerciseButton exerciseId={exercise.id} onDeleted={onRefresh} />
                </div>
              )}
              <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono font-medium">{currentExerciseTime}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg" dir="rtl">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4" />Ø§Ù„ØªÙ…Ø±ÙŠÙ†</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{exercise.statement}</ReactMarkdown>
            </div>
          </div>

          <div className="space-y-4" dir="rtl">
            <div className="flex gap-3">
              <Input placeholder="Ø£Ø¯Ø®Ù„ Ø¥Ø¬Ø§Ø¨ØªÙƒ..." value={userAnswers[exercise.id] || ""}
                onChange={(e) => setUserAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                disabled={submitted || isSubmitting}
                className={cn("flex-1", submitted && correct && "border-green-500 bg-green-500/10", submitted && !correct && "border-red-500 bg-red-500/10")}
                onKeyDown={(e) => { if (e.key === 'Enter' && !submitted && !isSubmitting && userAnswers[exercise.id]?.trim()) handleSubmit(exercise); }}
              />
              <Button onClick={() => handleSubmit(exercise)} disabled={submitted || isSubmitting || !userAnswers[exercise.id]?.trim()} className="gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                ØªØ£ÙƒÙŠØ¯
              </Button>
            </div>

            {submitted && (
              <div className={cn("p-4 rounded-lg flex items-center gap-3", correct ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30")}>
                {correct ? (
                  <><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /><div><p className="font-medium text-green-700 dark:text-green-300">Ø¥Ø¬Ø§Ø¨Ø© ØµØ­ÙŠØ­Ø©! ðŸŽ‰</p>{expectedAnswer && <p className="text-sm text-muted-foreground">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø©: {expectedAnswer}</p>}</div></>
                ) : (
                  <><XCircle className="h-5 w-5 text-red-500 shrink-0" /><div><p className="font-medium text-red-700 dark:text-red-300">Ø¥Ø¬Ø§Ø¨Ø© Ø®Ø§Ø·Ø¦Ø©</p><p className="text-sm text-muted-foreground">Ø¥Ø¬Ø§Ø¨ØªÙƒ: {userAnswers[exercise.id]}{expectedAnswer && ` â€” Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø©: ${expectedAnswer}`}</p></div></>
                )}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={() => toggleCorrection(exercise.id)} disabled={!submitted} className={cn("w-full gap-2", !submitted && "opacity-50")}>
            <Eye className="h-4 w-4" />{correctionVisible ? "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø­Ù„" : "Ø¹Ø±Ø¶ Ø§Ù„Ø­Ù„"}
          </Button>

          {correctionVisible && solution && (
            <div className="p-4 bg-muted/30 rounded-lg border" dir="rtl">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary"><CheckCircle2 className="h-4 w-4" />Ø§Ù„Ø­Ù„ Ø§Ù„Ù…ÙØµÙ„</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{solution}</ReactMarkdown></div>
            </div>
          )}

          <div className="flex gap-3">
            {currentExercise > 0 && <Button variant="outline" onClick={() => setCurrentExercise(currentExercise - 1)} className="flex-1">Ø§Ù„ØªÙ…Ø±ÙŠÙ† Ø§Ù„Ø³Ø§Ø¨Ù‚</Button>}
            {currentExercise < exercises.length - 1 && <Button onClick={() => setCurrentExercise(currentExercise + 1)} className="flex-1">Ø§Ù„ØªÙ…Ø±ÙŠÙ† Ø§Ù„ØªØ§Ù„ÙŠ</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = Object.values(submittedAnswers).filter(s => s.submitted && s.correct).length;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <span dir="rtl">تمارين</span>
          </CardTitle>
          <div className="flex gap-2">
            {canManage && onRefresh && <ExerciseFormDialog chapterId={chapterId} onSaved={onRefresh} />}
            <Button variant="outline" onClick={onClose}>Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø¯Ø±Ø³</Button>
          </div>
        </div>
        <p className="text-muted-foreground mt-2" dir="rtl">{chapterTitle} â€” {completedCount}/{exercises.length} Ù†Ø§Ø¬Ø­</p>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" dir="rtl">Ù„Ø§ ØªÙˆØ¬Ø¯ تمارين Ù…ØªØ§Ø­Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„ÙØµÙ„.</p>
        ) : (
          <div className="grid gap-3">
            {exercises.map((ex, index) => {
              const submitted = isSubmitted(ex.id);
              const correct = isCorrectFn(ex.id);
              const exerciseId = `exercise-${chapterId}-${index}`;
              const timeForExercise = exerciseTimes[exerciseId] || 0;
              return (
                <button key={ex.id} onClick={() => setCurrentExercise(index)} className={cn(
                  "w-full p-4 rounded-lg border text-right transition-all hover:shadow-md flex items-center justify-between gap-4",
                  submitted && correct ? "bg-green-500/5 border-green-500/30" : submitted && !correct ? "bg-red-500/5 border-red-500/30" : "hover:bg-accent"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      submitted && correct ? "bg-green-500 text-white" : submitted && !correct ? "bg-red-500 text-white" : "bg-muted"
                    )}>
                      {submitted && correct ? <CheckCircle2 className="h-4 w-4" /> : submitted && !correct ? <XCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div dir="rtl">
                      <h4 className="font-medium flex items-center">{ex.title}{ex.difficulty && <DifficultyPencils level={ex.difficulty} />}</h4>
                      <span className="text-sm text-muted-foreground line-clamp-1">{ex.statement.substring(0, 60)}...</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {timeForExercise > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />{formatTime(timeForExercise)}
                      </div>
                    )}
                    <span className="text-primary">â†</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
