import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bot, TrendingUp, TrendingDown, BookOpen, Clock, ChevronRight, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
  accuracy_rate?: number;
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

const buildPedagogicScoreMessage = (lessonTitle: string, accuracy: number, levelAfter: number) => `📉 لاحظت أن مستواك يحتاج دعماً في درس **"${lessonTitle}"**. نسبة النجاح الحالية **${accuracy}%** والمستوى **${levelAfter}/100**.

### 🎯 مثال لمعالجة lacune
**القاعدة:** لا تكتفِ بحفظ الجواب؛ ركّز على الطريقة. نحدّد المطلوب، نختار القاعدة المناسبة، ثم نطبّقها خطوة بخطوة ونتحقق من النتيجة.

#### مثال جديد) تمرين مشابه
لتكن الدالة $f(x)=3x^2-4x+1$. أوجد دالة أصلية $F$ للدالة $f$ على $\\mathbb{R}$.

**الحل المفصّل:**
1. المطلوب هو إيجاد $F$ بحيث $F'(x)=f(x)$.
2. دالة أصلية لـ $3x^2$ هي $x^3$ لأن $(x^3)'=3x^2$.
3. دالة أصلية لـ $-4x$ هي $-2x^2$ لأن $(-2x^2)'=-4x$.
4. دالة أصلية لـ $1$ هي $x$ لأن $(x)'=1$.
5. نضيف ثابتاً حقيقياً $C$ لأن مشتقة الثابت تساوي $0$.

**الجواب:** $$F(x)=x^3-2x^2+x+C,\\quad C\\in\\mathbb{R}$$

اضغط على **"توليد تعليق IA"** للحصول على أمثلة خاصة بأخطائك الحقيقية.`;

export default function AICommentsCard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<AIComment[]>([]);
  const [selected, setSelected] = useState<AIComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const buildScoreComment = (score: ScoreCommentSource): AIComment => {
    const levelAfter = Number(score.current_level || 0);
    const levelBefore = levelAfter < 50 ? 50 : levelAfter;
    const lessonTitle = score.lesson?.title_ar || score.lesson?.title || "درس";
    const chapterTitle = score.chapter?.title_ar || score.chapter?.title || null;
    const accuracy = Number(score.accuracy_rate || 0);
    const message = levelAfter < 50 || accuracy < 50
      ? buildPedagogicScoreMessage(lessonTitle, accuracy, levelAfter)
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
      accuracy_rate: accuracy,
    };
  };

  const generateCommentForScore = async (scoreComment: AIComment) => {
    if (!scoreComment.lesson_id || !userId) return;
    setGeneratingId(scoreComment.id);
    const levelBefore = scoreComment.level_before || scoreComment.level_after;
    const levelAfter = scoreComment.level_after;
    const accuracy = Number(scoreComment.accuracy_rate ?? 0);

    try {
      const { data, error } = await supabase.functions.invoke("generate-lesson-comment", {
        body: {
          lesson_title: scoreComment.lesson_title || "درس",
          chapter_title: scoreComment.chapter_title || "",
          level_before: levelBefore,
          level_after: levelAfter,
          weak_concepts: [scoreComment.lesson_title || "الفكرة الأساسية في الدرس"],
          strong_concepts: [],
          mistakes: [
            {
              question: `الطالب أخطأ في أسئلة مرتبطة بدرس ${scoreComment.lesson_title || "هذا الدرس"}`,
              user_answer: "إجابة غير صحيحة",
              correct_answer: "يحتاج إلى مراجعة القاعدة وتطبيقها خطوة بخطوة",
              type: "quiz",
            },
          ],
          session_correct: accuracy,
          session_total: 100,
          lesson_link: scoreComment.link_url,
        },
      });

      const message = !error && data?.message
        ? data.message
        : buildPedagogicScoreMessage(scoreComment.lesson_title || "درس", accuracy, levelAfter);

      await supabase.from("ai_lesson_comments").delete().eq("user_id", userId).eq("lesson_id", scoreComment.lesson_id);
      await supabase.from("ai_lesson_comments").insert({
        user_id: userId,
        lesson_id: scoreComment.lesson_id,
        chapter_id: scoreComment.chapter_id,
        lesson_title: scoreComment.lesson_title,
        chapter_title: scoreComment.chapter_title,
        level_before: levelBefore,
        level_after: levelAfter,
        level_delta: levelAfter - levelBefore,
        weak_concepts: [scoreComment.lesson_title || "الفكرة الأساسية في الدرس"],
        strong_concepts: [],
        message,
        link_url: scoreComment.link_url,
      });
      setSelected(null);
      await fetchLatest();
    } finally {
      setGeneratingId(null);
    }
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
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `قبل ${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `قبل ${hours} س`;
    return d.toLocaleString("ar-DZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="text-sm flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              تعليقات الذكاء الاصطناعي
            </span>
            {comments.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{comments.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-6">جاري التحميل…</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 px-3">
              <Bot className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                أكمل درسك الأول لتحصل على تحليل شخصي
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {comments.map((c) => {
                const up = c.level_delta > 0;
                const down = c.level_delta < 0;
                const accent = up
                  ? "border-l-emerald-500 bg-emerald-500/5"
                  : down
                    ? "border-l-red-500 bg-red-500/5"
                    : "border-l-primary/40 bg-primary/5";
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border border-l-4 hover:shadow-md transition-all text-right ${accent}`}
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      up ? "bg-emerald-500/15" : down ? "bg-red-500/15" : "bg-primary/15"
                    }`}>
                      {up ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : down ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-semibold truncate">{c.lesson_title || "درس"}</p>
                      {c.chapter_title && (
                        <p className="text-[10px] text-muted-foreground truncate">{c.chapter_title}</p>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(c.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          up
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                            : down
                              ? "bg-red-500/10 text-red-700 border-red-500/30"
                              : "bg-muted"
                        }`}
                      >
                        {up && "+"}{c.level_delta}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {c.level_before}→{c.level_after}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground rtl:rotate-180 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              تعليق الذكاء الاصطناعي
            </DialogTitle>
            <DialogDescription className="text-right">
              {selected?.lesson_title} {selected?.chapter_title ? `— ${selected.chapter_title}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
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

              <div className="ai-comment-markdown rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-5 text-sm leading-relaxed">
                <style>{`
                  .ai-comment-markdown h3 { font-size: 1rem; font-weight: 700; color: hsl(var(--primary)); margin: 0.9rem 0 0.5rem; padding-bottom: 0.3rem; border-bottom: 1px solid hsl(var(--border)); }
                  .ai-comment-markdown h4 { font-size: 0.95rem; font-weight: 700; margin: 0.8rem 0 0.4rem; padding: 0.35rem 0.6rem; background: hsl(var(--muted)); border-right: 3px solid hsl(var(--primary)); border-radius: 4px; }
                  .ai-comment-markdown p { margin: 0.45rem 0; line-height: 1.8; }
                  .ai-comment-markdown strong { color: hsl(var(--primary)); font-weight: 700; }
                  .ai-comment-markdown ul, .ai-comment-markdown ol { margin: 0.4rem 1.5rem 0.4rem 0; padding-right: 1rem; }
                  .ai-comment-markdown li { margin: 0.2rem 0; }
                  .ai-comment-markdown .katex-display { margin: 0.6rem 0; padding: 0.6rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 6px; overflow-x: auto; }
                `}</style>
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {selected.message}
                </ReactMarkdown>
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
