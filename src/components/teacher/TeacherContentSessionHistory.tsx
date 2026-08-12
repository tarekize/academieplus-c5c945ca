import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Trash2, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TeacherContentSessionRow, SessionContentType, listTeacherContentSessions, deleteTeacherContentSession } from "@/lib/teacherContentSessions";

interface Props {
  teacherId: string;
  contentType: SessionContentType;
  activeSessionId: string | null;
  onSelect: (session: TeacherContentSessionRow) => void;
  onNew: () => void;
  onClose: () => void;
}

/** Historique des sessions de génération IA enseignant (exercices/quiz/examens) —
 * même logique visuelle que ChatHistory.tsx côté élève, adaptée à un état
 * structuré (sélections + résultats) plutôt qu'à une liste de messages libres. */
export default function TeacherContentSessionHistory({ teacherId, contentType, activeSessionId, onSelect, onNew, onClose }: Props) {
  const [sessions, setSessions] = useState<TeacherContentSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Charge l'historique des sessions de génération IA de l'enseignant courant
  // pour ce type de contenu (exercice/quiz/examen).
  const fetchSessions = async () => {
    setLoading(true);
    try {
      setSessions(await listTeacherContentSessions(teacherId, contentType));
    } catch (err) {
      console.error("Error fetching teacher content sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, [teacherId, contentType]);

  // Supprime une session d'historique (clic sur la corbeille) ; si c'était la
  // session actuellement affichée, revient à un nouvel écran vierge (onNew).
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTeacherContentSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) onNew();
    } catch (err) {
      console.error("Error deleting teacher content session:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-bold text-primary flex-1">Historique des générations</h3>
        <Button variant="ghost" size="sm" onClick={onNew} className="text-xs gap-1 text-primary rounded-xl">
          <Plus className="h-3.5 w-3.5" /> Nouveau
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucune génération pour l'instant</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Vos générations seront sauvegardées ici</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group hover:bg-slate-50 dark:hover:bg-slate-900",
                  activeSessionId === s.id && "bg-primary/5 border border-primary/10"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(s.updated_at), "d MMM yyyy, HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(s.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {(() => {
                  const n = Array.isArray(s.state?.items)
                    ? s.state.items.length
                    : Array.isArray(s.state?.rows)
                      ? s.state.rows.filter((r: any) => r?.statement?.trim()).length
                      : 0;
                  return n > 0 ? <span className="text-[10px] text-muted-foreground/60">{n} générés</span> : null;
                })()}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
