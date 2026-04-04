import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getWilayaNames, getCitiesByWilaya } from "@/data/algeriaData";

interface LocationFieldsProps {
  wilaya: string;
  ville: string;
  ecole: string;
  onWilayaChange: (value: string) => void;
  onVilleChange: (value: string) => void;
  onEcoleChange: (value: string) => void;
  className?: string;
  hideEcole?: boolean;
}

const LocationFields = ({
  wilaya,
  ville,
  ecole,
  onWilayaChange,
  onVilleChange,
  onEcoleChange,
  className = "",
  hideEcole = false,
}: LocationFieldsProps) => {
  const wilayas = getWilayaNames();
  const cities = wilaya ? getCitiesByWilaya(wilaya) : [];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Sync search with current value when opening
  useEffect(() => {
    if (open) {
      setSearch(ville);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>Wilaya</Label>
        <Select value={wilaya} onValueChange={(val) => {
          onWilayaChange(val);
          onVilleChange("");
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="SÃ©lectionnez votre wilaya" />
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={!wilaya}
              className="w-full justify-between font-normal"
            >
              {ville || (wilaya ? "SÃ©lectionnez ou saisissez votre ville" : "SÃ©lectionnez d'abord une wilaya")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="p-2">
              <Input
                ref={inputRef}
                placeholder="Rechercher ou saisir une ville..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onVilleChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onVilleChange(search);
                    setOpen(false);
                  }
                }}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer",
                      ville === c && "bg-accent"
                    )}
                    onClick={() => {
                      onVilleChange(c);
                      setSearch(c);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("h-4 w-4", ville === c ? "opacity-100" : "opacity-0")} />
                    {c}
                  </button>
                ))
              ) : search ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Appuyez sur EntrÃ©e pour utiliser "{search}"
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {!hideEcole && (
        <div className="space-y-2">
          <Label htmlFor="ecole">Ã‰cole / Ã‰tablissement</Label>
          <Input
            id="ecole"
            value={ecole}
            onChange={(e) => onEcoleChange(e.target.value)}
            placeholder="Nom de votre Ã©cole ou Ã©tablissement"
          />
        </div>
      )}
    </div>
  );
};

export default LocationFields;
