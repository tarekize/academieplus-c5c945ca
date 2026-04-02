import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SearchFiltersProps {
  schoolLevel?: string;
  difficulty?: string;
  category?: string;
  onSchoolLevelChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

export const SearchFilters = ({
  schoolLevel,
  difficulty,
  category,
  onSchoolLevelChange,
  onDifficultyChange,
  onCategoryChange,
  onClearFilters
}: SearchFiltersProps) => {
  const activeFiltersCount = [schoolLevel, difficulty, category].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtres</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Effacer ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Niveau scolaire</label>
          <Select value={schoolLevel} onValueChange={onSchoolLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="cp">CP</SelectItem>
              <SelectItem value="ce1">CE1</SelectItem>
              <SelectItem value="ce2">CE2</SelectItem>
              <SelectItem value="cm1">CM1</SelectItem>
              <SelectItem value="cm2">CM2</SelectItem>
              <SelectItem value="sixieme">6ème</SelectItem>
              <SelectItem value="cinquieme">5ème</SelectItem>
              <SelectItem value="quatrieme">4ème</SelectItem>
              <SelectItem value="troisieme">3ème</SelectItem>
              <SelectItem value="seconde">Seconde</SelectItem>
              <SelectItem value="premiere">Première</SelectItem>
              <SelectItem value="terminale">Terminale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Difficulté</label>
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes difficultés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes difficultés</SelectItem>
              <SelectItem value="facile">Facile</SelectItem>
              <SelectItem value="moyen">Moyen</SelectItem>
              <SelectItem value="difficile">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Catégorie</label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="general">Matières générales</SelectItem>
              <SelectItem value="speciality">Spécialités</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};