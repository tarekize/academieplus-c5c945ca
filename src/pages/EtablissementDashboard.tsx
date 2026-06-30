import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "react-qr-code";
import {
  GraduationCap,
  LogOut,
  Loader2,
  Users,
  School,
  BookOpen,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  classes: ClassInfo[];
}

interface ClassInfo {
  id: string;
  name: string;
  school_level: string | null;
  subject: string | null;
  student_count: number;
}

interface Reclamation {
  id: string;
  user_id: string;
  user_role: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  created_at: string;
  resolved_at: string | null;
  profile?: { first_name: string | null; last_name: string | null; email: string | null };
}

const EtablissementDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingRec, setLoadingRec] = useState(true);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [establishmentCode, setEstablishmentCode] = useState<string | null>(null);
  const [establishmentName, setEstablishmentName] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchEstablishment();
    fetchTeachers();
    fetchReclamations();
  }, [user]);

  const fetchEstablishment = async () => {
    try {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("establishment_code, first_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (data) {
        setEstablishmentCode(data.establishment_code ?? null);
        setEstablishmentName(data.first_name ?? "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = async () => {
    if (!establishmentCode) return;
    try {
      await navigator.clipboard.writeText(establishmentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      // Only teachers linked to THIS establishment (via the establishment code they used at sign-up)
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("establishment_id", user!.id);

      if (!profiles || profiles.length === 0) {
        setTeachers([]);
        setLoadingTeachers(false);
        return;
      }

      const teacherIds = profiles.map((p: any) => p.id);

      // Get classes for these teachers
      const { data: classes } = await (supabase as any)
        .from("classes")
        .select("id, name, school_level, subject, teacher_id")
        .in("teacher_id", teacherIds);

      // Get student counts per class
      const classIds = (classes || []).map((c: any) => c.id);
      let studentCounts: Record<string, number> = {};
      if (classIds.length > 0) {
        const { data: csRows } = await (supabase as any)
          .from("class_students")
          .select("class_id")
          .in("class_id", classIds);

        (csRows || []).forEach((row: any) => {
          studentCounts[row.class_id] = (studentCounts[row.class_id] || 0) + 1;
        });
      }

      const teacherList: Teacher[] = (profiles || []).map((p: any) => ({
        ...p,
        classes: (classes || [])
          .filter((c: any) => c.teacher_id === p.id)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            school_level: c.school_level,
            subject: c.subject,
            student_count: studentCounts[c.id] || 0,
          })),
      }));

      setTeachers(teacherList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchReclamations = async () => {
    setLoadingRec(true);
    try {
      const { data } = await (supabase as any)
        .from("reclamations")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch profiles for each reclamation user
        const userIds = [...new Set((data as any[]).map((r) => r.user_id))];
        const { data: profiles } = await (supabase as any)
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        const profileMap: Record<string, any> = {};
        (profiles || []).forEach((p: any) => (profileMap[p.id] = p));

        setReclamations(
          (data as any[]).map((r) => ({ ...r, profile: profileMap[r.user_id] }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleRespond = async (reclamationId: string) => {
    const text = responseText[reclamationId]?.trim();
    if (!text) return;

    setRespondingId(reclamationId);
    try {
      const { error } = await (supabase as any)
        .from("reclamations")
        .update({
          response: text,
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reclamationId);

      if (error) throw error;

      toast({ title: "Réponse envoyée", description: "La réclamation a été marquée comme résolue." });
      setResponseText((prev) => ({ ...prev, [reclamationId]: "" }));
      fetchReclamations();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setRespondingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getFullName = (p: { first_name: string | null; last_name: string | null } | undefined) => {
    if (!p) return "Utilisateur inconnu";
    return [p.first_name, p.last_name].filter(Boolean).join(" ") || "Utilisateur";
  };

  const statusBadge = (status: string) => {
    if (status === "resolved")
      return <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle className="h-3 w-3" />Résolu</Badge>;
    if (status === "rejected")
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeté</Badge>;
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
  };

  const pendingCount = reclamations.filter((r) => r.status === "pending").length;
  const totalStudents = teachers.reduce((sum, t) => sum + t.classes.reduce((s, c) => s + c.student_count, 0), 0);
  const totalClasses = teachers.reduce((sum, t) => sum + t.classes.length, 0);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold hidden sm:block">Espace Établissement</span>
            </div>
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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome banner */}
          <div className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-5 text-primary-foreground shadow-[var(--shadow-elegant)]">
            <p className="text-primary-foreground/70 text-sm font-medium">Espace Établissement</p>
            <h1 className="text-2xl font-bold mt-0.5">Tableau de bord</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Suivi des enseignants, classes et réclamations</p>
          </div>

          {/* Establishment code & QR — shared with teachers so they can register */}
          <Card className="rounded-2xl border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-5 w-5 text-primary" />
                Code d'inscription enseignant
              </CardTitle>
            </CardHeader>
            <CardContent>
              {establishmentCode ? (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="bg-white p-3 rounded-xl border border-border/50 flex-shrink-0">
                    <QRCode value={establishmentCode} size={120} />
                  </div>
                  <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                    <p className="text-sm text-muted-foreground">
                      Communiquez ce code (ou le QR code) à vos enseignants. Ils doivent le saisir lors de
                      la création de leur compte « Enseignant » — sans ce code, le compte ne peut pas être créé.
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="font-mono text-2xl font-bold tracking-[0.3em] bg-muted px-4 py-2 rounded-xl">
                        {establishmentCode}
                      </span>
                      <Button variant="outline" size="icon" className="rounded-xl" onClick={copyCode}>
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  Aucun code d'établissement n'est encore disponible pour ce compte.
                </p>
              )}
            </CardContent>
          </Card>


          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                  <p className="text-xs text-muted-foreground">Enseignants</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <School className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                  <p className="text-xs text-muted-foreground">Classes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Élèves</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Réclamations en attente</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="teachers">
            <TabsList className="rounded-xl">
              <TabsTrigger value="teachers" className="rounded-lg">Enseignants & Classes</TabsTrigger>
              <TabsTrigger value="reclamations" className="rounded-lg gap-2">
                Réclamations
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Teachers tab */}
            <TabsContent value="teachers" className="mt-4">
              {loadingTeachers ? (
                <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
              ) : teachers.length === 0 ? (
                <Card className="rounded-2xl border-border/50">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucun enseignant enregistré.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {teachers.map((teacher) => (
                    <Card key={teacher.id} className="rounded-2xl border-border/50 overflow-hidden">
                      <button
                        className="w-full text-left"
                        onClick={() => setExpandedTeacher(expandedTeacher === teacher.id ? null : teacher.id)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold">{getFullName(teacher)}</p>
                              <p className="text-xs text-muted-foreground">{teacher.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{teacher.classes.length} classe{teacher.classes.length !== 1 ? "s" : ""}</Badge>
                            {expandedTeacher === teacher.id ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardContent>
                      </button>

                      {expandedTeacher === teacher.id && (
                        <div className="border-t border-border/50 bg-muted/30 p-4">
                          {teacher.classes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">Aucune classe créée.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {teacher.classes.map((cls) => (
                                <div key={cls.id} className="bg-card rounded-xl border border-border/50 p-3">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="font-medium text-sm">{cls.name}</p>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                      {cls.student_count} élève{cls.student_count !== 1 ? "s" : ""}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-2 flex-wrap mt-1">
                                    {cls.school_level && (
                                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cls.school_level}</span>
                                    )}
                                    {cls.subject && (
                                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cls.subject}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reclamations tab */}
            <TabsContent value="reclamations" className="mt-4">
              {loadingRec ? (
                <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
              ) : reclamations.length === 0 ? (
                <Card className="rounded-2xl border-border/50">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucune réclamation reçue.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reclamations.map((rec) => (
                    <Card key={rec.id} className="rounded-2xl border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold">{getFullName(rec.profile)}</p>
                            <p className="text-xs text-muted-foreground">
                              {rec.user_role === "teacher" ? "Enseignant" : "Élève"} •{" "}
                              {new Date(rec.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric", month: "long", year: "numeric",
                              })}
                            </p>
                          </div>
                          {statusBadge(rec.status)}
                        </div>

                        <p className="text-sm font-medium text-primary mb-1">{rec.subject}</p>
                        <p className="text-sm text-muted-foreground mb-3">{rec.message}</p>

                        {rec.response && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                            <p className="text-xs font-medium text-green-700 mb-1">Votre réponse :</p>
                            <p className="text-sm text-green-800">{rec.response}</p>
                          </div>
                        )}

                        {rec.status === "pending" && (
                          <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                            <Textarea
                              placeholder="Répondre à cette réclamation..."
                              value={responseText[rec.id] || ""}
                              onChange={(e) =>
                                setResponseText((prev) => ({ ...prev, [rec.id]: e.target.value }))
                              }
                              className="rounded-xl min-h-[80px] resize-none text-sm"
                              disabled={respondingId === rec.id}
                            />
                            <Button
                              size="sm"
                              className="rounded-xl gap-2"
                              onClick={() => handleRespond(rec.id)}
                              disabled={respondingId === rec.id || !responseText[rec.id]?.trim()}
                            >
                              {respondingId === rec.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              Répondre & résoudre
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default EtablissementDashboard;
