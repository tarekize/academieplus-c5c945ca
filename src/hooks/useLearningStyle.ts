import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { learningStyleService, type LearningStyle } from "@/services/learningStyleService";

// Charge le style d'apprentissage (visuel/textuel/pratique) de l'utilisateur
// courant, pour adapter la présentation du contenu pédagogique. userId vient
// de la session serveur (auth.getUser()), jamais d'un paramètre — un
// utilisateur ne peut donc pas lire le style d'apprentissage d'un autre via ce hook.
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
                setLearningStyle(style || "textual"); // Par défaut: textual
            } catch (err) {
                console.error("Erreur lors de la récupération du style:", err);
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
