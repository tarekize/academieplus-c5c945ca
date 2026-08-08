import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import { useTeacherEstablishmentStatus } from "@/hooks/useTeacherEstablishmentStatus";
import { AppShell, type AppShellNavItem } from "@/components/layout/AppShell";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";

import TeacherHome, { TeacherSection, TEACHER_SECTIONS, REQUIRES_ESTABLISHMENT } from "@/components/teacher/TeacherHome";
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

  const initials = (fullName.match(/\S+/g) ?? []).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

  const selectSection = (next: TeacherSection) => {
    if (hasEstablishment === false && REQUIRES_ESTABLISHMENT.includes(next)) {
      toast.error("Ajoutez d'abord un établissement pour accéder à cette fonctionnalité.");
      return;
    }
    setSection(next);
  };

  const navItems: AppShellNavItem[] = [
    { label: "Tableau de bord", icon: Home, active: section === null, onClick: () => setSection(null) },
    ...TEACHER_SECTIONS.map((s) => ({
      label: s.label,
      icon: s.icon,
      active: section === s.key,
      onClick: () => selectSection(s.key),
    })),
  ];

  return (
    <AppShell role="teacher" navItems={navItems} userName={fullName} initials={initials}>
      <div className="p-[26px]">
        {section === null && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <WelcomeBanner
              role="teacher"
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
      </div>
    </AppShell>
  );
};

export default TeacherDashboard;
