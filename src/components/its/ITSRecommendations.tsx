import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, BookOpen, Brain, Sparkles, Video, FileText, PenTool } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

interface LearningStyle {
  preferred_style: string;
  visual_score: number;
  textual_score: number;
  practical_score: number;
}

type SchoolLevel =
  | "5eme_primaire"
  | "1ere_cem"
  | "2eme_cem"
  | "3eme_cem"
  | "4eme_cem"
  | "1ere_tcl"
  | "1ere_tcs"
  | "terminale_lettres"
  | "terminale_sciences"
  | "terminale_mathematiques"
  | "terminale_gestion"
  | null;

// Tips adapted by school level and learning style
const getTipsByLevelAndStyle = (level: SchoolLevel, style: string): string[] => {
  // Primaire (5ème)
  if (level === "5eme_primaire") {
    if (style === "visual") {
      return [
        "Regarde les vidéos colorées et amusantes 🎨",
        "Utilise des dessins pour représenter les problèmes",
        "Crée des schémas avec des couleurs différentes",
      ];
    } else if (style === "textual") {
      return [
        "Lis les explications à voix haute",
        "Écris les règles dans tes propres mots",
        "Relis le cours plusieurs fois",
      ];
    } else {
      return [
        "Fais beaucoup d'exercices simples et progressifs",
        "Utilise des jeux pour apprendre",
        "Essaie avec des objets réels si possible",
      ];
    }
  }

  // Collège (1ère - 4ème CEM)
  if (["1ere_cem", "2eme_cem", "3eme_cem", "4eme_cem"].includes(level || "")) {
    if (style === "visual") {
      return [
        "Commence par les vidéos explicatives",
        "Utilise des graphiques et des diagrammes",
        "Dessine les figures géométriques avant de résoudre",
        "Fais des cartes mentales visuelles",
      ];
    } else if (style === "textual") {
      return [
        "Lis attentivement le cours avant les exercices",
        "Prends des notes détaillées et reformule les règles",
        "Revois les définitions et formules régulièrement",
        "Rédige des résumés de chaque chapitre",
      ];
    } else {
      return [
        "Commence directement par les exercices d'application",
        "Fais les quiz pour tester ta compréhension",
        "Résous beaucoup d'exercices variés",
        "Utilise la méthode essai-erreur contrôlée",
      ];
    }
  }

  // Lycée (1ère - Terminale)
  if (style === "visual") {
    return [
      "Utilise des visualisations mathématiques avancées",
      "Crée des diagrammes pour montrer les relations entre concepts",
      "Représente graphiquement les problèmes complexes",
      "Utilise des logiciels de visualisation (Geogebra, etc.)",
    ];
  } else if (style === "textual") {
    return [
      "Étudie les démonstrations de manière approfondie",
      "Prends des notes structurées avec définitions formelles",
      "Consulte les théorèmes et comprends leur logique",
      "Écris des preuves et justifie chaque étape",
    ];
  } else {
    return [
      "Résous des exercices complexes et progressifs",
      "Travaille sur des problèmes complets et des études de cas",
      "Faîtes des exercices d'examen et d'olympiades",
      "Entraîne-toi à expliquer ta méthode résolutoire",
    ];
  }
};

// Base style config with level-agnostic labels
const baseStyleConfig: Record<string, { icon: any; label: string; color: string }> = {
  visual: {
    icon: Eye,
    label: "Apprenant Visuel",
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  textual: {
    icon: BookOpen,
    label: "Apprenant Textuel",
    color: "bg-green-500/10 text-green-700 border-green-200",
  },
  practical: {
    icon: Brain,
    label: "Apprenant Pratique",
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
};

const methodIcons: Record<string, any> = {
  video: Video,
  text: FileText,
  exercise: PenTool,
};

export default function ITSRecommendations() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("learning_styles")
        .select("preferred_style, visual_score, textual_score, practical_score")
        .eq("user_id", user.id)
        .maybeSingle();
      setLearningStyle(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading || !learningStyle || !profile) return null;

  const config = baseStyleConfig[learningStyle.preferred_style] || baseStyleConfig.practical;
  const Icon = config.icon;

  // Get tips adapted to the user's school level
  const tips = getTipsByLevelAndStyle(profile.school_level as SchoolLevel, learningStyle.preferred_style);

  // Suggest learning order based on style and level
  let methodOrder: string[];
  if (learningStyle.preferred_style === "visual") {
    methodOrder = ["video", "text", "exercise"];
  } else if (learningStyle.preferred_style === "textual") {
    methodOrder = ["text", "video", "exercise"];
  } else {
    methodOrder = ["exercise", "video", "text"];
  }

  const methodLabels: Record<string, string> = {
    video: "Vidéos",
    text: "Cours écrit",
    exercise: "Exercices",
  };

  return (
    <Card className="p-6 border-border mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground text-lg">Tuteur Intelligent</h3>
      </div>

      <div className={`flex items-center gap-3 rounded-lg p-3 mb-4 border ${config.color}`}>
        <Icon className="h-6 w-6 flex-shrink-0" />
        <div>
          <p className="font-medium">{config.label}</p>
          <p className="text-sm opacity-80">Contenu adapté à ton style et ton niveau</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-muted-foreground">Ordre recommandé pour ce chapitre :</p>
        <div className="flex items-center gap-2">
          {methodOrder.map((method, i) => {
            const MIcon = methodIcons[method];
            return (
              <div key={method} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">→</span>}
                <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3">
                  <MIcon className="h-3.5 w-3.5" />
                  {methodLabels[method]}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Conseils personnalisés pour toi :</p>
        <ul className="space-y-1.5">
          {tips.map((tip, i) => (
            <li key={i} className="text-sm text-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
