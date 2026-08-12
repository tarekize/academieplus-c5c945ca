import { supabase } from "@/integrations/supabase/client";

export type LearningStyle = "visual" | "textual" | "practical";

export interface LearningStyleData {
    user_id: string;
    preferred_style: LearningStyle;
    visual_score: number;
    textual_score: number;
    practical_score: number;
}

// Accès à la table learning_styles (résultat du test de style d'apprentissage
// de l'élève). Consommé par useLearningStyle ; getUserLearningStyle(userId)/
// getUserLearningStyleFull(userId) prennent un userId en paramètre — leurs
// appelants doivent passer l'id de l'utilisateur courant (jamais un id
// arbitraire) pour éviter de lire le style d'apprentissage d'un autre élève ;
// la protection réelle reste la policy RLS de `learning_styles` — à vérifier côté RLS.
export const learningStyleService = {
    /**
     * Récupère le style d'apprentissage de l'utilisateur
     */
    async getUserLearningStyle(userId: string): Promise<LearningStyle | null> {
        try {
        const { data, error } = await (supabase as any)
            .from("learning_styles")
                .select("preferred_style")
                .eq("user_id", userId)
                .maybeSingle();

            if (error) {
                console.error("Erreur lors de la récupération du style:", error);
                return null;
            }

            return data?.preferred_style as LearningStyle || null;
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
        const { data, error } = await (supabase as any)
            .from("learning_styles")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();

            if (error) {
                console.error("Erreur lors de la récupération:", error);
                return null;
            }

            if (!data) return null;

            return {
                user_id: data.user_id,
                preferred_style: data.preferred_style as LearningStyle,
                visual_score: data.visual_score,
                textual_score: data.textual_score,
                practical_score: data.practical_score,
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
