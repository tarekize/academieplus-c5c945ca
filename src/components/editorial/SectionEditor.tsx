import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GripVertical, Trash2, Plus, X } from "lucide-react";
import { FormulaModal } from "./FormulaModal";
import { ImageUploadModal } from "./ImageUploadModal";
import ReactMarkdown from "react-markdown";

interface SectionEditorProps {
  section: any;
  onChange: (section: any) => void;
  onDelete: () => void;
  onAddSubsection?: () => void;
  level?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SectionEditor({ 
  section, 
  onChange, 
  onDelete,
  onAddSubsection,
  level = 0,
  isCollapsed = false,
  onToggleCollapse
}: SectionEditorProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddFormula = (formula: any) => {
    onChange({
      ...section,
      formules: [...(section.formules || []), formula],
    });
  };

  const handleAddImage = (image: any) => {
    onChange({
      ...section,
      medias: [...(section.medias || []), image],
    });
  };

  const handleRemoveFormula = (index: number) => {
    onChange({
      ...section,
      formules: section.formules.filter((_: any, i: number) => i !== index),
    });
  };

  const handleRemoveImage = (index: number) => {
    onChange({
      ...section,
      medias: section.medias.filter((_: any, i: number) => i !== index),
    });
  };

  const getSectionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      definition: "border-l-4 border-blue-500 bg-blue-50/50",
      propriete: "border-l-4 border-green-500 bg-green-50/50",
      exemple: "border-l-4 border-yellow-500 bg-yellow-50/50",
      methode: "border-l-4 border-purple-500 bg-purple-50/50",
      remarque: "border-l-4 border-gray-400 bg-gray-50/50",
    };
    return colors[type] || "";
  };

  return (
    <>
      <Card className={`p-6 ${getSectionTypeColor(section.type)}`}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <button className="cursor-move mt-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1 space-y-3">
            <div className="flex gap-3">
              <Input
                value={section.titre}
                onChange={(e) => onChange({ ...section, titre: e.target.value })}
                placeholder="Titre de la section"
                className="flex-1 font-bold text-lg"
              />
              <Select
                value={section.type}
                onValueChange={(value) => onChange({ ...section, type: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="definition">Définition</SelectItem>
                  <SelectItem value="propriete">Propriété</SelectItem>
                  <SelectItem value="exemple">Exemple</SelectItem>
                  <SelectItem value="methode">Méthode</SelectItem>
                  <SelectItem value="remarque">Remarque</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {/* Content editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Contenu (Markdown)</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Éditer" : "Aperçu"}
                </Button>
              </div>
              
              {showPreview ? (
                <div className="border rounded-lg p-4 bg-background prose prose-sm max-w-none">
                  <ReactMarkdown>{section.contenu_texte}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={section.contenu_texte}
                  onChange={(e) =>
                    onChange({ ...section, contenu_texte: e.target.value })
                  }
                  placeholder="Écrivez le contenu en Markdown..."
                  rows={8}
                  className="font-mono text-sm"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFormulaModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />∑ Formule LaTeX
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />📷 Image
              </Button>
            </div>

            {/* Formulas list */}
            {section.formules && section.formules.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Formules:</p>
                {section.formules.map((formula: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-3 rounded-lg"
                  >
                    <code className="text-sm font-mono">
                      {formula.latex_source}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFormula(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Images list */}
            {section.medias && section.medias.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Images:</p>
                {section.medias.map((media: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {media.url && (
                        <img
                          src={media.url}
                          alt={media.alt_text}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div className="text-sm">
                        <p className="font-medium">{media.nom_fichier}</p>
                        <p className="text-muted-foreground">
                          {media.alt_text}
                        </p>
                        {media.legende && (
                          <p className="text-xs italic">{media.legende}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <FormulaModal
        open={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        onInsert={handleAddFormula}
      />

      <ImageUploadModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onUpload={handleAddImage}
      />
    </>
  );
}
