import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Copy, Check, User, Loader2, CheckCircle, XCircle } from "lucide-react";
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
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
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
    <div className="space-y-5">
      {/* Pending Requests */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="rounded-2xl border-primary/30 bg-primary/[0.03] overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Demandes en attente</h3>
                    <p className="text-xs text-muted-foreground">
                      Des parents souhaitent se lier à votre compte
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-3 p-5">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Links & Code Generation */}
      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Mes parents liés
            </CardTitle>
            <CardDescription>
              Les parents qui peuvent suivre votre progression
            </CardDescription>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2 active:scale-95 transition-transform shrink-0">
                <Copy className="h-4 w-4" />
                Mon code de liaison
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Code de liaison</DialogTitle>
                <DialogDescription>
                  Partagez ce code avec votre parent pour qu'il puisse se lier à votre compte
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {linkingCode ? (
                  <>
                    <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/10">
                      <span className="text-3xl font-mono font-bold tracking-widest text-primary">
                        {linkingCode}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyCode}
                        className="rounded-full active:scale-90 transition-transform"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-500" />
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
        </CardHeader>

        <CardContent>
          {activeLinks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                <Users className="h-7 w-7 opacity-50" />
              </div>
              <p className="font-medium">Aucun parent lié pour le moment</p>
              <p className="text-sm">
                Partagez votre code de liaison avec vos parents
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLinks.map((link) => (
                <ParentCard key={link.id} link={link} />
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 ring-2 ring-primary/10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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

      <div className="flex items-center gap-2 shrink-0">
        <Button onClick={onAccept} size="sm" className="rounded-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-transform">
          <CheckCircle className="h-4 w-4" />
          Accepter
        </Button>
        <Button onClick={onReject} variant="outline" size="sm" className="rounded-full gap-1.5 text-destructive hover:text-destructive active:scale-95 transition-transform">
          <XCircle className="h-4 w-4" />
          Refuser
        </Button>
      </div>
    </div>
  );
}

function ParentCard({
  link,
}: {
  link: LinkedParent;
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
    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 ring-2 ring-primary/10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{fullName}</h4>
            <Badge variant="default" className="rounded-full">Parent</Badge>
          </div>
          {parent?.email ? (
            <p className="text-sm text-muted-foreground">{parent.email}</p>
          ) : parent?.first_name || parent?.last_name ? (
            <p className="text-sm text-muted-foreground">Compte parent lié</p>
          ) : (
            <p className="text-sm text-muted-foreground">Compte parent</p>
          )}
        </div>
      </div>
    </div>
  );
}
