import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff, Loader2, Smartphone, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

export const TwoFactorSettings = () => {
  const [loading, setLoading] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      // Combiner les facteurs TOTP et phone
      const allFactors = [...(data.totp || []), ...(data.phone || [])];
      setFactors(allFactors);
    } catch (error: any) {
      console.error("Error loading MFA factors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Application Authenticator'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setShowEnrollDialog(true);
    } catch (error: any) {
      console.error("Error enrolling MFA:", error);
      toast.error(error.message || "Erreur lors de l'activation de la 2FA");
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || !verifyCode) {
      toast.error("Veuillez entrer le code de vérification");
      return;
    }

    setLoading(true);
    try {
      // D'abord créer un challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (challengeError) throw challengeError;

      // Ensuite vérifier avec le code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      toast.success("Double authentification activée avec succès !");
      setShowEnrollDialog(false);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerifyCode("");
      loadFactors();
    } catch (error: any) {
      console.error("Error verifying MFA:", error);
      toast.error(error.message || "Code invalide. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (factorIdToRemove: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorIdToRemove
      });

      if (error) throw error;

      toast.success("Double authentification désactivée");
      loadFactors();
    } catch (error: any) {
      console.error("Error unenrolling MFA:", error);
      toast.error(error.message || "Erreur lors de la désactivation de la 2FA");
    } finally {
      setLoading(false);
    }
  };

  const verifiedFactors = factors.filter(f => f.status === 'verified');
  const hasMfaEnabled = verifiedFactors.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Double Authentification (2FA)
        </CardTitle>
        <CardDescription>
          Renforcez la sécurité de votre compte avec une authentification à deux facteurs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-3">
            {hasMfaEnabled ? (
              <ShieldCheck className="h-8 w-8 text-green-500" />
            ) : (
              <ShieldOff className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {hasMfaEnabled ? "2FA activée" : "2FA non activée"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasMfaEnabled 
                  ? "Votre compte est protégé par une authentification à deux facteurs" 
                  : "Activez la 2FA pour renforcer la sécurité de votre compte"}
              </p>
            </div>
          </div>
          <Badge variant={hasMfaEnabled ? "default" : "secondary"}>
            {hasMfaEnabled ? "Activée" : "Désactivée"}
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {verifiedFactors.length > 0 && (
              <div className="space-y-3">
                <Label>Méthodes d'authentification configurées</Label>
                {verifiedFactors.map((factor) => (
                  <div 
                    key={factor.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{factor.friendly_name || "Application Authenticator"}</p>
                        <p className="text-xs text-muted-foreground">
                          Ajouté le {new Date(factor.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Désactiver la 2FA ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action désactivera l'authentification à deux facteurs pour votre compte.
                            Votre compte sera moins sécurisé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnenroll(factor.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Désactiver
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}

            {!hasMfaEnabled && (
              <Button onClick={handleEnroll} disabled={enrolling} className="w-full">
                {enrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Activer la double authentification
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Dialog d'inscription 2FA */}
        <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configuration de la 2FA</DialogTitle>
              <DialogDescription>
                Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center p-4 bg-secondary rounded-lg">
                  <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
              )}

              {secret && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Ou entrez ce code manuellement :
                  </Label>
                  <code className="block w-full p-2 bg-secondary/20 rounded text-center font-mono text-sm break-all">
                    {secret}
                  </code>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verify-code">Code de vérification</Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Entrez le code à 6 chiffres affiché dans votre application
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleVerify} disabled={loading || verifyCode.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier et activer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TwoFactorSettings;
