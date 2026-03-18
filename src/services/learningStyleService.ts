import { supabase } from "@/integrations/supabase/client";

export type LearningStyle = "visual" | "textual" | "practical";

export interface LearningStyleData {
    user_id: string;
    preferred_style: LearningStyle;
    visual_score: number;
    textual_score: number;
    practical_score: number;
}

const mapLevelToStyle = (currentLevel: number): LearningStyle => {
    if (currentLevel >= 75) return "practical";
    if (currentLevel >= 45) return "visual";
    return "textual";
};

export const learningStyleService = {
    /**
     * Récupère le style d'apprentissage de l'utilisateur
     */
    async getUserLearningStyle(userId: string): Promise<LearningStyle | null> {
        try {
            const { data, error } = await supabase
                .from("student_scores")
                .select("current_level")
                .eq("user_id", userId)
                .is("lesson_id", null)
                .maybeSingle();

            if (error) {
                console.error("Erreur lors de la récupération du style:", error);
                return null;
            }

            if (!data) return null;
            return mapLevelToStyle(data.current_level);
        } catch (error) {
            console.error("Erreur:", error);
            return null;
        }
    },

    /**
     * Récupère les données complètes du style d'apprentissage
     */
    async getUserLearningStyleFull(userId: string): Promise<LearningStyleData | null> {
        try {
            const { data, error } = await supabase
                .from("student_scores")
                .select("user_id, current_level")
                .eq("user_id", userId)
                .is("lesson_id", null)
                .maybeSingle();

            if (error) {
                console.error("Erreur lors de la récupération:", error);
                return null;
            }

            if (!data) return null;

            const normalized = Math.min(100, Math.max(0, data.current_level));

            return {
                user_id: data.user_id,
                preferred_style: mapLevelToStyle(normalized),
                visual_score: normalized,
                textual_score: normalized,
                practical_score: normalized,
            };
        } catch (error) {
            console.error("Erreur:", error);
            return null;
        }
    },

    /**
     * Détermine le style dominant basé sur les scores
     */
    determineStyle(
        visualScore: number,
        textualScore: number,
        practicalScore: number
    ): LearningStyle {
        const max = Math.max(visualScore, textualScore, practicalScore);

        if (visualScore === max) return "visual";
        if (textualScore === max) return "textual";
        return "practical";
    },
};
