import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Loader2 } from "lucide-react";
import { useNavigate as _ } from "react-router-dom";
import TeacherHome, { TeacherSection } from "@/components/teacher/TeacherHome";
import EstablishmentManager from "@/components/teacher/EstablishmentManager";
import TeacherContentSpace from "@/components/teacher/TeacherContentSpace";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button className="flex items-center gap-2" onClick={() => setSection(null)}>
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">Espace Enseignant</span>
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        {section === null && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Bienvenue dans votre espace</h1>
              <p className="text-muted-foreground">Que souhaitez-vous faire aujourd'hui ?</p>
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
      </main>
    </div>
  );
};

export default TeacherDashboard;
