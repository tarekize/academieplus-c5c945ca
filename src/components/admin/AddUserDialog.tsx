import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Eye, EyeOff, Loader2, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SUBJECTS } from "@/lib/subjects";
import LocationFields from "@/components/profile/LocationFields";

const SCHOOL_LEVELS = [
  { value: "5eme_primaire", label: "5ème Primaire" },
  { value: "1ere_cem", label: "1ère CEM" },
  { value: "2eme_cem", label: "2ème CEM" },
  { value: "3eme_cem", label: "3ème CEM" },
  { value: "4eme_cem", label: "4ème CEM" },
  { value: "seconde", label: "Seconde" },
  { value: "premiere", label: "Première" },
  { value: "terminale", label: "Terminale" },
];

const LEVELS_WITH_FILIERE = ["seconde", "premiere", "terminale"];

const FILIERES_BY_LEVEL: Record<string, { value: string; label: string }[]> = {
  seconde: [
    { value: "sciences", label: "Sciences" },
    { value: "lettres", label: "Lettres" },
    { value: "gestion", label: "Gestion et Économie" },
    { value: "math_techniques", label: "Math Techniques" },
    { value: "mathematiques", label: "Mathématiques" },
  ],
  terminale: [
    { value: "sciences", label: "Sciences Expérimentales" },
    { value: "lettres", label: "Lettres et Philosophie" },
    { value: "gestion", label: "Gestion et Économie" },
    { value: "math_techniques", label: "Math Techniques" },
    { value: "mathematiques", label: "Mathématiques" },
  ],
  premiere: [
    { value: "tronc_commun_scientifique", label: "Tronc commun scientifique" },
    { value: "tronc_commun_lettres", label: "Tronc commun lettres" },
  ],
};

interface AddUserDialogProps {
  onUserAdded: () => void;
}

// Formulaire admin de création de compte (tous rôles). La validation côté client (mot
// de passe, champs requis) est un confort UX : l'attribution réelle du rôle et la création
// du compte auth se font côté serveur via l'edge function admin-create-user.
export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [role, setRole] = useState<string>("");
  const [schoolLevel, setSchoolLevel] = useState<string>("");
  const [filiere, setFiliere] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [wilaya, setWilaya] = useState("");
  const [ville, setVille] = useState("");
  const [ecole, setEcole] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | undefined>(undefined);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [takenSubjects, setTakenSubjects] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEstablishment = role === "etablissement";
  const isPedago = role === "pedago";
  const needsFiliere = role === "student" && LEVELS_WITH_FILIERE.includes(schoolLevel);

  // Charge quelles matières sont déjà assignées à un autre pédago, pour les
  // désactiver dans la sélection (une matière = un seul pédago).
  useEffect(() => {
    if (!isPedago || !open) return;
    setLoadingSubjects(true);
    supabase
      .from("pedago_subjects" as any)
      .select("subject_id, profiles:user_id(first_name, last_name, email)")
      .then(({ data, error }: any) => {
        if (error) {
          console.error("Error loading taken subjects:", error);
          return;
        }
        const taken: Record<string, string> = {};
        for (const row of data || []) {
          const p = row.profiles;
          taken[row.subject_id] = p ? (`${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email) : "un autre pédago";
        }
        setTakenSubjects(taken);
      })
      .finally(() => setLoadingSubjects(false));
  }, [isPedago, open]);

  /** Coche/décoche une matière dans la sélection du pédago en création. */
  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  };

  /** Règles de robustesse du mot de passe créé par l'admin (8+ car., 1 majuscule, 1 chiffre).
   * Son résultat EST vérifié dans handleSubmit ci-dessous (contrairement au bug déjà
   * corrigé dans Auth.tsx où l'appel équivalent était fait mais jamais lu). */
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule.";
    }
    if (!/\d/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre.";
    }
    return null;
  };

  /** Valide le formulaire côté client puis délègue la création réelle du compte à l'edge
   * function admin-create-user (seule habilitée, côté serveur, à écrire le rôle choisi ici —
   * ce composant ne fait qu'un appel réseau, il n'écrit jamais lui-même dans `user_roles`). */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast.error("Veuillez sélectionner un rôle.");
      return;
    }

    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (isEstablishment && !establishmentName.trim()) {
      toast.error("Veuillez saisir le nom de l'établissement.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (role === "student" && !schoolLevel) {
      toast.error("Veuillez sélectionner un niveau scolaire pour l'élève.");
      return;
    }

    if (needsFiliere && !filiere) {
      toast.error("Veuillez sélectionner une filière pour cet élève.");
      return;
    }

    if (role === "student" && subscriptionEndDate && subscriptionEndDate <= new Date()) {
      toast.error("La date de fin d'abonnement doit être dans le futur.");
      return;
    }

    if (isPedago && selectedSubjects.length === 0) {
      toast.error("Veuillez sélectionner au moins une matière enseignée par ce pédago.");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await supabase.functions.invoke("admin-create-user", {
        body: {
          email,
          password,
          firstName: isEstablishment ? establishmentName.trim() : firstName,
          lastName: isEstablishment ? "" : lastName,
          role,
          schoolLevel: role === "student" ? schoolLevel : null,
          filiere: needsFiliere ? filiere : null,
          phone: !isEstablishment && phone.trim() ? phone.trim() : null,
          dateOfBirth: !isEstablishment && dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
          wilaya: role === "student" && wilaya ? wilaya : null,
          ville: role === "student" && ville ? ville : null,
          ecole: role === "student" && ecole.trim() ? ecole.trim() : null,
          subscriptionEndDate: role === "student" && subscriptionEndDate ? format(subscriptionEndDate, "yyyy-MM-dd") : null,
          subjects: isPedago ? selectedSubjects : undefined,
        },
      });

      if (response.error) {
        // Sur une réponse non-2xx, le client Supabase ne parse jamais le
        // corps dans response.data (qui reste null) — le vrai message
        // d'erreur renvoyé par l'edge function n'est lisible que via
        // error.context (la Response brute), sans quoi on retombe sur le
        // message générique "Edge Function returned a non-2xx status code".
        let actualError = response.error.message || "Erreur lors de la création";
        try {
          const context = (response.error as any)?.context;
          if (context && typeof context.json === "function") {
            const body = await context.json();
            if (body?.error) actualError = body.error;
          }
        } catch {
          // Corps non-JSON ou déjà consommé : on garde le message générique.
        }
        throw new Error(actualError);
      }

      setOpen(false);
      resetForm();
      onUserAdded();
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        toast.error("Un compte existe déjà avec cet email.");
      } else {
        toast.error(error.message || "Erreur lors de la création de l'utilisateur.");
      }
    } finally {
      setLoading(false);
    }
  };

  /** Remet tous les champs à vide (nouvelle création ou fermeture de la modale). */
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setEstablishmentName("");
    setRole("");
    setSchoolLevel("");
    setFiliere("");
    setPhone("");
    setDateOfBirth(undefined);
    setWilaya("");
    setVille("");
    setEcole("");
    setSubscriptionEndDate(undefined);
    setSelectedSubjects([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte utilisateur (admin, pédago, enseignant, parent, élève ou établissement).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Role selection FIRST */}
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="pedago">Pédago</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="student">Élève</SelectItem>
                  <SelectItem value="etablissement">Établissement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remaining fields only after a role is chosen */}
            {role && (
              <>
                {isEstablishment ? (
                  <div className="space-y-2">
                    <Label htmlFor="establishmentName">Nom de l'établissement *</Label>
                    <Input
                      id="establishmentName"
                      value={establishmentName}
                      onChange={(e) => setEstablishmentName(e.target.value)}
                      placeholder="Lycée Ibn Khaldoun"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isEstablishment && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        maxLength={10}
                        placeholder="0555123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de naissance</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "Sélectionner"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={setDateOfBirth}
                            disabled={(date) => date > new Date() || date < new Date("1940-01-01")}
                            initialFocus
                            className="p-3 pointer-events-auto"
                            captionLayout="dropdown-buttons"
                            fromYear={1940}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="schoolLevel">Niveau scolaire *</Label>
                    <Select
                      value={schoolLevel}
                      onValueChange={(value) => {
                        setSchoolLevel(value);
                        setFiliere("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {needsFiliere && (
                  <div className="space-y-2">
                    <Label htmlFor="filiere">Filière *</Label>
                    <Select value={filiere} onValueChange={setFiliere}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une filière" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILIERES_BY_LEVEL[schoolLevel]?.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === "student" && (
                  <LocationFields
                    wilaya={wilaya}
                    ville={ville}
                    ecole={ecole}
                    onWilayaChange={setWilaya}
                    onVilleChange={setVille}
                    onEcoleChange={setEcole}
                    required={false}
                  />
                )}

                {role === "student" && (
                  <div className="space-y-2">
                    <Label>Date de fin d'abonnement (optionnel)</Label>
                    <p className="text-xs text-muted-foreground">
                      Accorde un accès premium immédiat jusqu'à cette date, sans passer par un paiement.
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !subscriptionEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {subscriptionEndDate ? format(subscriptionEndDate, "dd/MM/yyyy") : "Aucune (compte gratuit)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={subscriptionEndDate}
                          onSelect={setSubscriptionEndDate}
                          disabled={(date) => date <= new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {isPedago && (
                  <div className="space-y-2">
                    <Label>Matières enseignées *</Label>
                    <p className="text-xs text-muted-foreground">
                      Une matière ne peut être enseignée que par un seul pédago à la fois.
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto rounded-md border p-3">
                      {SUBJECTS.map((subject) => {
                        const takenBy = takenSubjects[subject.id];
                        return (
                          <label
                            key={subject.id}
                            className={`flex items-center gap-2 text-sm ${takenBy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            title={takenBy ? `Déjà assignée à ${takenBy}` : undefined}
                          >
                            <Checkbox
                              checked={selectedSubjects.includes(subject.id)}
                              disabled={!!takenBy || loadingSubjects}
                              onCheckedChange={() => toggleSubject(subject.id)}
                            />
                            <span>{subject.icon} {subject.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
