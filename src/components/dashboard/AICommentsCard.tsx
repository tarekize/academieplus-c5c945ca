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

interface ScoreCommentSource {
  id: string;
  lesson_id: string;
  chapter_id: string | null;
  current_level: number;
  accuracy_rate: number;
  updated_at: string;
  lesson?: { title: string | null; title_ar: string | null } | null;
  chapter?: { title: string | null; title_ar: string | null } | null;
}

export default function AICommentsCard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<AIComment[]>([]);
  const [selected, setSelected] = useState<AIComment | null>(null);
  const [loading, setLoading] = useState(true);

  const buildScoreComment = (score: ScoreCommentSource): AIComment => {
    const levelAfter = Number(score.current_level || 0);
    const levelBefore = levelAfter < 50 ? 50 : levelAfter;
    const lessonTitle = score.lesson?.title_ar || score.lesson?.title || "درس";
    const chapterTitle = score.chapter?.title_ar || score.chapter?.title || null;
    const accuracy = Number(score.accuracy_rate || 0);
    const message = levelAfter < 50 || accuracy < 50
      ? `📉 لاحظت أن مستواك يحتاج دعماً في درس "${lessonTitle}".\nنسبة النجاح الحالية ${accuracy}% والمستوى ${levelAfter}/100.\nراجع الدرس ثم اضغط على "تجديد" للحصول على 5 تمارين أو أسئلة مناسبة لمستواك.`
      : `🤖 تم تحليل عملك في درس "${lessonTitle}".\nمستواك الحالي ${levelAfter}/100 ونسبة النجاح ${accuracy}%.\nواصل التدريب واضغط "تجديد" للحصول على أسئلة جديدة حسب مستواك.`;

    return {
      id: `score-${score.id}`,
      lesson_id: score.lesson_id,
      chapter_id: score.chapter_id,
      lesson_title: lessonTitle,
      chapter_title: chapterTitle,
      level_before: levelBefore,
      level_after: levelAfter,
      level_delta: levelAfter - levelBefore,
      message,
      link_url: `/cours/math?chapitre=${score.chapter_id}&lecon=${score.lesson_id}`,
      created_at: score.updated_at,
    };
  };

  const fetchLatest = async () => {
    // Full history of AI comments — newest first
    const { data, error } = await supabase
      .from("ai_lesson_comments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) console.error("AI comments fetch error:", error);

    const list: AIComment[] = (data || []).map((c) => c as AIComment);
    const seenLessons = new Set(list.map((c) => c.lesson_id));

    // Add fallback "score-based" comment only for lessons that have NO real AI comment yet
    const { data: scores, error: scoresError } = await supabase
      .from("student_scores")
      .select("id, lesson_id, chapter_id, current_level, total_answers, correct_answers, accuracy_rate, updated_at, lesson:lessons(title, title_ar), chapter:chapters(title, title_ar)")
      .eq("user_id", userId)
      .not("lesson_id", "is", null)
      .gt("total_answers", 0)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (scoresError) console.error("Student scores fetch error:", scoresError);

    (scores || []).forEach((score) => {
      if (!score.lesson_id || seenLessons.has(score.lesson_id)) return;
      seenLessons.add(score.lesson_id);
      list.push(buildScoreComment(score));
    });

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setComments(list);
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
