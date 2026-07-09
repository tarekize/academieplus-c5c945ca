import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, LogOut, User as UserIcon, BarChart3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "@/components/LanguageToggle";

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

/** Shared top navigation bar: logo on the left, avatar/name/menu on the right. Used across all student-facing pages. */
export function AppHeader() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [isParent, setIsParent] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url, school_level")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
    hasRole("parent").then(setIsParent);
  }, [user, hasRole]);

  const fullName = (() => {
    const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  })();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(isParent ? "/parent-dashboard" : "/liste-cours")}
          >
            <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:block">AcadémiePlus</span>
          </div>

          <div className="flex items-center gap-2">
          <LanguageToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 cursor-pointer hover:bg-muted rounded-xl px-2 py-1.5 transition-colors">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold leading-tight">{fullName}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {profile?.school_level && getSchoolLevelName(profile.school_level)}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-border/50">
              <DropdownMenuItem onClick={() => navigate("/account")} className="rounded-lg cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Gérer mon compte</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(isParent ? "/parent-dashboard" : "/dashboard")} className="rounded-lg cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-lg cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
