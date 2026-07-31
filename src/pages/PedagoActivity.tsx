import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Plus, Pencil, Trash2, Loader2, BookOpen, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AppHeader } from "@/components/layout/AppHeader";

type ActivityAction = "create" | "update" | "delete";
type EntityType = "chapter" | "lesson" | "lesson_content" | "exam";
/** 'immediate' : titre/description, jamais gaté (toujours appliqué). 'deleted' :
 * l'élément n'existe plus (suppression confirmée). 'superseded' : version de
 * contenu remplacée par une soumission plus récente. */
type ReviewStatus = "pending" | "approved" | "rejected" | "immediate" | "deleted" | "superseded" | null;

interface ActivityRow {
  id: string;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id: string | null;
  entity_title: string | null;
  chapter_id: string | null;
  chapter_title: string | null;
  subject: string | null;
  school_level: string | null;
  created_at: string;
  review_status: ReviewStatus;
}

const ACTION_META: Record<ActivityAction, { label: string; icon: typeof Plus; color: string }> = {
  create: { label: "Ajout", icon: Plus, color: "bg-emerald-500/10 text-emerald-600" },
  update: { label: "Modification", icon: Pencil, color: "bg-amber-500/10 text-amber-600" },
  delete: { label: "Suppression", icon: Trash2, color: "bg-destructive/10 text-destructive" },
};

const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  chapter: "Chapitre",
  lesson: "Leçon",
  lesson_content: "Contenu de leçon",
  exam: "Examen",
};

/** Combine l'action ("Ajout"/"Modification"/"Suppression") au statut de
 * validation courant de l'élément visé, pour un badge du type "Ajout en
 * attente" / "Suppression refusée" / "Modification validée". */
function reviewBadge(action: ActivityAction, status: ReviewStatus) {
  const actionWord = action === "create" ? "Ajout" : action === "delete" ? "Suppression" : "Modification";
  switch (status) {
    case "pending":
      return { label: `${actionWord} en attente`, icon: Clock, className: "badge-status-pending gap-1" };
    case "approved":
      return { label: `${actionWord} validé(e)`, icon: CheckCircle2, className: "bg-green-100 text-green-700 border-green-200 gap-1" };
    case "rejected":
      return { label: `${actionWord} refusé(e)`, icon: XCircle, className: "gap-1" };
    case "superseded":
      return { label: "Remplacée par une version plus récente", icon: History, className: "gap-1" };
    case "deleted":
      return { label: "Supprimé", icon: Trash2, className: "gap-1" };
    case "immediate":
      return { label: "Appliqué directement", icon: CheckCircle2, className: "gap-1" };
    default:
      return null;
  }
}

export default function PedagoActivity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("pedago_activity_log_with_status" as any);
      if (!error) setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Mon activité"
        subtitle="Historique de vos ajouts, modifications et suppressions"
        titleIcon={History}
        onBack={() => navigate("/dashboard")}
        showProfileMenu={false}
      />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center text-muted-foreground">
              Aucune activité enregistrée pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const actionMeta = ACTION_META[row.action];
              const ActionIcon = actionMeta.icon;
              const subject = row.subject;
              const schoolLevel = row.school_level;
              const badge = reviewBadge(row.action, row.review_status);
              const BadgeIcon = badge?.icon;
              // Une modification de contenu de leçon refusée par l'admin peut être
              // corrigée : l'icône crayon devient cliquable et redirige vers la
              // leçon concernée, où le motif du refus est déjà affiché.
              const isFixableRejection = row.entity_type === "lesson_content" && row.review_status === "rejected" && row.entity_id;
              return (
                <Card key={row.id} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    {isFixableRejection ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-xl shrink-0 ${actionMeta.color} hover:opacity-80`}
                        onClick={() => navigate(`/lecon/${row.entity_id}`)}
                        aria-label="Corriger cette modification refusée"
                        title="Corriger cette modification refusée"
                      >
                        <ActionIcon className="h-5 w-5" />
                      </Button>
                    ) : (
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${actionMeta.color}`}>
                        <ActionIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{actionMeta.label}</Badge>
                        <span className="text-xs text-muted-foreground">{ENTITY_TYPE_LABEL[row.entity_type]}</span>
                        {badge && BadgeIcon && (
                          <Badge variant={row.review_status === "rejected" ? "destructive" : "secondary"} className={badge.className}>
                            <BadgeIcon className="h-3 w-3" /> {badge.label}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium truncate mt-0.5">{row.entity_title || "(sans titre)"}</p>
                      {(subject || schoolLevel || row.chapter_title) && (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {row.entity_type === "chapter" ? <BookOpen className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {subject} {schoolLevel ? `· ${schoolLevel}` : ""}
                          {row.entity_type !== "chapter" && row.chapter_title ? ` · ${row.chapter_title}` : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(row.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
