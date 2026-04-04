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

interface SimpleBotOnboardingProps {
    isOpen: boolean;
    onClose?: () => void;
    onLearningStyleDetected?: (style: "visual" | "auditory" | "kinesthetic") => void;
}

type OnboardingPhase = "welcome" | "explanation" | "reassurance" | "questions" | "result";

export const SimpleBotOnboarding = ({
    isOpen,
    onClose,
    onLearningStyleDetected,
}: SimpleBotOnboardingProps) => {
    const [phase, setPhase] = useState<OnboardingPhase>("welcome");
    const [messageComplete, setMessageComplete] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [scores, setScores] = useState({ visual: 0, auditory: 0, kinesthetic: 0 });
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [botAnimationDone, setBotAnimationDone] = useState(false);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setPhase("welcome");
            setMessageComplete(false);
            setCurrentQuestion(0);
            setScores({ visual: 0, auditory: 0, kinesthetic: 0 });
            setSelectedAnswer("");
            setBotAnimationDone(false);
        }
    }, [isOpen]);

    const handleContinue = () => {
        if (phase === "welcome") {
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

    const handleReadMore = () => {
        // Repeat the explanation
        setPhase("explanation");
        setMessageComplete(false);
    };

    const handleAnswerSubmit = () => {
        const answerKey = selectedAnswer as "visual" | "auditory" | "kinesthetic";
        if (answerKey) {
            setScores((prev) => ({
                ...prev,
                [answerKey]: prev[answerKey] + 1,
            }));
        }

        setSelectedAnswer("");

        const questionsList = Object.values(learningStyleQuestions);
        if (currentQuestion < questionsList.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Calculate dominant style
            const entries = Object.entries(scores);
            const dominant = entries.reduce((a, b) =>
                a[1] > b[1] ? a : b
            )[0] as "visual" | "auditory" | "kinesthetic";
            onLearningStyleDetected?.(dominant);
            setPhase("result");
        }
    };

    const getDominantStyle = () => {
        const entries = Object.entries(scores);
        return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] as
            | "visual"
            | "auditory"
            | "kinesthetic";
    };

    const questionsList = Object.values(learningStyleQuestions);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Background blanc avec transition */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-40 bg-gradient-to-br from-white via-blue-50 to-white"
                    />

                    {/* Contenu */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12"
                        >
                            {/* Welcome Phase */}
                            {phase === "welcome" && (
                                <div className="space-y-6 text-center">
                                    <FlyingBot
                                        expression="welcome"
                                        size="lg"
                                        isFlying={true}
                                        onAnimationComplete={() => setBotAnimationDone(true)}
                                    />
                                    {botAnimationDone && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <BotMessage
                                                text={botOnboardingMessages.welcome.ar}
                                                emoji="ðŸ‘‹"
                                                isTyping={true}
                                                onComplete={() => setMessageComplete(true)}
                                            />
                                            {messageComplete && (
                                                <motion.button
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onClick={handleContinue}
                                                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                                                >
                                                    ØªØ§Ø¨Ø¹ â†’
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Explanation Phase */}
                            {phase === "explanation" && (
                                <div className="space-y-6">
                                    <FlyingBot expression="thinking" size="md" isFlying={false} />
                                    <div className="space-y-4">
                                        <BotMessage
                                            text={botOnboardingMessages.explanation.ar}
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
                                                <motion.button
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onClick={handleContinue}
                                                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                                                >
                                                    ÙÙ‡Ù…Øª âœ“
                                                </motion.button>
                                                <motion.button
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onClick={handleReadMore}
                                                    className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all"
                                                >
                                                    Ø´Ø±Ø­ Ø£ÙƒØ«Ø±
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Reassurance Phase */}
                            {phase === "reassurance" && (
                                <div className="space-y-6">
                                    <FlyingBot expression="encouraging" size="md" isFlying={false} />
                                    <div className="space-y-4">
                                        <BotMessage
                                            text={botOnboardingMessages.reassurance.ar}
                                            emoji="ðŸ’ª"
                                            isTyping={true}
                                            delay={0}
                                            onComplete={() => setMessageComplete(true)}
                                        />
                                        {messageComplete && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pt-4"
                                            >
                                                <BotMessage
                                                    text={botOnboardingMessages.readyQuestion.ar}
                                                    emoji="ðŸš€"
                                                    isTyping={true}
                                                    delay={0}
                                                />
                                            </motion.div>
                                        )}
                                        {messageComplete && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 }}
                                                onClick={handleContinue}
                                                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
                                            >
                                                {botOnboardingMessages.buttonStart.ar}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Questions Phase */}
                            {phase === "questions" && (
                                <div className="space-y-6" dir="rtl">
                                    <FlyingBot expression="happy" size="md" isFlying={false} />
                                    <div className="space-y-4">
                                        <BotMessage
                                            text={
                                                Object.values(questionsList)[currentQuestion].ar
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
                                                        Object.values(questionsList)[currentQuestion].options
                                                    ).map(([key, value]: [string, any], idx) => (
                                                        <motion.button
                                                            key={key}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            onClick={() => setSelectedAnswer(key)}
                                                            className={`p-4 rounded-lg border-2 transition-all text-right ${selectedAnswer === key
                                                                ? "bg-primary/10 border-primary"
                                                                : "border-border hover:border-primary/50"
                                                                }`}
                                                        >
                                                            <div className="text-lg mb-1">
                                                                {value.ar}
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                                <Button
                                                    onClick={handleAnswerSubmit}
                                                    disabled={!selectedAnswer}
                                                    className="w-full"
                                                >
                                                    Ø§Ù„ØªØ§Ù„ÙŠ â†’
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Result Phase */}
                            {phase === "result" && (
                                <div className="space-y-6 text-center" dir="rtl">
                                    <FlyingBot expression="celebrating" size="lg" isFlying={false} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20"
                                    >
                                        <h2 className="text-2xl font-bold text-foreground mb-2">
                                            {
                                                learningStyleResults[getDominantStyle()].ar.title
                                            }
                                        </h2>
                                        <p className="text-foreground/80">
                                            {
                                                learningStyleResults[getDominantStyle()].ar.description
                                            }
                                        </p>
                                    </motion.div>
                                    <Button
                                        onClick={onClose}
                                        size="lg"
                                        className="w-full"
                                    >
                                        Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù† âœ“
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SimpleBotOnboarding;
