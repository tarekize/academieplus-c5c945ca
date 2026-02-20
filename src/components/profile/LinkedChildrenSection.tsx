import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { UserPlus, Hash, Trash2, Eye, User, GraduationCap, Loader2 } from "lucide-react";
import { useLinkedChildren, LinkedChild } from "@/hooks/useProfile";
import { getSchoolLevelLabel } from "@/lib/validation";
import { toast } from "sonner";

// Helper to get full name from child profile
const getChildFullName = (child: LinkedChild["child"]): string => {
  if (!child) return "Compte élève";
  const parts = [child.first_name, child.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Sans nom";
};

export function LinkedChildrenSection() {
  const { children, loading, addChildByCode, removeChild } = useLinkedChildren();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddByCode = async () => {
    if (!code.trim()) {
      toast.error("Veuillez entrer un code");
      return;
    }

    setSubmitting(true);
    const result = await addChildByCode(code.trim());
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setCode("");
      setDialogOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveChild = async (linkId: string) => {
    await removeChild(linkId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Mes enfants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Mes enfants
            </CardTitle>
            <CardDescription>
              Gérez les liens avec les comptes de vos enfants
            </CardDescription>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un enfant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un enfant</DialogTitle>
                <DialogDescription>
                  Liez le compte de votre enfant à votre profil parent en utilisant son code de liaison
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Code de liaison</Label>
                  <Input
                    placeholder="ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                  <p className="text-sm text-muted-foreground">
                    Demandez à votre enfant de générer un code depuis son profil
                  </p>
                </div>
                <Button
                  onClick={handleAddByCode}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Hash className="h-4 w-4 mr-2" />
                  )}
                  Valider le code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {children.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun enfant lié pour le moment</p>
            <p className="text-sm">Cliquez sur "Ajouter un enfant" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((link) => (
              <ChildCard
                key={link.id}
                link={link}
                onRemove={() => handleRemoveChild(link.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChildCard({
  link,
  onRemove,
}: {
  link: LinkedChild;
  onRemove: () => void;
}) {
  const child = link.child;
  const fullName = getChildFullName(child);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={child.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{fullName}</h4>
            <Badge
              variant={link.status === "active" ? "default" : "secondary"}
            >
              {link.status === "active" ? "Actif" : "En attente"}
            </Badge>
          </div>
          {child?.email ? (
            <p className="text-sm text-muted-foreground">{child.email}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Informations indisponibles</p>
          )}
          {child?.school_level && (
            <p className="text-sm text-primary">
              {getSchoolLevelLabel(child.school_level)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Voir
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le lien ?</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment supprimer le lien avec {fullName} ?
                Cette action est réversible, vous pourrez recréer le lien ultérieurement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-destructive">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
