import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Gift } from "lucide-react";

interface PrepaidCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrepaidCodeDialog = ({ open, onOpenChange }: PrepaidCodeDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivateCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez entrer un code prépayé",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement prepaid code activation when the function exists
      // For now, show a message that this feature is coming soon
      toast({
        title: "Fonctionnalité bientôt disponible",
        description: "L'activation des codes prépayés sera disponible prochainement.",
      });
      onOpenChange(false);
      setCode("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'activation du code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-pink-600" />
            </div>
            <DialogTitle className="text-2xl">Activer un code prépayé</DialogTitle>
          </div>
          <DialogDescription>
            Entrez votre code prépayé pour activer votre compte et votre abonnement
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Code prépayé
            </label>
            <Input
              id="code"
              placeholder="XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={14}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Format: XXXX-XXXX-XXXX
            </p>
          </div>

          <Button
            onClick={handleActivateCode}
            disabled={loading || !code.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activation en cours...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Activer le code
              </>
            )}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">💡 Informations importantes :</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li>• Le code ne peut être utilisé qu'une seule fois</li>
            <li>• Votre compte sera activé automatiquement</li>
            <li>• Votre abonnement démarrera immédiatement</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
