import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Search,
  BookOpen,
  Calculator,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/layout/AppHeader";
import StudentAnnouncementsBanner from "@/components/dashboard/StudentAnnouncementsBanner";
import StudentAssignedContent from "@/components/dashboard/StudentAssignedContent";
import { SUBJECTS, type SubjectDef } from "@/lib/subjects";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  email: string | null;
}

interface Subject {
  id: string;
  name: string;
  icon: any;
  color: string;
  available: boolean;
}

interface SchoolLevel {
  id: string;
  name: string;
  color: string;
}

// Only Mathematics is available for students currently
const staticSubjects: Subject[] = [
  { id: "math", name: "Mathématiques", icon: Calculator, color: "#3B82F6", available: true },
];

// School levels matching DB enum
const schoolLevels: SchoolLevel[] = [
  { id: "5eme_primaire", name: "5ème Primaire", color: "#8B5CF6" },
  { id: "1ere_cem", name: "1ère CEM", color: "#06B6D4" },
  { id: "2eme_cem", name: "2ème CEM", color: "#10B981" },
  { id: "3eme_cem", name: "3ème CEM", color: "#F59E0B" },
  { id: "4eme_cem", name: "4ème CEM", color: "#EF4444" },
  { id: "premiere", name: "Première", color: "#EC4899" },
  { id: "seconde", name: "Seconde", color: "#7C3AED" },
  { id: "terminale", name: "Terminale", color: "#D97706" },
];

// Levels that require filiere selection
const levelsWithFilieres = ["premiere", "seconde", "terminale"];

const ListeCours = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const subjectsList: Subject[] = staticSubjects.map((s) => (s.id === "math" ? { ...s, name: t("listeCours.math") } : s));
  const levelsList: SchoolLevel[] = schoolLevels.map((l) => ({ ...l, name: t(`app.schoolLevels.${l.id}`) }));
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPedago, setIsPedago] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(searchParams.get("niveau"));
  const [filieres, setFilieres] = useState<{ code: string; name: string; name_ar: string | null }[]>([]);
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectDef[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(searchParams.get("matiere"));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfileAndRole(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfileAndRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfileAndRole = async (userId: string) => {
    try {
      // Fetch profile and roles in parallel
      const [profileResult, adminResult, pedagoResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url, school_level, email")
          .eq("id", userId)
          .single(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "pedago")
          .maybeSingle(),
      ]);

      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);
      const admin = !!adminResult.data;
      const pedago = !!pedagoResult.data;
      setIsAdmin(admin);
      setIsPedago(pedago);

      if (admin) {
        // L'admin gère toutes les matières, pas besoin de requête.
        setAvailableSubjects(SUBJECTS);
        setSubjectsLoaded(true);
      } else if (pedago) {
        setLoadingSubjects(true);
        const { data, error } = await supabase
          .from("pedago_subjects" as any)
          .select("subject_id, subjects:subject_id(id, name, name_ar, icon)")
          .eq("user_id", userId);
        if (error) {
          console.error("Error fetching pedago subjects:", error);
        } else {
          const subjects: SubjectDef[] = (data || [])
            .map((row: any) => row.subjects)
            .filter(Boolean)
            .map((s: any) => ({ id: s.id, name: s.name, nameAr: s.name_ar, icon: s.icon }));
          setAvailableSubjects(subjects);
        }
        setLoadingSubjects(false);
        setSubjectsLoaded(true);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSchoolLevelName = (level: string) => {
    if (!level) return t("listeCours.yourClass");
    const key = `app.schoolLevels.${level}`;
    const translated = t(key);
    return translated === key ? level : translated;
  };

  // Sélection automatique de la matière quand le pédago (ou l'admin) n'en a
  // qu'une seule assignée — on ne montre l'écran de choix que s'il y en a
  // plusieurs, pour ne rien changer à l'expérience d'un pédago mono-matière.
  useEffect(() => {
    if (subjectsLoaded && !selectedSubject && availableSubjects.length === 1) {
      setSelectedSubject(availableSubjects[0].id);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("matiere", availableSubjects[0].id);
        return next;
      });
    }
  }, [subjectsLoaded, selectedSubject, availableSubjects, setSearchParams]);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("matiere", subjectId);
      return next;
    });
  };

  const handleLevelSelect = async (levelId: string) => {
    if ((isAdmin || isPedago) && levelsWithFilieres.includes(levelId)) {
      // Show filiere selection for premiere/seconde/terminale
      setSelectedLevel(levelId);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("niveau", levelId);
        return next;
      });
      setLoadingFilieres(true);
      try {
        const { data } = await supabase
          .from("filieres")
          .select("code, name, name_ar")
          .eq("school_level", levelId as any)
          .order("name");
        setFilieres(data || []);
      } catch (error) {
        console.error("Error fetching filieres:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les filières. Réessayez.",
          variant: "destructive",
        });
      } finally {
        setLoadingFilieres(false);
      }
    } else if (isAdmin || isPedago) {
      // No filiere needed, go directly to course
      navigate(`/cours/${selectedSubject || "math"}?niveau=${levelId}`);
    } else {
      setSelectedLevel(levelId);
      setSearchParams({ niveau: levelId });
    }
  };

  const handleFiliereSelect = (filiereCode: string) => {
    if (selectedLevel) {
      navigate(`/cours/${selectedSubject || "math"}?niveau=${selectedLevel}&filiere=${filiereCode}`);
    }
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setFilieres([]);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("niveau");
      return next;
    });
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedLevel(null);
    setFilieres([]);
    setSearchParams({});
  };

  const filteredSubjects = subjectsList.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLevels = levelsList.filter((level) =>
    level.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-redirect students directly to math course (only subject available)
  useEffect(() => {
    if (!loading && profile && !isAdmin && !isPedago) {
      navigate("/cours/math", { replace: true });
    }
  }, [loading, profile, isAdmin, isPedago, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // Admin/Pédago view - Subject selection (only shown when more than one
  // matière est disponible ; un pédago mono-matière passe directement au
  // choix du niveau, comme avant cette fonctionnalité).
  if ((isAdmin || isPedago) && !selectedSubject) {
    if (!subjectsLoaded || loadingSubjects) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      );
    }

    if (availableSubjects.length === 0) {
      return (
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container mx-auto px-4 py-16 text-center">
            <p className="text-xl text-muted-foreground">
              Aucune matière ne vous a été assignée. Contactez l'administrateur.
            </p>
          </main>
        </div>
      );
    }

    if (availableSubjects.length > 1) {
      return (
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-8 text-center text-primary-foreground shadow-[var(--shadow-elegant)] mb-8 animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Choisissez une matière</h1>
                <p className="text-primary-foreground/75 text-base">
                  Sélectionnez la matière dont vous voulez gérer le contenu.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {availableSubjects.map((subject, index) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => handleSubjectSelect(subject.id)}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)] hover:border-primary/40 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center text-center gap-3 p-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-primary/10 shadow-md transition-transform group-hover:scale-110">
                        {subject.icon}
                      </div>
                      <h3 className="font-display font-bold text-base leading-tight">{subject.name}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Exactement une matière : l'effet ci-dessus va la sélectionner
    // automatiquement au prochain rendu (bref écran de chargement).
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  // Admin/Pédago view - Level Selection
  if ((isAdmin || isPedago) && !selectedLevel) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="mb-10 animate-fade-in">
              {availableSubjects.length > 1 && (
                <Button variant="ghost" size="sm" className="mb-4 gap-2 rounded-xl" onClick={handleBackToSubjects}>
                  <ArrowLeft className="h-4 w-4" />
                  Changer de matière
                </Button>
              )}
              <div className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-8 text-center text-primary-foreground shadow-[var(--shadow-elegant)] mb-7">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                  {t("listeCours.pedagogicalContentByLevel")}
                </h1>
                <p className="text-primary-foreground/75 text-base">
                  {t("listeCours.selectLevelToSeeCourses")}
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("listeCours.searchLevel")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 rounded-xl bg-card border-border/50 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* School Levels Grid */}
            {filteredLevels.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {t("listeCours.schoolLevelsTitle")}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {filteredLevels.map((level, index) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleLevelSelect(level.id)}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)] hover:border-primary/40 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="h-1.5 w-full" style={{ backgroundColor: level.color }} />
                      <div className="flex flex-col items-center text-center gap-3 p-6">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                          style={{ backgroundColor: level.color }}
                        >
                          <GraduationCap className="h-7 w-7" />
                        </div>
                        <h3 className="font-display font-bold text-base leading-tight">{level.name}</h3>
                      </div>
                    </button>
                  ))}
                </div>

              </section>
            )}

            {/* No Results */}
            {filteredLevels.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">{t("app.noResultsFor", { query: searchQuery })}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Admin/Pédago view - Filiere selection for selected level
  if ((isAdmin || isPedago) && selectedLevel) {
    const levelName = levelsList.find(l => l.id === selectedLevel)?.name || selectedLevel;
    const levelColor = schoolLevels.find(l => l.id === selectedLevel)?.color || "#8B5CF6";

    return (
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Button variant="ghost" size="sm" className="mb-5 gap-2 rounded-xl" onClick={handleBackToLevels}>
              <ArrowLeft className="h-4 w-4" />
              {t("listeCours.backToLevels")}
            </Button>

            <div className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-7 text-center text-primary-foreground shadow-[var(--shadow-elegant)] mb-8 animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
                {t("listeCours.chooseAFiliere", { level: levelName })}
              </h1>
              <p className="text-primary-foreground/75 text-sm">
                {t("listeCours.selectFiliereToSeeCourses")}
              </p>
            </div>

            {loadingFilieres ? (
              <div className="flex justify-center py-16">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filieres.map((filiere, index) => (
                  <button
                    key={filiere.code}
                    type="button"
                    onClick={() => handleFiliereSelect(filiere.code)}
                    className="group bg-card rounded-2xl border border-border/50 p-6 text-left hover:shadow-lg hover:border-primary/30 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: levelColor }}
                      >
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{filiere.name}</h3>
                        {filiere.name_ar && (
                          <p className="text-muted-foreground text-sm mt-0.5" dir="rtl">{filiere.name_ar}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loadingFilieres && filieres.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">{t("listeCours.noFiliereForLevel")}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Student/Parent view - Original behavior
  return (
    <div className="min-h-screen student-shell">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl font-black mb-4 bg-[image:var(--gradient-violet)] bg-clip-text text-transparent">
              {t("listeCours.subjectsOf", { level: profile?.school_level ? getSchoolLevelName(profile.school_level) : t("listeCours.yourClass") })}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("listeCours.discoverSubjects")}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("listeCours.searchSubject")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-card pl-12 h-14 text-lg border-0 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          {user?.id && (
            <div className="mb-8">
              <StudentAnnouncementsBanner userId={user.id} />
              <StudentAssignedContent userId={user.id} />
            </div>
          )}

          {/* All Subjects */}
          {filteredSubjects.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {t("listeCours.allSubjects")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredSubjects.map((subject, index) => {
                  const Icon = subject.icon;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      disabled={!subject.available}
                      onClick={() => subject.available && navigate(`/cours/${subject.id}`)}
                      className={`group relative overflow-hidden glass-card text-left transition-all duration-300 animate-pop-in ${subject.available
                        ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)]"
                        : "opacity-60 cursor-not-allowed"
                        }`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="h-1.5 w-full" style={{ backgroundColor: subject.color }} />
                      <div className="flex flex-col items-center text-center gap-3 p-6">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                          style={{ backgroundColor: subject.color }}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg leading-tight">{subject.name}</h3>
                          {!subject.available && (
                            <span className="text-xs text-muted-foreground">{t("listeCours.comingSoon")}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            </section>
          )}

          {/* No Results */}
          {filteredSubjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">{t("app.noResultsFor", { query: searchQuery })}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListeCours;
