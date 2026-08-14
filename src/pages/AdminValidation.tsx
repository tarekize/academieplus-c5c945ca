import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ClipboardCheck, BookOpen, FileText, FilePlus2, PenTool, Brain, Loader2, ArrowRight,
  History, CheckCircle2, XCircle, Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExpandableText } from "@/components/ui/expandable-text";
import { TRIMESTER_LABELS } from "@/lib/examTypes";
import { AppHeader } from "@/components/layout/AppHeader";

type ItemType = "chapter" | "lesson" | "lesson_creation" | "exercise" | "quiz" | "chapter_deletion" | "lesson_deletion" | "exam" | "exam_deletion";

interface PendingItem {
  id: string;
  item_type: ItemType;
  title: string;
  difficulty: number | null;
  chapter_id: string;
  chapter_title: string;
  subject: string;
  school_level: string;
  filiere_id: string | null;
  filiere_code: string | null;
  filiere_name: string | null;
  lesson_id: string | null;
  lesson_title: string | null;
  submitted_by_name: string | null;
  submitted_at: string | null;
  deletion_reason: string | null;
  trimester: number | null;
}

interface HistoryItem extends PendingItem {
  status: "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
}

const ITEM_TYPE_META: Record<ItemType, { label: string; icon: typeof BookOpen; color: string }> = {
  chapter: { label: "Nouveau chapitre", icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
  lesson_creation: { label: "Nouvelle leçon", icon: FilePlus2, color: "bg-cyan-500/10 text-cyan-600" },
  lesson: { label: "Contenu de leçon", icon: FileText, color: "bg-indigo-500/10 text-indigo-600" },
  exercise: { label: "Exercice", icon: PenTool, color: "bg-amber-500/10 text-amber-600" },
  quiz: { label: "Quiz", icon: Brain, color: "bg-emerald-500/10 text-emerald-600" },
  chapter_deletion: { label: "Suppression de chapitre", icon: Trash2, color: "bg-red-500/10 text-red-600" },
  lesson_deletion: { label: "Suppression de leçon", icon: Trash2, color: "bg-orange-500/10 text-orange-600" },
  exam: { label: "Examen", icon: FileText, color: "bg-rose-500/10 text-rose-600" },
  exam_deletion: { label: "Suppression d'examen", icon: Trash2, color: "bg-red-500/10 text-red-600" },
};

export default function AdminValidation() {
  const navigate = useNavigate();
  const [view, setView] = useState<"pending" | "history">("pending");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Charge tous les contenus en attente de validation (chapitres, leçons,
  // exercices/quiz, examens, demandes de suppression), tous types confondus,
  // via la RPC admin_pending_content_items (admin-only côté serveur).
  // Déclenché au montage de la page.
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_pending_content_items" as any);
    if (!error) setItems((data as any) || []);
    setLoading(false);
  };

  // Charge l'historique des décisions de validation déjà prises (approuvé/
  // refusé), via la RPC admin_content_review_history (admin-only côté
  // serveur). Chargé une seule fois, à la première ouverture de l'onglet
  // "Historique" (historyLoaded évite de recharger à chaque bascule d'onglet).
  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data, error } = await supabase.rpc("admin_content_review_history" as any);
    if (!error) setHistoryItems((data as any) || []);
    setHistoryLoading(false);
    setHistoryLoaded(true);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (view === "history" && !historyLoaded) fetchHistory();
  }, [view, historyLoaded]);

  // Construit l'URL de la page où l'admin peut examiner/valider l'item
  // (grille de chapitres, éditeur de leçon, ou revue d'examen selon le type),
  // utilisée par le bouton "Examiner" de chaque carte.
  const reviewUrl = (item: PendingItem): string => {
    const filiereQs = item.filiere_code ? `?filiere=${item.filiere_code}` : "";
    if (item.item_type === "lesson") return `/lecon/${item.lesson_id}`;
    if ((item.item_type === "exercise" || item.item_type === "quiz") && item.lesson_id) {
      return `/lecon/${item.lesson_id}`;
    }
    // Suppression de chapitre : rester sur la grille (ne pas entrer dans le
    // chapitre qu'on s'apprête peut-être à supprimer) — le chapitre visé y
    // est entouré en rouge (chapter.deletionRequested).
    if (item.item_type === "chapter_deletion") return `/cours/${item.subject}/${item.school_level}/chapitres${filiereQs}`;
    if (item.item_type === "exam") {
      const params = new URLSearchParams({ subject: item.subject, niveau: item.school_level });
      if (item.filiere_code) params.set("filiere", item.filiere_code);
      if (item.trimester) params.set("trimester", String(item.trimester));
      return `/admin/examens?${params.toString()}`;
    }
    // Suppression d'examen : on connaît déjà l'examen visé, direction sa
    // page de revue (le motif et les actions Confirmer/Annuler y sont).
    if (item.item_type === "exam_deletion") return `/admin/examens/revue/${item.id}`;
    return `/cours/${item.subject}/${item.school_level}/chapitres/${item.chapter_id}/lecons${filiereQs}`;
  };

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Validation"
        subtitle={
          view === "pending"
            ? "Chapitres, leçons et exercices/quiz envoyés par les pédagogues, en attente de votre décision"
            : "Historique de vos décisions de validation"
        }
        titleIcon={ClipboardCheck}
        onBack={() => navigate("/dashboard")}
        actions={
          <Button
            variant={view === "history" ? "default" : "outline"}
            className="gap-2 rounded-xl active:scale-95 transition-transform"
            onClick={() => setView(view === "history" ? "pending" : "history")}
          >
            <History className="h-4 w-4" />
            {view === "history" ? "Voir les envois en attente" : "Historique"}
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8">
        {view === "pending" ? (
          loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16 text-center text-muted-foreground">
                Aucune validation en attente pour le moment.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => {
                const meta = ITEM_TYPE_META[item.item_type];
                const Icon = meta.icon;
                return (
                  <Card key={`${item.item_type}-${item.id}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Badge variant="secondary" className="mb-1">{meta.label}</Badge>
                          <p className="font-semibold truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subject} · {item.school_level}
                            {item.filiere_name ? ` · ${item.filiere_name}` : ""}
                            {!(["chapter","lesson_creation","chapter_deletion","exam","exam_deletion"] as ItemType[]).includes(item.item_type) ? ` · ${item.chapter_title}` : ""}
                            {item.item_type === "exam" && item.trimester ? ` · ${TRIMESTER_LABELS[item.trimester]}` : ""}
                          </p>
                          {(["chapter_deletion", "lesson_deletion", "exam_deletion"] as ItemType[]).includes(item.item_type) && item.deletion_reason && (
                            <ExpandableText
                              text={`Motif : « ${item.deletion_reason} »`}
                              className="text-xs text-destructive mt-1"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                        <span>
                          {item.submitted_by_name || "Pédagogue"}
                          {item.submitted_at && (
                            <> · {format(new Date(item.submitted_at), "d MMM yyyy à HH:mm", { locale: fr })}</>
                          )}
                        </span>
                        <Button size="sm" className="gap-1" onClick={() => navigate(reviewUrl(item))}>
                          Examiner <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        ) : historyLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : historyItems.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center text-muted-foreground">
              Vous n'avez encore traité aucune validation.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyItems.map((item) => {
              const meta = ITEM_TYPE_META[item.item_type];
              const Icon = meta.icon;
              const approved = item.status === "approved";
              return (
                <Card key={`${item.item_type}-${item.id}`} className="border-0 shadow-lg">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge variant="secondary">{meta.label}</Badge>
                          {approved ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Validé
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" /> Refusé
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subject} · {item.school_level}
                          {item.filiere_name ? ` · ${item.filiere_name}` : ""}
                          {!(["chapter","lesson_creation","chapter_deletion","exam","exam_deletion"] as ItemType[]).includes(item.item_type) ? ` · ${item.chapter_title}` : ""}
                          {item.item_type === "exam" && item.trimester ? ` · ${TRIMESTER_LABELS[item.trimester]}` : ""}
                        </p>
                        {!approved && item.rejection_reason && (
                          <ExpandableText
                            text={`« ${item.rejection_reason} »`}
                            className="text-xs text-destructive mt-1"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                      <span>{item.submitted_by_name || "Pédagogue"}</span>
                      <span>
                        {item.reviewed_at && format(new Date(item.reviewed_at), "d MMM yyyy à HH:mm", { locale: fr })}
                      </span>
                    </div>
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
