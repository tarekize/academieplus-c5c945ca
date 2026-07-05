import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Target } from "lucide-react";

interface ContentRow {
  id: string;
  content_type: "exercise" | "quiz";
  title: string | null;
  payload: any;
  difficulty: number | null;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = { exercise: "Exercice", quiz: "Quiz" };

export default function StudentAssignedContent({ userId }: { userId: string }) {
  const [items, setItems] = useState<ContentRow[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      // RLS restricts teacher_content to content assigned to this student (directly or via class).
      // Exams are excluded: they live on the dedicated exams page (/exams/list), not this preview.
      const { data } = await (supabase as any)
        .from("teacher_content")
        .select("id, content_type, title, payload, difficulty, created_at")
        .in("content_type", ["exercise", "quiz"])
        .order("created_at", { ascending: false })
        .limit(30);
      if (active) setItems(((data as ContentRow[]) || []));
    })();
    return () => { active = false; };
  }, [userId]);

  if (items.length === 0) return null;

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <FileText className="h-4 w-4" /> Contenu de mon enseignant
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => {
            const p = it.payload || {};
            return (
              <div key={it.id} className="rounded-lg bg-card/70 border p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  {it.content_type === "quiz"
                    ? <Target className="h-4 w-4 text-amber-600" />
                    : <FileText className="h-4 w-4 text-emerald-600" />}
                  <span className="text-xs font-medium">{TYPE_LABEL[it.content_type]}</span>
                  {it.difficulty ? <Badge variant="outline" className="ml-auto">Diff. {it.difficulty}/5</Badge> : null}
                </div>
                {(it.title || p.title) && <p className="font-medium text-sm">{it.title || p.title}</p>}
                {p.statement && <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{p.statement}</p>}
                {p.question && <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{p.question}</p>}
                {Array.isArray(p.options) && (
                  <ul className="text-sm list-disc list-inside text-muted-foreground">
                    {p.options.map((o: string, i: number) => <li key={i}>{o}</li>)}
                  </ul>
                )}
                {p.hint && <p className="text-xs text-amber-700 dark:text-amber-400">💡 {p.hint}</p>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
