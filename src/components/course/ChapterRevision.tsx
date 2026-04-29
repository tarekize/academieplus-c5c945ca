import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MarkdownSolution } from "@/components/course/MarkdownSolution";

interface ChapterRevisionProps {
  chapter: any;
  onBack: () => void;
}

export function ChapterRevision({ chapter, onBack }: ChapterRevisionProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [provider, setProvider] = useState<string>("");

  const generate = async () => {
    if (!chapter?.lessons || chapter.lessons.length === 0) {
      toast({
        title: "لا توجد دروس",
        description: "هذا الفصل لا يحتوي على أي درس.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setContent("");
    try {
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
      setContent(data.content);
      setProvider(data.provider || "");
      toast({
        title: "✅ تم إنشاء بطاقة المراجعة",
        description: `بواسطة ${data.provider || "AI"}`,
      });
    } catch (e: any) {
      toast({
        title: "خطأ في توليد بطاقة المراجعة",
        description: e?.message || "حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <Button variant="outline" size="sm" onClick={onBack}>← العودة</Button>

      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            <span>بطاقة المراجعة - {chapter.title}</span>
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
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {provider && (
                  <span className="text-xs text-muted-foreground">
                    ✨ تم التوليد بواسطة: <strong>{provider}</strong>
                  </span>
                )}
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
    </div>
  );
}

export default ChapterRevision;
