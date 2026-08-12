import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SUBJECTS } from "@/lib/subjects";
import { AdminUser } from "@/hooks/useAdmin";

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

interface EditUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

/** Rôle "principal" affiché/édité (un utilisateur peut avoir plusieurs rôles en base,
 * ce formulaire ne pilote que le premier). */
const getPrimaryRole = (user: AdminUser | null): string => user?.roles?.[0] || "student";

// Formulaire admin de modification d'un compte existant : identité, niveau scolaire,
// matières (pédago). Ne modifie ni le rôle ni l'email (l'email ne peut être changé que
// par l'utilisateur lui-même via lien de confirmation) — pas de champ mot de passe non
// plus, cette modale ne touche donc jamais aux identifiants de connexion.
export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const { user: currentAdmin } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [initialSubjects, setInitialSubjects] = useState<string[]>([]);
  const [takenSubjects, setTakenSubjects] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);

  const role = getPrimaryRole(user);
  const isEstablishment = role === "etablissement";
  const isPedago = role === "pedago";
  const isStudent = role === "student";

  // Réinitialise le formulaire à chaque ouverture sur un utilisateur donné —
  // sans ça, rouvrir la modale sur un autre utilisateur garderait les champs
  // du précédent le temps que les nouvelles valeurs arrivent.
  useEffect(() => {
    if (!open || !user) return;
    setFirstName(isEstablishment ? "" : user.first_name || "");
    setLastName(isEstablishment ? "" : user.last_name || "");
    setEstablishmentName(isEstablishment ? user.first_name || "" : "");
    setSchoolLevel(user.school_level || "");
  }, [open, user, isEstablishment]);

  // Charge les matières déjà assignées à ce pédago (pré-cochées) et celles
  // prises par d'autres pédagos (désactivées) — même logique que AddUserDialog,
  // en excluant cet utilisateur des "prises par un autre".
  useEffect(() => {
    if (!open || !user || !isPedago) return;
    setLoadingSubjects(true);
    supabase
      .from("pedago_subjects" as any)
      .select("subject_id, user_id, profiles:user_id(first_name, last_name, email)")
      .then(({ data, error }: any) => {
        if (error) {
          console.error("Error loading pedago subjects:", error);
          return;
        }
        const mine: string[] = [];
        const taken: Record<string, string> = {};
        for (const row of data || []) {
          if (row.user_id === user.id) {
            mine.push(row.subject_id);
          } else {
            const p = row.profiles;
            taken[row.subject_id] = p ? (`${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email) : "un autre pédago";
          }
        }
        setSelectedSubjects(mine);
        setInitialSubjects(mine);
        setTakenSubjects(taken);
      })
      .finally(() => setLoadingSubjects(false));
  }, [open, user, isPedago]);

  /** Coche/décoche une matière dans la sélection du pédago en édition. */
  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  };

  /** Enregistre le profil modifié + synchronise les matières du pédago (diff
   * initialSubjects/selectedSubjects → deletes + inserts ciblés), puis journalise l'action. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isEstablishment && !establishmentName.trim()) {
      toast.error("Veuillez saisir le nom de l'établissement.");
      return;
    }
    if (isPedago && selectedSubjects.length === 0) {
      toast.error("Sélectionnez au moins une matière enseignée par ce pédago.");
      return;
    }

    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: isEstablishment ? establishmentName.trim() : firstName.trim() || null,
          last_name: isEstablishment ? "" : lastName.trim() || null,
          school_level: isStudent && schoolLevel ? (schoolLevel as any) : null,
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      if (isPedago) {
        const toRemove = initialSubjects.filter((s) => !selectedSubjects.includes(s));
        const toAdd = selectedSubjects.filter((s) => !initialSubjects.includes(s));

        if (toRemove.length > 0) {
          const { error } = await supabase
            .from("pedago_subjects" as any)
            .delete()
            .in("subject_id", toRemove)
            .eq("user_id", user.id);
          if (error) throw error;
        }
        if (toAdd.length > 0) {
          const { error } = await supabase
            .from("pedago_subjects" as any)
            .insert(toAdd.map((subjectId) => ({ subject_id: subjectId, user_id: user.id })));
          if (error) {
            throw new Error(
              error.code === "23505"
                ? "Une des matières sélectionnées vient d'être assignée à un autre pédago. Réessayez."
                : error.message
            );
          }
        }
      }

      await supabase.rpc("log_activity", {
        _user_id: currentAdmin?.id,
        _action: "user_updated",
        _details: { target_user_id: user.id, target_user_email: user.email },
      });

      toast.success("Utilisateur mis à jour.");
      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            {user?.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {isEstablishment ? (
              <div className="space-y-2">
                <Label htmlFor="edit-establishmentName">Nom de l'établissement *</Label>
                <Input
                  id="edit-establishmentName"
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Prénom</Label>
                  <Input id="edit-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Nom</Label>
                  <Input id="edit-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">
                L'email de connexion se change uniquement par l'utilisateur lui-même (lien de confirmation), pas par l'admin.
              </p>
            </div>

            {isStudent && (
              <div className="space-y-2">
                <Label htmlFor="edit-schoolLevel">Niveau scolaire</Label>
                <Select value={schoolLevel} onValueChange={setSchoolLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
