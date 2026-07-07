import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { SchoolLevelSelect } from "@/components/profile/SchoolLevelSelect";
import { LinkedChildrenSection } from "@/components/profile/LinkedChildrenSection";
import { LinkedParentsSection } from "@/components/profile/LinkedParentsSection";
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Phone, 
  Mail, 
  Loader2,
  Save,
  LogOut,
  Shield,
  Sparkles,
  Trophy,
  BookOpen,
  Calendar,
  Lock,
  Heart
} from "lucide-react";
import { getSchoolLevelLabel, getSchoolCategory } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, hasRole } = useAuth();
  const { profile, loading, saving, updateProfile, uploadAvatar } = useProfile();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setSchoolLevel(profile.school_level || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      const date = new Date(user.created_at);
      setMemberSince(date.toLocaleDateString("fr-FR", { year: 'numeric', month: 'long' }));
    }
  }, [user]);

  useEffect(() => {
    const checkRoles = async () => {
      const [studentResult, parentResult, adminResult] = await Promise.all([
        hasRole("student"),
        hasRole("parent"),
        hasRole("admin")
      ]);
      setIsStudent(studentResult);
      setIsParent(parentResult);
      setIsAdmin(adminResult);
    };
    if (user) {
      checkRoles();
    }
  }, [user, hasRole]);

  useEffect(() => {
    if (profile) {
      const changed = 
        firstName !== (profile.first_name || "") ||
        lastName !== (profile.last_name || "") ||
        phone !== (profile.phone || "") ||
        schoolLevel !== (profile.school_level || "");
      setHasChanges(changed);
    }
  }, [firstName, lastName, phone, schoolLevel, profile]);

  const handleSave = async () => {
    const updates: Record<string, unknown> = {
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
    };

    if (isStudent) {
      updates.school_level = schoolLevel || null;
    }

    const success = await updateProfile(updates as any);
    if (success) {
      setHasChanges(false);
    }
  };

  const getFullName = () => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Mon profil";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[image:var(--gradient-soft)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)] pb-16">
      {/* Premium Translucent Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-sky-100/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-sky-50/50 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 border-primary/20 hover:border-primary/50 text-primary rounded-xl"
                >
                  <Shield className="h-4 w-4" />
                  <span>Administration</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={signOut}
                className="flex items-center gap-2 text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-950 dark:hover:bg-rose-950/30 rounded-xl transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Visual Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="relative overflow-hidden border-sky-100/60 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl shadow-sky-100/20 dark:shadow-none rounded-3xl group">
              {/* Artistic Background Accent Glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/50 dark:bg-sky-900/20 rounded-full blur-2xl -mr-6 -mt-6 transition-all duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-peach-200/40 dark:bg-peach-900/10 rounded-full blur-2xl -ml-6 -mb-6 transition-all duration-500 group-hover:scale-110" />
              
              <CardContent className="pt-8 pb-6 text-center relative z-10">
                <div className="relative inline-block mb-4">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-sky-400 to-peach-400 rounded-full blur-sm opacity-65 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white dark:bg-slate-900 p-1 rounded-full">
                    <ProfilePhotoUpload
                      currentUrl={profile.avatar_url}
                      name={getFullName()}
                      onUpload={uploadAvatar}
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
                  {getFullName()}
                  <Sparkles className="h-5 w-5 text-peach-500 animate-pulse" />
                </h2>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {profile.email}
                </p>

                {isStudent && schoolLevel && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-sky-50 to-peach-50 dark:from-sky-950/30 dark:to-peach-950/20 text-sky-800 dark:text-sky-300 rounded-full text-xs font-semibold border border-sky-100/30">
                    <GraduationCap className="h-4 w-4" />
                    <span>{getSchoolLevelLabel(schoolLevel)} • {getSchoolCategory(schoolLevel)}</span>
                  </div>
                )}

                {isParent && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold">
                    <Heart className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>Compte Parent</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 rounded-full text-xs font-semibold">
                    <Shield className="h-4 w-4" />
                    <span>Administrateur</span>
                  </div>
                )}

                <div className="border-t border-sky-100/50 dark:border-slate-800/80 mt-6 pt-5 grid grid-cols-2 gap-4">
                  <div className="text-left p-3 rounded-2xl bg-sky-50/30 dark:bg-slate-800/20">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Membre depuis
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{memberSince || "Récemment"}</p>
                  </div>
                  <div className="text-left p-3 rounded-2xl bg-peach-50/30 dark:bg-slate-800/20">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-peach-500" /> Rang élève
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Bronze Élite</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Learning Style Feature Hint */}
            {isStudent && (
              <Card className="border-sky-100/40 bg-gradient-to-br from-sky-500/10 to-peach-500/10 p-5 rounded-3xl flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                  <BookOpen className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Suivi Adaptatif Actif</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Votre parcours d'apprentissage se règle intelligemment selon la précision et la rapidité de vos réponses.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Settings Form & Sub-sections */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList className="flex w-full p-1 bg-sky-50/60 dark:bg-slate-900/50 rounded-2xl border border-sky-100/30 dark:border-slate-800/30">
                <TabsTrigger 
                  value="info" 
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 text-sm"
                >
                  <User className="h-4 w-4" />
                  <span>Informations</span>
                </TabsTrigger>
                {isParent && (
                  <TabsTrigger 
                    value="children" 
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 text-sm"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>Mes enfants</span>
                  </TabsTrigger>
                )}
                {isStudent && (
                  <TabsTrigger 
                    value="parents" 
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 text-sm"
                  >
                    <User className="h-4 w-4" />
                    <span>Mes parents</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="info" className="outline-none">
                <Card className="border-sky-100/60 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl shadow-sky-100/10 dark:shadow-none rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-sky-500/5 to-peach-500/5 border-b border-sky-100/30 dark:border-slate-800/30 px-6 py-5">
                    <CardTitle className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <User className="h-5 w-5 text-sky-600" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Gérez les paramètres généraux de votre profil académique.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                          Prénom / الاسم الأول
                        </Label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Ex. Amine"
                            className="bg-slate-50/50 dark:bg-slate-850/50 border-sky-100/60 dark:border-slate-800 rounded-xl focus:ring-sky-500/20 focus:border-sky-500 h-11 pl-4"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                          Nom / اللقب
                        </Label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Ex. Benali"
                            className="bg-slate-50/50 dark:bg-slate-850/50 border-sky-100/60 dark:border-slate-800 rounded-xl focus:ring-sky-500/20 focus:border-sky-500 h-11 pl-4"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-slate-400" />
                        Adresse e-mail / البريد الإلكتروني
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-slate-100 dark:bg-slate-900 border-sky-100/30 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 h-11 pl-4 cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Verrouillé
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-slate-400" />
                        Téléphone / رقم الهاتف
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex. 06 12 34 56 78"
                        className="bg-slate-50/50 dark:bg-slate-850/50 border-sky-100/60 dark:border-slate-800 rounded-xl focus:ring-sky-500/20 focus:border-sky-500 h-11 pl-4"
                      />
                    </div>

                    {isStudent && (
                      <div className="space-y-2 border-t border-sky-100/30 dark:border-slate-800/50 pt-5">
                        <Label className="text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 mb-2">
                          <GraduationCap className="h-4 w-4 text-slate-400" />
                          Niveau scolaire / المستوى الدراسي
                        </Label>
                        <div className="rounded-xl overflow-hidden border border-sky-100/40 dark:border-slate-800 p-2 bg-sky-50/10">
                          <SchoolLevelSelect
                            value={schoolLevel}
                            onValueChange={setSchoolLevel}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons with animated styles */}
                    <div className="flex justify-end gap-3 pt-5 border-t border-sky-100/30 dark:border-slate-800/30">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (profile) {
                            setFirstName(profile.first_name || "");
                            setLastName(profile.last_name || "");
                            setPhone(profile.phone || "");
                            setSchoolLevel(profile.school_level || "");
                          }
                        }}
                        disabled={!hasChanges || saving}
                        className="rounded-xl px-5 h-11 border-sky-200/50 dark:border-slate-800"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="rounded-xl px-6 h-11 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all duration-300"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer les modifications
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {isParent && (
                <TabsContent value="children" className="outline-none">
                  <Card className="border-sky-100/60 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-sky-500/5 to-peach-500/5 border-b border-sky-100/30 dark:border-slate-800/30 px-6 py-5">
                      <CardTitle className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-sky-600" />
                        Mes enfants rattachés
                      </CardTitle>
                      <CardDescription>
                        Suivez et gérez les profils d'apprentissage de vos enfants.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LinkedChildrenSection />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {isStudent && (
                <TabsContent value="parents" className="outline-none">
                  <Card className="border-sky-100/60 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-sky-500/5 to-peach-500/5 border-b border-sky-100/30 dark:border-slate-800/30 px-6 py-5">
                      <CardTitle className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <User className="h-5 w-5 text-sky-600" />
                        Mes parents rattachés
                      </CardTitle>
                      <CardDescription>
                        Visualisez les comptes parents connectés pour le suivi de votre progression.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LinkedParentsSection />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
}
