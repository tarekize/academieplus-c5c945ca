import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BotAnswerOption {
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    description?: string;
}

interface BotAnswerGroupProps {
    options: BotAnswerOption[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    layout?: "vertical" | "grid";
    delay?: number;
}

export const BotAnswerGroup = ({
    options,
    selectedValue,
    onValueChange,
    layout = "vertical",
    delay = 0,
}: BotAnswerGroupProps) => {
    const containerClass = layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={containerClass}
        >
            <RadioGroup value={selectedValue} onValueChange={onValueChange}>
                {options.map((option, index) => (
                    <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                    >
                        <Label
                            htmlFor={option.id}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50",
                                selectedValue === option.id
                                    ? "bg-primary/10 border-primary shadow-md"
                                    : "border-border hover:bg-secondary/30"
                            )}
                        >
                            <RadioGroupItem value={option.id} id={option.id} className="flex-shrink-0" />
                            <div className="flex-1">
                                {option.icon && <div className="text-lg mb-1">{option.icon}</div>}
                                <div className="text-sm font-medium text-foreground">{option.label}</div>
                                {option.description && (
                                    <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                                )}
                            </div>
                        </Label>
                    </motion.div>
                ))}
            </RadioGroup>
        </motion.div>
    );
};

export default BotAnswerGroup;
