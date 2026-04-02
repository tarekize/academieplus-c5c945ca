import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (image: any) => void;
}

export function ImageUploadModal({
  open,
  onClose,
  onUpload,
}: ImageUploadModalProps) {
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [legende, setLegende] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 MB");
      return;
    }

    setUploading(true);

    try {
      // Create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        setUrl(result);
      };
      reader.readAsDataURL(file);

      toast.success("Image chargée");
    } catch (error) {
      toast.error("Erreur lors du chargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleInsert = () => {
    if (!url) {
      toast.error("Veuillez ajouter une image");
      return;
    }

    if (!altText) {
      toast.error("Le texte alternatif est obligatoire (accessibilité)");
      return;
    }

    onUpload({
      id: `temp_${Date.now()}`,
      type: "image",
      url: url,
      nom_fichier: url.split("/").pop() || "image",
      alt_text: altText,
      legende: legende || null,
      position: 0,
    });

    // Reset form
    setUrl("");
    setAltText("");
    setLegende("");
    setPreview("");
    onClose();
    toast.success("Image ajoutée");
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value && value.startsWith("http")) {
      setPreview(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter une image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Glissez-déposez votre image ici
              </p>
              <p className="text-sm text-muted-foreground">
                ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, SVG (max 5 MB)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL de l'image</Label>
              <Input
                id="image-url"
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="border rounded-lg p-4 bg-muted/50">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Alt text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">
              Texte alternatif (obligatoire)
              <span className="text-xs text-muted-foreground ml-2">
                Pour l'accessibilité
              </span>
            </Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Description de l'image pour les lecteurs d'écran"
            />
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <Label htmlFor="legende">Légende (optionnelle)</Label>
            <Input
              id="legende"
              value={legende}
              onChange={(e) => setLegende(e.target.value)}
              placeholder="Ex: Représentation graphique de la fonction"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleInsert} disabled={!url || !altText || uploading}>
            {uploading ? "Chargement..." : "Insérer image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
