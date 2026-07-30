import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User as UserIcon, BarChart3, Users, ArrowLeft, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

interface HeaderProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
}

const getSchoolLevelName = (level: string) => {
  const levels: Record<string, string> = {
    cp: "CP", ce1: "CE1", ce2: "CE2", cm1: "CM1", cm2: "CM2",
    sixieme: "6ème", cinquieme: "5ème", quatrieme: "4ème", troisieme: "3ème",
    "6eme": "6ème", "5eme": "5ème", "4eme": "4ème", "3eme": "3ème",
    "5eme_primaire": "5ème Primaire", "1ere_cem": "1ère CEM", "2eme_cem": "2ème CEM",
    "3eme_cem": "3ème CEM", "4eme_cem": "4ème CEM",
    seconde: "Seconde", premiere: "Première", terminale: "Terminale",
  };
  return levels[level] || level;
};

interface AppHeaderProps {
  /** Titre de section (ex: "Espace Enseignant"). Si omis, affiche le nom de marque. */
  title?: string;
  /** Icône affichée dans le badge logo à la place du logo de marque par défaut. */
  titleIcon?: LucideIcon;
  /** Sous-titre optionnel affiché sous le titre (masqué sur mobile). */
  subtitle?: string;
  /** Affiche un bouton "Retour" avant le logo quand fourni. */
  onBack?: () => void;
  backLabel?: string;
  /** Override du comportement de clic sur le logo (par défaut, navigation basée sur le rôle). */
  onLogoClick?: () => void;
  /** Menu déroulant avatar+compte (utilisé sur les pages "élève"). Défaut : true. */
  showProfileMenu?: boolean;
  /** Bouton de déconnexion autonome (masqué si showProfileMenu, qui l'inclut déjà). Défaut : true. */
  showLogout?: boolean;
  /** Contenu additionnel affiché à droite, avant le LanguageToggle. */
  actions?: React.ReactNode;
}

/** Barre d'en-tête générique partagée par toutes les pages "app" (élève, parent,
 * enseignant, établissement, pédagogue) : logo, titre de section optionnel,
 * actions à droite, LanguageToggle, bouton déconnexion. */
export function AppHeader({
  title,
  titleIcon: TitleIcon,
  subtitle,
  onBack,
  backLabel,
  onLogoClick,
  showProfileMenu = true,
  showLogout = true,
  actions,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [isParent, setIsParent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPedago, setIsPedago] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url, school_level")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
    hasRole("parent").then(setIsParent);
    hasRole("admin").then(setIsAdmin);
    hasRole("pedago").then(setIsPedago);
  }, [user, hasRole]);

  const fullName = (() => {
    const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  })();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (onLogoClick) { onLogoClick(); return; }
    navigate(isAdmin || isPedago ? "/dashboard" : isParent ? "/parent-dashboard" : "/liste-matieres");
  };

  const LogoIcon = TitleIcon ?? GraduationCap;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 rounded-xl shrink-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="h-4 w-4" /> {backLabel ?? t("app.back")}
              </Button>
            )}
            <div
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 active:scale-95 transition-transform min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleLogoClick(); }}
            >
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm shrink-0">
                <LogoIcon className="h-5 w-5 text-white" />
              </div>
              {title ? (
                <span className="min-w-0 hidden sm:flex flex-col leading-tight">
                  <span className="font-semibold text-foreground truncate">{title}</span>
                  {subtitle && <span className="text-xs text-muted-foreground truncate">{subtitle}</span>}
                </span>
              ) : (
                <span className="font-display text-lg font-extrabold text-foreground hidden sm:block">{t("app.brand")}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {actions}
            <LanguageToggle />
            {showProfileMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 cursor-pointer hover:bg-muted rounded-xl px-2 py-1.5 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-start hidden md:block">
                      <p className="text-sm font-semibold leading-tight">{fullName}</p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {isAdmin ? t("app.administrator") : isPedago ? t("app.pedagogue") : profile?.school_level && getSchoolLevelName(profile.school_level)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-border/50">
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="rounded-lg cursor-pointer">
                      <Users className="me-2 h-4 w-4" />
                      <span>{t("dashboard.userManagement")}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/account")} className="rounded-lg cursor-pointer">
                    <UserIcon className="me-2 h-4 w-4" />
                    <span>{t("app.manageAccount")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(isParent ? "/parent-dashboard" : "/dashboard")} className="rounded-lg cursor-pointer">
                    <BarChart3 className="me-2 h-4 w-4" />
                    <span>{t("app.dashboard")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-lg cursor-pointer">
                    <LogOut className="me-2 h-4 w-4" />
                    <span>{t("app.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showLogout && !showProfileMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 rounded-xl text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("app.logout")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
