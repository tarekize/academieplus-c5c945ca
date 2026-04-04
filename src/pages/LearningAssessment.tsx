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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Questions de secours par niveau (utilisées si l'Edge Function est indisponible)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  "5eme_primaire": [
    { question: "ÙƒÙ… ÙŠساÙˆÙŠ 45 + 38ØŸ", options: ["81", "83", "79", "85"], correct_index: 1, chapter_ref: "اÙ„جÙ…ع", explanation: "45 + 38 = 83" },
    { question: "ÙƒÙ… ÙŠساÙˆÙŠ 7 Ã— 8ØŸ", options: ["54", "56", "64", "48"], correct_index: 1, chapter_ref: "اÙ„ضرب", explanation: "7 Ã— 8 = 56" },
    { question: "Ù…ا Ù‡Ùˆ Ù†اتج 72 ÷ 9ØŸ", options: ["6", "7", "8", "9"], correct_index: 2, chapter_ref: "اÙ„Ù‚سÙ…ة", explanation: "72 ÷ 9 = 8" },
    { question: "Ù…ا Ù‡Ùˆ Ù…حÙŠط Ù…ربع طÙˆÙ„ ضÙ„عÙ‡ 6 سÙ…ØŸ", options: ["12 سÙ…", "18 سÙ…", "24 سÙ…", "36 سÙ…"], correct_index: 2, chapter_ref: "اÙ„Ù‡Ù†دسة", explanation: "Ù…حÙŠط اÙ„Ù…ربع = 4 Ã— اÙ„ضÙ„ع = 4 Ã— 6 = 24 سÙ…" },
    { question: "ÙƒÙ… ÙŠساÙˆÙŠ 1/2 + 1/4ØŸ", options: ["2/6", "3/4", "1/3", "2/4"], correct_index: 1, chapter_ref: "اÙ„ÙƒسÙˆر", explanation: "1/2 + 1/4 = 2/4 + 1/4 = 3/4" },
  ],
  "1ere_cem": [
    { question: "Ù…ا Ù‡Ùˆ حÙ„ اÙ„Ù…عادÙ„ة: x + 5 = 12ØŸ", options: ["x = 5", "x = 6", "x = 7", "x = 8"], correct_index: 2, chapter_ref: "اÙ„Ù…عادÙ„ات", explanation: "x = 12 - 5 = 7" },
    { question: "Ù…ا Ù‡Ùˆ Ù†اتج: (-3) Ã— (+4)ØŸ", options: ["+12", "-12", "+7", "-7"], correct_index: 1, chapter_ref: "اÙ„أعداد اÙ„صحÙŠحة", explanation: "(-3) Ã— (+4) = -12 (أعداد بإشارتÙŠÙ† Ù…ختÙ„فتÙŠÙ† تعطÙŠ ساÙ„ب)" },
    { question: "ÙƒÙ… ÙŠساÙˆÙŠ 2³ØŸ", options: ["6", "8", "9", "16"], correct_index: 1, chapter_ref: "اÙ„أسس", explanation: "2³ = 2 Ã— 2 Ã— 2 = 8" },
    { question: "Ù…ا Ù‡Ùˆ Ù…ساحة Ù…ستطÙŠÙ„ طÙˆÙ„Ù‡ 8 سÙ… ÙˆعرضÙ‡ 5 سÙ…ØŸ", options: ["26 سÙ…²", "40 سÙ…²", "30 سÙ…²", "13 سÙ…²"], correct_index: 1, chapter_ref: "اÙ„Ù‡Ù†دسة", explanation: "اÙ„Ù…ساحة = اÙ„طÙˆÙ„ Ã— اÙ„عرض = 8 Ã— 5 = 40 سÙ…²" },
    { question: "Ù…ا Ù‡Ùˆ Ù†اتج: 3/4 + 1/8ØŸ", options: ["4/12", "7/8", "4/8", "1/2"], correct_index: 1, chapter_ref: "اÙ„ÙƒسÙˆر", explanation: "3/4 + 1/8 = 6/8 + 1/8 = 7/8" },
  ],
  "2eme_cem": [
    { question: "Ù…ا Ù‡Ùˆ حÙ„: 2x - 3 = 7ØŸ", options: ["x = 2", "x = 4", "x = 5", "x = 6"], correct_index: 2, chapter_ref: "اÙ„Ù…عادÙ„ات", explanation: "2x = 10 â†’ x = 5" },
    { question: "Ù…ا Ù‡Ùˆ Ù†اتج: (x + 2)(x - 2)ØŸ", options: ["x² - 4", "x² + 4", "x² - 2x + 4", "2x"], correct_index: 0, chapter_ref: "اÙ„تحÙ„ÙŠÙ„", explanation: "(a+b)(a-b) = a² - b² â†’ (x+2)(x-2) = x² - 4" },
    { question: "فÙŠ Ù…ثÙ„ث Ù‚ائÙ… اÙ„زاÙˆÙŠةØŒ اÙ„ضÙ„عاÙ† اÙ„Ù‚ائÙ…اÙ† 3 Ùˆ4ØŒ Ù…ا Ù‡Ùˆ اÙ„ÙˆترØŸ", options: ["5", "6", "7", "âˆš7"], correct_index: 0, chapter_ref: "Ù†ظرÙŠة فÙŠثاغÙˆرس", explanation: "اÙ„Ùˆتر² = 9 + 16 = 25 â†’ اÙ„Ùˆتر = 5" },
    { question: "Ù…ا Ù‡Ùˆ ÙˆسÙŠط Ù…جÙ…Ùˆعة: 3, 7, 2, 9, 5ØŸ", options: ["5", "7", "4", "3"], correct_index: 0, chapter_ref: "اÙ„إحصاء", explanation: "Ù†رتبÙ‡ا: 2,3,5,7,9 â†’ اÙ„ÙˆسÙŠط = 5" },
    { question: "Ù…ا Ù‡Ùˆ حجÙ… Ù…تÙˆازÙŠ Ù…ستطÙŠÙ„ات أبعادÙ‡ 3Ã—4Ã—5ØŸ", options: ["47 سÙ…³", "60 سÙ…³", "24 سÙ…³", "36 سÙ…³"], correct_index: 1, chapter_ref: "اÙ„Ù…جسÙ…ات", explanation: "اÙ„حجÙ… = اÙ„طÙˆÙ„ Ã— اÙ„عرض Ã— اÙ„ارتفاع = 3 Ã— 4 Ã— 5 = 60 سÙ…³" },
  ],
  "3eme_cem": [
    { question: "Ù…ا Ù‡Ùˆ Ù†اتج: (2x + 3)²ØŸ", options: ["4x² + 9", "4x² + 12x + 9", "4x² + 6x + 9", "2x² + 12x + 9"], correct_index: 1, chapter_ref: "اÙ„Ù‡ÙˆÙŠات اÙ„رÙŠاضÙŠة", explanation: "(a+b)² = a² + 2ab + b² â†’ (2x+3)² = 4x² + 12x + 9" },
    { question: "Ù…ا Ù‡Ùˆ cos(0°)ØŸ", options: ["0", "1", "-1", "1/2"], correct_index: 1, chapter_ref: "اÙ„Ù…ثÙ„ثات", explanation: "cos(0°) = 1" },
    { question: "Ù…ا Ù‡Ùˆ حÙ„ اÙ„Ù†ظاÙ…: x+y=5 Ùˆ x-y=1ØŸ", options: ["x=2, y=3", "x=3, y=2", "x=4, y=1", "x=1, y=4"], correct_index: 1, chapter_ref: "Ù…Ù†ظÙˆÙ…ة اÙ„Ù…عادÙ„ات", explanation: "باÙ„جÙ…ع: 2x=6 â†’ x=3, y=2" },
    { question: "Ù…ا Ù‡ÙŠ اÙ„Ù…شتÙ‚ة (اÙ„فرÙ‚) Ù„Ù€ f(x) = 3x²ØŸ", options: ["3x", "6x", "6x²", "3x³"], correct_index: 1, chapter_ref: "اÙ„Ù…شتÙ‚ات (Ù…Ù‚دÙ…ة)", explanation: "f'(x) = 2 Ã— 3x = 6x" },
    { question: "Ù…ا Ù‡Ùˆ اÙ„Ù…ÙŠÙ„ (Ù…عاÙ…Ù„ اÙ„اتجاÙ‡) Ù„Ù„Ù…ستÙ‚ÙŠÙ… y = 2x + 5ØŸ", options: ["5", "2", "7", "-2"], correct_index: 1, chapter_ref: "اÙ„Ù…عادÙ„ة اÙ„Ù…ستÙ‚ÙŠÙ…ÙŠة", explanation: "y = mx + b â†’ اÙ„Ù…ÙŠÙ„ m = 2" },
  ],
  "4eme_cem": [
    { question: "Ù…ا Ù‡Ùˆ حÙ„: x² - 5x + 6 = 0ØŸ", options: ["x=1 أÙˆ x=6", "x=2 أÙˆ x=3", "x=-2 أÙˆ x=-3", "x=3 أÙˆ x=4"], correct_index: 1, chapter_ref: "اÙ„Ù…عادÙ„ات اÙ„تربÙŠعÙŠة", explanation: "x² - 5x + 6 = (x-2)(x-3) = 0 â†’ x=2 أÙˆ x=3" },
    { question: "Ù…ا Ù‡Ùˆ Ù†طاÙ‚ اÙ„داÙ„ة f(x) = âˆšxØŸ", options: ["â„", "[0, +âˆž[", "]-âˆž, 0]", "â„*"], correct_index: 1, chapter_ref: "اÙ„دÙˆاÙ„", explanation: "اÙ„جذر اÙ„تربÙŠعÙŠ Ù…عرف فÙ‚ط Ù„Ù„أعداد اÙ„Ù…Ùˆجبة أÙˆ اÙ„صفر" },
    { question: "Ù…ا Ù‡Ùˆ sin(30°)ØŸ", options: ["âˆš3/2", "1/2", "âˆš2/2", "1"], correct_index: 1, chapter_ref: "اÙ„Ù…ثÙ„ثات", explanation: "sin(30°) = 1/2" },
    { question: "Ù…ا Ù‡Ùˆ Ù…تÙˆسط (Ù…عدÙ„): 12, 15, 18, 9, 6ØŸ", options: ["10", "12", "14", "15"], correct_index: 1, chapter_ref: "اÙ„إحصاء", explanation: "اÙ„Ù…عدÙ„ = (12+15+18+9+6) ÷ 5 = 60 ÷ 5 = 12" },
    { question: "Ù…ا Ù‡Ùˆ تÙ…ÙŠÙŠز (discriminant) Ù…عادÙ„ة 2x² - 4x + 2 = 0ØŸ", options: ["0", "4", "8", "-4"], correct_index: 0, chapter_ref: "اÙ„Ù…عادÙ„ات اÙ„تربÙŠعÙŠة", explanation: "Î” = b² - 4ac = 16 - 16 = 0" },
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
    level_label: "Ù…ستÙˆÙ‰ Ù…Ù…تاز",
    summary: "أداؤÙƒ رائع! أÙ†ت تÙ…تÙ„Ùƒ Ù‚اعدة Ù…تÙŠÙ†ة ÙˆجاÙ‡ز تÙ…اÙ…اÙ‹ Ù„Ù‡ذا اÙ„Ù…ستÙˆÙ‰.",
    strengths: ["إتÙ‚اÙ† اÙ„Ù…فاÙ‡ÙŠÙ… اÙ„أساسÙŠة", "دÙ‚ة فÙŠ اÙ„حÙ„"],
    improvements: ["Ù…ÙˆاصÙ„ة اÙ„تحدÙŠ بتمارين أÙƒثر تعÙ‚ÙŠداÙ‹"],
    advice: "أÙ†ت فÙŠ اÙ„Ù…سار اÙ„صحÙŠح! ÙˆاصÙ„ Ù‡ذا اÙ„تÙ…ÙŠز Ùˆجرب اÙ„Ù…سائÙ„ اÙ„Ù…تÙ‚دÙ…ة."
  };
  if (pct >= 60) return {
    level_label: "Ù…ستÙˆÙ‰ جÙŠد",
    summary: "أداؤÙƒ جÙŠد! Ù„دÙŠÙƒ فÙ‡Ù… جÙŠد Ù„أغÙ„ب اÙ„Ù…فاÙ‡ÙŠÙ…ØŒ Ù…ع بعض اÙ„Ù†Ù‚اط اÙ„تÙŠ تحتاج Ù…راجعة.",
    strengths: ["فÙ‡Ù… جÙŠد Ù„Ù„Ù…فاÙ‡ÙŠÙ… اÙ„أساسÙŠة"],
    improvements: ["Ù…راجعة بعض اÙ„فصÙˆÙ„", "تطبÙŠÙ‚ أÙƒثر عÙ„Ù‰ اÙ„تمارين"],
    advice: "Ù…ع اÙ„Ù‚Ù„ÙŠÙ„ Ù…Ù† اÙ„Ù…راجعة ستصÙ„ Ù„Ù„تÙ…ÙŠز! رÙƒز عÙ„Ù‰ Ù†Ù‚اط ضعفÙƒ."
  };
  if (pct >= 40) return {
    level_label: "Ù…ستÙˆÙ‰ Ù…تÙˆسط",
    summary: "Ù„دÙŠÙƒ Ù‚اعدة Ù„ÙƒÙ† Ù‡Ù†اÙƒ ثغرات تحتاج Ù…عاÙ„جة. تدرج فÙŠ اÙ„تعÙ„Ù… سÙŠساعدÙƒ ÙƒثÙŠراÙ‹.",
    strengths: ["اÙ„استعداد Ù„Ù„تعÙ„Ù…"],
    improvements: ["Ù…راجعة اÙ„Ù…فاÙ‡ÙŠÙ… اÙ„أساسÙŠة", "تخصÙŠص ÙˆÙ‚ت أÙƒثر Ù„Ù„دراسة"],
    advice: "Ù„ا تÙŠأس! ÙƒÙ„ شÙŠء ÙŠُفÙ‡Ù… باÙ„تÙƒرار ÙˆاÙ„Ù…Ù…ارسة. اÙ„Ù…Ù†صة ستساعدÙƒ خطÙˆة بخطÙˆة."
  };
  return {
    level_label: "ÙŠحتاج تعزÙŠز",
    summary: "Ù„ا تÙ‚Ù„Ù‚! اÙ„بداÙŠة دائÙ…اÙ‹ صعبة. اÙ„Ù…Ù†صة ستساعدÙƒ عÙ„Ù‰ بÙ†اء Ù‚اعدة Ù‚ÙˆÙŠة.",
    strengths: ["إÙ‚باÙ„ عÙ„Ù‰ اÙ„تعÙ„Ù… ÙˆاÙ„Ù…حاÙˆÙ„ة"],
    improvements: ["اÙ„بدء Ù…Ù† اÙ„أساسÙŠات", "اÙ„Ù…Ù…ارسة اÙ„ÙŠÙˆÙ…ÙŠة اÙ„Ù…Ù†تظÙ…ة"],
    advice: "ÙƒÙ„ خبÙŠر ÙƒاÙ† Ù…بتدئاÙ‹! ابدأ بالدروس اÙ„أساسÙŠة ÙˆاستخدÙ… اÙ„Ù…ساعد اÙ„ذÙƒÙŠ."
  };
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        // Niveau inconnu â†’ utiliser les questions générales
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
      // âœ… Utiliser les questions de secours au lieu de rediriger
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
      // âœ… Évaluation locale de secours
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
                <p className="text-muted-foreground">جارÙŠ تحضÙŠر اختبار اÙ„تÙ‚ÙŠÙŠÙ…...</p>
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
                    <h1 className="text-2xl font-bold">اختبار تحدÙŠد اÙ„Ù…ستÙˆÙ‰</h1>
                    <p className="text-muted-foreground leading-relaxed">
                      سÙŠتÙ… طرح {questions.length} أسئÙ„ة Ù„تÙ‚ÙŠÙŠÙ… Ù…ستÙˆاÙƒ اÙ„حاÙ„ÙŠ فÙŠ اÙ„رÙŠاضÙŠات.
                      أجب بصدÙ‚ Ù„Ù„حصÙˆÙ„ عÙ„Ù‰ تÙ‚ÙŠÙŠÙ… دÙ‚ÙŠÙ‚.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span>{questions.length} أسئÙ„ة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>تÙ‚ÙŠÙŠÙ… ذÙƒÙŠ</span>
                      </div>
                    </div>
                    <Button size="lg" onClick={() => setPhase("quiz")} className="gap-2">
                      ابدأ اÙ„اختبار
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
                      اÙ„فصÙ„: {questions[currentIndex].chapter_ref}
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
                        <p className="text-sm font-medium mb-1">اÙ„شرح:</p>
                        <p className="text-sm text-muted-foreground">{questions[currentIndex].explanation}</p>
                      </motion.div>
                    )}

                    {!showExplanation ? (
                      <Button onClick={handleAnswer} disabled={selectedAnswer === null} className="w-full">
                        تأÙƒÙŠد اÙ„إجابة
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="w-full gap-2">
                        {currentIndex < questions.length - 1 ? "اÙ„سؤاÙ„ اÙ„تاÙ„ÙŠ" : "عرض اÙ„Ù†تائج"}
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
                <p className="text-muted-foreground">جارÙŠ تحÙ„ÙŠÙ„ اÙ„Ù†تائج...</p>
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
                    <h1 className="text-2xl font-bold">Ù†تائج اÙ„تÙ‚ÙŠÙŠÙ…</h1>
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
                        <h2 className="font-semibold">تÙ‚رÙŠر اÙ„تÙ‚ÙŠÙŠÙ…</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{report.summary}</p>

                      {report.strengths?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            Ù†Ù‚اط اÙ„Ù‚Ùˆة
                          </h3>
                          <ul className="space-y-1">
                            {report.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">â€¢</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.improvements?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-amber-600 flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            Ù†Ù‚اط اÙ„تحسÙŠÙ†
                          </h3>
                          <ul className="space-y-1">
                            {report.improvements.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500 mt-1">â€¢</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.advice && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm font-medium text-primary mb-1">ðŸ’¡ Ù†صÙŠحة شخصÙŠة</p>
                          <p className="text-sm text-muted-foreground">{report.advice}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button size="lg" onClick={saveAndContinue} className="w-full gap-2">
                  Ù…تابعة إÙ„Ù‰ الدروس
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
