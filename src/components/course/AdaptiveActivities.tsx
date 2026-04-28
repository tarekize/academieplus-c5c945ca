import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, PenTool, BookOpen, Sparkles, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, Trophy } from "lucide-react";
import { useAdaptiveContent } from "@/hooks/useAdaptiveContent";
import { Skeleton } from "@/components/ui/skeleton";
import { HtmlWithMath } from "./HtmlWithMath";
import { MarkdownSolution } from "./MarkdownSolution";

interface AdaptiveActivitiesProps {
  lessonId: string;
  chapterId: string;
  userId: string;
  schoolLevel: string;
  lessonTitle: string;
  chapterTitle: string;
  initialTab?: "quiz" | "exercise" | "revision" | null;
}

export function AdaptiveActivities({ lessonId, chapterId, userId, schoolLevel, lessonTitle, chapterTitle, initialTab = null }: AdaptiveActivitiesProps) {
  const {
    quizzes, exercises, revisions, loading, score,
    sessionCorrect, sessionTotal, levelUpMessage,
    generateContent, recordAnswer, updateReadingTime, resetSessionCounters,
  } = useAdaptiveContent(lessonId, chapterId, userId, schoolLevel, lessonTitle, chapterTitle);

  const [activeTab, setActiveTab] = useState<"quiz" | "exercise" | "revision" | null>(initialTab);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});
  const [exerciseRevealed, setExerciseRevealed] = useState<Record<number, boolean>>({});
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<number, boolean | null>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const timerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer for tracking exercises/quizzes
  useEffect(() => {
    if (activeTab === "quiz" || activeTab === "exercise") {
      timerRef.current = 0;
      intervalRef.current = setInterval(() => { timerRef.current += 1; }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTab]);

  // Reading time tracking
  useEffect(() => {
    const mountTime = Date.now();
    return () => {
      const timeSpentSeconds = Math.floor((Date.now() - mountTime) / 1000);
      if (timeSpentSeconds > 5) updateReadingTime(timeSpentSeconds);
    };
  }, [lessonId, updateReadingTime]);

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

  const handleRegenerate = (type: "quiz" | "exercise" | "revision") => {
    if (type === "quiz") { setQuizAnswers({}); setQuizResults({}); }
    if (type === "exercise") { setExerciseRevealed({}); setExerciseAnswers({}); setExerciseResults({}); }
    resetSessionCounters();
    generateContent(type);
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
      {/* Score bar with x/y counter */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" dir="rtl">مستواك الحالي</span>
            <Badge variant="outline" className={getDifficultyColor(score.current_level)}>
              {getDifficultyLabel(score.current_level)} ({score.current_level}/100)
            </Badge>
          </div>
          <Progress value={score.current_level} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2 flex-wrap gap-2">
            {/* Session x/y scoreboard */}
            <span className="font-semibold text-foreground text-sm" dir="rtl">
              الجلسة: {sessionCorrect} / {sessionTotal}
            </span>
            <span dir="rtl">المجموع: {score.correct_answers}/{score.total_answers}</span>
            <span dir="rtl">نسبة النجاح: {score.accuracy_rate}%</span>
            {score.streak > 2 && <span className="text-green-500">🔥 {score.streak} متتالية</span>}
          </div>
          {/* Auto-refresh progress indicator (every 5) */}
          {sessionTotal > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span dir="rtl">التحديث التلقائي بعد {5 - (sessionTotal % 5)} أسئلة</span>
                <span>{sessionTotal % 5}/5</span>
              </div>
              <Progress value={(sessionTotal % 5) * 20} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Level-up / Performance drop notification banner */}
      {levelUpMessage && (
        <Card className={`border-2 ${levelUpMessage.includes("تهانينا") ? "border-green-500 bg-green-500/5" :
          levelUpMessage.includes("ثغرات") ? "border-red-500 bg-red-500/5" :
            "border-primary bg-primary/5"
          }`}>
          <CardContent className="p-4 flex items-start gap-3">
            {levelUpMessage.includes("تهانينا") ? (
              <Trophy className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
            ) : levelUpMessage.includes("ثغرات") ? (
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium" dir="rtl">{levelUpMessage}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={() => resetSessionCounters()}>✕</Button>
          </CardContent>
        </Card>
      )}

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
              <h3 className="font-semibold" dir="rtl">اسئله متعدده الاختيارات ذكية</h3>
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
            <CardTitle dir="rtl">اسئله متعدده الاختيارات ذكية - {lessonTitle}</CardTitle>
            <Button
              onClick={() => handleRegenerate("quiz")}
              disabled={loading.quiz}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.quiz ? "animate-spin" : ""}`} />
              {quizzes.length > 0 ? "تجديد" : "Générer avec l'IA"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.quiz ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))
            ) : quizzes.length === 0 ? (
              <div className="text-center py-6 px-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex justify-center items-center mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2" dir="rtl">اسئله متعدده الاختيارات ذكية مخصصة لك</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center" dir="rtl">
                  انقر على الزر أدناه ليقوم الذكاء الاصطناعي بتوليد 5 أسئلة اختبار تناسب مستواك الحالي.
                </p>
                <Button
                  size="lg"
                  onClick={() => handleRegenerate("quiz")}
                  disabled={loading.quiz}
                  className="font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  {loading.quiz ? "جاري الإنشاء..." : "Générer avec l'IA"}
                </Button>
              </div>
            ) : (
              quizzes.map((q, idx) => (
                <Card key={idx} className={`${quizResults[idx] === true ? "border-green-500/50 bg-green-500/5" : quizResults[idx] === false ? "border-red-500/50 bg-red-500/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="font-medium mb-3 flex gap-2 items-start" dir="rtl">
                      <span className="shrink-0">{idx + 1}.</span>
                      <HtmlWithMath htmlContent={q.question} className="flex-1" />
                    </div>
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
                          <HtmlWithMath htmlContent={opt} className="text-right flex-1" />
                        </Button>
                      ))}
                    </div>
                    {quizResults[idx] !== undefined && q.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm" dir="rtl">
                        <span className="font-medium">الشرح: </span>
                        <HtmlWithMath htmlContent={q.explanation} className="inline" />
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
            <CardTitle dir="rtl">تمارين ذكية - {lessonTitle}</CardTitle>
            <Button
              onClick={() => handleRegenerate("exercise")}
              disabled={loading.exercise}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.exercise ? "animate-spin" : ""}`} />
              {exercises.length > 0 ? "تجديد" : "Générer avec l'IA"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.exercise ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))
            ) : exercises.length === 0 ? (
              <div className="text-center py-6 px-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex justify-center items-center mb-4">
                  <PenTool className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2" dir="rtl">تمارين ذكية مخصصة لك</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center" dir="rtl">
                  انقر على الزر أدناه ليقوم الذكاء الاصطناعي بتوليد 5 تمارين تطبيقية تناسب مستواك.
                </p>
                <Button
                  size="lg"
                  onClick={() => handleRegenerate("exercise")}
                  disabled={loading.exercise}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-accent/20"
                >
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  {loading.exercise ? "جاري الإنشاء..." : "Générer avec l'IA"}
                </Button>
              </div>
            ) : (
              exercises.map((ex, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold flex gap-2" dir="rtl"><span className="shrink-0">{idx + 1}.</span> <HtmlWithMath htmlContent={ex.title} className="flex-1" /></h4>
                    <HtmlWithMath htmlContent={ex.statement} className="text-sm" dir="rtl" />

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

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExerciseRevealed(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    >
                      {exerciseRevealed[idx] ? "إخفاء الحل" : "📖 عرض الحل المفصل"}
                    </Button>
                    {exerciseRevealed[idx] && ex.solution && (
                      <MarkdownSolution content={ex.solution} compact />
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
            <CardTitle dir="rtl">بطاقات المراجعة الذكية - {lessonTitle}</CardTitle>
            <Button
              onClick={() => handleRegenerate("revision")}
              disabled={loading.revision}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.revision ? "animate-spin" : ""}`} />
              {revisions.length > 0 ? "تجديد" : "Générer avec l'IA"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.revision ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : revisions.length === 0 ? (
              <div className="text-center py-6 px-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex justify-center items-center mb-4">
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold mb-2" dir="rtl">بطاقات مراجعة ذكية</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center" dir="rtl">
                  انقر على الزر أدناه ليقوم الذكاء الاصطناعي بتلخيص هذا الدرس وتوليد بطاقات مراجعة.
                </p>
                <Button
                  size="lg"
                  onClick={() => handleRegenerate("revision")}
                  disabled={loading.revision}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 transition-all hover:scale-105 shadow-md shadow-green-500/20"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  {loading.revision ? "جاري الإنشاء..." : "Générer avec l'IA"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {revisions.map((rev, idx) => (
                  <Card
                    key={idx}
                    className="border-green-500/20 cursor-pointer hover:shadow-md transition-all min-h-[160px]"
                    onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  >
                    <CardContent className="p-4 space-y-2">
                      {!flippedCards[idx] ? (
                        <>
                          <h4 className="font-bold text-primary" dir="rtl">📌 {rev.concept}</h4>
                          <p className="text-sm" dir="rtl">{rev.explanation}</p>
                          <p className="text-xs text-muted-foreground mt-2" dir="rtl">انقر لرؤية المثال ←</p>
                        </>
                      ) : (
                        <>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm font-medium" dir="rtl">مثال:</p>
                            <p className="text-sm" dir="rtl">{rev.example}</p>
                          </div>
                          {rev.key_formula && (
                            <div className="bg-primary/5 rounded-lg p-2 text-center">
                              <p className="text-sm font-mono font-bold" dir="rtl">{rev.key_formula}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2" dir="rtl">← انقر للعودة</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
