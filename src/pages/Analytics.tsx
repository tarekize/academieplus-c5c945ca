import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Json } from "@/integrations/supabase/types";
import { ArrowLeft, BarChart3, Users, ListChecks, Activity } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Json | null;
  ip_address: string | null;
  created_at: string | null;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface Stats {
  totalLogs: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
}

// Le code brut de l'action (ex: "generate_remediation") ne dit rien à un
// admin qui lit le journal : cette table traduit chaque action connue en
// description compréhensible. Les codes non répertoriés (nouvelle action
// pas encore ajoutée ici) tombent sur un replis lisible plutôt qu'une
// erreur — le code brut mis en forme (underscores → espaces, majuscule).
const ACTION_DESCRIPTIONS: Record<string, string> = {
  // IA — génération de contenu pédagogique
  generate_remediation: "Génération par IA d'un plan de remédiation pour un élève en difficulté",
  generate_placement_test: "Génération par IA du test de positionnement",
  generate_adaptive_content: "Génération par IA du contenu adaptatif d'une leçon",
  generate_chapter_revision: "Génération par IA d'une fiche de révision de chapitre",
  generate_lesson_comment: "Génération par IA d'un commentaire sur une leçon",
  generate_periodic_advice: "Génération par IA d'un conseil périodique pour un parent",
  generate_parent_report: "Génération par IA du rapport de suivi envoyé à un parent",
  ia_teacher_content_request: "Génération par IA d'exercices/quiz par un enseignant",
  ia_extract_document: "Extraction de contenu depuis un document importé (IA)",
  ia_exam_exercise_request: "Génération par IA d'un exercice d'examen",
  ia_editorial_request: "Utilisation de l'assistant éditorial IA",
  ia_chat_request: "Message envoyé à l'assistant IA (chat)",
  // Paiement et abonnement
  record_payment: "Paiement enregistré (activation d'un abonnement)",
  // Compte et sécurité
  password_change_request: "Demande de changement de mot de passe",
  password_change_confirm: "Changement de mot de passe confirmé",
  password_change_code_requested: "Code de vérification demandé (changement de mot de passe)",
  user_deleted: "Suppression d'un compte utilisateur",
  user_updated: "Modification d'un compte utilisateur par un administrateur",
  profile_updated: "Mise à jour de son propre profil",
  create_child_account: "Création d'un compte enfant par un parent",
  join_class_attempt: "Tentative de rejoindre une classe avec un code",
  link_code_attempt: "Tentative de liaison d'un compte enfant par code",
  // Contenu pédagogique et communication
  course_sent_to_review: "Contenu envoyé en relecture par un pédagogue",
  send_bulk_notification: "Envoi d'une notification groupée",
  // Maintenance automatique (RGPD)
  delete_old_activity_logs: "Nettoyage automatique des anciens logs d'activité (RGPD)",
  delete_expired_parental_consent_tokens: "Nettoyage des demandes de consentement parental expirées",
  delete_old_contact_messages: "Nettoyage des anciens messages de contact",
};

function describeAction(action: string, details: Json | null): string {
  const base = ACTION_DESCRIPTIONS[action]
    ?? action.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

  if (action === "user_deleted" && details && typeof details === "object" && !Array.isArray(details)) {
    const selfDelete = (details as Record<string, unknown>).self_delete;
    if (selfDelete === true) return "Suppression de son propre compte";
    if (selfDelete === false) return "Suppression du compte d'un autre utilisateur";
  }

  return base;
}

const Analytics = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setLogs(logsData || []);

      const userIds = [...new Set((logsData || []).map((log) => log.user_id).filter(Boolean))] as string[];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        const map: Record<string, UserProfile> = {};
        (profilesData || []).forEach((p: any) => {
          map[p.id] = { first_name: p.first_name, last_name: p.last_name, email: p.email };
        });
        setUserNames(map);
      }

      // Calculate stats
      if (logsData) {
        const uniqueUsers = new Set(logsData.map(log => log.user_id).filter(Boolean)).size;
        const actionCounts = logsData.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topActions = Object.entries(actionCounts)
          .map(([action, count]) => ({ action, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalLogs: logsData.length,
          uniqueUsers,
          topActions,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error("Erreur", {
        description: "Impossible de charger les données d'analyse",
      });
    } finally {
      setLoading(false);
    }
  };

  const userLabel = (userId: string | null) => {
    if (!userId) return '-';
    const p = userNames[userId];
    const name = p ? [p.first_name, p.last_name].filter(Boolean).join(' ').trim() : '';
    return name || p?.email || `${userId.slice(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pro-shell container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold">Analytics</h1>
                <p className="text-sm text-muted-foreground">Activité de la plateforme et journal des événements</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold">{stats.totalLogs}</p>
                  <p className="text-xs text-muted-foreground">Total des logs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold">{stats.uniqueUsers}</p>
                  <p className="text-xs text-muted-foreground">Utilisateurs uniques</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="h-4 w-4 text-purple-600" />
                  Actions principales
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {stats.topActions.map((item, index) => (
                    <li key={index} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground" title={describeAction(item.action, null)}>
                        {describeAction(item.action, null)}
                      </span>
                      <Badge variant="secondary" className="rounded-full shrink-0">{item.count}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Logs récents</CardTitle>
            <CardDescription>Les 50 dernières activités</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Utilisateur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        Aucun log pour le moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full font-normal">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs">
                          {describeAction(log.action, log.details)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{userLabel(log.user_id)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
