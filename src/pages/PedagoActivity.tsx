import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, Plus, Pencil, Trash2, Loader2, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityRow {
  id: string;
  action: "create" | "update" | "delete";
  entity_type: "chapter" | "lesson" | "lesson_content";
  entity_title: string | null;
  chapter_id: string | null;
  subject: string | null;
  school_level: string | null;
  created_at: string;
  chapters: { subject: string; school_level: string; title: string; title_ar: string | null } | null;
}

const ACTION_META: Record<ActivityRow["action"], { label: string; icon: typeof Plus; color: string }> = {
  create: { label: "Ajout", icon: Plus, color: "bg-emerald-500/10 text-emerald-600" },
  update: { label: "Modification", icon: Pencil, color: "bg-amber-500/10 text-amber-600" },
  delete: { label: "Suppression", icon: Trash2, color: "bg-destructive/10 text-destructive" },
};

const ENTITY_TYPE_LABEL: Record<ActivityRow["entity_type"], string> = {
  chapter: "Chapitre",
  lesson: "Leçon",
  lesson_content: "Contenu de leçon",
};

export default function PedagoActivity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedago_activity_log" as any)
        .select("id, action, entity_type, entity_title, chapter_id, subject, school_level, created_at, chapters(subject, school_level, title, title_ar)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!error) setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

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
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold">Mon activité</h1>
                <p className="text-sm text-muted-foreground">
                  Historique de vos ajouts, modifications et suppressions de chapitres, leçons et contenus
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

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
              const subject = row.subject || row.chapters?.subject;
              const schoolLevel = row.school_level || row.chapters?.school_level;
              return (
                <Card key={row.id} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${actionMeta.color}`}>
                      <ActionIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{actionMeta.label}</Badge>
                        <span className="text-xs text-muted-foreground">{ENTITY_TYPE_LABEL[row.entity_type]}</span>
                      </div>
                      <p className="font-medium truncate mt-0.5">{row.entity_title || "(sans titre)"}</p>
                      {(subject || schoolLevel) && (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {row.entity_type === "chapter" ? <BookOpen className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {subject} {schoolLevel ? `· ${schoolLevel}` : ""}
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
