import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2, Shield, GraduationCap } from "lucide-react";

type Status = "checking" | "ready" | "invalid";
type Step = "password" | "mfa";

/**
 * Page atteinte depuis le lien "Réinitialiser le mot de passe" reçu par e-mail
 * (voir Auth.tsx:handleForgotPassword). Le lien pointe vers l'endpoint de
 * vérification de Supabase, qui redirige ensuite ici avec un ?code=... (flux
 * PKCE, cf. integrations/supabase/client.ts) qu'il faut échanger explicitement
 * contre une session avant de pouvoir appeler updateUser().
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Session déjà établie (flux par fragment d'URL déjà auto-détecté par
      // le SDK, ou code déjà échangé lors d'un précédent rendu) : on évite de
      // ré-échanger un ?code= déjà consommé, qui échouerait sur un simple
      // rafraîchissement de la page.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("ready");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        setStatus("invalid");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      setStatus(error ? "invalid" : "ready");
      if (error) console.error("Error exchanging recovery code:", error);
    };
    init();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(pwd)) return "Le mot de passe doit contenir au moins une lettre majuscule.";
    if (!/\d/.test(pwd)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  };

  const checkMfaRequired = async (): Promise<boolean> => {
    try {
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        console.error("Error checking AAL:", aalError);
        return false;
      }
      if (aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
          console.error("Error listing factors:", factorsError);
          return false;
        }
        const totpFactor = factorsData.totp.find((f) => f.status === "verified");
        if (totpFactor) {
          setFactorId(totpFactor.id);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error in MFA check:", error);
      return false;
    }
  };

  const finishSuccess = () => {
    toast.success("Mot de passe mis à jour avec succès !");
    navigate("/dashboard", { replace: true });
  };

  const verifyMfaAndUpdate = async () => {
    if (!factorId || mfaCode.length !== 6) {
      toast.error("Veuillez entrer le code à 6 chiffres.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: mfaCode,
      });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      finishSuccess();
    } catch (error: any) {
      console.error("Error during MFA verification:", error);
      if (error.message?.includes("Invalid TOTP code")) {
        toast.error("Code de vérification invalide. Veuillez réessayer.");
      } else {
        toast.error(error.message || "Erreur lors de la vérification MFA.");
      }
      setMfaCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const mfaRequired = await checkMfaRequired();
      if (mfaRequired) {
        setSubmitting(false);
        setStep("mfa");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        if (error.message?.includes("AAL2")) {
          const mfaNeeded = await checkMfaRequired();
          if (mfaNeeded) {
            setSubmitting(false);
            setStep("mfa");
            return;
          }
        }
        throw error;
      }

      finishSuccess();
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4 text-center bg-gradient-to-br from-background via-secondary to-background">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <KeyRound className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Lien invalide ou expiré</h2>
        <p className="text-muted-foreground max-w-sm">
          Ce lien de réinitialisation n'est plus valide. Demande un nouveau lien depuis la page de connexion.
        </p>
        <Button onClick={() => navigate("/auth")}>Retour à la connexion</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            {step === "mfa" ? <Shield className="h-6 w-6 text-primary" /> : <GraduationCap className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle>{step === "mfa" ? "Vérification requise" : "Choisis un nouveau mot de passe"}</CardTitle>
          <CardDescription>
            {step === "mfa"
              ? "Ouvre ton application d'authentification et entre le code à 6 chiffres."
              : "Il doit contenir au moins 8 caractères, une majuscule et un chiffre."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "password" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Mettre à jour le mot de passe
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("password")}>
                  Retour
                </Button>
                <Button className="flex-1" onClick={verifyMfaAndUpdate} disabled={submitting || mfaCode.length !== 6}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Vérifier et modifier
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
