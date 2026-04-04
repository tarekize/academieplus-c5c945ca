import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BotContainerProps {
    children: ReactNode;
    showProgress?: boolean;
    currentStep?: number;
    totalSteps?: number;
}

export const BotContainer = ({
    children,
    showProgress = false,
    currentStep = 0,
    totalSteps = 0,
}: BotContainerProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
        >
            <div className="space-y-6">
                {/* Progress Bar */}
                {showProgress && totalSteps > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progression</span>
                            <span>{currentStep}/{totalSteps}</span>
                        </div>
                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Content */}
                <div className="space-y-6">{children}</div>
            </div>
        </motion.div>
    );
};

export default BotContainer;
