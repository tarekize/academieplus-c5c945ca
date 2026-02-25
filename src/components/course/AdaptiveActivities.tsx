import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, PenTool, BookOpen, Sparkles, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useAdaptiveContent } from "@/hooks/useAdaptiveContent";
import { Skeleton } from "@/components/ui/skeleton";

interface AdaptiveActivitiesProps {
  lessonId: string;
  chapterId: string;
  userId: string;
  schoolLevel: string;
  lessonTitle: string;
  chapterTitle: string;
}

export function AdaptiveActivities({ lessonId, chapterId, userId, schoolLevel, lessonTitle, chapterTitle }: AdaptiveActivitiesProps) {
  const { quizzes, exercises, revisions, loading, score, generateContent, recordAnswer } = useAdaptiveContent(
    lessonId, chapterId, userId, schoolLevel, lessonTitle, chapterTitle
  );

  const [activeTab, setActiveTab] = useState<"quiz" | "exercise" | "revision" | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});
  const [exerciseRevealed, setExerciseRevealed] = useState<Record<number, boolean>>({});
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<number, boolean | null>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const timerRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for tracking
  useEffect(() => {
    if (activeTab === "quiz" || activeTab === "exercise") {
      timerRef.current = 0;
      intervalRef.current = setInterval(() => { timerRef.current += 1; }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTab]);

  const handleQuizAnswer = async (qIdx: number, answer: string) => {
    if (quizResults[qIdx] !== undefined) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: answer }));
    const isCorrect = answer === quizzes[qIdx].correct_answer;
    setQuizResults(prev => ({ ...prev, [qIdx]: isCorrect }));
    await recordAnswer(isCorrect, timerRef.current, "quiz");
    timerRef.current = 0;
  };

  const handleExerciseSubmit = async (eIdx: number) => {
    const userAnswer = exerciseAnswers[eIdx]?.trim();
    if (!userAnswer) return;
    const isCorrect = userAnswer === exercises[eIdx].expected_answer;
    setExerciseResults(prev => ({ ...prev, [eIdx]: isCorrect }));
    await recordAnswer(isCorrect, timerRef.current, "exercise");
    timerRef.current = 0;
  };

  const getDifficultyColor = (level: number) => {
    if (level < 30) return "text-green-500";
    if (level < 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getDifficultyLabel = (level: number) => {
    if (level < 25) return "مبتدئ";
    if (level < 40) return "سهل";
    if (level < 60) return "متوسط";
    if (level < 80) return "صعب";
    return "متقدم";
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Score bar */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" dir="rtl">مستواك الحالي</span>
            <Badge variant="outline" className={getDifficultyColor(score.current_level)}>
              {getDifficultyLabel(score.current_level)} ({score.current_level}/100)
            </Badge>
          </div>
          <Progress value={score.current_level} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>إجابات: {score.correct_answers}/{score.total_answers}</span>
            <span>نسبة النجاح: {score.accuracy_rate}%</span>
            {score.streak > 2 && <span className="text-green-500">🔥 {score.streak} متتالية</span>}
          </div>
        </CardContent>
      </Card>

      {/* Activity tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === "quiz" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActiveTab(activeTab === "quiz" ? null : "quiz")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold" dir="rtl">اختبارات ذكية</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">
                {quizzes.length > 0 ? `${quizzes.length} أسئلة` : "إنشاء بالذكاء الاصطناعي"}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === "exercise" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActiveTab(activeTab === "exercise" ? null : "exercise")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <PenTool className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold" dir="rtl">تمارين ذكية</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">
                {exercises.length > 0 ? `${exercises.length} تمارين` : "إنشاء بالذكاء الاصطناعي"}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeTab === "revision" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActiveTab(activeTab === "revision" ? null : "revision")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold" dir="rtl">بطاقات مراجعة ذكية</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">
                {revisions.length > 0 ? `${revisions.length} بطاقات` : "إنشاء بالذكاء الاصطناعي"}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
          </CardContent>
        </Card>
      </div>

      {/* Quiz content */}
      {activeTab === "quiz" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle dir="rtl">اختبارات - {lessonTitle}</CardTitle>
            <Button 
              onClick={() => { setQuizAnswers({}); setQuizResults({}); generateContent("quiz"); }}
              disabled={loading.quiz}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.quiz ? "animate-spin" : ""}`} />
              {quizzes.length > 0 ? "تجديد" : "إنشاء"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.quiz ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground" dir="rtl">اضغط على "إنشاء" لتوليد اختبارات مخصصة لمستواك</p>
              </div>
            ) : (
              quizzes.map((q, idx) => (
                <Card key={idx} className={`${quizResults[idx] === true ? "border-green-500/50 bg-green-500/5" : quizResults[idx] === false ? "border-red-500/50 bg-red-500/5" : ""}`}>
                  <CardContent className="p-4">
                    <p className="font-medium mb-3" dir="rtl">{idx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <Button
                          key={oIdx}
                          variant={quizAnswers[idx] === opt ? (quizResults[idx] ? "default" : "destructive") : "outline"}
                          className={`justify-start text-right ${opt === q.correct_answer && quizResults[idx] !== undefined ? "border-green-500 bg-green-500/10" : ""}`}
                          onClick={() => handleQuizAnswer(idx, opt)}
                          disabled={quizResults[idx] !== undefined}
                          dir="rtl"
                        >
                          {quizResults[idx] !== undefined && opt === q.correct_answer && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                          {quizResults[idx] === false && quizAnswers[idx] === opt && <XCircle className="h-4 w-4 mr-2" />}
                          {opt}
                        </Button>
                      ))}
                    </div>
                    {quizResults[idx] !== undefined && q.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl">
                        <span className="font-medium">الشرح: </span>{q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises content */}
      {activeTab === "exercise" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle dir="rtl">تمارين - {lessonTitle}</CardTitle>
            <Button
              onClick={() => { setExerciseRevealed({}); setExerciseAnswers({}); setExerciseResults({}); generateContent("exercise"); }}
              disabled={loading.exercise}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.exercise ? "animate-spin" : ""}`} />
              {exercises.length > 0 ? "تجديد" : "إنشاء"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.exercise ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))
            ) : exercises.length === 0 ? (
              <div className="text-center py-8">
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground" dir="rtl">اضغط على "إنشاء" لتوليد تمارين مخصصة لمستواك</p>
              </div>
            ) : (
              exercises.map((ex, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold" dir="rtl">{idx + 1}. {ex.title}</h4>
                    <p className="text-sm" dir="rtl">{ex.statement}</p>

                    {/* Hints */}
                    {ex.hints && ex.hints.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHints(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="text-yellow-600"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        {showHints[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        تلميحات
                      </Button>
                    )}
                    {showHints[idx] && ex.hints?.map((hint, hIdx) => (
                      <p key={hIdx} className="text-xs text-muted-foreground bg-yellow-500/5 p-2 rounded" dir="rtl">💡 {hint}</p>
                    ))}

                    {/* Answer input */}
                    {exerciseResults[idx] === undefined && (
                      <div className="flex gap-2" dir="rtl">
                        <input
                          className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                          placeholder="أدخل إجابتك..."
                          value={exerciseAnswers[idx] || ""}
                          onChange={(e) => setExerciseAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                          dir="rtl"
                        />
                        <Button size="sm" onClick={() => handleExerciseSubmit(idx)}>تحقق</Button>
                      </div>
                    )}

                    {exerciseResults[idx] !== undefined && (
                      <div className={`p-2 rounded text-sm ${exerciseResults[idx] ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`} dir="rtl">
                        {exerciseResults[idx] ? "✅ إجابة صحيحة!" : `❌ الإجابة الصحيحة: ${ex.expected_answer}`}
                      </div>
                    )}

                    {/* Solution toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExerciseRevealed(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    >
                      {exerciseRevealed[idx] ? "إخفاء الحل" : "عرض الحل"}
                    </Button>
                    {exerciseRevealed[idx] && (
                      <div className="p-3 bg-muted/50 rounded-lg text-sm" dir="rtl">
                        <span className="font-medium">الحل: </span>{ex.solution}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Revision content */}
      {activeTab === "revision" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle dir="rtl">بطاقات المراجعة - {lessonTitle}</CardTitle>
            <Button
              onClick={() => generateContent("revision")}
              disabled={loading.revision}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.revision ? "animate-spin" : ""}`} />
              {revisions.length > 0 ? "تجديد" : "إنشاء"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.revision ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : revisions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground" dir="rtl">اضغط على "إنشاء" لتوليد بطاقات مراجعة مخصصة</p>
              </div>
            ) : (
              revisions.map((rev, idx) => (
                <Card key={idx} className="border-green-500/20">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-bold text-primary" dir="rtl">📌 {rev.concept}</h4>
                    <p className="text-sm" dir="rtl">{rev.explanation}</p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium" dir="rtl">مثال:</p>
                      <p className="text-sm" dir="rtl">{rev.example}</p>
                    </div>
                    {rev.key_formula && (
                      <div className="bg-primary/5 rounded-lg p-2 text-center">
                        <p className="text-sm font-mono font-bold" dir="rtl">{rev.key_formula}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
