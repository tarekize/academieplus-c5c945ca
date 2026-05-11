import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bot, TrendingUp, TrendingDown, BookOpen, Clock, ChevronRight } from "lucide-react";

interface AIComment {
  id: string;
  lesson_id: string;
  chapter_id: string | null;
  lesson_title: string | null;
  chapter_title: string | null;
  level_before: number;
  level_after: number;
  level_delta: number;
  message: string;
  link_url: string | null;
  created_at: string;
}

export default function AICommentsCard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<AIComment[]>([]);
  const [selected, setSelected] = useState<AIComment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    // Latest comment per lesson
    const { data } = await supabase
      .from("ai_lesson_comments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    const seen = new Set<string>();
    const latest: AIComment[] = [];
    (data || []).forEach((c: any) => {
      if (seen.has(c.lesson_id)) return;
      seen.add(c.lesson_id);
      latest.push(c as AIComment);
    });
    setComments(latest);
    setLoading(false);
  };

  useEffect(() => {
    fetchLatest();
    const channel = supabase
      .channel("ai-comments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_lesson_comments", filter: `user_id=eq.${userId}` },
        () => fetchLatest(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ar-DZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            تعليقات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-3">جاري التحميل…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              أكمل درسك الأول لتحصل على تحليل شخصي
            </p>
          ) : (
            comments.map((c) => {
              const up = c.level_delta > 0;
              const down = c.level_delta < 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-right"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {up ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : down ? (
                      <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{c.lesson_title || "درس"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.chapter_title}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      up
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : down
                          ? "bg-red-500/10 text-red-700 border-red-500/20"
                          : ""
                    }
                  >
                    {c.level_before}→{c.level_after}
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground rtl:rotate-180" />
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              تعليق الذكاء الاصطناعي
            </DialogTitle>
            <DialogDescription className="text-right">
              {selected?.lesson_title} — {selected?.chapter_title}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selected.level_delta > 0 ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" /> تحسّن +{selected.level_delta}
                  </Badge>
                ) : selected.level_delta < 0 ? (
                  <Badge className="bg-red-500/10 text-red-700 border-red-500/20">
                    <TrendingDown className="h-3 w-3 mr-1" /> {selected.level_delta}
                  </Badge>
                ) : (
                  <Badge variant="outline">مستقر</Badge>
                )}
                <Badge variant="outline">
                  {selected.level_before}/100 → {selected.level_after}/100
                </Badge>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-line">
                {selected.message}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(selected.created_at)}
                </span>
                {selected.link_url && (
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate(selected.link_url!);
                      setSelected(null);
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5 ml-1" />
                    اذهب إلى الدرس
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
