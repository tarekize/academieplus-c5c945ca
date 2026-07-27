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
import { Key, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";

type Step = "password" | "code";

const RESEND_COOLDOWN_SECONDS = 30;

export function ChangePasswordButton({ className }: { className?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    const interval = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const requestVerificationCode = async () => {
    const { error } = await supabase.functions.invoke("request-password-change");
    if (error) throw new Error(await extractFunctionErrorMessage(error));
    startResendCooldown();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Veuillez entrer votre mot de passe actuel.");
      return;
    }

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
      // --- Vérifie le mot de passe ACTUEL avant tout changement : sans ce
      // contrôle, une session volée (XSS, jeton local exposé, appareil
      // partagé resté connecté) suffisait à elle seule pour changer le mot
      // de passe et exclure le vrai propriétaire du compte, sans qu'il n'ait
      // jamais à prouver qu'il connaît le mot de passe actuel. Supabase
      // n'expose pas d'API dédiée de vérification : se reconnecter avec le
      // mot de passe actuel est le moyen standard de le confirmer côté client. ---
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) {
        toast.error("Session invalide, veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) {
        toast.error("Mot de passe actuel incorrect.");
        setLoading(false);
        return;
      }

      // Envoie un code de vérification par email avant d'autoriser le changement.
      await requestVerificationCode();
      toast.success("Un code de vérification a été envoyé à votre adresse email.");
      setStep("code");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await requestVerificationCode();
      toast.success("Un nouveau code a été envoyé.");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Veuillez entrer le code à 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("confirm-password-change", {
        body: { code: verificationCode, newPassword },
      });
      if (error) throw new Error(await extractFunctionErrorMessage(error));

      toast.success("Mot de passe modifié avec succès !");
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error confirming password change:", error);
      toast.error(error.message || "Code invalide ou expiré.");
      setVerificationCode("");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setStep("password");
    setResendCooldown(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
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
                Entrez votre mot de passe actuel puis votre nouveau mot de passe. Il doit contenir au moins 8 caractères, une majuscule et un chiffre.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
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
                    "Continuer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Vérification par email
              </DialogTitle>
              <DialogDescription>
                Un code de vérification à 6 chiffres a été envoyé à votre adresse email. Entrez-le pour confirmer le changement de mot de passe.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center gap-4">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={(value) => setVerificationCode(value)}
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
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer le code"}
              </button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep("password")}>
                Retour
              </Button>
              <Button onClick={handleConfirmCode} disabled={loading || verificationCode.length !== 6}>
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
