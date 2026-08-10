import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, User, Trash2, ShieldAlert, Save } from "lucide-react";
import { toast } from "sonner";
import TeacherPageHeader from "./TeacherPageHeader";
import LocationFields from "@/components/profile/LocationFields";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wilaya: string | null;
  ville: string | null;
  ecole: string | null;
  subject: string | null;
}

export default function TeacherProfile({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", wilaya: "", ville: "", ecole: "", subject: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, wilaya, ville, ecole, subject")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const p = data as Profile;
          setProfile(p);
          setForm({
            first_name: p.first_name || "",
            last_name: p.last_name || "",
            phone: p.phone || "",
            wilaya: p.wilaya || "",
            ville: p.ville || "",
            ecole: p.ecole || "",
            subject: p.subject || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          wilaya: form.wilaya || null,
          ville: form.ville || null,
          ecole: form.ecole || null,
          subject: form.subject.trim() || null,
        } as any)
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profil mis à jour");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user-account", {
        body: { userId: profile.id },
      });
      if (error) {
        // Sur une réponse non-2xx, response.data reste null : le vrai
        // message de l'edge function n'est lisible que via error.context.
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
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression du compte.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Enseignant";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <TeacherPageHeader
        icon={User}
        iconClassName="bg-indigo-500/10 text-indigo-600"
        title="Mon profil"
        description="Informations & compte"
        onBack={onBack}
      />

      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <div className="h-16 bg-[image:var(--gradient-primary)]" />
        <CardHeader className="-mt-8 pb-2">
          <div className="flex items-end gap-3">
            <div className="h-16 w-16 rounded-2xl bg-card border-4 border-card shadow-sm flex items-center justify-center shrink-0">
              <div className="h-full w-full rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <User className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
            <div className="pb-1">
              <CardTitle className="text-xl">{fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">Enseignant</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled className="text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Matière</Label>
              <Input id="subject" placeholder="Ex: Mathématiques" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
          </div>
          <LocationFields
            wilaya={form.wilaya}
            ville={form.ville}
            ecole={form.ecole}
            onWilayaChange={(val) => setForm((f) => ({ ...f, wilaya: val, ville: "" }))}
            onVilleChange={(val) => setForm((f) => ({ ...f, ville: val }))}
            onEcoleChange={(val) => setForm((f) => ({ ...f, ecole: val }))}
          />
          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer les modifications
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-destructive/30 bg-destructive/[0.03]">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Zone de danger</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cette action est irréversible. Toutes vos données (classes, exercices, quiz, examens) seront définitivement supprimées.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2 rounded-xl" disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Supprimer définitivement mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est <strong>irréversible</strong>. Votre compte, vos classes, vos exercices, quiz et examens seront définitivement supprimés. Vous serez déconnecté immédiatement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Oui, supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
