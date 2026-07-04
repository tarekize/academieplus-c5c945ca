import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, User, Mail, Phone, MapPin, School, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import TeacherPageHeader from "./TeacherPageHeader";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wilaya: string | null;
  ville: string | null;
  ecole: string | null;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/40">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="font-medium truncate">{value || <span className="text-muted-foreground italic text-sm">Non renseigné</span>}</p>
      </div>
    </div>
  );
}

export default function TeacherProfile({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, wilaya, ville, ecole")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setProfile(data as Profile);
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async () => {
    if (!profile) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user-account", {
        body: { userId: profile.id },
      });
      if (error) throw error;
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
        <CardContent className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
          <InfoRow icon={<User className="h-4 w-4" />} label="Prénom" value={profile?.first_name} />
          <InfoRow icon={<User className="h-4 w-4" />} label="Nom" value={profile?.last_name} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile?.email} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Téléphone" value={profile?.phone} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Wilaya" value={profile?.wilaya} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Ville" value={profile?.ville} />
          <InfoRow icon={<School className="h-4 w-4" />} label="École" value={profile?.ecole} />
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
