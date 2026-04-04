import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CourseFiltersProps {
  onChange: (filters: any) => void;
}

export default function CourseFilters({ onChange }: CourseFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un cours..."
          className="pl-9"
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      
      <Select onValueChange={(value) => onChange({ statut: value })}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="publiÃ©">PubliÃ©</SelectItem>
          <SelectItem value="brouillon">Brouillon</SelectItem>
          <SelectItem value="en_revision">En révision</SelectItem>
          <SelectItem value="archivÃ©">ArchivÃ©</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onChange({ matiere: value })}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Toutes matiÃ¨res" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes matiÃ¨res</SelectItem>
          <SelectItem value="mathematiques">MathÃ©matiques</SelectItem>
          <SelectItem value="physique">Physique</SelectItem>
          <SelectItem value="svt">SVT</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
