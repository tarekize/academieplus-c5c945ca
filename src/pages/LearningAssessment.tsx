import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, CheckCircle, XCircle, Loader2, ArrowRight, Sparkles, Trophy, Target, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correct_index: number;
  chapter_ref: string;
  explanation: string;
}

interface Answer {
  question: string;
  selected_index: number;
  correct: boolean;
  chapter_ref: string;
}

interface Report {
  level_label: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  advice: string;
}

type Phase = "loading" | "intro" | "quiz" | "evaluating" | "result";

const LearningAssessment = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [score, setScore] = useState({ score: 0, total: 0 });
  const [userId, setUserId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Check auth and existing assessment
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const { data } = await supabase.from("learning_styles").select("id").eq("user_id", session.user.id).maybeSingle();
      if (data) navigate("/liste-cours");
    };
    check();
  }, [navigate]);

  // Generate test when profile is ready
  useEffect(() => {
    if (profileLoading || !profile?.school_level) return;
    generateTest();
  }, [profile, profileLoading]);

  const generateTest = async () => {
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-placement-test", {
        body: { school_level: profile?.school_level, action: "generate" },
      });
      if (error) throw error;
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setPhase("intro");
      } else {
        toast.error("لم يتم العثور على أسئلة لهذا المستوى");
        navigate("/liste-cours");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("خطأ في تحميل الاختبار");
      navigate("/liste-cours");
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    const q = questions[currentIndex];
    const correct = selectedAnswer === q.correct_index;

    setShowExplanation(true);

    const newAnswer: Answer = {
      question: q.question,
      selected_index: selectedAnswer,
      correct,
      chapter_ref: q.chapter_ref,
    };
    setAnswers(prev => [...prev, newAnswer]);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      evaluateResults();
    }
  };

  const evaluateResults = async () => {
    setPhase("evaluating");
    try {
      const finalAnswers = [...answers];
      // Add last answer if not already added
      if (finalAnswers.length < questions.length && selectedAnswer !== null) {
        const q = questions[currentIndex];
        finalAnswers.push({
          question: q.question,
          selected_index: selectedAnswer,
          correct: selectedAnswer === q.correct_index,
          chapter_ref: q.chapter_ref,
        });
      }

      const { data, error } = await supabase.functions.invoke("generate-placement-test", {
        body: {
          school_level: profile?.school_level,
          student_name: profile?.first_name,
          action: "evaluate",
          answers: finalAnswers,
        },
      });
      if (error) throw error;
      setReport(data.report);
      setScore({ score: data.score, total: data.total });
      setPhase("result");
    } catch (err: any) {
      console.error(err);
      toast.error("خطأ في التقييم");
      setPhase("result");
    }
  };

  const saveAndContinue = async () => {
    if (!userId) return;
    try {
      // Save to learning_styles table (reuse existing table)
      const correctCount = answers.filter(a => a.correct).length;
      const { error } = await supabase.from("learning_styles").insert({
        user_id: userId,
        visual_score: correctCount,
        textual_score: questions.length,
        practical_score: 0,
        preferred_style: report?.level_label || "mixed",
        assessment_data: { type: "placement_test", answers, report, score } as any,
        advice_seen: false, // Initialize as not seen
      });
      if (error) throw error;
      toast.success("تم حفظ نتائج التقييم بنجاح!");
      navigate("/liste-cours");
    } catch (e: any) {
      console.error(e);
      toast.error("خطأ أثناء الحفظ");
    }
  };

  const progressValue = phase === "quiz" ? ((currentIndex + 1) / questions.length) * 100 : phase === "result" ? 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background" dir="rtl">
      {/* Progress bar */}
      {phase === "quiz" && (
        <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-background/80 border-b">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
            <Progress value={progressValue} className="h-1.5 flex-1" />
            <Brain className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-xl w-full">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {phase === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">جاري تحضير اختبار التقييم...</p>
              </motion.div>
            )}

            {/* Intro */}
            {phase === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <Card className="border-primary/20">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Target className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">اختبار تحديد المستوى</h1>
                    <p className="text-muted-foreground leading-relaxed">
                      سيتم طرح 5 أسئلة من برنامج السنة الماضية لتقييم مستواك الحالي في الرياضيات.
                      أجب بصدق للحصول على تقييم دقيق.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span>5 أسئلة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>تقييم بالذكاء الاصطناعي</span>
                      </div>
                    </div>
                    <Button size="lg" onClick={() => setPhase("quiz")} className="gap-2">
                      ابدأ الاختبار
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quiz */}
            {phase === "quiz" && questions.length > 0 && (
              <motion.div key={`q-${currentIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6 pt-16">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="text-sm text-muted-foreground">
                      الفصل: {questions[currentIndex].chapter_ref}
                    </div>
                    <h2 className="text-lg font-semibold leading-relaxed">
                      {questions[currentIndex].question}
                    </h2>
                    <div className="space-y-3">
                      {questions[currentIndex].options.map((option, idx) => {
                        let borderClass = "border-border hover:border-primary/50";
                        if (showExplanation) {
                          if (idx === questions[currentIndex].correct_index) {
                            borderClass = "border-green-500 bg-green-500/10";
                          } else if (idx === selectedAnswer && idx !== questions[currentIndex].correct_index) {
                            borderClass = "border-red-500 bg-red-500/10";
                          }
                        } else if (selectedAnswer === idx) {
                          borderClass = "border-primary bg-primary/5";
                        }

                        return (
                          <button
                            key={idx}
                            className={`w-full p-4 rounded-lg border-2 text-right transition-all ${borderClass} ${showExplanation ? "cursor-default" : "cursor-pointer"}`}
                            onClick={() => !showExplanation && setSelectedAnswer(idx)}
                            disabled={showExplanation}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                                {String.fromCharCode(1571 + idx)}
                              </span>
                              <span className="flex-1">{option}</span>
                              {showExplanation && idx === questions[currentIndex].correct_index && (
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                              )}
                              {showExplanation && idx === selectedAnswer && idx !== questions[currentIndex].correct_index && (
                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showExplanation && questions[currentIndex].explanation && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm font-medium mb-1">الشرح:</p>
                        <p className="text-sm text-muted-foreground">{questions[currentIndex].explanation}</p>
                      </motion.div>
                    )}

                    {/* Action button */}
                    {!showExplanation ? (
                      <Button onClick={handleAnswer} disabled={selectedAnswer === null} className="w-full">
                        تأكيد الإجابة
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="w-full gap-2">
                        {currentIndex < questions.length - 1 ? "السؤال التالي" : "عرض النتائج"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Evaluating */}
            {phase === "evaluating" && (
              <motion.div key="eval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">جاري تحليل النتائج بالذكاء الاصطناعي...</p>
              </motion.div>
            )}

            {/* Result */}
            {phase === "result" && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Score card */}
                <Card className="border-primary/20">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Trophy className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">نتائج التقييم</h1>
                    <div className="text-4xl font-bold text-primary">
                      {score.score}/{score.total}
                    </div>
                    {report && (
                      <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {report.level_label}
                      </span>
                    )}
                  </CardContent>
                </Card>

                {/* AI Report */}
                {report && (
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        <h2 className="font-semibold">تقرير الذكاء الاصطناعي</h2>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">{report.summary}</p>

                      {report.strengths && report.strengths.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            نقاط القوة
                          </h3>
                          <ul className="space-y-1">
                            {report.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.improvements && report.improvements.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-amber-600 flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            نقاط التحسين
                          </h3>
                          <ul className="space-y-1">
                            {report.improvements.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.advice && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm font-medium text-primary mb-1">💡 نصيحة شخصية</p>
                          <p className="text-sm text-muted-foreground">{report.advice}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button size="lg" onClick={saveAndContinue} className="w-full gap-2">
                  متابعة إلى الدروس
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LearningAssessment;
