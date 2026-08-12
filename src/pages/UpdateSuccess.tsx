import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

// Écran de confirmation affiché après une mise à jour réussie des données du
// compte. Purement transitoire : redirige automatiquement vers /account
// après 2 secondes (le timer est nettoyé au démontage pour éviter une
// navigation "fantôme" si l'utilisateur quitte la page avant l'échéance).
const UpdateSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/account");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen pro-shell flex items-center justify-center p-4">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="h-24 w-24 text-mint mx-auto" />
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
          Vos données ont été mises à jour avec succès !
        </h1>
      </div>
    </div>
  );
};

export default UpdateSuccess;
