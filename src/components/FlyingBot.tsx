import { motion, Variants } from "framer-motion";

interface FlyingBotProps {
    expression?: "welcome" | "thinking" | "happy" | "encouraging" | "celebrating";
    size?: "sm" | "md" | "lg";
    isFlying?: boolean;
    onAnimationComplete?: () => void;
}

export const FlyingBot = ({
    expression = "welcome",
    size = "md",
    isFlying = true,
    onAnimationComplete,
}: FlyingBotProps) => {
    const sizeClasses = {
        sm: "w-16 h-16 text-3xl",
        md: "w-24 h-24 text-5xl",
        lg: "w-32 h-32 text-6xl",
    };

    const expressions: Record<string, string> = {
        welcome: "ðŸ‘‹",
        thinking: "ðŸ¤”",
        happy: "ðŸ˜Š",
        encouraging: "ðŸ’ª",
        celebrating: "ðŸŽ‰",
    };

    const flyingVariants: Variants = {
        initial: { y: -200, opacity: 0, scale: 0.5 },
        animate: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                onComplete: onAnimationComplete,
            },
        },
    };

    const floatingVariants: Variants = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.div
            variants={flyingVariants}
            initial="initial"
            animate="animate"
            className="flex justify-center relative"
        >
            <motion.div
                variants={floatingVariants}
                animate={isFlying ? "animate" : undefined}
                className={`w-full flex justify-center`}
            >
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30 shadow-lg cursor-pointer transition-transform hover:scale-105`}
                >
                    {expressions[expression]}
                </div>
            </motion.div>

            {/* Aura animÃ©e */}
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/20 blur-sm"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
            />
        </motion.div>
    );
};

export default FlyingBot;
