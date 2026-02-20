import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Users, Copy, Check, Trash2, User, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLinkedParents, LinkedParent } from "@/hooks/useProfile";
import { toast } from "sonner";

// Helper to get full name from parent profile
const getParentFullName = (parent: LinkedParent["parent"]): string => {
  if (!parent) return "Compte parent";
  const parts = [parent.first_name, parent.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Sans nom";
};

export function LinkedParentsSection() {
  const { parents, linkingCode, loading, respondToRequest, removeParent } =
    useLinkedParents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (linkingCode) {
      navigator.clipboard.writeText(linkingCode);
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    await respondToRequest(requestId, accept);
  };

  const handleRemoveParent = async (linkId: string) => {
    await removeParent(linkId);
  };

  const pendingRequests = parents.filter((p) => p.status === "pending");
  const activeLinks = parents.filter((p) => p.status === "active");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mes parents
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
    <div className="space-y-4">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              Demandes en attente
            </CardTitle>
            <CardDescription>
              Des parents souhaitent se lier à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((link) => (
              <PendingRequestCard
                key={link.id}
                link={link}
                onAccept={() => handleRespond(link.id, true)}
                onReject={() => handleRespond(link.id, false)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Links & Code Generation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mes parents liés
              </CardTitle>
              <CardDescription>
                Les parents qui peuvent suivre votre progression
              </CardDescription>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Mon code de liaison
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Code de liaison</DialogTitle>
                  <DialogDescription>
                    Partagez ce code avec votre parent pour qu'il puisse se lier à votre compte
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  {linkingCode ? (
                    <>
                      <div className="flex items-center justify-center gap-4 p-6 bg-secondary rounded-lg">
                        <span className="text-3xl font-mono font-bold tracking-widest">
                          {linkingCode}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyCode}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-center text-muted-foreground">
                        Ce code est unique à votre compte
                      </p>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Aucun code de liaison disponible
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {activeLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun parent lié pour le moment</p>
              <p className="text-sm">
                Partagez votre code de liaison avec vos parents
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLinks.map((link) => (
                <ParentCard
                  key={link.id}
                  link={link}
                  onRemove={() => handleRemoveParent(link.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PendingRequestCard({
  link,
  onAccept,
  onReject,
}: {
  link: LinkedParent;
  onAccept: () => void;
  onReject: () => void;
}) {
  const parent = link.parent;
  const fullName = getParentFullName(parent);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div>
          <h4 className="font-medium">{fullName}</h4>
          {parent?.email ? (
            <p className="text-sm text-muted-foreground">{parent.email}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Informations indisponibles</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onAccept} size="sm" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Accepter
        </Button>
        <Button onClick={onReject} variant="outline" size="sm" className="text-destructive">
          <XCircle className="h-4 w-4 mr-2" />
          Refuser
        </Button>
      </div>
    </div>
  );
}

function ParentCard({
  link,
  onRemove,
}: {
  link: LinkedParent;
  onRemove: () => void;
}) {
  const parent = link.parent;
  const fullName = getParentFullName(parent);
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
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{fullName}</h4>
            <Badge variant="default">Parent</Badge>
          </div>
          {parent?.email ? (
            <p className="text-sm text-muted-foreground">{parent.email}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Informations indisponibles</p>
          )}
        </div>
      </div>

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
              Ce parent ne pourra plus suivre votre progression.
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
  );
}
