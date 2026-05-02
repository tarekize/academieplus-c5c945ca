import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface MathKeyboardProps {
  onInsert: (text: string) => void;
  className?: string;
}

const SYMBOL_GROUPS: { label: string; symbols: { display: string; insert: string; title?: string }[] }[] = [
  {
    label: "أساسيات",
    symbols: [
      { display: "+", insert: "+" },
      { display: "−", insert: "-" },
      { display: "×", insert: "×" },
      { display: "÷", insert: "÷" },
      { display: "=", insert: "=" },
      { display: "≠", insert: "≠" },
      { display: "≈", insert: "≈" },
      { display: "±", insert: "±" },
      { display: "<", insert: "<" },
      { display: ">", insert: ">" },
      { display: "≤", insert: "≤" },
      { display: "≥", insert: "≥" },
      { display: "(", insert: "(" },
      { display: ")", insert: ")" },
      { display: "[", insert: "[" },
      { display: "]", insert: "]" },
    ],
  },
  {
    label: "قوى وجذور",
    symbols: [
      { display: "x²", insert: "²" },
      { display: "x³", insert: "³" },
      { display: "xⁿ", insert: "^n" },
      { display: "√", insert: "√" },
      { display: "∛", insert: "∛" },
      { display: "x⁻¹", insert: "⁻¹" },
      { display: "a/b", insert: "/" },
      { display: "·", insert: "·" },
      { display: "⁰", insert: "⁰" },
      { display: "¹", insert: "¹" },
      { display: "²", insert: "²" },
      { display: "³", insert: "³" },
      { display: "⁴", insert: "⁴" },
      { display: "⁵", insert: "⁵" },
      { display: "₀", insert: "₀" },
      { display: "₁", insert: "₁" },
      { display: "₂", insert: "₂" },
      { display: "ₙ", insert: "ₙ" },
    ],
  },
  {
    label: "تحليل",
    symbols: [
      { display: "∞", insert: "∞" },
      { display: "lim", insert: "lim " },
      { display: "→", insert: "→" },
      { display: "∫", insert: "∫" },
      { display: "∑", insert: "∑" },
      { display: "∏", insert: "∏" },
      { display: "∂", insert: "∂" },
      { display: "f(x)", insert: "f(x)" },
      { display: "f'", insert: "f'" },
      { display: "ln", insert: "ln(" },
      { display: "log", insert: "log(" },
      { display: "eˣ", insert: "eˣ" },
      { display: "e", insert: "e" },
      { display: "π", insert: "π" },
      { display: "sin", insert: "sin(" },
      { display: "cos", insert: "cos(" },
      { display: "tan", insert: "tan(" },
    ],
  },
  {
    label: "مجموعات",
    symbols: [
      { display: "ℝ", insert: "ℝ" },
      { display: "ℕ", insert: "ℕ" },
      { display: "ℤ", insert: "ℤ" },
      { display: "ℚ", insert: "ℚ" },
      { display: "ℂ", insert: "ℂ" },
      { display: "∈", insert: "∈" },
      { display: "∉", insert: "∉" },
      { display: "⊂", insert: "⊂" },
      { display: "⊆", insert: "⊆" },
      { display: "∪", insert: "∪" },
      { display: "∩", insert: "∩" },
      { display: "∅", insert: "∅" },
      { display: "∀", insert: "∀" },
      { display: "∃", insert: "∃" },
    ],
  },
  {
    label: "يونانية",
    symbols: [
      { display: "α", insert: "α" },
      { display: "β", insert: "β" },
      { display: "γ", insert: "γ" },
      { display: "δ", insert: "δ" },
      { display: "ε", insert: "ε" },
      { display: "θ", insert: "θ" },
      { display: "λ", insert: "λ" },
      { display: "μ", insert: "μ" },
      { display: "π", insert: "π" },
      { display: "ρ", insert: "ρ" },
      { display: "σ", insert: "σ" },
      { display: "φ", insert: "φ" },
      { display: "ω", insert: "ω" },
      { display: "Δ", insert: "Δ" },
      { display: "Σ", insert: "Σ" },
      { display: "Ω", insert: "Ω" },
    ],
  },
];

export function MathKeyboard({ onInsert, className }: MathKeyboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("gap-1 shrink-0", className)}
          title="لوحة الرموز الرياضية"
        >
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">رموز</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[320px] p-2"
        dir="ltr"
      >
        <div className="flex flex-wrap gap-1 mb-2 border-b pb-2">
          {SYMBOL_GROUPS.map((group, idx) => (
            <Button
              key={group.label}
              type="button"
              size="sm"
              variant={activeTab === idx ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setActiveTab(idx)}
            >
              {group.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-1">
          {SYMBOL_GROUPS[activeTab].symbols.map((sym, i) => (
            <Button
              key={i}
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 w-full px-0 text-base font-serif hover:bg-primary/10"
              onClick={() => onInsert(sym.insert)}
              title={sym.title || sym.insert}
            >
              {sym.display}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
