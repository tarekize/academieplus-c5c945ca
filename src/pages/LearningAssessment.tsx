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
// Questions de secours par niveau (utilisÃ©es si l'Edge Function est indisponible)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  "5eme_primaire": [
    { question: "ÙƒÙ… ÙŠØ³Ø§ÙˆÙŠ 45 + 38ØŸ", options: ["81", "83", "79", "85"], correct_index: 1, chapter_ref: "Ø§Ù„Ø¬Ù…Ø¹", explanation: "45 + 38 = 83" },
    { question: "ÙƒÙ… ÙŠØ³Ø§ÙˆÙŠ 7 Ã— 8ØŸ", options: ["54", "56", "64", "48"], correct_index: 1, chapter_ref: "Ø§Ù„Ø¶Ø±Ø¨", explanation: "7 Ã— 8 = 56" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù†Ø§ØªØ¬ 72 Ã· 9ØŸ", options: ["6", "7", "8", "9"], correct_index: 2, chapter_ref: "Ø§Ù„Ù‚Ø³Ù…Ø©", explanation: "72 Ã· 9 = 8" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù…Ø­ÙŠØ· Ù…Ø±Ø¨Ø¹ Ø·ÙˆÙ„ Ø¶Ù„Ø¹Ù‡ 6 Ø³Ù…ØŸ", options: ["12 Ø³Ù…", "18 Ø³Ù…", "24 Ø³Ù…", "36 Ø³Ù…"], correct_index: 2, chapter_ref: "Ø§Ù„Ù‡Ù†Ø¯Ø³Ø©", explanation: "Ù…Ø­ÙŠØ· Ø§Ù„Ù…Ø±Ø¨Ø¹ = 4 Ã— Ø§Ù„Ø¶Ù„Ø¹ = 4 Ã— 6 = 24 Ø³Ù…" },
    { question: "ÙƒÙ… ÙŠØ³Ø§ÙˆÙŠ 1/2 + 1/4ØŸ", options: ["2/6", "3/4", "1/3", "2/4"], correct_index: 1, chapter_ref: "Ø§Ù„ÙƒØ³ÙˆØ±", explanation: "1/2 + 1/4 = 2/4 + 1/4 = 3/4" },
  ],
  "1ere_cem": [
    { question: "Ù…Ø§ Ù‡Ùˆ Ø­Ù„ Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø©: x + 5 = 12ØŸ", options: ["x = 5", "x = 6", "x = 7", "x = 8"], correct_index: 2, chapter_ref: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª", explanation: "x = 12 - 5 = 7" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù†Ø§ØªØ¬: (-3) Ã— (+4)ØŸ", options: ["+12", "-12", "+7", "-7"], correct_index: 1, chapter_ref: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„ØµØ­ÙŠØ­Ø©", explanation: "(-3) Ã— (+4) = -12 (Ø£Ø¹Ø¯Ø§Ø¯ Ø¨Ø¥Ø´Ø§Ø±ØªÙŠÙ† Ù…Ø®ØªÙ„ÙØªÙŠÙ† ØªØ¹Ø·ÙŠ Ø³Ø§Ù„Ø¨)" },
    { question: "ÙƒÙ… ÙŠØ³Ø§ÙˆÙŠ 2Â³ØŸ", options: ["6", "8", "9", "16"], correct_index: 1, chapter_ref: "Ø§Ù„Ø£Ø³Ø³", explanation: "2Â³ = 2 Ã— 2 Ã— 2 = 8" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù…Ø³Ø§Ø­Ø© Ù…Ø³ØªØ·ÙŠÙ„ Ø·ÙˆÙ„Ù‡ 8 Ø³Ù… ÙˆØ¹Ø±Ø¶Ù‡ 5 Ø³Ù…ØŸ", options: ["26 Ø³Ù…Â²", "40 Ø³Ù…Â²", "30 Ø³Ù…Â²", "13 Ø³Ù…Â²"], correct_index: 1, chapter_ref: "Ø§Ù„Ù‡Ù†Ø¯Ø³Ø©", explanation: "Ø§Ù„Ù…Ø³Ø§Ø­Ø© = Ø§Ù„Ø·ÙˆÙ„ Ã— Ø§Ù„Ø¹Ø±Ø¶ = 8 Ã— 5 = 40 Ø³Ù…Â²" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù†Ø§ØªØ¬: 3/4 + 1/8ØŸ", options: ["4/12", "7/8", "4/8", "1/2"], correct_index: 1, chapter_ref: "Ø§Ù„ÙƒØ³ÙˆØ±", explanation: "3/4 + 1/8 = 6/8 + 1/8 = 7/8" },
  ],
  "2eme_cem": [
    { question: "Ù…Ø§ Ù‡Ùˆ Ø­Ù„: 2x - 3 = 7ØŸ", options: ["x = 2", "x = 4", "x = 5", "x = 6"], correct_index: 2, chapter_ref: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª", explanation: "2x = 10 â†’ x = 5" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù†Ø§ØªØ¬: (x + 2)(x - 2)ØŸ", options: ["xÂ² - 4", "xÂ² + 4", "xÂ² - 2x + 4", "2x"], correct_index: 0, chapter_ref: "Ø§Ù„ØªØ­Ù„ÙŠÙ„", explanation: "(a+b)(a-b) = aÂ² - bÂ² â†’ (x+2)(x-2) = xÂ² - 4" },
    { question: "ÙÙŠ Ù…Ø«Ù„Ø« Ù‚Ø§Ø¦Ù… Ø§Ù„Ø²Ø§ÙˆÙŠØ©ØŒ Ø§Ù„Ø¶Ù„Ø¹Ø§Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø§Ù† 3 Ùˆ4ØŒ Ù…Ø§ Ù‡Ùˆ Ø§Ù„ÙˆØªØ±ØŸ", options: ["5", "6", "7", "âˆš7"], correct_index: 0, chapter_ref: "Ù†Ø¸Ø±ÙŠØ© ÙÙŠØ«Ø§ØºÙˆØ±Ø³", explanation: "Ø§Ù„ÙˆØªØ±Â² = 9 + 16 = 25 â†’ Ø§Ù„ÙˆØªØ± = 5" },
    { question: "Ù…Ø§ Ù‡Ùˆ ÙˆØ³ÙŠØ· Ù…Ø¬Ù…ÙˆØ¹Ø©: 3, 7, 2, 9, 5ØŸ", options: ["5", "7", "4", "3"], correct_index: 0, chapter_ref: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡", explanation: "Ù†Ø±ØªØ¨Ù‡Ø§: 2,3,5,7,9 â†’ Ø§Ù„ÙˆØ³ÙŠØ· = 5" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ø­Ø¬Ù… Ù…ØªÙˆØ§Ø²ÙŠ Ù…Ø³ØªØ·ÙŠÙ„Ø§Øª Ø£Ø¨Ø¹Ø§Ø¯Ù‡ 3Ã—4Ã—5ØŸ", options: ["47 Ø³Ù…Â³", "60 Ø³Ù…Â³", "24 Ø³Ù…Â³", "36 Ø³Ù…Â³"], correct_index: 1, chapter_ref: "Ø§Ù„Ù…Ø¬Ø³Ù…Ø§Øª", explanation: "Ø§Ù„Ø­Ø¬Ù… = Ø§Ù„Ø·ÙˆÙ„ Ã— Ø§Ù„Ø¹Ø±Ø¶ Ã— Ø§Ù„Ø§Ø±ØªÙØ§Ø¹ = 3 Ã— 4 Ã— 5 = 60 Ø³Ù…Â³" },
  ],
  "3eme_cem": [
    { question: "Ù…Ø§ Ù‡Ùˆ Ù†Ø§ØªØ¬: (2x + 3)Â²ØŸ", options: ["4xÂ² + 9", "4xÂ² + 12x + 9", "4xÂ² + 6x + 9", "2xÂ² + 12x + 9"], correct_index: 1, chapter_ref: "Ø§Ù„Ù‡ÙˆÙŠØ§Øª Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ©", explanation: "(a+b)Â² = aÂ² + 2ab + bÂ² â†’ (2x+3)Â² = 4xÂ² + 12x + 9" },
    { question: "Ù…Ø§ Ù‡Ùˆ cos(0Â°)ØŸ", options: ["0", "1", "-1", "1/2"], correct_index: 1, chapter_ref: "Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª", explanation: "cos(0Â°) = 1" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ø­Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…: x+y=5 Ùˆ x-y=1ØŸ", options: ["x=2, y=3", "x=3, y=2", "x=4, y=1", "x=1, y=4"], correct_index: 1, chapter_ref: "Ù…Ù†Ø¸ÙˆÙ…Ø© Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª", explanation: "Ø¨Ø§Ù„Ø¬Ù…Ø¹: 2x=6 â†’ x=3, y=2" },
    { question: "Ù…Ø§ Ù‡ÙŠ Ø§Ù„Ù…Ø´ØªÙ‚Ø© (Ø§Ù„ÙØ±Ù‚) Ù„Ù€ f(x) = 3xÂ²ØŸ", options: ["3x", "6x", "6xÂ²", "3xÂ³"], correct_index: 1, chapter_ref: "Ø§Ù„Ù…Ø´ØªÙ‚Ø§Øª (Ù…Ù‚Ø¯Ù…Ø©)", explanation: "f'(x) = 2 Ã— 3x = 6x" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ø§Ù„Ù…ÙŠÙ„ (Ù…Ø¹Ø§Ù…Ù„ Ø§Ù„Ø§ØªØ¬Ø§Ù‡) Ù„Ù„Ù…Ø³ØªÙ‚ÙŠÙ… y = 2x + 5ØŸ", options: ["5", "2", "7", "-2"], correct_index: 1, chapter_ref: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø© Ø§Ù„Ù…Ø³ØªÙ‚ÙŠÙ…ÙŠØ©", explanation: "y = mx + b â†’ Ø§Ù„Ù…ÙŠÙ„ m = 2" },
  ],
  "4eme_cem": [
    { question: "Ù…Ø§ Ù‡Ùˆ Ø­Ù„: xÂ² - 5x + 6 = 0ØŸ", options: ["x=1 Ø£Ùˆ x=6", "x=2 Ø£Ùˆ x=3", "x=-2 Ø£Ùˆ x=-3", "x=3 Ø£Ùˆ x=4"], correct_index: 1, chapter_ref: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø§Ù„ØªØ±Ø¨ÙŠØ¹ÙŠØ©", explanation: "xÂ² - 5x + 6 = (x-2)(x-3) = 0 â†’ x=2 Ø£Ùˆ x=3" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¯Ø§Ù„Ø© f(x) = âˆšxØŸ", options: ["â„", "[0, +âˆž[", "]-âˆž, 0]", "â„*"], correct_index: 1, chapter_ref: "Ø§Ù„Ø¯ÙˆØ§Ù„", explanation: "Ø§Ù„Ø¬Ø°Ø± Ø§Ù„ØªØ±Ø¨ÙŠØ¹ÙŠ Ù…Ø¹Ø±Ù ÙÙ‚Ø· Ù„Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…ÙˆØ¬Ø¨Ø© Ø£Ùˆ Ø§Ù„ØµÙØ±" },
    { question: "Ù…Ø§ Ù‡Ùˆ sin(30Â°)ØŸ", options: ["âˆš3/2", "1/2", "âˆš2/2", "1"], correct_index: 1, chapter_ref: "Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª", explanation: "sin(30Â°) = 1/2" },
    { question: "Ù…Ø§ Ù‡Ùˆ Ù…ØªÙˆØ³Ø· (Ù…Ø¹Ø¯Ù„): 12, 15, 18, 9, 6ØŸ", options: ["10", "12", "14", "15"], correct_index: 1, chapter_ref: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡", explanation: "Ø§Ù„Ù…Ø¹Ø¯Ù„ = (12+15+18+9+6) Ã· 5 = 60 Ã· 5 = 12" },
    { question: "Ù…Ø§ Ù‡Ùˆ ØªÙ…ÙŠÙŠØ² (discriminant) Ù…Ø¹Ø§Ø¯Ù„Ø© 2xÂ² - 4x + 2 = 0ØŸ", options: ["0", "4", "8", "-4"], correct_index: 0, chapter_ref: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø§Ù„ØªØ±Ø¨ÙŠØ¹ÙŠØ©", explanation: "Î” = bÂ² - 4ac = 16 - 16 = 0" },
  ],
};

// Fonction qui retourne les questions de secours selon le niveau
const getFallbackQuestions = (schoolLevel: string): Question[] => {
  return (
    FALLBACK_QUESTIONS[schoolLevel] ||
    FALLBACK_QUESTIONS["3eme_cem"] // fallback gÃ©nÃ©ral
  );
};

// Ã‰valuation locale (si l'Edge Function evaluate Ã©choue)
const getLocalEvaluation = (correctCount: number, total: number): Report => {
  const pct = Math.round((correctCount / total) * 100);
  if (pct >= 80) return {
    level_label: "Ù…Ø³ØªÙˆÙ‰ Ù…Ù…ØªØ§Ø²",
    summary: "Ø£Ø¯Ø§Ø¤Ùƒ Ø±Ø§Ø¦Ø¹! Ø£Ù†Øª ØªÙ…ØªÙ„Ùƒ Ù‚Ø§Ø¹Ø¯Ø© Ù…ØªÙŠÙ†Ø© ÙˆØ¬Ø§Ù‡Ø² ØªÙ…Ø§Ù…Ø§Ù‹ Ù„Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªÙˆÙ‰.",
    strengths: ["Ø¥ØªÙ‚Ø§Ù† Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©", "Ø¯Ù‚Ø© ÙÙŠ Ø§Ù„Ø­Ù„"],
    improvements: ["Ù…ÙˆØ§ØµÙ„Ø© Ø§Ù„ØªØ­Ø¯ÙŠ Ø¨تمارين Ø£ÙƒØ«Ø± ØªØ¹Ù‚ÙŠØ¯Ø§Ù‹"],
    advice: "Ø£Ù†Øª ÙÙŠ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„ØµØ­ÙŠØ­! ÙˆØ§ØµÙ„ Ù‡Ø°Ø§ Ø§Ù„ØªÙ…ÙŠØ² ÙˆØ¬Ø±Ø¨ Ø§Ù„Ù…Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©."
  };
  if (pct >= 60) return {
    level_label: "Ù…Ø³ØªÙˆÙ‰ Ø¬ÙŠØ¯",
    summary: "Ø£Ø¯Ø§Ø¤Ùƒ Ø¬ÙŠØ¯! Ù„Ø¯ÙŠÙƒ ÙÙ‡Ù… Ø¬ÙŠØ¯ Ù„Ø£ØºÙ„Ø¨ Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ…ØŒ Ù…Ø¹ Ø¨Ø¹Ø¶ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬ Ù…Ø±Ø§Ø¬Ø¹Ø©.",
    strengths: ["ÙÙ‡Ù… Ø¬ÙŠØ¯ Ù„Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©"],
    improvements: ["Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¨Ø¹Ø¶ Ø§Ù„ÙØµÙˆÙ„", "ØªØ·Ø¨ÙŠÙ‚ Ø£ÙƒØ«Ø± Ø¹Ù„Ù‰ Ø§Ù„تمارين"],
    advice: "Ù…Ø¹ Ø§Ù„Ù‚Ù„ÙŠÙ„ Ù…Ù† Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© Ø³ØªØµÙ„ Ù„Ù„ØªÙ…ÙŠØ²! Ø±ÙƒØ² Ø¹Ù„Ù‰ Ù†Ù‚Ø§Ø· Ø¶Ø¹ÙÙƒ."
  };
  if (pct >= 40) return {
    level_label: "Ù…Ø³ØªÙˆÙ‰ Ù…ØªÙˆØ³Ø·",
    summary: "Ù„Ø¯ÙŠÙƒ Ù‚Ø§Ø¹Ø¯Ø© Ù„ÙƒÙ† Ù‡Ù†Ø§Ùƒ Ø«ØºØ±Ø§Øª ØªØ­ØªØ§Ø¬ Ù…Ø¹Ø§Ù„Ø¬Ø©. ØªØ¯Ø±Ø¬ ÙÙŠ Ø§Ù„ØªØ¹Ù„Ù… Ø³ÙŠØ³Ø§Ø¹Ø¯Ùƒ ÙƒØ«ÙŠØ±Ø§Ù‹.",
    strengths: ["Ø§Ù„Ø§Ø³ØªØ¹Ø¯Ø§Ø¯ Ù„Ù„ØªØ¹Ù„Ù…"],
    improvements: ["Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©", "ØªØ®ØµÙŠØµ ÙˆÙ‚Øª Ø£ÙƒØ«Ø± Ù„Ù„Ø¯Ø±Ø§Ø³Ø©"],
    advice: "Ù„Ø§ ØªÙŠØ£Ø³! ÙƒÙ„ Ø´ÙŠØ¡ ÙŠÙÙÙ‡Ù… Ø¨Ø§Ù„ØªÙƒØ±Ø§Ø± ÙˆØ§Ù„Ù…Ù…Ø§Ø±Ø³Ø©. Ø§Ù„Ù…Ù†ØµØ© Ø³ØªØ³Ø§Ø¹Ø¯Ùƒ Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ©."
  };
  return {
    level_label: "ÙŠØ­ØªØ§Ø¬ ØªØ¹Ø²ÙŠØ²",
    summary: "Ù„Ø§ ØªÙ‚Ù„Ù‚! Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ø¯Ø§Ø¦Ù…Ø§Ù‹ ØµØ¹Ø¨Ø©. Ø§Ù„Ù…Ù†ØµØ© Ø³ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ø¨Ù†Ø§Ø¡ Ù‚Ø§Ø¹Ø¯Ø© Ù‚ÙˆÙŠØ©.",
    strengths: ["Ø¥Ù‚Ø¨Ø§Ù„ Ø¹Ù„Ù‰ Ø§Ù„ØªØ¹Ù„Ù… ÙˆØ§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©"],
    improvements: ["Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ§Øª", "Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„ÙŠÙˆÙ…ÙŠØ© Ø§Ù„Ù…Ù†ØªØ¸Ù…Ø©"],
    advice: "ÙƒÙ„ Ø®Ø¨ÙŠØ± ÙƒØ§Ù† Ù…Ø¨ØªØ¯Ø¦Ø§Ù‹! Ø§Ø¨Ø¯Ø£ Ø¨الدروس Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© ÙˆØ§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ."
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

  // VÃ©rif auth et Ã©valuation existante
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

  // Générer le test dÃ¨s que school_level est disponible
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

  // Fallback polling aprÃ¨s 3s si le profil n'est toujours pas prÃªt
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
        // Niveau inconnu â†’ utiliser les questions gÃ©nÃ©rales
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
      // Si l'Edge Function retourne une erreur mÃ©tier
      if (data?.error) throw new Error(data.error);

      if (data?.questions?.length > 0) {
        setQuestions(data.questions);
        setPhase("intro");
        return;
      }

      throw new Error("Aucune question reÃ§ue de l'IA");

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

      // RÃ©cupÃ©rer school_level depuis le profil ou les mÃ©tadonnÃ©es
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
      console.warn("Ã‰valuation IA indisponible, utilisation de l'Ã©valuation locale:", err?.message);
      // âœ… Ã‰valuation locale de secours
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

      toast.success("RÃ©sultats sauvegardÃ©s !");
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

        toast.success("RÃ©sultats sauvegardÃ©s !");
        navigate("/liste-cours");
      } catch (legacyError: any) {
        console.error("Legacy save failed:", legacyError);
        toast.error("Erreur lors de la sauvegarde. Veuillez rÃ©essayer.");
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
                <p className="text-muted-foreground">Ø¬Ø§Ø±ÙŠ ØªØ­Ø¶ÙŠØ± Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ØªÙ‚ÙŠÙŠÙ…...</p>
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
                    <h1 className="text-2xl font-bold">Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø³ØªÙˆÙ‰</h1>
                    <p className="text-muted-foreground leading-relaxed">
                      Ø³ÙŠØªÙ… Ø·Ø±Ø­ {questions.length} Ø£Ø³Ø¦Ù„Ø© Ù„ØªÙ‚ÙŠÙŠÙ… Ù…Ø³ØªÙˆØ§Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ ÙÙŠ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª.
                      Ø£Ø¬Ø¨ Ø¨ØµØ¯Ù‚ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ… Ø¯Ù‚ÙŠÙ‚.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span>{questions.length} Ø£Ø³Ø¦Ù„Ø©</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>ØªÙ‚ÙŠÙŠÙ… Ø°ÙƒÙŠ</span>
                      </div>
                    </div>
                    <Button size="lg" onClick={() => setPhase("quiz")} className="gap-2">
                      Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
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
                      Ø§Ù„ÙØµÙ„: {questions[currentIndex].chapter_ref}
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
                        <p className="text-sm font-medium mb-1">Ø§Ù„Ø´Ø±Ø­:</p>
                        <p className="text-sm text-muted-foreground">{questions[currentIndex].explanation}</p>
                      </motion.div>
                    )}

                    {!showExplanation ? (
                      <Button onClick={handleAnswer} disabled={selectedAnswer === null} className="w-full">
                        ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="w-full gap-2">
                        {currentIndex < questions.length - 1 ? "Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„ØªØ§Ù„ÙŠ" : "Ø¹Ø±Ø¶ Ø§Ù„Ù†ØªØ§Ø¦Ø¬"}
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
                <p className="text-muted-foreground">Ø¬Ø§Ø±ÙŠ ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬...</p>
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
                    <h1 className="text-2xl font-bold">Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…</h1>
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
                        <h2 className="font-semibold">ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ‚ÙŠÙŠÙ…</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{report.summary}</p>

                      {report.strengths?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            Ù†Ù‚Ø§Ø· Ø§Ù„Ù‚ÙˆØ©
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
                            Ù†Ù‚Ø§Ø· Ø§Ù„ØªØ­Ø³ÙŠÙ†
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
                          <p className="text-sm font-medium text-primary mb-1">ðŸ’¡ Ù†ØµÙŠØ­Ø© Ø´Ø®ØµÙŠØ©</p>
                          <p className="text-sm text-muted-foreground">{report.advice}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button size="lg" onClick={saveAndContinue} className="w-full gap-2">
                  Ù…ØªØ§Ø¨Ø¹Ø© Ø¥Ù„Ù‰ الدروس
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
