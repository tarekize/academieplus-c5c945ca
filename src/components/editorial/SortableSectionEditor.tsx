import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { SectionEditor } from './SectionEditor';

interface SortableSectionEditorProps {
  section: any;
  onChange: (section: any) => void;
  onDelete: () => void;
}

export default function SortableSectionEditor({ section, onChange, onDelete }: SortableSectionEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-2 top-6 cursor-move z-10" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="pl-8">
        <SectionEditor
          section={section}
          onChange={onChange}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
