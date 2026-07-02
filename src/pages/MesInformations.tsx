import { useEffect, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { LinkedChildrenSection } from "@/components/profile/LinkedChildrenSection";
import { LinkedParentsSection } from "@/components/profile/LinkedParentsSection";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { AppHeader } from "@/components/layout/AppHeader";

import LocationFields from "@/components/profile/LocationFields";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis").max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  last_name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  phone: z.string().trim().max(20, "Le téléphone ne peut pas dépasser 20 caractères").optional().nullable(),
  school_level: z.string().optional().nullable(),
  filiere: z.string().optional().nullable(),
  email: z.string().email("L'adresse email n'est pas valide"),
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
  const navigate = useNavigate();
  const { toast } = useToast();
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
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (profile: Profile | null): string => {
    if (!profile) return "Utilisateur";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);

      const validatedData = profileSchema.parse({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        school_level: formData.school_level || null,
        filiere: formData.filiere || null,
        email: formData.email,
        avatar_url: formData.avatar_url,
      });

      if (!profile?.id || !user) return;

      // Update email if it has changed - using edge function for immediate update
      if (validatedData.email !== profile.email) {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter pour modifier votre email.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { error: emailError } = await supabase.functions.invoke("update-user-email", {
          body: { userId: profile.id, newEmail: validatedData.email },
        });

        if (emailError) {
          throw new Error(emailError.message || "Erreur lors de la mise à jour de l'email");
        }

        toast({
          title: "Email mis à jour",
          description: "Votre email a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouvelle adresse.",
        });
      }

      // Update other profile fields (email is already updated by edge function)
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

      navigate("/update-success");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
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

      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

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
    return levels[level] || level || "Votre classe";
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
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate("/account")}
            className="mb-6 rounded-full gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour vers Gérer mon compte
          </Button>
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
                onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
                onDelete={() => setFormData({ ...formData, avatar_url: null })}
              />
              <h1 className="mt-5 text-2xl font-bold text-foreground">{fullName}</h1>
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
                      <h2 className="text-lg font-bold text-foreground">Informations personnelles</h2>
                      <p className="text-xs text-muted-foreground">Vos informations d'inscription</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Votre prénom"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Nom de famille</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Votre nom de famille"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Votre adresse email"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Un email de confirmation sera envoyé si vous modifiez votre adresse.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Téléphone
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Numéro de téléphone"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date de naissance</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal rounded-xl",
                              !formData.date_of_birth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date_of_birth
                              ? format(formData.date_of_birth, "dd/MM/yyyy")
                              : "Sélectionnez une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date_of_birth}
                            onSelect={(date) => setFormData({ ...formData, date_of_birth: date })}
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
                      <h2 className="text-lg font-bold text-foreground">Localisation</h2>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <LocationFields
                      wilaya={formData.wilaya}
                      ville={formData.ville}
                      ecole={formData.ecole}
                      onWilayaChange={(val) => setFormData({ ...formData, wilaya: val, ville: "" })}
                      onVilleChange={(val) => setFormData({ ...formData, ville: val })}
                      onEcoleChange={(val) => setFormData({ ...formData, ecole: val })}
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
                      <h2 className="text-lg font-bold text-foreground">Scolarité</h2>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Niveau scolaire</Label>
                        <div className="flex h-10 w-full items-center rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                          {getSchoolLevelName(formData.school_level)}
                        </div>
                      </div>

                      {showFiliereSelector && formData.filiere && (
                        <div className="space-y-2">
                          <Label>Filière</Label>
                          <div className="flex h-10 w-full items-center rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            {getFiliereLabel(formData.filiere)}
                          </div>
                        </div>
                      )}
                    </div>

                    {profile?.linking_code && (
                      <div className="space-y-2 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
                        <Label className="text-primary font-semibold">Code de liaison parent</Label>
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
                              toast({
                                title: "Copié !",
                                description: "Le code a été copié dans le presse-papiers",
                              });
                              setTimeout(() => setCodeCopied(false), 2000);
                            }}
                          >
                            {codeCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Partagez ce code avec vos parents pour qu'ils puissent lier leur compte au vôtre.
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
                    Supprimer le compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement votre compte et toutes vos
                      données associées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="rounded-full px-8 h-11 shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                {updating ? "Mise à jour..." : "Mettre à jour"}
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
