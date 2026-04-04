import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "password" | "mfa";

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("password");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule.";
    }
    if (!/\d/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre.";
    }
    return null;
  };

  const checkMfaRequired = async (): Promise<boolean> => {
    try {
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.error("Error checking AAL:", aalError);
        return false;
      }

      // If current level is aal1 but next level requires aal2, MFA verification is needed
      if (aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
        // Get the TOTP factor
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        
        if (factorsError) {
          console.error("Error listing factors:", factorsError);
          return false;
        }

        const totpFactor = factorsData.totp.find(f => f.status === "verified");
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

  const verifyMfaAndUpdate = async () => {
    if (!factorId || mfaCode.length !== 6) {
      toast.error("Veuillez entrer le code à 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      // Create and verify the MFA challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: mfaCode,
      });

      if (verifyError) throw verifyError;

      // Now update the password with AAL2 session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast.success("Mot de passe modifié avec succès !");
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error during MFA verification:", error);
      if (error.message?.includes("Invalid TOTP code")) {
        toast.error("Code de vérification invalide. Veuillez réessayer.");
      } else {
        toast.error(error.message || "Erreur lors de la vérification MFA.");
      }
      setMfaCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Check if MFA verification is required
      const mfaRequired = await checkMfaRequired();
      
      if (mfaRequired) {
        setLoading(false);
        setStep("mfa");
        return;
      }

      // No MFA required, update directly
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        // Check if error is about AAL2 requirement
        if (error.message?.includes("AAL2")) {
          const mfaNeeded = await checkMfaRequired();
          if (mfaNeeded) {
            setLoading(false);
            setStep("mfa");
            return;
          }
        }
        throw error;
      }

      toast.success("Mot de passe modifié avec succès !");
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setMfaCode("");
    setStep("password");
    setFactorId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Key className="h-4 w-4" />
          Modifier le mot de passe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === "password" ? (
          <>
            <DialogHeader>
              <DialogTitle>Modifier le mot de passe</DialogTitle>
              <DialogDescription>
                Entrez votre nouveau mot de passe. Il doit contenir au moins 8 caractères, une majuscule et un chiffre.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Modifier"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Vérification requise
              </DialogTitle>
              <DialogDescription>
                Pour modifier votre mot de passe, veuillez entrer le code de votre application d'authentification.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center gap-4">
              <InputOTP
                maxLength={6}
                value={mfaCode}
                onChange={(value) => setMfaCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-sm text-muted-foreground text-center">
                Ouvrez votre application d'authentification et entrez le code à 6 chiffres.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep("password")}>
                Retour
              </Button>
              <Button onClick={verifyMfaAndUpdate} disabled={loading || mfaCode.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier et modifier"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
