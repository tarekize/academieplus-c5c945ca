import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Loader2 } from "lucide-react";
import { useTeacherEstablishmentStatus } from "@/hooks/useTeacherEstablishmentStatus";
import { AppHeader } from "@/components/layout/AppHeader";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";

import TeacherHome, { TeacherSection, TEACHER_SECTIONS } from "@/components/teacher/TeacherHome";
import EstablishmentManager from "@/components/teacher/EstablishmentManager";
import TeacherContentSpace from "@/components/teacher/TeacherContentSpace";
import TeacherReclamationPanel from "@/components/teacher/TeacherReclamationPanel";
import TeacherProfile from "@/components/teacher/TeacherProfile";

const SECTION_STORAGE_KEY = "teacherDashboard:section";

// L'onglet actif ne vivait qu'en mémoire (useState) : sur mobile en
// particulier, changer de fenêtre/appli peut faire décharger puis recharger
// l'onglet par le navigateur, ce qui remonte le composant et renvoie
// silencieusement l'enseignant au menu principal. On restaure donc la
// dernière section ouverte depuis sessionStorage au montage.
const readStoredSection = (): TeacherSection | null => {
  try {
    const stored = sessionStorage.getItem(SECTION_STORAGE_KEY);
    return TEACHER_SECTIONS.some((s) => s.key === stored) ? (stored as TeacherSection) : null;
  } catch {
    return null;
  }
};

interface TeacherProfileHeaderInfo {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

// Tableau de bord enseignant : coquille de navigation entre les sous-écrans
// (accueil, établissement, contenu, réclamations, profil). Redirige vers
// /auth si aucun utilisateur n'est connecté.
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [section, setSectionState] = useState<TeacherSection | null>(readStoredSection);
  const { hasEstablishment } = useTeacherEstablishmentStatus(user?.id);
  const [profile, setProfile] = useState<TeacherProfileHeaderInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Enseignant";

  // Change la section active et la persiste dans sessionStorage (voir
  // readStoredSection ci-dessus) pour survivre à un remount du composant.
  const setSection = (next: TeacherSection | null) => {
    setSectionState(next);
    try {
      if (next) sessionStorage.setItem(SECTION_STORAGE_KEY, next);
      else sessionStorage.removeItem(SECTION_STORAGE_KEY);
    } catch {
      // Stockage indisponible (navigation privée, quota...) : la session ne
      // survivra pas à un remount, mais la navigation reste fonctionnelle.
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const activeMeta = TEACHER_SECTIONS.find((s) => s.key === section);

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Espace Enseignant"
        subtitle={activeMeta?.label}
        onLogoClick={() => setSection(null)}
        showProfileMenu={false}
        actions={
          <button
            type="button"
            onClick={() => setSection("profil")}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-muted active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-start hidden md:block">
              <p className="text-sm font-semibold leading-tight">{fullName}</p>
              <p className="text-xs text-muted-foreground leading-tight">Enseignant</p>
            </div>
          </button>
        }
      />

      <main className="container mx-auto px-4 pt-6 pb-12">
        {section === null && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <WelcomeBanner
              eyebrow="Espace Enseignant"
              title="Bienvenue dans votre espace"
              subtitle="Que souhaitez-vous faire aujourd'hui ?"
            />
            <TeacherHome onSelect={setSection} hasEstablishment={hasEstablishment !== false} />
          </div>
        )}

        {section === "establishment" && (
          <EstablishmentManager teacherId={user.id} onBack={() => setSection(null)} />
        )}

        {(section === "exercise" || section === "quiz" || section === "exam") && (
          <TeacherContentSpace teacherId={user.id} contentType={section} onBack={() => setSection(null)} />
        )}

        {section === "reclamation" && (
          <TeacherReclamationPanel onBack={() => setSection(null)} />
        )}

        {section === "profil" && (
          <TeacherProfile onBack={() => setSection(null)} />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
