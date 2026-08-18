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
import { format, parse, isValid } from "date-fns";
import Header from "@/components/Header";
import iconStudent from "@/assets/icon-student.png";
import iconParent from "@/assets/icon-parent.png";
import { User, CalendarIcon, GraduationCap } from "lucide-react";
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
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [wilaya, setWilaya] = useState("");
  const [ville, setVille] = useState("");
  const [ecole, setEcole] = useState("");
  const [dateOfBirthInput, setDateOfBirthInput] = useState("");
  const [establishmentCode, setEstablishmentCode] = useState("");

  useEffect(() => {
    // Page atterrissage pour tout compte authentifié sans rôle encore assigné
    // (ex : inscription via Google OAuth, qui ne passe pas par le
    // raw_user_meta_data lu par handle_new_user). Si un rôle existe déjà,
    // redirige directement vers l'espace correspondant au lieu d'afficher le
    // formulaire — cette page ne sert qu'à la première complétion.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Pre-fill from Google OAuth metadata
      const meta = session.user.user_metadata;
      if (meta) {
        setFirstName(meta.first_name || meta.given_name || meta.full_name?.split(' ')[0] || "");
        setLastName(meta.last_name || meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || "");
        if (meta.phone) setPhone(meta.phone);
      }

      // Override with existing profile data if available
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, date_of_birth, wilaya, ville, ecole, school_level')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        if (profile.first_name) setFirstName(profile.first_name);
        if (profile.last_name) setLastName(profile.last_name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.date_of_birth) setDateOfBirth(new Date(profile.date_of_birth));
        if (profile.wilaya) setWilaya(profile.wilaya);
        if (profile.ville) setVille(profile.ville);
        if (profile.ecole) setEcole(profile.ecole);
      }

      // Pré-remplir le type de profil si le rôle est déjà connu
      if (roleData?.role === 'student') setProfileType('enfant');
      else if (roleData?.role === 'parent') setProfileType('parent');
      else if (roleData?.role === 'teacher') setProfileType('enseignant');

      // Un rôle déjà assigné signifie que le profil est complet — mais seul le
      // rôle élève dépend réellement de cette page pour renseigner school_level.
      // Les comptes créés par un admin (pédago, admin, établissement) n'ont — et
      // n'auront jamais — de school_level : les bloquer sur `roleData?.role &&
      // profile?.school_level` les laissait coincés ici avec le seul choix
      // élève/parent au lieu de les renvoyer vers leur espace.
      if (roleData?.role === 'admin' || roleData?.role === 'pedago') {
        navigate("/liste-matieres");
        return;
      }
      if (roleData?.role === 'etablissement') {
        navigate("/etablissement-dashboard");
        return;
      }
      if (roleData?.role === 'teacher') {
        navigate("/teacher-dashboard");
        return;
      }
      if (roleData?.role === 'parent') {
        navigate("/parent-dashboard");
        return;
      }
      if (roleData?.role === 'student' && profile?.school_level) {
        navigate("/liste-matieres");
        return;
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    setFiliere("");
  }, [classLevel]);

  // Soumission du formulaire de complétion : valide les champs requis selon
  // le profil choisi, assigne le rôle (via complete_teacher_signup pour un
  // enseignant, insert direct RLS-validé pour élève/parent), met à jour le
  // profil, puis redirige vers l'espace correspondant. Déclenché par le
  // bouton de validation du formulaire.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileType) { toast.error("Veuillez sélectionner votre profil."); return; }
    if (!firstName || !lastName) { toast.error("Veuillez renseigner votre prénom et nom."); return; }
    if (profileType === 'enfant' && !classLevel) { toast.error("Veuillez sélectionner votre classe."); return; }
    if (profileType === 'enfant' && (classLevel === "Première" || classLevel === "Seconde" || classLevel === "Terminale") && !filiere) {
      toast.error("Veuillez sélectionner votre filière / tronc commun.");
      return;
    }
    if (profileType === 'enseignant' && !establishmentCode.trim()) {
      toast.error("Veuillez renseigner votre code d'établissement.");
      return;
    }
    if (!userId) { toast.error("Session expirée."); navigate("/auth"); return; }

    setLoading(true);

    try {
      // Valider le code AVANT toute écriture sur profiles : un code invalide
      // ne doit pas laisser un compte enseignant à moitié créé. On arrive ici
      // sans aucun rôle assigné pour l'instant (voir useEffect ci-dessus, qui
      // redirige déjà tout compte ayant un rôle) : join_establishment_by_code
      // ne peut donc pas être utilisée, elle exige d'avoir déjà le rôle
      // teacher. complete_teacher_signup fait les deux à la fois (assigne le
      // rôle ET rattache l'établissement) de façon atomique côté serveur.
      let joinedEstablishment: { establishment_id: string; establishment_name: string } | null = null;
      if (profileType === 'enseignant') {
        const { data: joinResult, error: joinError } = await supabase
          .rpc('complete_teacher_signup' as any, { p_code: establishmentCode.trim().toUpperCase() });
        if (joinError) {
          toast.error(joinError.message || "Code d'établissement invalide.");
          setLoading(false);
          return;
        }
        const result = Array.isArray(joinResult) ? joinResult[0] : joinResult;
        if (!result?.establishment_name) {
          toast.error("Code d'établissement invalide.");
          setLoading(false);
          return;
        }
        joinedEstablishment = result;
      }
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

      const role = profileType === 'enfant' ? 'student' : profileType === 'enseignant' ? 'teacher' : 'parent';

      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
      };

      if (phone) updateData.phone = phone;
      if (dateOfBirth) updateData.date_of_birth = format(dateOfBirth, 'yyyy-MM-dd');

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

      // Pour un enseignant, le rôle a déjà été assigné par complete_teacher_signup
      // ci-dessus (RLS interdit de toute façon un self-insert direct avec un
      // rôle autre que student/parent — voir la policy "Users can insert
      // their own initial role"). Ne le réinsérer que pour élève/parent.
      if (role !== 'teacher') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as any });

        if (roleError && !roleError.message.includes('duplicate')) throw roleError;
      }

      // Rattache l'établissement au compte (même mécanisme que "Ajouter un
      // établissement" côté tableau de bord enseignant — voir EstablishmentManager).
      if (role === 'teacher' && joinedEstablishment) {
        const { error: estError } = await supabase
          .from('establishments' as any)
          .insert({
            teacher_id: userId,
            name: joinedEstablishment.establishment_name,
            establishment_profile_id: joinedEstablishment.establishment_id,
          });
        if (estError) {
          console.error('Erreur liaison établissement:', estError);
          // Ne bloque pas la fin de l'inscription (le rôle est déjà attribué) mais
          // ne doit plus rester totalement silencieux — l'enseignant se retrouvait
          // sans établissement visible sans aucune indication de ce qui a échoué.
          toast.error(
            estError.code === "23505"
              ? "Vous êtes déjà dans cet établissement."
              : "Erreur lors du rattachement à l'établissement. Réessayez depuis votre tableau de bord.",
          );
        }
      }

      toast.success("Profil complété avec succès !");

      if (role === 'parent') {
        navigate("/parent-dashboard");
      } else if (role === 'teacher') {
        navigate("/teacher-dashboard");
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
      <div className="min-h-screen flex items-center justify-center bg-[image:var(--gradient-soft)] p-4 pt-24">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-3xl shadow-[var(--shadow-elegant)] border border-border/50 overflow-hidden">
            <div className="bg-[image:var(--gradient-primary)] px-8 pt-8 pb-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm mb-4">
                <User className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-extrabold text-primary-foreground mb-1">Compléter votre profil</h1>
              <p className="text-sm text-primary-foreground/80">Pour finaliser votre inscription, complétez vos informations.</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
                    <Input id="firstName" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary/20 border-border" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
                    <Input id="lastName" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary/20 border-border" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" type="tel" placeholder="0555123456" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} className="bg-secondary/20 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={dateOfBirthInput}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 8) value = value.slice(0, 8);

                          let formattedValue = "";
                          if (value.length > 0) formattedValue += value.slice(0, 2);
                          if (value.length > 2) formattedValue += "/" + value.slice(2, 4);
                          if (value.length > 4) formattedValue += "/" + value.slice(4, 8);

                          setDateOfBirthInput(formattedValue);

                          if (formattedValue.length === 10) {
                            const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date());
                            if (isValid(parsedDate)) {
                              setDateOfBirth(parsedDate);
                            }
                          }
                        }}
                        className="bg-secondary/20 border-border"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className={cn("aspect-square h-10 w-10 flex-shrink-0 bg-secondary/20 border-border", !dateOfBirth && "text-muted-foreground")}>
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={(date) => {
                              setDateOfBirth(date);
                              if (date) {
                                setDateOfBirthInput(format(date, "dd/MM/yyyy"));
                              }
                            }}
                            captionLayout="dropdown-buttons"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Qui êtes-vous ? <span className="text-red-500">*</span></Label>
                  <RadioGroup value={profileType} onValueChange={setProfileType}>
                    <div className="grid grid-cols-3 gap-4">
                      <Label htmlFor="enfant-complete" className={cn(
                        "flex flex-col items-center justify-center h-32 px-2 rounded-lg border-2 cursor-pointer transition-all",
                        profileType === "enfant" ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-secondary/20 border-border hover:bg-secondary/30"
                      )}>
                        <RadioGroupItem value="enfant" id="enfant-complete" className="sr-only" />
                        <img src={iconStudent} alt="Élève" className="h-16 w-16 mb-2 object-contain" />
                        <span className="font-semibold">Élève</span>
                      </Label>
                      <Label htmlFor="parent-complete" className={cn(
                        "flex flex-col items-center justify-center h-32 px-2 rounded-lg border-2 cursor-pointer transition-all",
                        profileType === "parent" ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-secondary/20 border-border hover:bg-secondary/30"
                      )}>
                        <RadioGroupItem value="parent" id="parent-complete" className="sr-only" />
                        <img src={iconParent} alt="Parent" className="h-16 w-16 mb-2 object-contain" />
                        <span className="font-semibold">Parent</span>
                      </Label>
                      <Label htmlFor="enseignant-complete" className={cn(
                        "flex flex-col items-center justify-center h-32 px-2 rounded-lg border-2 cursor-pointer transition-all",
                        profileType === "enseignant" ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-secondary/20 border-border hover:bg-secondary/30"
                      )}>
                        <RadioGroupItem value="enseignant" id="enseignant-complete" className="sr-only" />
                        <GraduationCap className="h-16 w-16 mb-2" strokeWidth={1.5} />
                        <span className="font-semibold">Enseignant</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {profileType === "enseignant" && (
                  <div className="space-y-2">
                    <Label htmlFor="establishmentCode-complete" className="text-foreground">
                      Code d'établissement <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="establishmentCode-complete"
                      type="text"
                      placeholder="Ex: ETB1234"
                      value={establishmentCode}
                      onChange={(e) => setEstablishmentCode(e.target.value.toUpperCase())}
                      className="bg-secondary/20 border-border font-mono tracking-widest uppercase"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Code fourni par ton établissement pour rattacher ton compte enseignant.
                    </p>
                  </div>
                )}

                {profileType === "enfant" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-foreground">En quelle classe êtes-vous ? <span className="text-red-500">*</span></Label>
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
                        <Label className="text-foreground">Quelle est ta filière ? <span className="text-red-500">*</span></Label>
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

                <LocationFields
                  wilaya={wilaya}
                  ville={ville}
                  ecole={ecole}
                  onWilayaChange={setWilaya}
                  onVilleChange={setVille}
                  onEcoleChange={setEcole}
                  hideEcole={profileType === "parent" || profileType === "enseignant"}
                />

                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? "Enregistrement..." : "Valider mon profil"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;
