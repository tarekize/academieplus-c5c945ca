import { useState, useEffect, useRef } from "react";
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

// ─────────────────────────────────────────────────────────────────────────────
// Questions de secours par niveau (utilisées si l'Edge Function est indisponible)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  "5eme_primaire": [
    { question: "كم يساوي 45 + 38؟", options: ["81", "83", "79", "85"], correct_index: 1, chapter_ref: "الجمع", explanation: "45 + 38 = 83" },
    { question: "كم يساوي 7 × 8؟", options: ["54", "56", "64", "48"], correct_index: 1, chapter_ref: "الضرب", explanation: "7 × 8 = 56" },
    { question: "ما هو ناتج 72 ÷ 9؟", options: ["6", "7", "8", "9"], correct_index: 2, chapter_ref: "القسمة", explanation: "72 ÷ 9 = 8" },
    { question: "ما هو محيط مربع طول ضلعه 6 سم؟", options: ["12 سم", "18 سم", "24 سم", "36 سم"], correct_index: 2, chapter_ref: "الهندسة", explanation: "محيط المربع = 4 × الضلع = 4 × 6 = 24 سم" },
    { question: "كم يساوي 1/2 + 1/4؟", options: ["2/6", "3/4", "1/3", "2/4"], correct_index: 1, chapter_ref: "الكسور", explanation: "1/2 + 1/4 = 2/4 + 1/4 = 3/4" },
  ],
  "1ere_cem": [
    { question: "ما هو حل المعادلة: x + 5 = 12؟", options: ["x = 5", "x = 6", "x = 7", "x = 8"], correct_index: 2, chapter_ref: "المعادلات", explanation: "x = 12 - 5 = 7" },
    { question: "ما هو ناتج: (-3) × (+4)؟", options: ["+12", "-12", "+7", "-7"], correct_index: 1, chapter_ref: "الأعداد الصحيحة", explanation: "(-3) × (+4) = -12 (أعداد بإشارتين مختلفتين تعطي سالب)" },
    { question: "كم يساوي 2³؟", options: ["6", "8", "9", "16"], correct_index: 1, chapter_ref: "الأسس", explanation: "2³ = 2 × 2 × 2 = 8" },
    { question: "ما هو مساحة مستطيل طوله 8 سم وعرضه 5 سم؟", options: ["26 سم²", "40 سم²", "30 سم²", "13 سم²"], correct_index: 1, chapter_ref: "الهندسة", explanation: "المساحة = الطول × العرض = 8 × 5 = 40 سم²" },
    { question: "ما هو ناتج: 3/4 + 1/8؟", options: ["4/12", "7/8", "4/8", "1/2"], correct_index: 1, chapter_ref: "الكسور", explanation: "3/4 + 1/8 = 6/8 + 1/8 = 7/8" },
  ],
  "2eme_cem": [
    { question: "ما هو حل: 2x - 3 = 7؟", options: ["x = 2", "x = 4", "x = 5", "x = 6"], correct_index: 2, chapter_ref: "المعادلات", explanation: "2x = 10 → x = 5" },
    { question: "ما هو ناتج: (x + 2)(x - 2)؟", options: ["x² - 4", "x² + 4", "x² - 2x + 4", "2x"], correct_index: 0, chapter_ref: "التحليل", explanation: "(a+b)(a-b) = a² - b² → (x+2)(x-2) = x² - 4" },
    { question: "في مثلث قائم الزاوية، الضلعان القائمان 3 و4، ما هو الوتر؟", options: ["5", "6", "7", "√7"], correct_index: 0, chapter_ref: "نظرية فيثاغورس", explanation: "الوتر² = 9 + 16 = 25 → الوتر = 5" },
    { question: "ما هو وسيط مجموعة: 3, 7, 2, 9, 5؟", options: ["5", "7", "4", "3"], correct_index: 0, chapter_ref: "الإحصاء", explanation: "نرتبها: 2,3,5,7,9 → الوسيط = 5" },
    { question: "ما هو حجم متوازي مستطيلات أبعاده 3×4×5؟", options: ["47 سم³", "60 سم³", "24 سم³", "36 سم³"], correct_index: 1, chapter_ref: "المجسمات", explanation: "الحجم = الطول × العرض × الارتفاع = 3 × 4 × 5 = 60 سم³" },
  ],
  "3eme_cem": [
    { question: "ما هو ناتج: (2x + 3)²؟", options: ["4x² + 9", "4x² + 12x + 9", "4x² + 6x + 9", "2x² + 12x + 9"], correct_index: 1, chapter_ref: "الهويات الرياضية", explanation: "(a+b)² = a² + 2ab + b² → (2x+3)² = 4x² + 12x + 9" },
    { question: "ما هو cos(0°)؟", options: ["0", "1", "-1", "1/2"], correct_index: 1, chapter_ref: "المثلثات", explanation: "cos(0°) = 1" },
    { question: "ما هو حل النظام: x+y=5 و x-y=1؟", options: ["x=2, y=3", "x=3, y=2", "x=4, y=1", "x=1, y=4"], correct_index: 1, chapter_ref: "منظومة المعادلات", explanation: "بالجمع: 2x=6 → x=3, y=2" },
    { question: "ما هي المشتقة (الفرق) لـ f(x) = 3x²؟", options: ["3x", "6x", "6x²", "3x³"], correct_index: 1, chapter_ref: "المشتقات (مقدمة)", explanation: "f'(x) = 2 × 3x = 6x" },
    { question: "ما هو الميل (معامل الاتجاه) للمستقيم y = 2x + 5؟", options: ["5", "2", "7", "-2"], correct_index: 1, chapter_ref: "المعادلة المستقيمية", explanation: "y = mx + b → الميل m = 2" },
  ],
  "4eme_cem": [
    { question: "ما هو حل: x² - 5x + 6 = 0؟", options: ["x=1 أو x=6", "x=2 أو x=3", "x=-2 أو x=-3", "x=3 أو x=4"], correct_index: 1, chapter_ref: "المعادلات التربيعية", explanation: "x² - 5x + 6 = (x-2)(x-3) = 0 → x=2 أو x=3" },
    { question: "ما هو نطاق الدالة f(x) = √x؟", options: ["â„", "[0, +∞[", "]-∞, 0]", "â„*"], correct_index: 1, chapter_ref: "الدوال", explanation: "الجذر التربيعي معرف فقط للأعداد الموجبة أو الصفر" },
    { question: "ما هو sin(30°)؟", options: ["√3/2", "1/2", "√2/2", "1"], correct_index: 1, chapter_ref: "المثلثات", explanation: "sin(30°) = 1/2" },
    { question: "ما هو متوسط (معدل): 12, 15, 18, 9, 6؟", options: ["10", "12", "14", "15"], correct_index: 1, chapter_ref: "الإحصاء", explanation: "المعدل = (12+15+18+9+6) ÷ 5 = 60 ÷ 5 = 12" },
    { question: "ما هو تمييز (discriminant) معادلة 2x² - 4x + 2 = 0؟", options: ["0", "4", "8", "-4"], correct_index: 0, chapter_ref: "المعادلات التربيعية", explanation: "Δ = b² - 4ac = 16 - 16 = 0" },
  ],
};

// Fonction qui retourne les questions de secours selon le niveau
const getFallbackQuestions = (schoolLevel: string): Question[] => {
  return (
    FALLBACK_QUESTIONS[schoolLevel] ||
    FALLBACK_QUESTIONS["3eme_cem"] // fallback général
  );
};

// Évaluation locale (si l'Edge Function evaluate échoue)
const getLocalEvaluation = (correctCount: number, total: number): Report => {
  const pct = Math.round((correctCount / total) * 100);
  if (pct >= 80) return {
    level_label: "مستوى ممتاز",
    summary: "أداؤك رائع! أنت تمتلك قاعدة متينة وجاهز تماماً لهذا المستوى.",
    strengths: ["إتقان المفاهيم الأساسية", "دقة في الحل"],
    improvements: ["مواصلة التحدي بتمارين أكثر تعقيداً"],
    advice: "أنت في المسار الصحيح! واصل هذا التميز وجرب المسائل المتقدمة."
  };
  if (pct >= 60) return {
    level_label: "مستوى جيد",
    summary: "أداؤك جيد! لديك فهم جيد لأغلب المفاهيم، مع بعض النقاط التي تحتاج مراجعة.",
    strengths: ["فهم جيد للمفاهيم الأساسية"],
    improvements: ["مراجعة بعض الفصول", "تطبيق أكثر على التمارين"],
    advice: "مع القليل من المراجعة ستصل للتميز! ركز على نقاط ضعفك."
  };
  if (pct >= 40) return {
    level_label: "مستوى متوسط",
    summary: "لديك قاعدة لكن هناك ثغرات تحتاج معالجة. تدرج في التعلم سيساعدك كثيراً.",
    strengths: ["الاستعداد للتعلم"],
    improvements: ["مراجعة المفاهيم الأساسية", "تخصيص وقت أكثر للدراسة"],
    advice: "لا تيأس! كل شيء يُفهم بالتكرار والممارسة. المنصة ستساعدك خطوة بخطوة."
  };
  return {
    level_label: "يحتاج تعزيز",
    summary: "لا تقلق! البداية دائماً صعبة. المنصة ستساعدك على بناء قاعدة قوية.",
    strengths: ["إقبال على التعلم والمحاولة"],
    improvements: ["البدء من الأساسيات", "الممارسة اليومية المنتظمة"],
    advice: "كل خبير كان مبتدئاً! ابدأ بالدروس الأساسية واستخدم المساعد الذكي."
  };
};

// ─────────────────────────────────────────────────────────────────────────────

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
  const testGeneratedRef = useRef(false);

  const hasCompletedPlacementAssessment = async (id: string): Promise<boolean> => {
    const { data: scoreRows } = await supabase
      .from("student_scores")
      .select("id")
      .eq("user_id", id)
      .is("lesson_id", null)
      .limit(1);

    if ((scoreRows?.length || 0) > 0) return true;

    // Compatibility: users with only lesson-linked rows should not retake placement.
    const { data: anyScoreRows } = await supabase
      .from("student_scores")
      .select("id")
      .eq("user_id", id)
      .limit(1);

    if ((anyScoreRows?.length || 0) > 0) return true;

    const { data: legacyRows } = await (supabase as any)
      .from("learning_styles")
      .select("id")
      .eq("user_id", id)
      .limit(1);

    return (legacyRows?.length || 0) > 0;
  };

  // Vérif auth et évaluation existante
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const hasAssessment = await hasCompletedPlacementAssessment(session.user.id);
      if (hasAssessment) navigate("/liste-cours");
    };
    check();
  }, [navigate]);

  // Générer le test dès que school_level est disponible
  useEffect(() => {
    if (testGeneratedRef.current) return;

    const getSchoolLevel = async (): Promise<string | null> => {
      if (!profileLoading && profile?.school_level) return profile.school_level;
      const { data: { session } } = await supabase.auth.getSession();
      return (session?.user?.user_metadata?.school_level as string) || null;
    };

    const tryGenerate = async () => {
      const schoolLevel = await getSchoolLevel();
      if (!schoolLevel) return;
      testGeneratedRef.current = true;
      generateTest(schoolLevel);
    };

    tryGenerate();
  }, [profile, profileLoading]);

  // Fallback polling après 3s si le profil n'est toujours pas prêt
  useEffect(() => {
    if (testGeneratedRef.current) return;

    const timer = setTimeout(async () => {
      if (testGeneratedRef.current) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const metaLevel = session.user.user_metadata?.school_level as string | undefined;
      if (metaLevel) {
        testGeneratedRef.current = true;
        generateTest(metaLevel);
        return;
      }

      const { data: profileData } = await supabase.from("profiles").select("school_level").eq("id", session.user.id).maybeSingle();
      if (profileData?.school_level) {
        testGeneratedRef.current = true;
        generateTest(profileData.school_level);
      } else {
        // Niveau inconnu → utiliser les questions générales
        testGeneratedRef.current = true;
        generateTest("3eme_cem");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const generateTest = async (schoolLevel: string) => {
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-placement-test", {
        body: { school_level: schoolLevel, action: "generate" },
      });

      // Si l'Edge Function retourne une erreur HTTP
      if (error) throw error;
      // Si l'Edge Function retourne une erreur métier
      if (data?.error) throw new Error(data.error);

      if (data?.questions?.length > 0) {
        setQuestions(data.questions);
        setPhase("intro");
        return;
      }

      throw new Error("Aucune question reçue de l'IA");

    } catch (err: any) {
      console.warn("Edge Function indisponible, utilisation des questions locales:", err?.message);
      // ✅ Utiliser les questions de secours au lieu de rediriger
      const fallback = getFallbackQuestions(schoolLevel);
      setQuestions(fallback);
      setPhase("intro");
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    const q = questions[currentIndex];
    const correct = selectedAnswer === q.correct_index;
    setShowExplanation(true);
    setAnswers(prev => [...prev, {
      question: q.question,
      selected_index: selectedAnswer,
      correct,
      chapter_ref: q.chapter_ref,
    }]);
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
      if (finalAnswers.length < questions.length && selectedAnswer !== null) {
        const q = questions[currentIndex];
        finalAnswers.push({
          question: q.question,
          selected_index: selectedAnswer,
          correct: selectedAnswer === q.correct_index,
          chapter_ref: q.chapter_ref,
        });
      }

      // Récupérer school_level depuis le profil ou les métadonnées
      const { data: { session } } = await supabase.auth.getSession();
      const schoolLevel = profile?.school_level || session?.user?.user_metadata?.school_level;
      const studentName = profile?.first_name || session?.user?.user_metadata?.first_name;

      const { data, error } = await supabase.functions.invoke("generate-placement-test", {
        body: {
          school_level: schoolLevel,
          student_name: studentName,
          action: "evaluate",
          answers: finalAnswers,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setReport(data.report);
      setScore({ score: data.score, total: data.total });
      setPhase("result");

    } catch (err: any) {
      console.warn("Évaluation IA indisponible, utilisation de l'évaluation locale:", err?.message);
      // ✅ Évaluation locale de secours
      const correctCount = answers.filter(a => a.correct).length;
      const total = answers.length;
      setReport(getLocalEvaluation(correctCount, total));
      setScore({ score: correctCount, total });
      setPhase("result");
    }
  };

  const saveAndContinue = async () => {
    if (!userId) return;
    const correctCount = answers.filter(a => a.correct).length;
    try {
      const placementScore = questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;

      const payload = {
        user_id: userId,
        lesson_id: null,
        chapter_id: null,
        current_level: placementScore,
        assessment_data: { type: "placement_test", answers, report, score } as any,
        advice_seen: false,
        periodic_advice: null,
        report_first_shown_at: null,
        last_advice_generated_at: null,
      };

      const { data: existing } = await supabase
        .from("student_scores")
        .select("id")
        .eq("user_id", userId)
        .is("lesson_id", null)
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from("student_scores")
          .update(payload)
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("student_scores")
          .insert(payload);
        if (insertError) throw insertError;
      }

      toast.success("Résultats sauvegardés !");
      navigate("/liste-cours");
    } catch (e: any) {
      console.error("Primary save to student_scores failed, trying legacy fallback:", e);

      try {
        const legacyPayload = {
          user_id: userId,
          visual_score: correctCount,
          textual_score: questions.length,
          practical_score: 0,
          preferred_style: report?.level_label || "mixed",
          assessment_data: { type: "placement_test", answers, report, score } as any,
          advice_seen: false,
        };

        const { data: legacyExisting } = await (supabase as any)
          .from("learning_styles")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (legacyExisting?.id) {
          const { error: legacyUpdateError } = await (supabase as any)
            .from("learning_styles")
            .update(legacyPayload)
            .eq("id", legacyExisting.id);
          if (legacyUpdateError) throw legacyUpdateError;
        } else {
          const { error: legacyInsertError } = await (supabase as any)
            .from("learning_styles")
            .insert(legacyPayload);
          if (legacyInsertError) throw legacyInsertError;
        }

        toast.success("Résultats sauvegardés !");
        navigate("/liste-cours");
      } catch (legacyError: any) {
        console.error("Legacy save failed:", legacyError);
        toast.error("Erreur lors de la sauvegarde. Veuillez réessayer.");
      }
    }
  };

  const progressValue = phase === "quiz" ? ((currentIndex + 1) / questions.length) * 100 : phase === "result" ? 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background" dir="rtl">
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
                      سيتم طرح {questions.length} أسئلة لتقييم مستواك الحالي في الرياضيات.
                      أجب بصدق للحصول على تقييم دقيق.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span>{questions.length} أسئلة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>تقييم ذكي</span>
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
                          if (idx === questions[currentIndex].correct_index) borderClass = "border-green-500 bg-green-500/10";
                          else if (idx === selectedAnswer && idx !== questions[currentIndex].correct_index) borderClass = "border-red-500 bg-red-500/10";
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

                    {showExplanation && questions[currentIndex].explanation && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm font-medium mb-1">الشرح:</p>
                        <p className="text-sm text-muted-foreground">{questions[currentIndex].explanation}</p>
                      </motion.div>
                    )}

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
                <p className="text-muted-foreground">جاري تحليل النتائج...</p>
              </motion.div>
            )}

            {/* Result */}
            {phase === "result" && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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

                {report && (
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        <h2 className="font-semibold">تقرير التقييم</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{report.summary}</p>

                      {report.strengths?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            نقاط القوة
                          </h3>
                          <ul className="space-y-1">
                            {report.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.improvements?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-amber-600 flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            نقاط التحسين
                          </h3>
                          <ul className="space-y-1">
                            {report.improvements.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>{s}
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
