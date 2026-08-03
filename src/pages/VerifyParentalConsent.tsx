import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, GraduationCap } from "lucide-react";

type Status = "checking" | "success" | "error";

/** Page atteinte depuis le lien envoyé par email au parent/tuteur d'un élève
 * de moins de 15 ans (voir send-parental-consent-email). Public, sans
 * authentification requise : c'est le parent qui clique, pas l'élève. */
export default function VerifyParentalConsent() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide : jeton manquant.");
      return;
    }

    supabase.functions.invoke("verify-parental-consent", { body: { token } }).then(({ data, error }) => {
      if (error || data?.error) {
        setStatus("error");
        setMessage(data?.error || "Ce lien est invalide ou a expiré.");
        return;
      }
      setStatus("success");
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Consentement parental</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "checking" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Vérification en cours...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle className="h-12 w-12 text-mint" />
              <p className="font-medium">Merci ! Votre consentement a bien été enregistré.</p>
              <p className="text-sm text-muted-foreground">Le compte de votre enfant est désormais confirmé.</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">{message}</p>
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
