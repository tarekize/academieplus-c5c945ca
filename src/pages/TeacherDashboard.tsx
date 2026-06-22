import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap, LogOut, ArrowLeft, Loader2, Users, BookOpen, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";
import CreateClassDialog from "@/components/teacher/CreateClassDialog";
import AddStudentToClassDialog from "@/components/teacher/AddStudentToClassDialog";
import ClassProgressView, { ClassRow } from "@/components/teacher/ClassProgressView";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";

interface DetailStudent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school_level: string | null;
  filiere?: string | null;
  avatar_url: string | null;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [detailStudent, setDetailStudent] = useState<DetailStudent | null>(null);

  const fetchClasses = useCallback(async (teacherId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, school_level, filiere, subject, join_code")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data as ClassRow[]) || [];
      setClasses(rows);

      // Student counts per class
      if (rows.length > 0) {
        const { data: members } = await supabase
          .from("class_students")
          .select("class_id")
          .in("class_id", rows.map((c) => c.id));
        const map: Record<string, number> = {};
        for (const m of (members as any[]) || []) {
          map[m.class_id] = (map[m.class_id] || 0) + 1;
        }
        setCounts(map);
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    fetchClasses(user.id);
  }, [user, authLoading, navigate, fetchClasses]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteClass = async (id: string) => {
    try {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Classe supprimée");
      if (user) fetchClasses(user.id);
    } catch (e: any) {
      toast.error("Impossible de supprimer la classe");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // --- Student detail view ---
  if (detailStudent) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" size="sm" onClick={() => setDetailStudent(null)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour à la classe
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 pt-24 pb-12">
          <StudentDashboardContent
            userId={detailStudent.id}
            profile={{
              first_name: detailStudent.first_name,
              last_name: detailStudent.last_name,
              avatar_url: detailStudent.avatar_url,
              school_level: detailStudent.school_level,
              filiere: detailStudent.filiere,
              email: detailStudent.email,
            }}
            parentView
            hideActions
          />
        </main>
      </div>
    );
  }

  // --- Class progression view ---
  if (selectedClass) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" size="sm" onClick={() => setSelectedClass(null)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Mes classes
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" /> {selectedClass.name}
              </h1>
              <p className="text-muted-foreground">
                {getSchoolLevelLabel(selectedClass.school_level || "")}
                {selectedClass.filiere ? ` · ${selectedClass.filiere}` : ""}
              </p>
            </div>
            {selectedClass.join_code && (
              <div className="rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Code de la classe</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold tracking-widest">{selectedClass.join_code}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedClass.join_code || "");
                      toast.success("Code copié");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Partagez-le pour que vos élèves rejoignent la classe.</p>
              </div>
            )}
          </div>
          <ClassProgressView
            key={JSON.stringify(selectedClass)}
            classRow={selectedClass}
            onOpenStudentDetail={(s) => setDetailStudent(s as DetailStudent)}
          />
        </main>
      </div>
    );
  }

  // --- Classes list view ---
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">Espace Enseignant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mes classes</h1>
            <p className="text-muted-foreground">Gérez vos classes et suivez la progression de vos élèves.</p>
          </div>
          {user && <CreateClassDialog teacherId={user.id} onCreated={() => fetchClasses(user.id)} />}
        </div>

        {classes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-3">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Aucune classe pour le moment</h3>
              <p className="text-muted-foreground">Créez votre première classe pour commencer.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteClass(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{getSchoolLevelLabel(c.school_level || "")}</Badge>
                    {c.filiere && <Badge variant="outline">{c.filiere}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" /> {counts[c.id] || 0} élève(s)
                  </div>
                  <Button className="w-full" onClick={() => setSelectedClass(c)}>
                    Voir la progression
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
