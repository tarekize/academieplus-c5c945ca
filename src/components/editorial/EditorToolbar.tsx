import { Save, Upload, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorToolbarProps {
  course: any;
  isSaving: boolean;
  onSave: () => void;
  onPublish: () => void;
}

export default function EditorToolbar({ course, isSaving, onSave, onPublish }: EditorToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-green-600" />
                  Sauvegardé
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Statut: <span className="font-medium">{course.statut}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Sections: <span className="font-medium">{course.sections?.length || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder brouillon
            </Button>
            <Button onClick={onPublish} disabled={isSaving}>
              <Upload className="w-4 h-4 mr-2" />
              Publier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
