import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Loader2 } from "lucide-react";
import { useTeacherEstablishmentStatus } from "@/hooks/useTeacherEstablishmentStatus";

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

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [section, setSectionState] = useState<TeacherSection | null>(readStoredSection);
  const { hasEstablishment } = useTeacherEstablishmentStatus(user?.id);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity min-w-0"
              onClick={() => setSection(null)}
            >
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold hidden sm:flex items-center gap-1.5 min-w-0">
                <span>Espace Enseignant</span>
                {activeMeta && (
                  <>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-muted-foreground truncate">{activeMeta.label}</span>
                  </>
                )}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-12">
        {section === null && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-primary)] px-6 py-7 sm:px-8 sm:py-8 text-primary-foreground shadow-[var(--shadow-elegant)]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
              <div className="absolute right-6 bottom-0 h-20 w-20 rounded-full bg-white/10" aria-hidden />
              <div className="relative">
                <p className="text-primary-foreground/75 text-sm font-medium uppercase tracking-wide">Espace Enseignant</p>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">Bienvenue dans votre espace</h1>
                <p className="text-primary-foreground/80 text-sm mt-1.5">Que souhaitez-vous faire aujourd'hui ?</p>
              </div>
            </div>
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
