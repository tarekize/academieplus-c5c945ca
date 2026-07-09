import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "joining" | "success" | "error" | "redirecting";

export default function JoinClass() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [className, setClassName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMsg("Code de classe invalide.");
      return;
    }

    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in: store class code + returnTo, redirect to signup
        sessionStorage.setItem("pendingClassCode", code.toUpperCase());
        sessionStorage.setItem("returnTo", `/rejoindre/${code}`);
        navigate(`/auth?mode=signup`, { replace: true });
        return;
      }

      // Logged in: call the edge function
      setStatus("joining");
      try {
        const { data, error } = await supabase.functions.invoke("join-class", {
          body: { code: code.toUpperCase() },
        });

        if (error || (data as any)?.error) {
          const msg = (data as any)?.error || error?.message || "Erreur lors de l'adhésion à la classe.";
          setStatus("error");
          setErrorMsg(msg);
          return;
        }

        const name = (data as any)?.class?.name || "la classe";
        setClassName(name);
        setStatus("success");

        sessionStorage.removeItem("pendingClassCode");

        setTimeout(() => {
          navigate("/cours/math", { replace: true });
        }, 2500);
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e.message || "Erreur inattendue.");
      }
    };

    run();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center px-4 max-w-sm">
        {(status === "loading" || status === "joining" || status === "redirecting") && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground text-lg">
              {status === "joining" ? "Adhésion à la classe en cours…" : "Vérification en cours…"}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-mint" />
            <div>
              <p className="text-xl font-bold">Classe rejointe !</p>
              <p className="text-muted-foreground mt-1">Vous avez rejoint <strong>{className}</strong>.</p>
              <p className="text-sm text-muted-foreground mt-2">Redirection en cours…</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-14 w-14 text-destructive" />
            <div>
              <p className="text-xl font-bold">Échec de l'adhésion</p>
              <p className="text-muted-foreground mt-1">{errorMsg}</p>
            </div>
            <Button onClick={() => navigate("/cours/math")}>Retour à l'accueil</Button>
          </>
        )}
      </div>
    </div>
  );
}
