import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Header from "@/components/Header";
import iconStudent from "@/assets/icon-student.png";
import iconParent from "@/assets/icon-parent.png";
import { User, CalendarIcon } from "lucide-react";
import LocationFields from "@/components/profile/LocationFields";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileType, setProfileType] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [filiere, setFiliere] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [wilaya, setWilaya] = useState("");
  const [ville, setVille] = useState("");
  const [ecole, setEcole] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleData?.role) {
        if (roleData.role === 'parent') navigate("/parent-dashboard");
        else navigate("/liste-cours");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    setFiliere("");
  }, [classLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileType) { toast.error("Veuillez sélectionner votre profil."); return; }
    if (!firstName || !lastName) { toast.error("Veuillez renseigner votre prénom et nom."); return; }
    if (profileType === 'enfant' && !classLevel) { toast.error("Veuillez sélectionner votre classe."); return; }
    if (profileType === 'enfant' && (classLevel === "Première" || classLevel === "Seconde" || classLevel === "Terminale") && !filiere) {
      toast.error("Veuillez sélectionner votre filière / tronc commun.");
      return;
    }
    if (!userId) { toast.error("Session expirée."); navigate("/auth"); return; }

    setLoading(true);

    try {
      const schoolLevelMapping: Record<string, string> = {
        "5ème Primaire": "5eme_primaire",
        "1ère CEM": "1ere_cem",
        "2ème CEM": "2eme_cem",
        "3ème CEM": "3eme_cem",
        "4ème CEM": "4eme_cem",
        "Première": "premiere",
        "Seconde": "seconde",
        "Terminale": "terminale",
      };

      const role = profileType === 'enfant' ? 'student' : 'parent';

      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
      };

      if (profileType === 'enfant' && classLevel) {
        updateData.school_level = schoolLevelMapping[classLevel] || classLevel.toLowerCase();
        if (filiere) {
          updateData.filiere = filiere;
        }
      }

      if (wilaya) updateData.wilaya = wilaya;
      if (ville) updateData.ville = ville;
      if (ecole) updateData.ecole = ecole;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any });

      if (roleError && !roleError.message.includes('duplicate')) throw roleError;

      toast.success("Profil complété avec succès !");

      if (role === 'parent') {
        navigate("/parent-dashboard");
      } else {
        navigate("/learning-assessment");
      }
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast.error(error.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const schoolLevels = ["5ème Primaire", "1ère CEM", "2ème CEM", "3ème CEM", "4ème CEM", "Première", "Seconde", "Terminale"];

  return (
    <>
      <Header minimal={true} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4 pt-24">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 border border-border">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Compléter votre profil</h1>
              <p className="text-muted-foreground">Pour finaliser votre inscription, veuillez compléter vos informations.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary/20 border-border" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary/20 border-border" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Qui êtes-vous ?</Label>
                <RadioGroup value={profileType} onValueChange={setProfileType}>
                  <div className="grid grid-cols-2 gap-4">
                    <Label htmlFor="enfant-complete" className={cn(
                      "flex flex-col items-center justify-center h-32 px-4 rounded-lg border-2 cursor-pointer transition-all",
                      profileType === "enfant" ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-secondary/20 border-border hover:bg-secondary/30"
                    )}>
                      <RadioGroupItem value="enfant" id="enfant-complete" className="sr-only" />
                      <img src={iconStudent} alt="Élève" className="h-16 w-16 mb-2 object-contain" />
                      <span className="font-semibold">Élève</span>
                    </Label>
                    <Label htmlFor="parent-complete" className={cn(
                      "flex flex-col items-center justify-center h-32 px-4 rounded-lg border-2 cursor-pointer transition-all",
                      profileType === "parent" ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-secondary/20 border-border hover:bg-secondary/30"
                    )}>
                      <RadioGroupItem value="parent" id="parent-complete" className="sr-only" />
                      <img src={iconParent} alt="Parent" className="h-16 w-16 mb-2 object-contain" />
                      <span className="font-semibold">Parent</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {profileType === "enfant" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">En quelle classe êtes-vous ?</Label>
                    <RadioGroup value={classLevel} onValueChange={setClassLevel}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {schoolLevels.map((level) => (
                          <Label key={level} htmlFor={`level-${level}`} className={cn(
                            "flex items-center justify-center h-10 px-4 rounded-md border-2 cursor-pointer transition-all font-medium text-sm",
                            classLevel === level ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-secondary/20 border-border hover:bg-secondary/30 hover:border-primary"
                          )}>
                            <RadioGroupItem value={level} id={`level-${level}`} className="sr-only" />
                            {level}
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {classLevel === "Première" && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Quel est ton tronc commun ?</Label>
                      <RadioGroup value={filiere} onValueChange={setFiliere}>
                        <div className="grid grid-cols-2 gap-3">
                          {["Tronc commun scientifique", "Tronc commun lettres"].map((f) => (
                            <Label key={f} htmlFor={`filiere-cp-${f}`} className={cn(
                              "flex items-center justify-center h-10 px-4 rounded-md border-2 cursor-pointer transition-all font-medium text-sm",
                              filiere === f ? "bg-accent text-accent-foreground border-accent shadow-md" : "bg-secondary/20 border-border hover:bg-secondary/30 hover:border-accent"
                            )}>
                              <RadioGroupItem value={f} id={`filiere-cp-${f}`} className="sr-only" />
                              {f}
                            </Label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {(classLevel === "Seconde" || classLevel === "Terminale") && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Quelle est ta filière ?</Label>
                      <RadioGroup value={filiere} onValueChange={setFiliere}>
                        <div className="grid grid-cols-2 gap-3">
                          {["Sciences", "Lettres", "Gestion", "Math techniques", "Mathématiques"].map((f) => (
                            <Label key={f} htmlFor={`filiere-cp-${f}`} className={cn(
                              "flex items-center justify-center h-10 px-4 rounded-md border-2 cursor-pointer transition-all font-medium text-sm",
                              filiere === f ? "bg-accent text-accent-foreground border-accent shadow-md" : "bg-secondary/20 border-border hover:bg-secondary/30 hover:border-accent"
                            )}>
                              <RadioGroupItem value={f} id={`filiere-cp-${f}`} className="sr-only" />
                              {f}
                            </Label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </>
              )}

              {(profileType === "enfant" || profileType === "parent") && (
                <LocationFields
                  wilaya={wilaya}
                  ville={ville}
                  ecole={ecole}
                  onWilayaChange={setWilaya}
                  onVilleChange={setVille}
                  onEcoleChange={setEcole}
                />
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enregistrement..." : "Valider mon profil"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;
