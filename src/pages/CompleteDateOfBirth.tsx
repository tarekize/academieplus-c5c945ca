import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { parse, isValid } from "date-fns";
import { GraduationCap } from "lucide-react";

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/** Collecte douce (au prochain login) de la date de naissance pour les
 * comptes élève créés avant que ce champ ne devienne obligatoire à
 * l'inscription — voir migration 20260803150001_dob_regularization_rpc et
 * AuthContext.tsx. L'utilisateur peut différer ("Plus tard") : la page ne
 * réapparaît qu'à la prochaine connexion, pas à chaque navigation. */
export default function CompleteDateOfBirth() {
  const navigate = useNavigate();
  const [dateOfBirthInput, setDateOfBirthInput] = useState("");
  const [needsParentEmail, setNeedsParentEmail] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedDob = dateOfBirthInput.length === 10 ? parse(dateOfBirthInput, "dd/MM/yyyy", new Date()) : null;
  const validDob = parsedDob && isValid(parsedDob) && parsedDob <= new Date() ? parsedDob : null;
  const age = validDob ? calculateAge(validDob) : null;

  const handleDobChange = (raw: string) => {
    let value = raw.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = "";
    if (value.length > 0) formatted += value.slice(0, 2);
    if (value.length > 2) formatted += "/" + value.slice(2, 4);
    if (value.length > 4) formatted += "/" + value.slice(4, 8);
    setDateOfBirthInput(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validDob) { toast.error("Date de naissance invalide."); return; }
    if (age !== null && age < 15 && !needsParentEmail) setNeedsParentEmail(true);
    if (age !== null && age < 15 && !parentEmail.trim()) {
      if (!needsParentEmail) return;
      toast.error("L'email d'un parent/tuteur est requis.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("submit_missing_date_of_birth", {
        p_date_of_birth: `${validDob.getFullYear()}-${String(validDob.getMonth() + 1).padStart(2, "0")}-${String(validDob.getDate()).padStart(2, "0")}`,
        p_consent_parent_email: age !== null && age < 15 ? parentEmail.trim() : null,
      });
      if (error) throw error;
      toast.success("Merci ! Votre profil est à jour.");
      navigate("/cours/math/chapitres");
    } catch (err: any) {
      toast.error(err.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => {
    navigate("/cours/math/chapitres");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Une dernière information</CardTitle>
          <CardDescription>
            Nous avons besoin de votre date de naissance pour finaliser votre profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date de naissance</Label>
              <Input
                id="dob"
                placeholder="JJ/MM/AAAA"
                value={dateOfBirthInput}
                onChange={(e) => handleDobChange(e.target.value)}
              />
            </div>

            {age !== null && age < 15 && (
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email d'un parent ou tuteur</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@exemple.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Étant donné votre âge, nous devons obtenir le consentement d'un parent ou tuteur légal. Un email de confirmation lui sera envoyé.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleLater} disabled={loading}>
                Plus tard
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !validDob}>
                {loading ? "Enregistrement..." : "Valider"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
