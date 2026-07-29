import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Loader2, RefreshCw, History, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MarkdownSolution } from "@/components/course/MarkdownSolution";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { localizedText } from "@/lib/utils";

interface ChapterRevisionProps {
  chapter: {
    id: string;
    title: string;
    titleAr?: string;
    lessons?: ChapterLesson[];
  };
  onBack: () => void;
}

interface ChapterLesson {
  title?: string;
  titleAr?: string;
  content?: string | null;
}

interface RevisionRow {
  id: string;
  content: unknown;
  created_at: string;
}

const CHAPTER_REVISION_CONTENT_TYPE = "revision";

export function ChapterRevision({ chapter, onBack }: ChapterRevisionProps) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const dateLocale = i18n.language === "ar" ? "ar" : "fr";
  const chapterTitle = localizedText(i18n.language, chapter.title, chapter.titleAr);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [history, setHistory] = useState<RevisionRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RevisionRow | null>(null);

  const normalize = (c: unknown) => {
    if (typeof c === "string") return c;
    if (c && typeof c === "object" && "text" in c) {
      const text = (c as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
    return JSON.stringify(c);
  };

  const loadHistory = async () => {
    if (!chapter?.id) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("ai_generated_content")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .eq("chapter_id", chapter.id)
      .eq("content_type", CHAPTER_REVISION_CONTENT_TYPE)
      .is("lesson_id", null)
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
        }
      } finally {
        setIsInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id]);

  const generate = async () => {
    if (!chapter?.lessons || chapter.lessons.length === 0) {
      toast.error(t("chapterRevision.noLessonsTitle"), { description: t("chapterRevision.noLessonsDescription") });
      return;
    }

    setLoading(true);
    setContent("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("chapterRevision.loginRequired"));

      const { data, error } = await supabase.functions.invoke("generate-chapter-revision", {
        body: {
          chapterTitle: chapter.title,
          lessons: chapter.lessons.map((l) => ({
            title: l.title,
            titleAr: l.titleAr,
            content: l.content || "",
          })),
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "AI generation failed");

      const newContent = data.content;

      const { error: dbError } = await supabase.from("ai_generated_content").insert({
        user_id: user.id,
        chapter_id: chapter.id,
        lesson_id: null,
        content_type: CHAPTER_REVISION_CONTENT_TYPE,
        content: newContent,
        difficulty_level: 0,
      });
      if (dbError) {
        console.error("Error saving chapter revision to DB:", dbError);
        toast.error(t("chapterRevision.saveError"), { description: dbError.message });
        return;
      }

      setContent(newContent);
      await loadHistory();

      toast.success(t("chapterRevision.generateSuccess"));

    } catch (e: unknown) {
      toast.error(t("chapterRevision.generateError"), { description: e instanceof Error ? e.message : t("chapterRevision.tryAgain") });
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
    <div className="mt-6 space-y-4" dir={dir}>
      <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("chapterRevision.back")}
      </Button>

      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <span>{t("chapterRevision.cardTitle", { chapterTitle })}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setHistoryOpen(true)}
              disabled={history.length === 0}
            >
              <History className="h-4 w-4" />
              {t("chapterRevision.history")} {history.length > 0 ? `(${history.length})` : ""}
            </Button>

          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!content && !loading && (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                {t("chapterRevision.generatePrompt")}
              </p>
              <Button onClick={generate} variant="hero" size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                {t("chapterRevision.generateButton")}
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-green-500" />
              <p className="text-sm text-muted-foreground">
                {t("chapterRevision.generating")}
              </p>
            </div>
          )}

          {content && !loading && (
            <>
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <Button onClick={generate} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t("chapterRevision.regenerate")}
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
            <DialogTitle dir={dir}>{t("chapterRevision.historyDialogTitle")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-2">
            {selectedHistory ? (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedHistory(null)} className="gap-2">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  {t("chapterRevision.backToHistory")}
                </Button>
                <div className="text-xs text-muted-foreground">
                  {new Date(selectedHistory.created_at).toLocaleString(dateLocale)}
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
                    dir={dir}
                  >
                    <div className="font-medium">{t("chapterRevision.historyCardLabel", { number: history.length - idx })}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString(dateLocale)}
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
