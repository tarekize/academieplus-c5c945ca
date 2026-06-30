import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Loader2 } from "lucide-react";

import TeacherHome, { TeacherSection } from "@/components/teacher/TeacherHome";
import EstablishmentManager from "@/components/teacher/EstablishmentManager";
import TeacherContentSpace from "@/components/teacher/TeacherContentSpace";
import TeacherReclamationPanel from "@/components/teacher/TeacherReclamationPanel";
import TeacherProfile from "@/components/teacher/TeacherProfile";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [section, setSection] = useState<TeacherSection | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              onClick={() => setSection(null)}
            >
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold hidden sm:block">Espace Enseignant</span>
            </button>
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
      </header>

      <main className="container mx-auto px-4 pt-20 pb-12">
        {section === null && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-5 text-primary-foreground shadow-[var(--shadow-elegant)]">
              <p className="text-primary-foreground/70 text-sm font-medium">Espace Enseignant</p>
              <h1 className="text-2xl font-bold mt-0.5">Bienvenue dans votre espace</h1>
              <p className="text-primary-foreground/70 text-sm mt-1">Que souhaitez-vous faire aujourd'hui ?</p>
            </div>
            <TeacherHome onSelect={setSection} />
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
