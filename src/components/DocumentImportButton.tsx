import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fileToDocumentParts, extractContentFromDocument } from "@/lib/documentExtraction";
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

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const parts = await fileToDocumentParts(file);
      const items = await extractContentFromDocument(contentType, parts);
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

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={loading}
        onClick={() => inputRef.current?.click()}
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
    </>
  );
}
