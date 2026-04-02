import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { toast } from "sonner";

interface FormulaModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (formula: any) => void;
}

export function FormulaModal({ open, onClose, onInsert }: FormulaModalProps) {
  const [latex, setLatex] = useState("");
  const [displayMode, setDisplayMode] = useState<"block" | "inline">("block");
  const [legende, setLegende] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateLatex = (input: string) => {
    if (!input.trim()) {
      setError("");
      return true;
    }

    setIsValidating(true);
    
    // Basic syntax validation
    const openBraces = (input.match(/\{/g) || []).length;
    const closeBraces = (input.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      setError("Accolades non équilibrées");
      setIsValidating(false);
      return false;
    }

    // Check for common LaTeX commands
    const invalidChars = /[<>]/g;
    if (invalidChars.test(input)) {
      setError("Caractères invalides détectés");
      setIsValidating(false);
      return false;
    }

    // Try to render with KaTeX
    try {
      katex.renderToString(input, { throwOnError: true, displayMode: displayMode === "block" });
      setError("");
      setIsValidating(false);
      return true;
    } catch (e: any) {
      setError(`Erreur LaTeX: ${e.message || 'Syntaxe invalide'}`);
      setIsValidating(false);
      return false;
    }
  };

  const handleLatexChange = (value: string) => {
    setLatex(value);
    // Validate after a short delay to avoid too many validations
    const timeoutId = setTimeout(() => {
      validateLatex(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleInsert = () => {
    if (!latex.trim()) {
      toast.error("Veuillez saisir une formule");
      return;
    }

    if (error) {
      toast.error("Corrigez les erreurs avant d'insérer");
      return;
    }

    onInsert({
      latex_source: latex,
      display_mode: displayMode === "block",
      legende: legende || null,
      position: 0,
    });

    // Reset form
    setLatex("");
    setLegende("");
    setDisplayMode("block");
    setError("");
    onClose();
    toast.success("Formule ajoutée");
  };

  const commonSymbols = [
    { label: "√", latex: "\\sqrt{}" },
    { label: "∫", latex: "\\int" },
    { label: "∑", latex: "\\sum" },
    { label: "∞", latex: "\\infty" },
    { label: "α", latex: "\\alpha" },
    { label: "β", latex: "\\beta" },
    { label: "≤", latex: "\\leq" },
    { label: "≥", latex: "\\geq" },
    { label: "≠", latex: "\\neq" },
    { label: "×", latex: "\\times" },
    { label: "÷", latex: "\\div" },
    { label: "±", latex: "\\pm" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter une formule LaTeX</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* LaTeX input */}
          <div className="space-y-2">
            <Label htmlFor="latex">Code LaTeX</Label>
            <Textarea
              id="latex"
              value={latex}
              onChange={(e) => handleLatexChange(e.target.value)}
              placeholder="Ex: \ln(x) = y"
              rows={4}
              className="font-mono"
            />
            {isValidating && (
              <p className="text-xs text-muted-foreground mt-1">Validation en cours...</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Common symbols */}
          <div className="space-y-2">
            <Label>Symboles courants</Label>
            <div className="flex flex-wrap gap-2">
              {commonSymbols.map((symbol) => (
                <Button
                  key={symbol.label}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleLatexChange(latex + symbol.latex)
                  }
                >
                  {symbol.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Display mode */}
          <div className="space-y-2">
            <Label>Mode d'affichage</Label>
            <RadioGroup
              value={displayMode}
              onValueChange={(value) => setDisplayMode(value as "block" | "inline")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="block" id="block" />
                <Label htmlFor="block" className="font-normal">
                  Bloc (centré, grande taille)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inline" id="inline" />
                <Label htmlFor="inline" className="font-normal">
                  Inline (dans le texte)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <Label htmlFor="legende">Légende (optionnelle)</Label>
            <Input
              id="legende"
              value={legende}
              onChange={(e) => setLegende(e.target.value)}
              placeholder="Ex: Fonction logarithme népérien"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Aperçu</Label>
            <div className="border rounded-lg p-4 bg-muted/50 min-h-[100px] flex items-center justify-center">
              {!error && latex ? (
                <div className="text-center">
                  {displayMode === "block" ? (
                    <BlockMath math={latex} />
                  ) : (
                    <InlineMath math={latex} />
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Saisissez du code LaTeX pour voir l'aperçu
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleInsert} disabled={!latex || !!error}>
            Insérer formule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
