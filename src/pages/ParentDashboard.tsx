import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  UserPlus,
  Hash,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  email: string | null;
}

interface LinkedChild {
  id: string;
  child_id: string;
  status: string;
  created_at: string;
  child: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    school_level: string | null;
    avatar_url: string | null;
  } | null;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, school_level, email")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchChildren = useCallback(async (userId: string) => {
    setChildrenLoading(true);
    try {
      const { data, error } = await supabase
        .from("parent_child_links")
        .select(`
          id,
          child_id,
          status,
          created_at,
          child:profiles!parent_child_links_child_id_fkey(
            id,
            first_name,
            last_name,
            email,
            school_level,
            avatar_url
          )
        `)
        .eq("parent_id", userId);

      if (error) throw error;
      setChildren((data as any[]) || []);
    } catch (error: any) {
      console.error("Error fetching children:", error);
    } finally {
      setChildrenLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchProfile(user.id);
    fetchChildren(user.id);
  }, [user, authLoading, navigate, fetchProfile, fetchChildren]);


  const getFullName = (profile: Profile | null): string => {
    if (!profile) return "Utilisateur";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const getChildFullName = (child: LinkedChild["child"]): string => {
    if (!child) return "Compte élève";
    const parts = [child.first_name, child.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Sans nom";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate("/");
  };

  const handleAddByCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      sonnerToast.error("Veuillez entrer un code");
      return;
    }

    if (!user) return;

    // Validate code format (8 hex characters)
    if (!/^[a-f0-9]{8}$/i.test(trimmedCode)) {
      sonnerToast.error("Format de code invalide (8 caractères attendus)");
      return;
    }

    setSubmitting(true);
    try {
      // Call the edge function to link child by code (bypasses RLS)
      const { data, error } = await supabase.functions.invoke("link-child-by-code", {
        body: { code: trimmedCode },
      });

      if (error) {
        console.error("Edge function error:", error);
        sonnerToast.error(error.message || "Erreur lors de la liaison");
        return;
      }

      if (data?.error) {
        sonnerToast.error(data.error);
        return;
      }

      sonnerToast.success(data?.message || "Demande de liaison envoyée");
      setCode("");
      setDialogOpen(false);
      fetchChildren(user.id);
    } catch (error: any) {
      console.error("Error adding child by code:", error);
      sonnerToast.error(error.message || "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveChild = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      if (user) {
        fetchChildren(user.id);
      }
      sonnerToast.success("Lien supprimé avec succès");
    } catch (error: any) {
      console.error("Error removing child:", error);
      sonnerToast.error("Erreur lors de la suppression du lien");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fullName = getFullName(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>

            <div className="flex items-center gap-3">
              <ChangePasswordButton />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">Compte Parent</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Welcome + Add Child Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour {fullName} 👋
              </h1>
              <p className="text-muted-foreground">
                Suivez la progression de vos enfants
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <UserPlus className="h-5 w-5" />
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

          {/* Children Table Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Mes enfants
              </CardTitle>
              <CardDescription>
                Gérez les liens avec les comptes de vos enfants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {childrenLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Aucun enfant lié pour le moment</p>
                  <p className="text-sm">Cliquez sur "Ajouter un enfant" pour commencer</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enfant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {children.map((link) => {
                        const childName = getChildFullName(link.child);
                      const initials = childName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={link.child?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials || <UserIcon className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{childName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                              {link.child?.email ?? "—"}
                          </TableCell>
                          <TableCell>
                              {link.child?.school_level ? (
                              <Badge variant="outline">
                                  {getSchoolLevelLabel(link.child.school_level)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={link.status === "active" ? "default" : "secondary"}>
                              {link.status === "active" ? "Actif" : "En attente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRemoveChild(link.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;