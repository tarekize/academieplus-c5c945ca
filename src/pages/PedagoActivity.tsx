import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Plus, Pencil, Trash2, Loader2, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AppHeader } from "@/components/layout/AppHeader";

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
