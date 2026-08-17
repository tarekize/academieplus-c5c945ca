import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, CalendarIcon, Copy, Check, Phone, Mail, MapPin, IdCard, ShieldAlert } from "lucide-react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";
import { algerianPhoneSchema } from "@/lib/validation";
import { LinkedChildrenSection } from "@/components/profile/LinkedChildrenSection";
import { LinkedParentsSection } from "@/components/profile/LinkedParentsSection";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { AppHeader } from "@/components/layout/AppHeader";

import LocationFields from "@/components/profile/LocationFields";

// Construit le schéma de validation avec des messages dans la langue active
// (t vient de react-i18next) — algerianPhoneSchema est partagé avec
// d'autres pages et garde son message d'erreur par défaut (français), seul
// cas résiduel non localisé sur cette page.
const buildProfileSchema = (t: (key: string) => string) => z.object({
  first_name: z.string().trim().min(1, t("mesInformations.firstNameRequired")).max(100, t("mesInformations.firstNameTooLong")),
  last_name: z.string().trim().min(1, t("mesInformations.lastNameRequired")).max(100, t("mesInformations.lastNameTooLong")),
  phone: algerianPhoneSchema.nullable(),
  school_level: z.string().optional().nullable(),
  filiere: z.string().optional().nullable(),
  email: z.string().email(t("mesInformations.emailInvalid")),
  avatar_url: z.string().optional().nullable(),
});

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  school_level: string | null;
  filiere: string | null;
  avatar_url: string | null;
  linking_code: string | null;
  date_of_birth: string | null;
  wilaya: string | null;
  ville: string | null;
  ecole: string | null;
}

const MesInformations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, hasRole } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    school_level: "",
    filiere: "",
    email: "",
    avatar_url: "",
    date_of_birth: undefined as Date | undefined,
    wilaya: "",
    ville: "",
    ecole: "",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile(user.id);

    const determineUserRole = async () => {
      if (await hasRole('admin')) {
        setUserRole('admin');
      } else if (await hasRole('pedago')) {
        setUserRole('pedago');
      } else if (await hasRole('parent')) {
        setUserRole('parent');
      } else if (await hasRole('student')) {
        setUserRole('student');
      }
    };
    determineUserRole();
  }, [user, authLoading, navigate, hasRole]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, school_level, filiere, avatar_url, linking_code, date_of_birth, wilaya, ville, ecole")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        school_level: data.school_level || "",
        filiere: data.filiere || "",
        email: data.email || "",
        avatar_url: data.avatar_url || "",
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth + 'T00:00:00') : undefined,
        wilaya: (data as any).wilaya || "",
        ville: (data as any).ville || "",
        ecole: (data as any).ecole || "",
      });
    } catch (error: any) {
      toast.error(t("mesInformations.errorTitle"), {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (profile: Profile | null): string => {
    if (!profile) return t("mesInformations.defaultUserName");
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : t("mesInformations.defaultUserName");
  };

  // La photo de profil s'enregistre immédiatement (contrairement aux autres
  // champs, qui restent groupés derrière le bouton "Mettre à jour").
  const persistAvatarUrl = async (avatarUrl: string | null) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    if (error) {
      toast.error(t("mesInformations.errorTitle"), { description: t("mesInformations.avatarSaveError") });
      return;
    }
    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);

      const validatedData = buildProfileSchema(t).parse({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        school_level: formData.school_level || null,
        filiere: formData.filiere || null,
        email: formData.email,
        avatar_url: formData.avatar_url,
      });

      if (!profile?.id || !user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          phone: validatedData.phone,
          school_level: validatedData.school_level as any,
          filiere: validatedData.filiere,
          avatar_url: validatedData.avatar_url,
          date_of_birth: formData.date_of_birth ? format(formData.date_of_birth, 'yyyy-MM-dd') : null,
          wilaya: formData.wilaya || null,
          ville: formData.ville || null,
          ecole: formData.ecole || null,
        } as any)
        .eq("id", profile.id);

      if (error) throw error;

      toast.success(t("mesInformations.updateSuccessTitle"), {
        description: t("mesInformations.updateSuccessDesc"),
      });
      if (user) await fetchProfile(user.id);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(t("mesInformations.validationErrorTitle"), {
          description: error.errors[0].message,
        });
      } else {
        toast.error(t("mesInformations.errorTitle"), {
          description: error.message,
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      if (!profile?.id) return;

      const { error } = await supabase.functions.invoke("delete-user-account", {
        body: { userId: profile.id },
      });

      if (error) {
        // Sur une réponse non-2xx, le client Supabase ne parse jamais le
        // corps dans data : le vrai message renvoyé par l'edge function
        // (ex: conflit de suppression) n'est lisible que via error.context
        // (la Response brute), sinon on retombe sur le message générique
        // "Edge Function returned a non-2xx status code".
        let message = error.message;
        try {
          const context = (error as any)?.context;
          if (context && typeof context.json === "function") {
            const body = await context.json();
            if (body?.error) message = body.error;
          }
        } catch {
          // Corps non-JSON ou déjà consommé : on garde le message générique.
        }
        throw new Error(message);
      }

      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      toast.error(t("mesInformations.errorTitle"), {
        description: error.message,
      });
      setDeleting(false);
    }
  };

  // Les niveaux scolaires restent en français dans les deux langues :
  // termes de scolarité standards en Algérie (décision explicite), pas du
  // contenu d'interface à traduire.
  const getSchoolLevelName = (level: string) => {
    const levels: Record<string, string> = {
      "5eme_primaire": "5ème Primaire",
      "1ere_cem": "1ère CEM",
      "2eme_cem": "2ème CEM",
      "3eme_cem": "3ème CEM",
      "4eme_cem": "4ème CEM",
      seconde: "Seconde",
      premiere: "Première",
      terminale: "Terminale",
    };
    return levels[level] || level || t("mesInformations.defaultClass");
  };

  const getFiliereLabel = (filiere: string) => {
    const filieres: Record<string, string> = {
      tronc_commun_scientifique: "Tronc commun scientifique",
      tronc_commun_lettres: "Tronc commun lettres",
      sciences: "Sciences",
      lettres: "Lettres",
      gestion: "Gestion",
      math_techniques: "Math techniques",
      mathematiques: "Mathématiques",
    };
    return filieres[filiere] || filiere;
  };

  const showFiliereSelector = ["premiere", "seconde", "terminale"].includes(formData.school_level);




  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  const fullName = getFullName(profile);

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/account")} className="cursor-pointer flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("mesInformations.backToAccount")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-5">
          {/* Header + Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/5 rounded-3xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 p-8 flex flex-col items-center text-center">
              <AvatarUpload
                url={formData.avatar_url}
                onUpload={(url) => { setFormData((prev) => ({ ...prev, avatar_url: url })); persistAvatarUrl(url); }}
                onDelete={() => { setFormData((prev) => ({ ...prev, avatar_url: null })); persistAvatarUrl(null); }}
              />
              <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">{fullName}</h1>
              <p className="text-muted-foreground text-sm">{profile?.email}</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="space-y-5"
          >
            {/* Informations personnelles */}
            <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
              <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <IdCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{t("mesInformations.personalInfoTitle")}</h2>
                      <p className="text-xs text-muted-foreground">{t("mesInformations.personalInfoDesc")}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">{t("mesInformations.firstName")}</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                        placeholder={t("mesInformations.firstNamePlaceholder")}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">{t("mesInformations.lastName")}</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                        placeholder={t("mesInformations.lastNamePlaceholder")}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {t("mesInformations.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="rounded-xl text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("mesInformations.emailNotEditable")}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {t("mesInformations.phone")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const filtered = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setFormData((prev) => ({ ...prev, phone: filtered }));
                        }}
                        maxLength={10}
                        placeholder={t("mesInformations.phonePlaceholder")}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center">{t("mesInformations.dateOfBirth")}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-10 justify-start text-left font-normal rounded-xl",
                              !formData.date_of_birth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date_of_birth
                              ? format(formData.date_of_birth, "dd/MM/yyyy")
                              : t("mesInformations.selectDate")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date_of_birth}
                            onSelect={(date) => setFormData((prev) => ({ ...prev, date_of_birth: date }))}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1940-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                            captionLayout="dropdown-buttons"
                            fromYear={1940}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Localisation */}
            {(userRole === 'student' || userRole === 'parent') && (
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{t("mesInformations.locationTitle")}</h2>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <LocationFields
                      wilaya={formData.wilaya}
                      ville={formData.ville}
                      ecole={formData.ecole}
                      onWilayaChange={(val) => setFormData((prev) => ({ ...prev, wilaya: val, ville: "" }))}
                      onVilleChange={(val) => setFormData((prev) => ({ ...prev, ville: val }))}
                      onEcoleChange={(val) => setFormData((prev) => ({ ...prev, ecole: val }))}
                      hideEcole={userRole === 'parent'}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Scolarité + code de liaison (élève) */}
            {userRole === 'student' && (
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{t("mesInformations.schoolingTitle")}</h2>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("mesInformations.schoolLevelLabel")}</Label>
                        <div className="flex h-10 w-full items-center rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                          {getSchoolLevelName(formData.school_level)}
                        </div>
                      </div>

                      {showFiliereSelector && formData.filiere && (
                        <div className="space-y-2">
                          <Label>{t("mesInformations.filiereLabel")}</Label>
                          <div className="flex h-10 w-full items-center rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            {getFiliereLabel(formData.filiere)}
                          </div>
                        </div>
                      )}
                    </div>

                    {profile?.linking_code && (
                      <div className="space-y-2 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
                        <Label className="text-primary font-semibold">{t("mesInformations.linkingCodeLabel")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={profile.linking_code.toUpperCase()}
                            readOnly
                            className="bg-background font-mono text-lg tracking-widest rounded-xl"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-xl shrink-0 active:scale-90 transition-transform"
                            onClick={() => {
                              navigator.clipboard.writeText(profile.linking_code!);
                              setCodeCopied(true);
                              toast.success(t("mesInformations.copiedTitle"), {
                                description: t("mesInformations.copiedDesc"),
                              });
                              setTimeout(() => setCodeCopied(false), 2000);
                            }}
                          >
                            {codeCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("mesInformations.linkingCodeHint")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3"
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={deleting}
                    className="rounded-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground active:scale-95 transition-all"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {t("mesInformations.deleteAccountButton")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("mesInformations.deleteConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("mesInformations.deleteConfirmDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{t("mesInformations.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t("mesInformations.deletePermanently")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="rounded-full px-8 h-11 shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                {updating ? t("mesInformations.updating") : t("mesInformations.updateButton")}
              </Button>
            </motion.div>

            {/* Section Parent/Enfant selon le rôle */}
            {userRole === 'parent' && (
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <LinkedChildrenSection />
              </motion.div>
            )}
            {userRole === 'student' && (
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <LinkedParentsSection />
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MesInformations;
