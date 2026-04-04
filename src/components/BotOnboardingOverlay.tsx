import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import FlyingBot from "./FlyingBot";
import BotMessage from "./BotMessage";
import { Button } from "./ui/button";
import {
    botOnboardingMessages,
    learningStyleQuestions,
    learningStyleResults,
} from "@/i18n/botMessages";

interface BotOnboardingOverlayProps {
    isOpen: boolean;
    language?: "fr" | "ar";
    onComplete?: () => void;
    onLearningStyleDetected?: (style: "visual" | "auditory" | "kinesthetic") => void;
}

type OnboardingPhase = "landing" | "explanation" | "reassurance" | "questions" | "result";

export const BotOnboardingOverlay = ({
    isOpen,
    language = "fr",
    onComplete,
    onLearningStyleDetected,
}: BotOnboardingOverlayProps) => {
    const [phase, setPhase] = useState<OnboardingPhase>("landing");
    const [botAnimationComplete, setBotAnimationComplete] = useState(false);
    const [messageComplete, setMessageComplete] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [scores, setScores] = useState({ visual: 0, auditory: 0, kinesthetic: 0 });
    const [selectedAnswer, setSelectedAnswer] = useState("");

    const isArabic = language === "ar";

    useEffect(() => {
        if (!isOpen) {
            setPhase("landing");
            setBotAnimationComplete(false);
            setMessageComplete(false);
            setCurrentQuestion(0);
            setScores({ visual: 0, auditory: 0, kinesthetic: 0 });
            setSelectedAnswer("");
        }
    }, [isOpen]);

    const handlePhaseTransition = () => {
        if (phase === "landing") {
            setPhase("explanation");
            setMessageComplete(false);
        } else if (phase === "explanation") {
            setPhase("reassurance");
            setMessageComplete(false);
        } else if (phase === "reassurance") {
            setPhase("questions");
            setMessageComplete(false);
        }
    };

    const handleAnswerSubmit = () => {
        // Record answer and move to next question
        const styleMap: Record<string, "visual" | "auditory" | "kinesthetic"> = {
            visual: "visual",
            auditory: "auditory",
            kinesthetic: "kinesthetic",
        };

        // Update scores based on selected answer
        const answerKey = selectedAnswer as keyof typeof styleMap;
        if (styleMap[answerKey]) {
            setScores((prev) => ({
                ...prev,
                [styleMap[answerKey]]: prev[styleMap[answerKey]] + 1,
            }));
        }

        setSelectedAnswer("");

        if (currentQuestion < Object.keys(learningStyleQuestions).length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Calculate dominant style
            const dominant = Object.entries(scores).reduce((a, b) =>
                a[1] > b[1] ? a : b
            )[0] as "visual" | "auditory" | "kinesthetic";
            onLearningStyleDetected?.(dominant);
            setPhase("result");
        }
    };

    const handleStartQuestions = () => {
        setPhase("questions");
        setMessageComplete(false);
    };

    const handleReadMore = () => {
        // Repeat explanation
        setPhase("explanation");
        setMessageComplete(false);
    };

    const handleCompleteOnboarding = () => {
        onComplete?.();
    };

    const getMessages = () => {
        const msg = botOnboardingMessages;
        if (phase === "landing") {
            return isArabic ? msg.welcome.ar : msg.welcome.fr;
        } else if (phase === "explanation") {
            return isArabic ? msg.explanation.ar : msg.explanation.fr;
        } else if (phase === "reassurance") {
            return isArabic ? msg.reassurance.ar : msg.reassurance.fr;
        }
        return "";
    };

    const getDominantStyle = () => {
        const entries = Object.entries(scores);
        return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] as
            | "visual"
            | "auditory"
            | "kinesthetic";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                >
                    {/* Background avec transition blanche */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-white"
                    />

                    {/* Contenu principal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`relative z-10 w-full max-w-2xl mx-auto px-4 py-8 ${isArabic ? "direction-rtl" : "direction-ltr"
                            }`}
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        {/* Landing Phase */}
                        {phase === "landing" && (
                            <div className="space-y-6 text-center">
                                <FlyingBot
                                    expression="welcome"
                                    size="lg"
                                    isFlying={true}
                                    onAnimationComplete={() => setBotAnimationComplete(true)}
                                />
                                {botAnimationComplete && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <BotMessage
                                            text={getMessages()}
                                            emoji="ðŸ‘‹"
                                            isTyping={true}
                                            onComplete={() => setMessageComplete(true)}
                                        />
                                        {messageComplete && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <Button
                                                    onClick={handlePhaseTransition}
                                                    size="lg"
                                                    className="w-full"
                                                >
                                                    {isArabic ? "تابع" : "Continuer"}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Explanation Phase */}
                        {phase === "explanation" && (
                            <div className="space-y-6">
                                <FlyingBot
                                    expression="thinking"
                                    size="md"
                                    isFlying={false}
                                />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={getMessages()}
                                        emoji="ðŸ’­"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <Button
                                                onClick={handlePhaseTransition}
                                                className="flex-1"
                                            >
                                                {isArabic ? "فÙ‡Ù…ت" : "J'ai compris"}
                                            </Button>
                                            <Button
                                                onClick={handleReadMore}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                {isArabic ? "شرح أÙƒثر" : "Plus de détails"}
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reassurance Phase */}
                        {phase === "reassurance" && (
                            <div className="space-y-6">
                                <FlyingBot
                                    expression="encouraging"
                                    size="md"
                                    isFlying={false}
                                />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={getMessages()}
                                        emoji="ðŸ’ª"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <BotMessage
                                                text={
                                                    isArabic
                                                        ? botOnboardingMessages.readyQuestion.ar
                                                        : botOnboardingMessages.readyQuestion.fr
                                                }
                                                emoji="ðŸš€"
                                                isTyping={true}
                                                delay={300}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1 }}
                                            >
                                                <Button
                                                    onClick={handleStartQuestions}
                                                    size="lg"
                                                    className="w-full"
                                                >
                                                    {isArabic
                                                        ? botOnboardingMessages.buttonStart.ar
                                                        : botOnboardingMessages.buttonStart.fr}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Questions Phase */}
                        {phase === "questions" && (
                            <div className="space-y-6">
                                <FlyingBot
                                    expression="happy"
                                    size="md"
                                    isFlying={false}
                                />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={
                                            isArabic
                                                ? Object.values(learningStyleQuestions)[currentQuestion].ar
                                                : Object.values(learningStyleQuestions)[currentQuestion].fr
                                        }
                                        emoji="â“"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="grid grid-cols-1 gap-3">
                                                {Object.entries(
                                                    Object.values(learningStyleQuestions)[currentQuestion]
                                                        .options
                                                ).map(([key, value]: [string, any]) => (
                                                    <motion.button
                                                        key={key}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        onClick={() => setSelectedAnswer(key)}
                                                        className={`p-4 rounded-lg border-2 transition-all text-${isArabic ? "right" : "left"
                                                            } ${selectedAnswer === key
                                                                ? "bg-primary/10 border-primary"
                                                                : "border-border hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`text-lg mb-2 ${isArabic ? "text-right" : "text-left"
                                                                }`}
                                                        >
                                                            {isArabic
                                                                ? value.ar
                                                                : value.fr}
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <Button
                                                onClick={handleAnswerSubmit}
                                                disabled={!selectedAnswer}
                                                className="w-full"
                                            >
                                                {isArabic ? "اÙ„تاÙ„ÙŠ" : "Suivant"}
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Result Phase */}
                        {phase === "result" && (
                            <div className="space-y-6">
                                <FlyingBot
                                    expression="celebrating"
                                    size="lg"
                                    isFlying={false}
                                />
                                <div className="space-y-4 text-center">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20"
                                    >
                                        <h2 className="text-2xl font-bold text-foreground mb-2">
                                            {isArabic
                                                ? learningStyleResults[getDominantStyle()].ar.title
                                                : learningStyleResults[getDominantStyle()].fr.title}
                                        </h2>
                                        <p className="text-foreground/80">
                                            {isArabic
                                                ? learningStyleResults[getDominantStyle()].ar.description
                                                : learningStyleResults[getDominantStyle()].fr.description}
                                        </p>
                                    </motion.div>
                                    <Button
                                        onClick={handleCompleteOnboarding}
                                        size="lg"
                                        className="w-full"
                                    >
                                        {isArabic ? "ابدأ اÙ„آÙ†" : "Commencer maintenant"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BotOnboardingOverlay;
