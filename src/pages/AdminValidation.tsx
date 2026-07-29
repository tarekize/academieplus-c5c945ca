import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardCheck, BookOpen, FileText, PenTool, Brain, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PendingItem {
  id: string;
  item_type: "chapter" | "lesson" | "exercise" | "quiz";
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
}

const ITEM_TYPE_META: Record<PendingItem["item_type"], { label: string; icon: typeof BookOpen; color: string }> = {
  chapter: { label: "Nouveau chapitre", icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
  lesson: { label: "Contenu de leçon", icon: FileText, color: "bg-indigo-500/10 text-indigo-600" },
  exercise: { label: "Exercice", icon: PenTool, color: "bg-amber-500/10 text-amber-600" },
  quiz: { label: "Quiz", icon: Brain, color: "bg-emerald-500/10 text-emerald-600" },
};

export default function AdminValidation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PendingItem[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_pending_content_items" as any);
    if (!error) setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const reviewUrl = (item: PendingItem): string => {
    const filiereQs = item.filiere_code ? `?filiere=${item.filiere_code}` : "";
    if (item.item_type === "lesson") return `/lecon/${item.lesson_id}`;
    if ((item.item_type === "exercise" || item.item_type === "quiz") && item.lesson_id) {
      return `/lecon/${item.lesson_id}`;
    }
    return `/cours/${item.subject}/${item.school_level}/chapitres/${item.chapter_id}/lecons${filiereQs}`;
  };

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
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold">Validation</h1>
                <p className="text-sm text-muted-foreground">
                  Chapitres, leçons et exercices/quiz envoyés par les pédagogues, en attente de votre décision
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
                          {item.item_type !== "chapter" ? ` · ${item.chapter_title}` : ""}
                        </p>
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
        )}
      </main>
    </div>
  );
}
