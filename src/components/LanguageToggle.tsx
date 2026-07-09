import { useTranslation } from "react-i18next";

/** Sélecteur de langue FR / AR réutilisable. L'arabe est la langue par défaut. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: "fr" | "ar") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`flex items-center gap-1 bg-secondary rounded-lg p-1 ${className}`}>
      <button
        onClick={() => changeLanguage("ar")}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
          i18n.language === "ar"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        AR
      </button>
      <button
        onClick={() => changeLanguage("fr")}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
          i18n.language === "fr"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        FR
      </button>
    </div>
  );
}

export default LanguageToggle;
