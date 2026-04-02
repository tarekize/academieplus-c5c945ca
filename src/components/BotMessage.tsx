import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BotMessageProps {
    text: string;
    isTyping?: boolean;
    emoji?: string;
    delay?: number;
    onComplete?: () => void;
}

export const BotMessage = ({
    text,
    isTyping = true,
    emoji = "🧠",
    delay = 0,
    onComplete,
}: BotMessageProps) => {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!isTyping) {
            setDisplayText(text);
            setIsComplete(true);
            onComplete?.();
            return;
        }

        const timer = setTimeout(() => {
            let index = 0;
            const interval = setInterval(() => {
                if (index <= text.length) {
                    setDisplayText(text.slice(0, index));
                    index++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                    onComplete?.();
                }
            }, 30); // Vitesse de frappe

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [text, isTyping, delay, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 mb-4"
        >
            <div className="text-2xl flex-shrink-0 mt-1">{emoji}</div>
            <div className="bg-primary/10 rounded-2xl px-4 py-3 rounded-tl-none max-w-lg">
                <p className="text-foreground text-sm leading-relaxed">{displayText}</p>
                {isTyping && !isComplete && (
                    <div className="flex gap-1 mt-2">
                        <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                        <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                        <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BotMessage;
