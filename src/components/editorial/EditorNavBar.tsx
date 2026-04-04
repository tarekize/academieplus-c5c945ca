import { useState } from 'react';
import { Save, Eye, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditorNavBarProps {
  course: any;
  onChange: (course: any) => void;
  onSave?: () => void;
  onPreview?: () => void;
}

export default function EditorNavBar({ course, onChange, onSave, onPreview }: EditorNavBarProps) {
  return (
    <div className="border-b bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4 flex-1">
          <FileText className="w-6 h-6 text-primary" />
          <Input
            type="text"
            placeholder="Titre du cours"
            value={course.titre || ''}
            onChange={(e) => onChange({ ...course, titre: e.target.value })}
            className="max-w-md font-semibold"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button variant="outline" onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
