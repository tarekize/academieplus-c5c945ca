import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/** Small FR/AR pill toggle. Default is Arabic; clicking FR switches the whole
 * app (and RTL/LTR direction) to French, persisted in localStorage. Masqué
 * pour les élèves : leur espace est arabe uniquement (voir le verrouillage
 * de langue dans AuthContext.tsx) — leur montrer un bouton FR qui ne doit
 * jamais rester actif serait trompeur. */
export function LanguageToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const { roles } = useAuth();
  const current = i18n.language?.startsWith("fr") ? "fr" : "ar";

  if (roles.includes('student')) return null;

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
