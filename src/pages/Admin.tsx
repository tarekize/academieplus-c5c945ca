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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Separate users by role
  const pedagos = users.filter((user) => getPrimaryRole(user) === "pedago");
  const parents = users.filter((user) => getPrimaryRole(user) === "parent");
  const students = users.filter((user) => getPrimaryRole(user) === "student");

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

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Administration</h1>
                  <p className="text-sm text-muted-foreground">Tableau de bord administrateur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            iconColor="text-orange-500"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-background">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="pedagos" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Shield className="h-4 w-4" />
                Pédagos ({pedagos.length})
              </TabsTrigger>
              <TabsTrigger value="parents" className="flex items-center gap-2 data-[state=active]:bg-background">
                <User className="h-4 w-4" />
                Parents ({parents.length})
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2 data-[state=active]:bg-background">
                <GraduationCap className="h-4 w-4" />
                Élèves ({students.length})
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Activity className="h-4 w-4" />
                Activité
              </TabsTrigger>
            </TabsList>

            <AddUserDialog onUserAdded={refetch} />
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Parents */}
              <Card className="border-0 shadow-lg">
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
              <Card className="border-0 shadow-lg">
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
            <Card className="border-0 shadow-lg">
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
                      const userName = log.user
                        ? [log.user.first_name, log.user.last_name].filter(Boolean).join(" ") || log.user.email
                        : "Système";
                      return (
                        <div
                          key={log.id}
                          className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="p-2 rounded-full bg-muted">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{log.action}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              Par {userName}
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
            <Card className="border-0 shadow-lg">
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
                            toggleUserStatus(user.id, !user.is_active)
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
            <Card className="border-0 shadow-lg">
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
                            toggleUserStatus(user.id, !user.is_active)
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
            <Card className="border-0 shadow-lg">
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
                            toggleUserStatus(user.id, !user.is_active)
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

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card className="border-0 shadow-lg">
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
                      const userName = log.user
                        ? [log.user.first_name, log.user.last_name].filter(Boolean).join(" ") || log.user.email
                        : "Système";
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="p-2 rounded-full bg-muted">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">
                              Par {userName}
                            </p>
                            {log.details && (
                              <p className="text-sm text-muted-foreground mt-1 font-mono text-xs bg-muted/50 p-2 rounded">
                                {JSON.stringify(log.details)}
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
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className={`p-6 bg-gradient-to-br ${gradient}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-4xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-background/80 shadow-sm`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
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
  onToggleStatus,
  onDelete,
}: {
  user: AdminUser;
  showLevel?: boolean;
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
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Voir le profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCog className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleStatus}>
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
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
