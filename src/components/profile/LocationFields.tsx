import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getWilayaNames, getCitiesByWilaya } from "@/data/algeriaData";

interface LocationFieldsProps {
  wilaya: string;
  ville: string;
  ecole: string;
  onWilayaChange: (value: string) => void;
  onVilleChange: (value: string) => void;
  onEcoleChange: (value: string) => void;
  className?: string;
}

const LocationFields = ({
  wilaya,
  ville,
  ecole,
  onWilayaChange,
  onVilleChange,
  onEcoleChange,
  className = "",
}: LocationFieldsProps) => {
  const wilayas = getWilayaNames();
  const cities = wilaya ? getCitiesByWilaya(wilaya) : [];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>Wilaya</Label>
        <Select value={wilaya} onValueChange={(val) => {
          onWilayaChange(val);
          onVilleChange(""); // reset ville when wilaya changes
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez votre wilaya" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {wilayas.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ville</Label>
        <Select value={ville} onValueChange={onVilleChange} disabled={!wilaya}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={wilaya ? "Sélectionnez votre ville" : "Sélectionnez d'abord une wilaya"} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ecole">École / Établissement</Label>
        <Input
          id="ecole"
          value={ecole}
          onChange={(e) => onEcoleChange(e.target.value)}
          placeholder="Nom de votre école ou établissement"
        />
      </div>
    </div>
  );
};

export default LocationFields;
