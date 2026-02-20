import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, GraduationCap, LogOut, User as UserIcon, CalendarIcon, Copy, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { LinkedChildrenSection } from "@/components/profile/LinkedChildrenSection";
import { LinkedParentsSection } from "@/components/profile/LinkedParentsSection";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import { SchoolLevelSelect } from "@/components/profile/SchoolLevelSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile(user.id);

    const determineUserRole = async () => {
      if (await hasRole('parent')) {
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
        .select("id, first_name, last_name, email, phone, school_level, filiere, avatar_url, linking_code")
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
        })
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

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès",
      });

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

  const getFilieresForLevel = (level: string) => {
    if (level === "premiere") {
      return [
        { value: "tronc_commun_scientifique", label: "Tronc commun scientifique" },
        { value: "tronc_commun_lettres", label: "Tronc commun lettres" },
      ];
    }
    return [
      { value: "sciences", label: "Sciences" },
      { value: "lettres", label: "Lettres" },
      { value: "gestion", label: "Gestion" },
      { value: "math_techniques", label: "Math techniques" },
      { value: "mathematiques", label: "Mathématiques" },
    ];
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fullName = getFullName(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/liste-cours")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.school_level && getSchoolLevelName(profile.school_level)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(userRole === 'parent' ? "/parent-dashboard" : "/dashboard")}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mt-20">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/account")} className="cursor-pointer flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour vers Gérer mon compte
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Mes Informations</CardTitle>
              <CardDescription>Vos informations personnelles d'inscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUpload
                url={formData.avatar_url}
                onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
                onDelete={() => setFormData({ ...formData, avatar_url: null })}
              />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Votre prénom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom de famille</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Votre nom de famille"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Votre adresse email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Un email de confirmation sera envoyé si vous modifiez votre adresse.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Numéro de téléphone"
                  />
                </div>

                {userRole !== 'parent' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="school_level">Niveau scolaire</Label>
                      <SchoolLevelSelect
                        value={formData.school_level}
                        onValueChange={(value) => {
                          setFormData({ 
                            ...formData, 
                            school_level: value,
                            // Reset filière when changing level
                            filiere: ["premiere", "seconde", "terminale"].includes(value) ? formData.filiere : ""
                          });
                        }}
                      />
                    </div>

                    {showFiliereSelector && (
                      <div className="space-y-2">
                        <Label htmlFor="filiere">Filière</Label>
                        <Select
                          value={formData.filiere}
                          onValueChange={(value) => setFormData({ ...formData, filiere: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez votre filière" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFilieresForLevel(formData.school_level).map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {/* Code de liaison pour les élèves */}
                {userRole === 'student' && profile?.linking_code && (
                  <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <Label className="text-primary font-semibold">Code de liaison parent</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={profile.linking_code.toUpperCase()}
                        readOnly
                        className="bg-background font-mono text-lg tracking-widest"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
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
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      Supprimer le compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Cela supprimera définitivement votre compte et toutes vos
                        données associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Supprimer définitivement
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button onClick={handleUpdate} disabled={updating}>
                  {updating ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 2FA */}
          <TwoFactorSettings />

          {/* Section Parent/Enfant selon le rôle */}
          {userRole === 'parent' && <LinkedChildrenSection />}
          {userRole === 'student' && <LinkedParentsSection />}
        </div>
      </main>
    </div>
  );
};

export default MesInformations;
