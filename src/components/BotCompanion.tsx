import { motion } from "framer-motion";

interface BotCompanionProps {
    expression?:
    | "welcome"
    | "excited"
    | "thinking"
    | "happy"
    | "encouraging"
    | "celebrating";
    animate?: boolean;
}

export const BotCompanion = ({
    expression = "welcome",
    animate = true,
}: BotCompanionProps) => {
    const expressions: Record<
        string,
        { emoji: string; motion: string; scale: number }
    > = {
        welcome: {
            emoji: "👋",
            motion: "wave",
            scale: 1,
        },
        excited: {
            emoji: "🎉",
            motion: "bounce",
            scale: 1.1,
        },
        thinking: {
            emoji: "🤔",
            motion: "pulse",
            scale: 1,
        },
        happy: {
            emoji: "😊",
            motion: "bounce",
            scale: 1,
        },
        encouraging: {
            emoji: "💪",
            motion: "pulse",
            scale: 1.05,
        },
        celebrating: {
            emoji: "🏆",
            motion: "bounce",
            scale: 1.2,
        },
    };

    const current = expressions[expression] || expressions.welcome;

    const animationVariants = {
        wave: {
            rotate: [0, 25, -25, 25, 0],
            transition: { duration: 0.6, repeat: Infinity, delay: 0.5 },
        },
        bounce: {
            y: [0, -10, 0],
            transition: { duration: 0.5, repeat: Infinity },
        },
        pulse: {
            scale: [1, 1.05, 1],
            transition: { duration: 0.8, repeat: Infinity },
        },
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-6"
        >
            <motion.div
                className="relative"
                animate={
                    animate && animationVariants[current.motion as keyof typeof animationVariants]
                }
            >
                <div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl border-2 border-primary/30"
                    style={{ transform: `scale(${current.scale})` }}
                >
                    {current.emoji}
                </div>
                {/* Petite aura de lumière */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>
        </motion.div>
    );
};

export default BotCompanion;
