import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers, useActivityLogs, AdminUser } from "@/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  User,
  Shield,
  Search,
  MoreHorizontal,
  Eye,
  UserCog,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
  Activity,
  TrendingUp,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getSchoolLevelLabel } from "@/lib/validation";
import { AddUserDialog } from "@/components/admin/AddUserDialog";

// Helper to get full name from profile
const getFullName = (user: AdminUser): string => {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Sans nom";
};

// Helper to get primary role from roles array
const getPrimaryRole = (user: AdminUser): string => {
  if (user.roles && user.roles.length > 0) {
    return user.roles[0];
  }
  return "student";
};

export default function Admin() {
  const navigate = useNavigate();
  const { users, stats, loading, toggleUserStatus, deleteUser, refetch } = useAdminUsers();
  const { logs, loading: logsLoading } = useActivityLogs(100);

  const [searchQueryPedagos, setSearchQueryPedagos] = useState("");
  const [searchQueryParents, setSearchQueryParents] = useState("");
  const [searchQueryStudents, setSearchQueryStudents] = useState("");
  const [searchQueryTeachers, setSearchQueryTeachers] = useState("");
  const [searchQueryEtablissements, setSearchQueryEtablissements] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Separate users by role
  const pedagos = users.filter((user) => getPrimaryRole(user) === "pedago");
  const parents = users.filter((user) => getPrimaryRole(user) === "parent");
  const students = users.filter((user) => getPrimaryRole(user) === "student");
  const teachers = users.filter((user) => getPrimaryRole(user) === "teacher");
  const etablissements = users.filter((user) => getPrimaryRole(user) === "etablissement");

  // Filter pedagos
  const filteredPedagos = pedagos.filter((user) => {
    const fullName = getFullName(user);
    return (
      fullName.toLowerCase().includes(searchQueryPedagos.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQueryPedagos.toLowerCase())
    );
  });

  // Filter parents
  const filteredParents = parents.filter((user) => {
    const fullName = getFullName(user);
    return (
      fullName.toLowerCase().includes(searchQueryParents.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQueryParents.toLowerCase())
    );
  });

  // Filter students
  const filteredStudents = students.filter((user) => {
    const fullName = getFullName(user);
    return (
      fullName.toLowerCase().includes(searchQueryStudents.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQueryStudents.toLowerCase())
    );
  });

  // Filter teachers
  const filteredTeachers = teachers.filter((user) => {
    const fullName = getFullName(user);
    return (
      fullName.toLowerCase().includes(searchQueryTeachers.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQueryTeachers.toLowerCase())
    );
  });

  // Filter etablissements
  const filteredEtablissements = etablissements.filter((user) => {
    const fullName = getFullName(user);
    return (
      fullName.toLowerCase().includes(searchQueryEtablissements.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQueryEtablissements.toLowerCase())
    );
  });



  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id, userToDelete.email);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Administration</h1>
                <p className="text-xs text-muted-foreground leading-tight">Tableau de bord administrateur</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total utilisateurs"
            value={stats.totalUsers}
            icon={Users}
            gradient="from-primary/20 to-primary/5"
            iconColor="text-primary"
          />
          <StatCard
            title="Élèves"
            value={stats.students}
            icon={GraduationCap}
            gradient="from-blue-500/20 to-blue-500/5"
            iconColor="text-blue-500"
          />
          <StatCard
            title="Parents"
            value={stats.parents}
            icon={User}
            gradient="from-green-500/20 to-green-500/5"
            iconColor="text-green-500"
          />
          <StatCard
            title="Nouveaux (7j)"
            value={stats.newUsersThisWeek}
            icon={TrendingUp}
            gradient="from-orange-500/20 to-orange-500/5"
            iconColor="text-amber"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="bg-muted/60 rounded-xl p-1 h-auto gap-0.5">
              <TabsTrigger value="dashboard" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="pedagos" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <Shield className="h-3.5 w-3.5" />
                Pédagos <span className="text-xs opacity-60">({pedagos.length})</span>
              </TabsTrigger>
              <TabsTrigger value="parents" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <User className="h-3.5 w-3.5" />
                Parents <span className="text-xs opacity-60">({parents.length})</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <GraduationCap className="h-3.5 w-3.5" />
                Élèves <span className="text-xs opacity-60">({students.length})</span>
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <UserCog className="h-3.5 w-3.5" />
                Enseignants <span className="text-xs opacity-60">({teachers.length})</span>
              </TabsTrigger>
              <TabsTrigger value="etablissements" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <Building2 className="h-3.5 w-3.5" />
                Établissements <span className="text-xs opacity-60">({etablissements.length})</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-2 text-sm">
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Activité</span>
              </TabsTrigger>
            </TabsList>

            <AddUserDialog onUserAdded={refetch} />
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Parents */}
              <Card className="rounded-2xl border-border/50">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <User className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Parents récents</CardTitle>
                        <CardDescription>Les 5 derniers inscrits</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{parents.length} total</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {parents.slice(0, 5).map((user) => (
                      <UserCompactRow key={user.id} user={user} />
                    ))}
                    {parents.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun parent inscrit
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Students */}
              <Card className="rounded-2xl border-border/50">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Élèves récents</CardTitle>
                        <CardDescription>Les 5 derniers inscrits</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{students.length} total</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {students.slice(0, 5).map((user) => (
                      <UserCompactRow key={user.id} user={user} showLevel />
                    ))}
                    {students.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun élève inscrit
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Activité récente</CardTitle>
                    <CardDescription>Dernières actions sur la plateforme</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {logsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune activité récente
                  </p>
                ) : (
                  <div className="divide-y">
                    {logs.slice(0, 5).map((log) => {
                      const d: any = {};
                      try {
                        const parsed = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                        Object.assign(d, parsed || {});
                      } catch (e) {
                        console.warn("Could not parse log details", e);
                      }
                      const actorName = d.admin_name
                        || (log.user ? [log.user.first_name, log.user.last_name].filter(Boolean).join(" ") || log.user.email : null)
                        || "Système";

                      let actionLine: string = log.action;
                      if (log.action === "user_deleted") {
                        const targetEmail = d.target_user_email || d.target_email || d.email;
                        const targetName = d.target_user_name || d.target_name || d.name;
                        const target = targetName || targetEmail || "un utilisateur";
                        actionLine = `${actorName} a supprimé ${target}`;
                      } else if (log.action === "user_activated") {
                        const targetEmail = d.target_user_email || d.target_email || d.email;
                        const targetName = d.target_user_name || d.target_name || d.name;
                        const target = targetName || targetEmail || "un utilisateur";
                        actionLine = `${actorName} a activé ${target}`;
                      } else if (log.action === "user_deactivated") {
                        const targetEmail = d.target_user_email || d.target_email || d.email;
                        const targetName = d.target_user_name || d.target_name || d.name;
                        const target = targetName || targetEmail || "un utilisateur";
                        actionLine = `${actorName} a désactivé ${target}`;
                      }

                      return (
                        <div
                          key={log.id}
                          className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="p-2 rounded-full bg-muted">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{actionLine}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              Par {actorName}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {log.created_at && format(new Date(log.created_at), "dd MMM HH:mm", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedagos Tab */}
          <TabsContent value="pedagos">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Shield className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle>Gestion des Pédagos</CardTitle>
                      <CardDescription>
                        {filteredPedagos.length} pédago(s) affiché(s)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un pédago..."
                      value={searchQueryPedagos}
                      onChange={(e) => setSearchQueryPedagos(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Pédago</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPedagos.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          onToggleStatus={() =>
                            toggleUserStatus(user.id, !user.is_active, user.email || '')
                          }
                          onDelete={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                      {filteredPedagos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Aucun pédago trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle>Gestion des Parents</CardTitle>
                      <CardDescription>
                        {filteredParents.length} parent(s) affiché(s)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un parent..."
                      value={searchQueryParents}
                      onChange={(e) => setSearchQueryParents(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Parent</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParents.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          onToggleStatus={() =>
                            toggleUserStatus(user.id, !user.is_active, user.email || '')
                          }
                          onDelete={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                      {filteredParents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Aucun parent trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle>Gestion des Élèves</CardTitle>
                      <CardDescription>
                        {filteredStudents.length} élève(s) affiché(s)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un élève..."
                      value={searchQueryStudents}
                      onChange={(e) => setSearchQueryStudents(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Élève</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          showLevel
                          onToggleStatus={() =>
                            toggleUserStatus(user.id, !user.is_active, user.email || '')
                          }
                          onDelete={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Aucun élève trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <UserCog className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <CardTitle>Gestion des Enseignants</CardTitle>
                      <CardDescription>
                        {filteredTeachers.length} enseignant(s) affiché(s)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un enseignant..."
                      value={searchQueryTeachers}
                      onChange={(e) => setSearchQueryTeachers(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Enseignant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          onToggleStatus={() =>
                            toggleUserStatus(user.id, !user.is_active, user.email || '')
                          }
                          onDelete={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                      {filteredTeachers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Aucun enseignant trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Etablissements Tab */}
          <TabsContent value="etablissements">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Building2 className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle>Gestion des Établissements</CardTitle>
                      <CardDescription>
                        {filteredEtablissements.length} établissement(s) affiché(s)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un établissement..."
                        value={searchQueryEtablissements}
                        onChange={(e) => setSearchQueryEtablissements(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/contrats")}>
                      Gérer les contrats
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Établissement</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEtablissements.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          hideToggle
                          onToggleStatus={() => {}}
                          onDelete={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                      {filteredEtablissements.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Aucun établissement trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Historique d'activité</CardTitle>
                    <CardDescription>
                      Toutes les actions sur les comptes utilisateurs
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune activité récente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => {
                      const d: any = {};
                      try {
                        const parsed = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                        Object.assign(d, parsed || {});
                      } catch (e) {
                        console.warn("Could not parse log details", e);
                      }
                      const actorName = d.admin_name
                        || (log.user ? [log.user.first_name, log.user.last_name].filter(Boolean).join(" ") || log.user.email : null)
                        || "Admin Système";

                      let actionText = log.action;
                      let detailsText: string | null = null;

                      if (log.action === "user_deleted") {
                        actionText = "Suppression d'un compte utilisateur";
                        const targetEmail = d.target_user_email || d.target_email || d.email;
                        const targetName = d.target_user_name || d.target_name || d.name;
                        const target = targetName && targetEmail
                          ? `${targetName} (${targetEmail})`
                          : targetEmail || targetName;
                        detailsText = target
                          ? `${actorName} a supprimé ${target}`
                          : `${actorName} a supprimé un utilisateur`;
                      } else if (log.action === "user_activated") {
                        actionText = "Activation d'un compte utilisateur";
                        const targetEmail = d.target_user_email || d.target_email || d.email;
                        const targetName = d.target_user_name || d.target_name || d.name;
                        const target = targetName && targetEmail ? `${targetName} (${targetEmail})` : targetEmail || targetName;
                        detailsText = target
                          ? `${actorName} a activé ${target}`
                          : `${actorName} a activé un utilisateur`;
                      } else if (log.action === "user_deactivated") {
                        actionText = "Désactivation d'un compte utilisateur";
                        const targetEmail = d.target_user_email || d.target_email || d.email;
                        const targetName = d.target_user_name || d.target_name || d.name;
                        const target = targetName && targetEmail ? `${targetName} (${targetEmail})` : targetEmail || targetName;
                        detailsText = target
                          ? `${actorName} a désactivé ${target}`
                          : `${actorName} a désactivé un utilisateur`;
                      }

                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="p-2 rounded-full bg-muted">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-primary">{actionText}</p>
                            <p className="text-sm text-muted-foreground">
                              Par {actorName}
                            </p>
                            {detailsText && (
                              <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-md">
                                {detailsText}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {log.created_at && format(new Date(log.created_at), "dd MMM HH:mm", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer le compte de{" "}
              <strong>{userToDelete ? getFullName(userToDelete) : ''}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconColor,
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} border border-border/40`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
          <p className="font-display text-3xl font-extrabold mt-0.5">{value}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/80 shadow-sm flex-shrink-0">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function UserCompactRow({ user, showLevel }: { user: AdminUser; showLevel?: boolean }) {
  const fullName = getFullName(user);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{fullName}</p>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      </div>
      {showLevel && user.school_level && (
        <Badge variant="outline" className="text-xs">
          {getSchoolLevelLabel(user.school_level)}
        </Badge>
      )}
      <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
        {user.is_active ? "Actif" : "Inactif"}
      </Badge>
    </div>
  );
}

function UserRow({
  user,
  showLevel,
  hideToggle,
  onToggleStatus,
  onDelete,
}: {
  user: AdminUser;
  showLevel?: boolean;
  hideToggle?: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const fullName = getFullName(user);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      {showLevel && (
        <TableCell>
          {user.school_level ? (
            <Badge variant="outline">{getSchoolLevelLabel(user.school_level)}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      )}
      <TableCell>
        <Badge variant={user.is_active ? "default" : "secondary"}>
          {user.is_active ? "Actif" : "Inactif"}
        </Badge>
      </TableCell>
      <TableCell>
        {user.created_at && format(new Date(user.created_at), "dd/MM/yyyy", { locale: fr })}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-border/50">
            {!hideToggle ? (
              <DropdownMenuItem onClick={onToggleStatus} className="rounded-lg cursor-pointer">
                {user.is_active ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs rounded-lg">
                Statut géré via la page Contrats
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg cursor-pointer">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
