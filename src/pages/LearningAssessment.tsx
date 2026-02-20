import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Eye, BookOpen, Brain, Timer, Sparkles, Rocket, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BotCompanion from "@/components/BotCompanion";
import BotMessage from "@/components/BotMessage";
import BotAnswerGroup from "@/components/BotAnswerGroup";
import { botOnboardingMessages } from "@/i18n/botMessages";

type SchoolLevel =
  | "5eme_primaire"
  | "1ere_cem"
  | "2eme_cem"
  | "3eme_cem"
  | "4eme_cem"
  | "1ere_tcl"
  | "1ere_tcs"
  | "terminale_lettres"
  | "terminale_sciences"
  | "terminale_mathematiques"
  | "terminale_gestion"
  | null;

type VisualPuzzle = {
  type: "sequence" | "odd-one" | "count" | "pattern";
  question: string;
  options: string[];
  correctIndex: number;
  svg: React.ReactNode;
};

type TextRiddle = {
  riddle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

// ─── PRIMARY LEVEL PUZZLES ──────────────────────────────────────
const VISUAL_PUZZLES_PRIMARY: VisualPuzzle[] = [
  {
    type: "sequence",
    question: "ما الشكل التالي في هذه السلسلة؟",
    options: ["مثلث", "مربع", "دائرة", "نجمة"],
    correctIndex: 1,
    svg: (
      <svg viewBox="0 0 400 120" className="w-full h-40">
        <defs>
          <linearGradient id="g1p" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="g2p" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="g3p" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="28" fill="url(#g1p)" opacity="0.9" />
        <text x="115" y="65" fill="#94A3B8" fontSize="20" fontWeight="bold">→</text>
        <rect x="145" y="32" width="56" height="56" rx="6" fill="url(#g2p)" opacity="0.9" />
        <text x="230" y="65" fill="#94A3B8" fontSize="20" fontWeight="bold">→</text>
        <polygon points="290,32 318,88 262,88" fill="url(#g3p)" opacity="0.9" />
        <text x="345" y="65" fill="#94A3B8" fontSize="20" fontWeight="bold">→</text>
        <rect x="365" y="35" width="50" height="50" rx="8" fill="none" stroke="#6366F1" strokeWidth="3" strokeDasharray="6 4" />
        <text x="390" y="66" textAnchor="middle" fill="#6366F1" fontSize="22" fontWeight="bold">؟</text>
      </svg>
    ),
  },
  {
    type: "odd-one",
    question: "أي شكل لا ينتمي إلى المجموعة؟",
    options: ["الشكل الأول", "الشكل الثاني", "الشكل الثالث", "الشكل الرابع"],
    correctIndex: 2,
    svg: (
      <svg viewBox="0 0 400 120" className="w-full h-40">
        <defs>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r="30" fill="#3B82F6" filter="url(#glow1)" opacity="0.85" />
        <text x="60" y="100" textAnchor="middle" fill="#64748B" fontSize="11">١</text>
        <circle cx="160" cy="60" r="30" fill="#3B82F6" filter="url(#glow1)" opacity="0.85" />
        <text x="160" y="100" textAnchor="middle" fill="#64748B" fontSize="11">٢</text>
        <rect x="230" y="30" width="60" height="60" rx="8" fill="#3B82F6" filter="url(#glow1)" opacity="0.85" />
        <text x="260" y="100" textAnchor="middle" fill="#64748B" fontSize="11">٣</text>
        <circle cx="340" cy="60" r="30" fill="#3B82F6" filter="url(#glow1)" opacity="0.85" />
        <text x="340" y="100" textAnchor="middle" fill="#64748B" fontSize="11">٤</text>
      </svg>
    ),
  },
];

const TEXT_RIDDLE_PRIMARY: TextRiddle = {
  riddle: "أنا عدد. إذا ضربتني في نفسي أحصل على 9. وإذا جمعتني مع نفسي أحصل على 6. من أنا؟",
  question: "ما هو هذا العدد؟",
  options: ["2", "3", "4", "5"],
  correctIndex: 1,
  explanation: "3 × 3 = 9 و 3 + 3 = 6",
};

// ─── 1ERE CEM PUZZLES ───────────────────────────────────────────
const VISUAL_PUZZLES_1CEM: VisualPuzzle[] = [
  {
    type: "sequence",
    question: "ما العدد الذي يكمل هذه المتتابعة؟ 2، 4، 8، 16، ...؟",
    options: ["20", "24", "32", "30"],
    correctIndex: 2,
    svg: (
      <svg viewBox="0 0 400 100" className="w-full h-36">
        <defs><linearGradient id="gc1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
        {[2, 4, 8, 16].map((n, i) => (
          <g key={i}>
            <circle cx={60 + i * 80} cy={50} r={24} fill="url(#gc1)" opacity={0.15 + i * 0.2} />
            <text x={60 + i * 80} y={56} textAnchor="middle" fill="#6366F1" fontSize="22" fontWeight="bold">{n}</text>
          </g>
        ))}
        <circle cx={380} cy={50} r={24} fill="none" stroke="#EC4899" strokeWidth="2" strokeDasharray="5 3" />
        <text x={380} y={56} textAnchor="middle" fill="#EC4899" fontSize="22" fontWeight="bold">؟</text>
      </svg>
    ),
  },
  {
    type: "count",
    question: "كم مثلثاً يمكنك عدّه في هذا الشكل؟",
    options: ["3", "4", "5", "6"],
    correctIndex: 1,
    svg: (
      <svg viewBox="0 0 300 180" className="w-full h-44">
        <defs><linearGradient id="gtri1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient></defs>
        <polygon points="150,20 30,160 270,160" fill="none" stroke="url(#gtri1)" strokeWidth="3" />
        <line x1="150" y1="20" x2="150" y2="160" stroke="#06B6D4" strokeWidth="2" />
        <line x1="90" y1="90" x2="210" y2="90" stroke="#06B6D4" strokeWidth="2" />
      </svg>
    ),
  },
];

const TEXT_RIDDLE_1CEM: TextRiddle = {
  riddle: "أنا عدد مكون من رقمين. مجموع رقميّ يساوي 7. إذا عكست ترتيب الرقمين يصبح العدد أكبر بـ 27. من أنا؟",
  question: "ما هو هذا العدد؟",
  options: ["25", "34", "16", "43"],
  correctIndex: 0,
  explanation: "25: 2+5=7، وعكسه 52، و 52-25=27",
};

// ─── 2EME CEM PUZZLES ───────────────────────────────────────────
const VISUAL_PUZZLES_2CEM: VisualPuzzle[] = [
  {
    type: "pattern",
    question: "كم مربعاً يمكنك إحصاؤه في هذا الشكل؟",
    options: ["4", "5", "6", "8"],
    correctIndex: 1,
    svg: (
      <svg viewBox="0 0 300 180" className="w-full h-48">
        <defs><linearGradient id="gs2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
        <rect x="50" y="20" width="120" height="120" fill="none" stroke="url(#gs2)" strokeWidth="3" rx="4" />
        <line x1="110" y1="20" x2="110" y2="140" stroke="#8B5CF6" strokeWidth="2" />
        <line x1="50" y1="80" x2="170" y2="80" stroke="#8B5CF6" strokeWidth="2" />
        <text x="230" y="85" textAnchor="middle" fill="#6366F1" fontSize="40" fontWeight="bold">= ؟</text>
      </svg>
    ),
  },
  {
    type: "sequence",
    question: "ما العدد التالي: 1، 1، 2، 3، 5، 8، ...؟",
    options: ["10", "11", "13", "15"],
    correctIndex: 2,
    svg: (
      <svg viewBox="0 0 450 80" className="w-full h-28">
        <defs><linearGradient id="gf2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient></defs>
        {[1, 1, 2, 3, 5, 8].map((n, i) => (
          <g key={i}>
            <rect x={15 + i * 60} y={15} width={45} height={45} rx={10} fill="url(#gf2)" opacity={0.15 + i * 0.12} />
            <text x={37 + i * 60} y={45} textAnchor="middle" fill="#10B981" fontSize="20" fontWeight="bold">{n}</text>
          </g>
        ))}
        <rect x={375} y={15} width={45} height={45} rx={10} fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5 3" />
        <text x={397} y={45} textAnchor="middle" fill="#3B82F6" fontSize="20" fontWeight="bold">؟</text>
      </svg>
    ),
  },
];

const TEXT_RIDDLE_2CEM: TextRiddle = {
  riddle: "عددان مجموعهما 10 وحاصل ضربهما 21. ما هذان العددان؟",
  question: "ما هما العددان؟",
  options: ["3 و 7", "4 و 6", "5 و 5", "2 و 8"],
  correctIndex: 0,
  explanation: "3 + 7 = 10 و 3 × 7 = 21",
};

// ─── 3EME CEM PUZZLES ───────────────────────────────────────────
const VISUAL_PUZZLES_3CEM: VisualPuzzle[] = [
  {
    type: "pattern",
    question: "ما مساحة المنطقة الملونة إذا كان ضلع المربع 10؟",
    options: ["25π", "50 - 25π", "100 - 25π", "75"],
    correctIndex: 2,
    svg: (
      <svg viewBox="0 0 300 200" className="w-full h-48">
        <defs>
          <linearGradient id="g3c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#EF4444" /></linearGradient>
          <clipPath id="clip3"><rect x="50" y="25" width="150" height="150" /></clipPath>
        </defs>
        <rect x="50" y="25" width="150" height="150" fill="url(#g3c)" opacity="0.2" rx="4" />
        <circle cx="125" cy="100" r="75" fill="hsl(var(--background))" clipPath="url(#clip3)" />
        <rect x="50" y="25" width="150" height="150" fill="none" stroke="#F59E0B" strokeWidth="3" rx="4" />
        <circle cx="125" cy="100" r="75" fill="none" stroke="#EF4444" strokeWidth="2" />
        <text x="125" y="105" textAnchor="middle" fill="#EF4444" fontSize="16" fontWeight="bold">r</text>
        <text x="125" y="195" textAnchor="middle" fill="#64748B" fontSize="12">ضلع المربع = 10</text>
      </svg>
    ),
  },
  {
    type: "sequence",
    question: "ما القيمة التالية: 1، 4، 9، 16، 25، ...؟",
    options: ["30", "36", "49", "32"],
    correctIndex: 1,
    svg: (
      <svg viewBox="0 0 450 100" className="w-full h-32">
        {[1, 4, 9, 16, 25].map((n, i) => (
          <g key={i}>
            <rect x={10 + i * 75} y={50 - Math.sqrt(n) * 4} width={Math.sqrt(n) * 8} height={Math.sqrt(n) * 8} rx={4} fill="#8B5CF6" opacity={0.2 + i * 0.15} />
            <text x={10 + i * 75 + Math.sqrt(n) * 4} y={90} textAnchor="middle" fill="#8B5CF6" fontSize="16" fontWeight="bold">{n}</text>
          </g>
        ))}
        <text x={390} y={70} textAnchor="middle" fill="#6366F1" fontSize="24" fontWeight="bold">؟</text>
      </svg>
    ),
  },
];

const TEXT_RIDDLE_3CEM: TextRiddle = {
  riddle: "ساعة تشير إلى الساعة 3:15. ما هي الزاوية بين عقرب الساعات وعقرب الدقائق؟",
  question: "ما هي الزاوية؟",
  options: ["0°", "7.5°", "15°", "90°"],
  correctIndex: 1,
  explanation: "عقرب الدقائق عند 90° وعقرب الساعات عند 97.5° (3×30 + 15×0.5)، الفرق = 7.5°",
};

// ─── 4EME CEM PUZZLES ───────────────────────────────────────────
const VISUAL_PUZZLES_4CEM: VisualPuzzle[] = [
  {
    type: "pattern",
    question: "كم مثلثاً يمكنك عدّه في هذا الشكل المعقد؟",
    options: ["8", "10", "13", "16"],
    correctIndex: 2,
    svg: (
      <svg viewBox="0 0 300 200" className="w-full h-48">
        <defs><linearGradient id="g4c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient></defs>
        <polygon points="150,15 20,180 280,180" fill="none" stroke="url(#g4c)" strokeWidth="3" />
        <line x1="150" y1="15" x2="150" y2="180" stroke="#06B6D4" strokeWidth="2" />
        <line x1="85" y1="97" x2="215" y2="97" stroke="#06B6D4" strokeWidth="2" />
        <line x1="85" y1="97" x2="280" y2="180" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.6" />
        <line x1="215" y1="97" x2="20" y2="180" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.6" />
      </svg>
    ),
  },
  {
    type: "sequence",
    question: "ما القيمة المجهولة: 3, 6, 11, 18, ...؟",
    options: ["25", "27", "29", "30"],
    correctIndex: 1,
    svg: (
      <svg viewBox="0 0 450 100" className="w-full h-28">
        {[3, 6, 11, 18].map((n, i) => (
          <g key={i}>
            <circle cx={70 + i * 90} cy={50} r={28} fill="#EC4899" opacity={0.1 + i * 0.15} />
            <text x={70 + i * 90} y={56} textAnchor="middle" fill="#EC4899" fontSize="22" fontWeight="bold">{n}</text>
            {i < 3 && <text x={115 + i * 90} y={40} textAnchor="middle" fill="#94A3B8" fontSize="12">+{[3, 5, 7][i]}</text>}
          </g>
        ))}
        <circle cx={430} cy={50} r={28} fill="none" stroke="#EC4899" strokeWidth="2" strokeDasharray="5 3" />
        <text x={430} y={56} textAnchor="middle" fill="#EC4899" fontSize="22" fontWeight="bold">؟</text>
      </svg>
    ),
  },
];

const TEXT_RIDDLE_4CEM: TextRiddle = {
  riddle: "أب عمره أربعة أضعاف عمر ابنه. بعد 5 سنوات يصبح عمر الأب ثلاثة أضعاف عمر ابنه. كم عمر كل منهما الآن؟",
  question: "كم عمر الابن الآن؟",
  options: ["8", "10", "12", "15"],
  correctIndex: 1,
  explanation: "الابن 10 سنوات والأب 40. بعد 5 سنوات: 15 و 45، أي 45 = 3 × 15",
};

// ─── HIGH SCHOOL PUZZLES (SECONDE/PREMIERE/TERMINALE) ───────────
const VISUAL_PUZZLES_HIGH: VisualPuzzle[] = [
  {
    type: "pattern",
    question: "كم مثلثاً في هذا الشكل المقسّم؟",
    options: ["8", "12", "16", "20"],
    correctIndex: 2,
    svg: (
      <svg viewBox="0 0 300 200" className="w-full h-48">
        <defs><linearGradient id="gh1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
        <polygon points="150,10 10,190 290,190" fill="none" stroke="url(#gh1)" strokeWidth="3" />
        <line x1="150" y1="10" x2="150" y2="190" stroke="#6366F1" strokeWidth="2" />
        <line x1="80" y1="100" x2="220" y2="100" stroke="#6366F1" strokeWidth="2" />
        <line x1="80" y1="100" x2="290" y2="190" stroke="#EC4899" strokeWidth="1.5" opacity="0.5" />
        <line x1="220" y1="100" x2="10" y2="190" stroke="#EC4899" strokeWidth="1.5" opacity="0.5" />
        <line x1="115" y1="55" x2="185" y2="55" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    type: "sequence",
    question: "ما القيمة التالية في المتتابعة: 2، 6، 12، 20، ...؟",
    options: ["28", "30", "32", "36"],
    correctIndex: 1,
    svg: (
      <svg viewBox="0 0 400 100" className="w-full h-32">
        {[2, 6, 12, 20].map((n, i) => (
          <g key={i}>
            <rect x={20 + i * 85} y={20} width={60} height={60} rx={14} fill="#6366F1" opacity={0.1 + i * 0.15} />
            <text x={50 + i * 85} y={58} textAnchor="middle" fill="#6366F1" fontSize="24" fontWeight="bold">{n}</text>
          </g>
        ))}
        <rect x={360} y={20} width={60} height={60} rx={14} fill="none" stroke="#EC4899" strokeWidth="2" strokeDasharray="6 4" />
        <text x={390} y={58} textAnchor="middle" fill="#EC4899" fontSize="24" fontWeight="bold">؟</text>
      </svg>
    ),
  },
];

const TEXT_RIDDLE_HIGH: TextRiddle = {
  riddle: "عدد إذا قسمته على 5 يبقى 3، وإذا قسمته على 7 يبقى 2. ما هو أصغر عدد موجب يحقق هاتين الحالتين؟",
  question: "ما هو العدد؟",
  options: ["23", "38", "52", "73"],
  correctIndex: 0,
  explanation: "23 ÷ 5 = 4 والباقي 3، 23 ÷ 7 = 3 والباقي 2",
};

// ─── GET PUZZLES BY LEVEL ───────────────────────────────────────
const getAssessmentPhasesByLevel = (level: SchoolLevel) => {
  switch (level) {
    case "5eme_primaire":
      return { visualPhases: VISUAL_PUZZLES_PRIMARY, textRiddle: TEXT_RIDDLE_PRIMARY, displayTime: 10 };
    case "1ere_cem":
      return { visualPhases: VISUAL_PUZZLES_1CEM, textRiddle: TEXT_RIDDLE_1CEM, displayTime: 8 };
    case "2eme_cem":
      return { visualPhases: VISUAL_PUZZLES_2CEM, textRiddle: TEXT_RIDDLE_2CEM, displayTime: 7 };
    case "3eme_cem":
      return { visualPhases: VISUAL_PUZZLES_3CEM, textRiddle: TEXT_RIDDLE_3CEM, displayTime: 6 };
    case "4eme_cem":
      return { visualPhases: VISUAL_PUZZLES_4CEM, textRiddle: TEXT_RIDDLE_4CEM, displayTime: 6 };
    default:
      return { visualPhases: VISUAL_PUZZLES_HIGH, textRiddle: TEXT_RIDDLE_HIGH, displayTime: 5 };
  }
};

// Preference questions (direct questions - unchanged)
const PREFERENCE_QUESTIONS = [
  {
    question: "كيف تفضل تعلم مفهوم جديد في الرياضيات؟",
    options: [
      { label: "مشاهدة فيديو توضيحي", style: "visual" as const },
      { label: "قراءة الدرس المكتوب", style: "textual" as const },
      { label: "إجراء التمارين مباشرة", style: "practical" as const },
    ],
  },
  {
    question: "عندما لا تفهم تمرينًا، ما الذي تفضله؟",
    options: [
      { label: "رؤية رسم تخطيطي أو صورة", style: "visual" as const },
      { label: "إعادة قراءة القاعدة أو الصيغة", style: "textual" as const },
      { label: "المحاولة بأرقام أخرى", style: "practical" as const },
    ],
  },
];

type Phase = "bot-flying" | "bot-intro" | "bot-explanation" | "bot-explanation-detail" | "bot-launch" | "visual-show" | "visual-question" | "text" | "preference" | "result";

// ─── FLOATING PARTICLES ─────────────────────────────────────────
const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary/10"
        style={{
          width: Math.random() * 6 + 2,
          height: Math.random() * 6 + 2,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────
const LearningAssessment = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { profile, loading: profileLoading } = useProfile();
  const [phase, setPhase] = useState<Phase>("bot-flying");
  const [visualIndex, setVisualIndex] = useState(0);
  const [prefIndex, setPrefIndex] = useState(0);
  const [timer, setTimer] = useState(5);
  const [scores, setScores] = useState({ visual: 0, textual: 0, practical: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [visualPhases, setVisualPhases] = useState<VisualPuzzle[]>(VISUAL_PUZZLES_2CEM);
  const [textRiddle, setTextRiddle] = useState<TextRiddle>(TEXT_RIDDLE_2CEM);
  const [displayTime, setDisplayTime] = useState(7);

  useEffect(() => { i18n.changeLanguage('ar'); }, [i18n]);

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

  useEffect(() => {
    if (profileLoading || !profile) return;
    const adaptation = getAssessmentPhasesByLevel(profile.school_level as SchoolLevel);
    setVisualPhases(adaptation.visualPhases);
    setTextRiddle(adaptation.textRiddle);
    setDisplayTime(adaptation.displayTime);
    setTimer(adaptation.displayTime);
  }, [profile, profileLoading]);

  // Bot flying animation → transition to intro
  useEffect(() => {
    if (phase !== "bot-flying") return;
    const t = setTimeout(() => setPhase("bot-intro"), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-advance bot phases
  useEffect(() => {
    if (phase !== "bot-explanation" && phase !== "bot-launch") return;
    const t = setTimeout(() => {
      if (phase === "bot-explanation") setPhase("bot-launch");
      else if (phase === "bot-launch") startAssessment();
    }, 10000);
    return () => clearTimeout(t);
  }, [phase]);

  // Timer for visual display
  useEffect(() => {
    if (phase !== "visual-show") return;
    if (timer <= 0) { setPhase("visual-question"); return; }
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timer]);

  const startAssessment = () => { setPhase("visual-show"); setTimer(displayTime); };

  const handleBotExplanationAction = (actionIndex: number) => {
    if (actionIndex === 0) setPhase("bot-launch");
    else setPhase("bot-explanation-detail");
  };

  const submitVisualAnswer = () => {
    const correct = visualPhases[visualIndex].correctIndex === parseInt(selectedAnswer);
    if (correct) setScores((s) => ({ ...s, visual: s.visual + 1 }));
    setSelectedAnswer("");
    if (visualIndex < visualPhases.length - 1) {
      setVisualIndex(visualIndex + 1);
      setPhase("visual-show");
      setTimer(displayTime);
    } else {
      setPhase("text");
    }
  };

  const submitTextAnswer = () => {
    const correct = textRiddle.correctIndex === parseInt(selectedAnswer);
    if (correct) setScores((s) => ({ ...s, textual: s.textual + 1 }));
    setSelectedAnswer("");
    setPhase("preference");
  };

  const submitPreference = () => {
    const chosen = PREFERENCE_QUESTIONS[prefIndex].options[parseInt(selectedAnswer)];
    if (chosen) setScores((s) => ({ ...s, [chosen.style]: s[chosen.style] + 1 }));
    setSelectedAnswer("");
    if (prefIndex < PREFERENCE_QUESTIONS.length - 1) setPrefIndex(prefIndex + 1);
    else setPhase("result");
  };

  const getPreferredStyle = useCallback(() => {
    const { visual, textual, practical } = scores;
    if (visual >= textual && visual >= practical) return "visual";
    if (textual >= visual && textual >= practical) return "textual";
    return "practical";
  }, [scores]);

  const saveAndContinue = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const preferredStyle = getPreferredStyle();
      const { error } = await supabase.from("learning_styles").insert({
        user_id: userId,
        visual_score: scores.visual,
        textual_score: scores.textual,
        practical_score: scores.practical,
        preferred_style: preferredStyle,
        assessment_data: scores as any,
      });
      if (error) throw error;
      toast.success("تم حفظ ملف التعلم بنجاح!");
      navigate("/liste-cours");
    } catch (e: any) {
      console.error(e);
      toast.error("خطأ أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const totalPhases = visualPhases.length + 1 + PREFERENCE_QUESTIONS.length;
  const currentStep =
    phase === "bot-flying" || phase === "bot-intro" || phase === "bot-explanation" || phase === "bot-launch" || phase === "bot-explanation-detail" ? 0
      : phase === "visual-show" || phase === "visual-question" ? visualIndex + 1
        : phase === "text" ? visualPhases.length + 1
          : phase === "preference" ? visualPhases.length + 1 + prefIndex + 1
            : totalPhases;
  const progress = (currentStep / totalPhases) * 100;

  const styleLabels: Record<string, { label: string; labelAr: string; icon: any; desc: string; descAr: string }> = {
    visual: { label: "Visuel", labelAr: "بصري", icon: Eye, desc: "Tu apprends mieux avec des images et vidéos.", descAr: "أنت تتعلم بشكل أفضل من خلال الصور والفيديوهات والرسومات." },
    textual: { label: "Textuel", labelAr: "نصّي", icon: BookOpen, desc: "Tu apprends mieux en lisant.", descAr: "أنت تتعلم بشكل أفضل من خلال القراءة والشرح المكتوب." },
    practical: { label: "Pratique", labelAr: "تطبيقي", icon: Brain, desc: "Tu apprends mieux en pratiquant.", descAr: "أنت تتعلم بشكل أفضل من خلال الممارسة والتمارين." },
  };

  const showProgress = phase !== "bot-flying" && phase !== "bot-intro";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,100%,97%)] via-[hsl(200,85%,94%)] to-[hsl(250,80%,96%)] text-gray-900 overflow-hidden relative">
      <FloatingParticles />

      {/* Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Bar (top, no header) */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-white/80 border-b border-gray-200"
          >
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-gray-600">{currentStep}/{totalPhases}</span>
              </div>
              <div className="flex-1">
                <Progress value={progress} className="h-1.5 bg-gray-200" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-xl w-full py-8">
          <AnimatePresence mode="wait">

            {/* ─── BOT FLYING IN ──────────────────────────────────── */}
            {phase === "bot-flying" && (
              <motion.div
                key="flying"
                className="flex flex-col items-center justify-center gap-6"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ y: -400, scale: 0.3, rotate: -20 }}
                  animate={{ y: 0, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 60, damping: 12, duration: 1.5 }}
                  className="relative"
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 60px 20px hsl(var(--primary) / 0.3)" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="w-32 h-32">
                    <BotCompanion expression="excited" animate={true} />
                  </div>
                </motion.div>

                {/* Trail particles */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/40"
                    initial={{ y: -400 - i * 40, x: (Math.random() - 0.5) * 100, opacity: 0.8 }}
                    animate={{ y: 200, opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.1 * i, ease: "easeOut" }}
                  />
                ))}

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-gray-500 text-sm font-medium"
                >
                  جاري التحضير...
                </motion.p>
              </motion.div>
            )}

            {/* ─── BOT INTRO ─────────────────────────────────────── */}
            {phase === "bot-intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Floating Bot */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <div className="relative w-28 h-28">
                    <BotCompanion expression="happy" animate={true} />
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-primary/20 rounded-full blur-md"
                      animate={{ scaleX: [0.8, 1.1, 0.8], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>

                {/* Messages */}
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <BotMessage
                      text={i18n.language === 'ar' ? botOnboardingMessages.explanation.ar : botOnboardingMessages.explanation.fr}
                      emoji="🎯"
                      delay={0}
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
                  <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <BotMessage
                      text={i18n.language === 'ar' ? botOnboardingMessages.explanationDetail.ar : botOnboardingMessages.explanationDetail.fr}
                      emoji="⚡"
                      delay={0}
                    />
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="flex gap-3"
                >
                  <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => handleBotExplanationAction(0)} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                      <Rocket className="h-4 w-4 ml-2" />
                      {i18n.language === 'ar' ? botOnboardingMessages.buttonStart.ar : botOnboardingMessages.buttonStart.fr}
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => handleBotExplanationAction(1)} variant="outline" className="w-full border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400">
                      {i18n.language === 'ar' ? botOnboardingMessages.buttonExplainMore.ar : botOnboardingMessages.buttonExplainMore.fr}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── BOT EXPLANATION DETAIL ─────────────────────────── */}
            {phase === "bot-explanation-detail" && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-5"
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="flex justify-center">
                  <div className="w-24 h-24"><BotCompanion expression="happy" animate={true} /></div>
                </motion.div>

                <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  {[
                    { emoji: "👀", titleAr: "المتعلم البصري", descAr: "يتعلم بشكل أفضل من خلال الصور والرسومات والفيديوهات." },
                    { emoji: "📖", titleAr: "المتعلم النصّي", descAr: "يتعلم بشكل أفضل من خلال القراءة والشرح المكتوب." },
                    { emoji: "🛠️", titleAr: "المتعلم التطبيقي", descAr: "يتعلم بشكل أفضل من خلال الممارسة والتمارين العملية." },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.2 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="text-right">
                        <h4 className="font-bold text-gray-800">{item.titleAr}</h4>
                        <p className="text-sm text-gray-600">{item.descAr}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => setPhase("bot-launch")} className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
                      <Zap className="h-4 w-4 ml-2" />
                      {i18n.language === 'ar' ? botOnboardingMessages.buttonContinue.ar : botOnboardingMessages.buttonContinue.fr}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── BOT LAUNCH ────────────────────────────────────── */}
            {phase === "bot-launch" && (
              <motion.div
                key="launch"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-6"
              >
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="flex justify-center">
                  <div className="w-28 h-28"><BotCompanion expression="excited" animate={true} /></div>
                </motion.div>

                <div className="space-y-3">
                  {["مثالي! استعد لاكتشاف كيفية تعلمك بشكل أفضل. 🎉", "سنبدأ بمرحلة بصرية، ثم نختبر فهمك في القراءة، وأخيراً سنرى تفضيلاتك. 😊", "هل أنت مستعد؟ هيا لنبدأ المغامرة! 🌟"].map((msg, i) => (
                    <motion.div key={i} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.7 }}>
                      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
                        <BotMessage text={msg} emoji={["🎉", "✨", "💡"][i]} isTyping={false} delay={0} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── VISUAL SHOW ────────────────────────────────────── */}
            {phase === "visual-show" && (
              <motion.div
                key="vshow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5 pt-12"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="flex justify-center">
                  <div className="w-20 h-20"><BotCompanion expression="thinking" animate={true} /></div>
                </motion.div>

                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3">
                  <BotMessage text={`🔍 ادرس هذا اللغز البصري جيداً! الصورة ${visualIndex + 1}/${visualPhases.length}`} emoji="👀" isTyping={false} />
                </div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white backdrop-blur-md p-6 flex items-center justify-center shadow-sm"
                  style={{ minHeight: 200 }}
                >
                  {visualPhases[visualIndex].svg}

                  {/* Timer Badge */}
                  <motion.div
                    className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-500/30"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {timer}
                  </motion.div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: displayTime, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── VISUAL QUESTION ────────────────────────────────── */}
            {phase === "visual-question" && (
              <motion.div
                key="vq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5 pt-12"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="flex justify-center">
                  <div className="w-20 h-20"><BotCompanion expression="encouraging" animate={true} /></div>
                </motion.div>

                <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <BotMessage text={visualPhases[visualIndex].question} emoji="🎯" isTyping={false} />
                </div>

                <div className="space-y-2">
                  <BotAnswerGroup
                    options={visualPhases[visualIndex].options.map((opt, i) => ({ id: String(i), label: opt }))}
                    selectedValue={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                    layout="vertical"
                    delay={0.2}
                  />
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={submitVisualAnswer} disabled={!selectedAnswer}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 disabled:opacity-30">
                      تأكيد إجابتي ✨
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── TEXT PHASE ─────────────────────────────────────── */}
            {phase === "text" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5 pt-12"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="flex justify-center">
                  <div className="w-20 h-20"><BotCompanion expression="happy" animate={true} /></div>
                </motion.div>

                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3">
                  <BotMessage text="أحسنت في المرحلة البصرية! الآن حان وقت اللغز النصي 📖" emoji="📚" isTyping={false} />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="backdrop-blur-md bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6"
                >
                  <p className="text-gray-800 leading-relaxed text-lg text-right font-medium" dir="rtl">{textRiddle.riddle}</p>
                </motion.div>

                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3">
                  <BotMessage text={textRiddle.question} emoji="❓" isTyping={false} delay={0.3} />
                </div>

                <BotAnswerGroup
                  options={textRiddle.options.map((opt, i) => ({ id: String(i), label: opt }))}
                  selectedValue={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  layout="vertical"
                  delay={0.5}
                />

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={submitTextAnswer} disabled={!selectedAnswer}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 disabled:opacity-30">
                      تأكيد إجابتي ✨
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── PREFERENCE PHASE ───────────────────────────────── */}
            {phase === "preference" && (
              <motion.div
                key="pref"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5 pt-12"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="flex justify-center">
                  <div className="w-20 h-20"><BotCompanion expression="encouraging" animate={true} /></div>
                </motion.div>

                <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <BotMessage text={`💪 عمل رائع! الآن، دعنا نتحدث عن تفضيلاتك. السؤال ${prefIndex + 1}/${PREFERENCE_QUESTIONS.length}. 💭`} emoji="🤔" isTyping={false} />
                </div>

                <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <BotMessage text={PREFERENCE_QUESTIONS[prefIndex].question} emoji="❓" isTyping={false} delay={0.2} />
                </div>

                <BotAnswerGroup
                  options={PREFERENCE_QUESTIONS[prefIndex].options.map((opt, i) => ({ id: String(i), label: opt.label }))}
                  selectedValue={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  layout="vertical"
                  delay={0.4}
                />

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={submitPreference} disabled={!selectedAnswer}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 disabled:opacity-30">
                      تأكيد إجابتي ✨
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── RESULT ────────────────────────────────────────── */}
            {phase === "result" && (() => {
              const style = getPreferredStyle();
              const info = styleLabels[style];
              const Icon = info.icon;
              return (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 pt-12"
                >
                  <motion.div animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex justify-center">
                    <div className="w-28 h-28"><BotCompanion expression="celebrating" animate={true} /></div>
                  </motion.div>

                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3">
                    <BotMessage text={`🏆 مبروك! ملفك التعليمي هو: ${info.labelAr}!`} emoji="🎉" isTyping={false} />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="backdrop-blur-md bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4" dir="rtl">
                      <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{info.labelAr}</h3>
                        <p className="text-gray-700 text-sm">{info.descAr}</p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                    <BotMessage text="سأقوم بتخصيص جميع دروسك حسب هذا النمط. الدروس والتمارين ستكون مصممة لتناسبك! 💪" emoji="✨" isTyping={false} delay={0.3} />
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-3">
                    {[
                      { score: scores.visual, label: "👀 بصري", color: "from-blue-50 to-blue-100" },
                      { score: scores.textual, label: "📖 نصّي", color: "from-green-50 to-green-100" },
                      { score: scores.practical, label: "💪 تطبيقي", color: "from-purple-50 to-purple-100" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}
                        className={`bg-gradient-to-br ${item.color} backdrop-blur-md border border-gray-200 rounded-xl p-4 text-center shadow-sm`}>
                        <p className="text-2xl font-bold text-gray-900">{item.score}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button onClick={saveAndContinue} size="lg" disabled={saving}
                        className="w-full text-lg bg-gradient-to-r from-primary to-primary/80 shadow-xl shadow-primary/25 disabled:opacity-30">
                        {saving ? "جاري الحفظ..." : "🎓 الانطلاق نحو الدروس"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })()}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LearningAssessment;
