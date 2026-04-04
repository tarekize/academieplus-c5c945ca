import { useState, useCallback } from "react";

interface UseBotOnboardingOptions {
    autoOpen?: boolean;
    language?: "fr" | "ar";
    onLearningStyleDetected?: (style: "visual" | "auditory" | "kinesthetic") => void;
}

export const useBotOnboarding = (options: UseBotOnboardingOptions = {}) => {
    const [isOpen, setIsOpen] = useState(options.autoOpen || false);
    const [language, setLanguage] = useState<"fr" | "ar">(options.language || "fr");
    const [detectedStyle, setDetectedStyle] = useState<"visual" | "auditory" | "kinesthetic" | null>(null);

    const openOnboarding = useCallback((lang: "fr" | "ar" = "fr") => {
        setLanguage(lang);
        setIsOpen(true);
    }, []);

    const closeOnboarding = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleLearningStyleDetected = useCallback(
        (style: "visual" | "auditory" | "kinesthetic") => {
            setDetectedStyle(style);
            options.onLearningStyleDetected?.(style);
        },
        [options]
    );

    const handleCompleteOnboarding = useCallback(() => {
        closeOnboarding();
    }, [closeOnboarding]);

    return {
        isOpen,
        language,
        detectedStyle,
        openOnboarding,
        closeOnboarding,
        handleLearningStyleDetected,
        handleCompleteOnboarding,
    };
};

export default useBotOnboarding;
