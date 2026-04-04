import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveAnswerCardProps {
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    description?: string;
    isSelected?: boolean;
    isRTL?: boolean;
    delay?: number;
    onClick?: (id: string) => void;
    variant?: "default" | "large" | "minimal";
}

export const InteractiveAnswerCard = ({
    id,
    label,
    icon,
    description,
    isSelected = false,
    isRTL = false,
    delay = 0,
    onClick,
    variant = "default",
}: InteractiveAnswerCardProps) => {
    const handleClick = () => onClick?.(id);

    const variantClasses = {
        default:
            "p-4 border-2 rounded-lg transition-all cursor-pointer hover:border-primary/50",
        large:
            "p-6 border-2 rounded-xl transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
        minimal:
            "p-3 border border-border rounded-md transition-all cursor-pointer hover:bg-secondary/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay }}
            onClick={handleClick}
            className={cn(
                variantClasses[variant],
                isSelected
                    ? "bg-primary/10 border-primary shadow-md"
                    : "border-border bg-secondary/30"
            )}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <div className={`flex items-start ${isRTL ? "flex-row-reverse" : "flex-row"} gap-4`}>
                {icon && (
                    <div className={`text-3xl flex-shrink-0 ${variant === "minimal" ? "text-lg" : ""}`}>
                        {icon}
                    </div>
                )}
                <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <div className={`font-semibold text-foreground ${variant === "minimal" ? "text-sm" : "text-base"}`}>
                        {label}
                    </div>
                    {description && (
                        <div
                            className={`text-xs text-muted-foreground mt-1 ${variant === "minimal" ? "hidden" : ""}`}
                        >
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

interface InteractiveAnswerGroupProps {
    options: {
        id: string;
        label: ReactNode;
        icon?: ReactNode;
        description?: string;
    }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    isRTL?: boolean;
    layout?: "vertical" | "grid" | "horizontal";
    delay?: number;
    variant?: "default" | "large" | "minimal";
}

export const InteractiveAnswerGroup = ({
    options,
    selectedValue,
    onValueChange,
    isRTL = false,
    layout = "vertical",
    delay = 0,
    variant = "default",
}: InteractiveAnswerGroupProps) => {
    const containerClasses = {
        vertical: "space-y-3",
        grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        horizontal: "flex flex-wrap gap-3",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={containerClasses[layout]}
            dir={isRTL ? "rtl" : "ltr"}
        >
            {options.map((option, index) => (
                <InteractiveAnswerCard
                    key={option.id}
                    {...option}
                    isSelected={selectedValue === option.id}
                    isRTL={isRTL}
                    onClick={onValueChange}
                    delay={delay + index * 0.1}
                    variant={variant}
                />
            ))}
        </motion.div>
    );
};

export default InteractiveAnswerGroup;
