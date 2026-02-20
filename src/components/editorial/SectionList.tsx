import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SortableSectionEditor from './SortableSectionEditor';

interface SectionListProps {
  sections: any[];
  onChange: (sections: any[]) => void;
  onAddSection: () => void;
}

export default function SectionList({ sections, onChange, onAddSection }: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      
      // Update ordre
      newSections.forEach((s, idx) => {
        s.ordre = idx + 1;
      });

      onChange(newSections);
    }
  };

  return (
    <div className="space-y-4 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Contenu du cours</h2>
        <Button onClick={onAddSection}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une section
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SortableSectionEditor
              key={section.id}
              section={section}
              onChange={(updated) => {
                const newSections = [...sections];
                newSections[index] = updated;
                onChange(newSections);
              }}
              onDelete={() => {
                onChange(sections.filter((_, i) => i !== index));
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune section pour le moment.</p>
          <p className="text-sm mt-2">Cliquez sur "Ajouter une section" pour commencer.</p>
        </div>
      )}
    </div>
  );
}
