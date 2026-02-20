import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mathSecondeChapters } from "@/data/mathSecondeChapters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCw, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlashCard {
  id: string;
  question: string;
  answer: string;
}

const Revision = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [schoolLevel, setSchoolLevel] = useState<string>("");

  useEffect(() => {
    if (subjectId) {
      fetchData();
    }
  }, [subjectId]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_level")
        .eq("id", user.id)
        .single();

      setSchoolLevel(profile?.school_level || "");

      // Use static data for math seconde
      if (subjectId === "math" && profile?.school_level === "seconde") {
        const allCards: FlashCard[] = [];
        mathSecondeChapters.forEach(chapter => {
          chapter.quizzes.forEach(quiz => {
            allCards.push({
              id: quiz.id,
              question: quiz.question,
              answer: `${quiz.correctAnswer}\n\n${quiz.explanation}`
            });
          });
        });
        
        // Shuffle cards
        const shuffled = allCards.sort(() => Math.random() - 0.5);
        setCards(shuffled.slice(0, 20)); // Limit to 20 cards
      } else {
        setCards([]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cartes de révision",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkReviewed = (known: boolean) => {
    setReviewed(prev => new Set([...prev, currentIndex]));
    if (known) {
      toast({
        title: "Bien joué ! ✓",
        description: "Cette carte est marquée comme connue.",
      });
    }
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewed(new Set());
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Aucune carte disponible</h2>
        <p className="text-muted-foreground mb-6">
          Les cartes de révision ne sont pas encore disponibles pour cette matière et ce niveau.
        </p>
        <Button onClick={() => navigate("/liste-cours")}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  const progress = (reviewed.size / cards.length) * 100;
  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/liste-cours")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Recommencer
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Carte {currentIndex + 1} sur {cards.length}
              </span>
              <span className="text-sm font-medium">
                {reviewed.size} révisées
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* FlashCard */}
          <Card 
            className="min-h-[300px] cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">
                {isFlipped ? "Réponse" : "Question"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                {isFlipped ? (
                  <div className="whitespace-pre-line text-lg">
                    {currentCard.answer}
                  </div>
                ) : (
                  <p className="text-xl font-medium">{currentCard.question}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Cliquez sur la carte pour la retourner
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédente
            </Button>

            {isFlipped && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleMarkReviewed(false)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  À revoir
                </Button>
                <Button
                  onClick={() => handleMarkReviewed(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Je sais
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
            >
              Suivante
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {reviewed.size === cards.length && (
            <Card className="p-6 text-center border-2 border-green-500/50 bg-green-500/5">
              <h3 className="text-2xl font-bold mb-2">Bravo ! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                Vous avez révisé toutes les cartes !
              </p>
              <Button onClick={handleReset}>
                Recommencer la session
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Revision;