import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Loader2, RefreshCw, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MarkdownSolution } from "@/components/course/MarkdownSolution";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChapterRevisionProps {
  chapter: any;
  onBack: () => void;
}

interface RevisionRow {
  id: string;
  content: any;
  created_at: string;
}

export function ChapterRevision({ chapter, onBack }: ChapterRevisionProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [history, setHistory] = useState<RevisionRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RevisionRow | null>(null);

  const normalize = (c: any) => (typeof c === "string" ? c : (c?.text ?? JSON.stringify(c)));

  const loadHistory = async () => {
    if (!chapter?.id) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("ai_generated_content")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .eq("chapter_id", chapter.id)
      .eq("content_type", "chapter_revision")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return [];
    }
    setHistory(data || []);
    return data || [];
  };

  useEffect(() => {
    (async () => {
      try {
        const rows = await loadHistory();
        if (rows.length > 0) {
          setContent(normalize(rows[0].content));
          setProvider("محفوظة");
        }
      } finally {
        setIsInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id]);

  const generate = async () => {
    if (!chapter?.lessons || chapter.lessons.length === 0) {
      toast({ title: "لا توجد دروس", description: "هذا الفصل لا يحتوي على أي درس.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setContent("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول");

      const { data, error } = await supabase.functions.invoke("generate-chapter-revision", {
        body: {
          chapterTitle: chapter.title,
          lessons: chapter.lessons.map((l: any) => ({
            title: l.title,
            titleAr: l.titleAr,
            content: l.content || "",
          })),
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "AI generation failed");

      const newContent = data.content;
      setContent(newContent);
      setProvider(data.provider || "");

      const { error: dbError } = await supabase.from("ai_generated_content").insert({
        user_id: user.id,
        chapter_id: chapter.id,
        lesson_id: null as any,
        content_type: "chapter_revision",
        content: newContent as any,
        difficulty_level: 0,
      });
      if (dbError) {
        console.error("Error saving chapter revision to DB:", dbError);
        toast({ title: "تعذر حفظ بطاقة المراجعة", description: dbError.message, variant: "destructive" });
      }

      await loadHistory();

      toast({ title: "✅ تم إنشاء بطاقة المراجعة" });

    } catch (e: any) {
      toast({ title: "خطأ في توليد بطاقة المراجعة", description: e?.message || "حاول مرة أخرى", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <Button variant="outline" size="sm" onClick={onBack}>← العودة</Button>

      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <span>بطاقة المراجعة - {chapter.title}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setHistoryOpen(true)}
              disabled={history.length === 0}
            >
              <History className="h-4 w-4" />
              السجل {history.length > 0 ? `(${history.length})` : ""}
            </Button>

          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!content && !loading && (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground" dir="rtl">
                اضغط على الزر لتوليد بطاقة مراجعة شاملة لكل دروس هذا الفصل بواسطة الذكاء الاصطناعي.
              </p>
              <Button onClick={generate} variant="hero" size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                توليد بطاقة المراجعة بالذكاء الاصطناعي
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-green-500" />
              <p className="text-sm text-muted-foreground" dir="rtl">
                يتم الآن إنشاء بطاقة مراجعة تخطيطية لكل دروس الفصل...
              </p>
            </div>
          )}

          {content && !loading && (
            <>
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <Button onClick={generate} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  إعادة التوليد
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-br from-green-500/5 to-transparent">
                <MarkdownSolution content={content} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle dir="rtl">سجل بطاقات المراجعة</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-2">
            {selectedHistory ? (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedHistory(null)}>
                  ← العودة للسجل
                </Button>
                <div className="text-xs text-muted-foreground" dir="rtl">
                  {new Date(selectedHistory.created_at).toLocaleString("ar")}
                </div>
                <div className="border rounded-lg p-4">
                  <MarkdownSolution content={normalize(selectedHistory.content)} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((row, idx) => (
                  <button
                    key={row.id}
                    onClick={() => setSelectedHistory(row)}
                    className="w-full text-right border rounded-lg p-3 hover:bg-accent transition"
                    dir="rtl"
                  >
                    <div className="font-medium">بطاقة #{history.length - idx}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("ar")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChapterRevision;
