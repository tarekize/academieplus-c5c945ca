import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileUp, Loader2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { fileToDocumentParts, extractContentFromDocument, ExtractMode } from "@/lib/documentExtraction";
import { GeneratedItem } from "@/lib/teacherContent";

interface Props {
  contentType: "exercise" | "quiz" | "exam";
  onExtracted: (items: GeneratedItem[]) => void;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

/** Bouton "Générer via un document" partagé enseignant/pédago/admin : importe
 * un PDF/Word/image, l'IA en extrait les exercices/quiz/examens déjà présents
 * (elle n'en invente pas) et les renvoie à `onExtracted` dans le même format
 * que la génération classique, pour que l'appelant les insère dans la bonne
 * place (résultats du chat, lignes d'examen, ou directement en base). */
export default function DocumentImportButton({
  contentType,
  onExtracted,
  label = "Générer via un document",
  className,
  variant = "outline",
  size = "sm",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const modeRef = useRef<ExtractMode>("exact");

  /** Extrait le contenu du document sélectionné (mode choisi via pickMode)
   * et transmet les éléments obtenus à l'appelant via onExtracted. Déclenché
   * par le changement de l'input file caché. */
  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const parts = await fileToDocumentParts(file);
      const items = await extractContentFromDocument(contentType, parts, modeRef.current);
      if (items.length === 0) {
        toast.error("Aucun contenu exploitable trouvé dans ce document.");
        return;
      }
      onExtracted(items);
      toast.success(`${items.length} élément${items.length > 1 ? "s" : ""} extrait${items.length > 1 ? "s" : ""} du document.`);
    } catch (e: any) {
      toast.error(e.message || "Échec de l'extraction depuis le document.");
    } finally {
      setLoading(false);
    }
  };

  /** Mémorise le mode d'extraction choisi ("exact" ou "improve") puis ouvre
   * le sélecteur de fichier natif. */
  const pickMode = (mode: ExtractMode) => {
    modeRef.current = mode;
    setModeDialogOpen(false);
    inputRef.current?.click();
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={loading}
        onClick={() => setModeDialogOpen(true)}
      >
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileUp className="h-4 w-4 mr-2" />}
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handleFile(file);
        }}
      />

      <Dialog open={modeDialogOpen} onOpenChange={setModeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comment veux-tu utiliser le document ?</DialogTitle>
            <DialogDescription>Ce choix s'applique à tout le document que tu vas importer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => pickMode("exact")}
              className="w-full text-left p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-start gap-3"
            >
              <Copy className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Exactement les mêmes</p>
                <p className="text-xs text-muted-foreground">L'IA retranscrit fidèlement le contenu du document, sans rien changer.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => pickMode("improve")}
              className="w-full text-left p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-start gap-3"
            >
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Version équivalente, améliorée par l'IA</p>
                <p className="text-xs text-muted-foreground">L'IA s'inspire du document pour créer des exercices équivalents, reformulés/améliorés.</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
