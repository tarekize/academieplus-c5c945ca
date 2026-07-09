import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** Small FR/AR pill toggle. Default is Arabic; clicking FR switches the whole
 * app (and RTL/LTR direction) to French, persisted in localStorage. */
export function LanguageToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("fr") ? "fr" : "ar";

  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5", className)}>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("ar")}
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold transition-all",
          current === "ar" ? "bg-[image:var(--gradient-primary)] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        AR
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("fr")}
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold transition-all",
          current === "fr" ? "bg-[image:var(--gradient-primary)] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        FR
      </button>
    </div>
  );
}
