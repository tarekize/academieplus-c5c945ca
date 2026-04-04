import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotMessage } from "./BotMessage";
import { BotCompanion } from "./BotCompanion";
import { Button } from "./ui/button";

export interface BotSequenceStep {
    message: string;
    emoji?: string;
    expression?: "welcome" | "excited" | "thinking" | "happy" | "encouraging" | "celebrating";
    delay?: number;
    actionLabel?: string;
    actionSecondaryLabel?: string;
}

interface BotSequenceProps {
    steps: BotSequenceStep[];
    onComplete?: () => void;
    onAction?: (actionIndex: number) => void;
    showActions?: boolean;
    autoProgress?: boolean;
}

export const BotSequence = ({
    steps,
    onComplete,
    onAction,
    showActions = true,
    autoProgress = false,
}: BotSequenceProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [messageComplete, setMessageComplete] = useState(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setMessageComplete(false);
        } else {
            onComplete?.();
        }
    };

    const handleAction = (actionIndex: number) => {
        onAction?.(actionIndex);
    };

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <BotCompanion expression={step.expression} animate={true} />

                <div className="space-y-4">
                    <BotMessage
                        text={step.message}
                        emoji={step.emoji}
                        delay={step.delay || 0}
                        onComplete={() => {
                            setMessageComplete(true);
                            if (autoProgress && isLastStep) {
                                setTimeout(() => handleNext(), 1500);
                            }
                        }}
                    />
                </div>

                {showActions && messageComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex gap-3 pt-4"
                    >
                        {step.actionLabel && (
                            <Button
                                onClick={() => {
                                    if (isLastStep && step.actionLabel === "C'est parti !") {
                                        handleAction(0);
                                    } else {
                                        handleNext();
                                    }
                                }}
                                className="flex-1"
                            >
                                {step.actionLabel}
                            </Button>
                        )}
                        {step.actionSecondaryLabel && (
                            <Button
                                onClick={() => {
                                    if (step.actionSecondaryLabel === "Explique-moi encore un peu") {
                                        handleAction(1);
                                    } else {
                                        handleNext();
                                    }
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                {step.actionSecondaryLabel}
                            </Button>
                        )}
                        {!step.actionLabel && !step.actionSecondaryLabel && (
                            <Button onClick={handleNext} className="w-full">
                                {isLastStep ? "Continuer" : "Suivant"}
                            </Button>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default BotSequence;
