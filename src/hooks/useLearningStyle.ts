import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { learningStyleService, type LearningStyle } from "@/services/learningStyleService";

export const useLearningStyle = () => {
    const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLearningStyle = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLearningStyle(null);
                    return;
                }

                const style = await learningStyleService.getUserLearningStyle(user.id);
                setLearningStyle(style || "textual"); // Par dÃ©faut: textual
            } catch (err) {
                console.error("Erreur lors de la rÃ©cupÃ©ration du style:", err);
                setError("Impossible de charger le style d'apprentissage");
                setLearningStyle("textual"); // Fallback
            } finally {
                setLoading(false);
            }
        };

        fetchLearningStyle();
    }, []);

    return { learningStyle, loading, error };
};
