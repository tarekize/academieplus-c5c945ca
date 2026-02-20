import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean | null;
  roles: string[];
}

export default function GestionEquipe() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadTeam();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roles?.some(r => r.role === 'admin');
    setIsAdmin(hasAdminRole || false);

    if (!hasAdminRole) {
      toast.error("Accès refusé - Administrateurs uniquement");
      navigate('/editorial');
    }
  };

  const loadTeam = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, is_active')
        .order('email');

      if (profilesError) throw profilesError;

      // Load roles for each user
      const teamWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: userRoles?.map(r => r.role) || []
          };
        })
      );

      setTeam(teamWithRoles);
    } catch (error) {
      console.error('Error loading team:', error);
      toast.error("Erreur lors du chargement de l'équipe");
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (member: TeamMember) => {
    const parts = [member.first_name, member.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Sans nom";
  };

  const updateRole = async (userId: string, role: string, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: role as any }]);

        if (error) throw error;
        toast.success(`Rôle ${role} ajouté`);
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role as any);

        if (error) throw error;
        toast.success(`Rôle ${role} retiré`);
      }

      await loadTeam();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(currentStatus ? "Utilisateur désactivé" : "Utilisateur activé");
      await loadTeam();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const deleteUser = async () => {
    if (!selectedMember) return;

    try {
      // Delete roles first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedMember.id);

      // Then delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedMember.id);

      if (error) throw error;

      toast.success("Utilisateur supprimé");
      setShowDeleteDialog(false);
      setSelectedMember(null);
      await loadTeam();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800 border-red-300',
      'parent': 'bg-blue-100 text-blue-800 border-blue-300',
      'student': 'bg-green-100 text-green-800 border-green-300'
    };

    return (
      <Badge variant="outline" className={variants[role] || ''}>
        {role}
      </Badge>
    );
  };

  const filteredTeam = team.filter(member => 
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getFullName(member).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/editorial')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Gestion de l'équipe
              </h1>
              <p className="text-muted-foreground mt-1">
                Gérez les membres et leurs rôles
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <div className="text-sm text-muted-foreground">
              {filteredTeam.length} membre{filteredTeam.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        {/* Team table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôles</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeam.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {getFullName(member)}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.length > 0 ? (
                        member.roles.map(role => (
                          <div key={role} className="flex items-center gap-1">
                            {getRoleBadge(role)}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateRole(member.id, role, 'remove')}
                            >
                              ×
                            </Button>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucun rôle</span>
                      )}
                      <Select onValueChange={(value) => updateRole(member.id, value, 'add')}>
                        <SelectTrigger className="w-[120px] h-7">
                          <SelectValue placeholder="+ Rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="student">Élève</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "default" : "secondary"}>
                      {member.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(member.id, member.is_active)}
                      >
                        {member.is_active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTeam.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucun membre trouvé
            </div>
          )}
        </Card>

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedMember ? getFullName(selectedMember) : ''} ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedMember(null)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}