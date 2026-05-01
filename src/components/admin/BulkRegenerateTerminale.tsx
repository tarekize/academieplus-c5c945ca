import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TERMINALE_SCIENCES_FILIERE_ID = "9f9cea26-5b2c-4bb3-ab00-206abb7f43c5";
const BATCH_SIZE = 3;

type LessonRow = {
  lesson_id: string;
  lesson_title: string;
  chapter_id: string;
  chapter_title_ar: string;
  chapter_title_fr: string;
};

export function BulkRegenerateTerminale() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errors, setErrors] = useState<{ lesson: string; error: string }[]>([]);
  const [completed, setCompleted] = useState(false);

  const fetchLessons = async (): Promise<LessonRow[]> => {
    const { data: chapters, error: cErr } = await supabase
      .from("chapters")
      .select("id, title, title_ar, order_index")
      .eq("school_level", "terminale")
      .eq("filiere_id", TERMINALE_SCIENCES_FILIERE_ID)
      .order("order_index");
    if (cErr) throw cErr;
    if (!chapters?.length) return [];

    const ids = chapters.map((c) => c.id);
    const { data: lessons, error: lErr } = await supabase
      .from("lessons")
      .select("id, title, title_ar, chapter_id, order_index")
      .in("chapter_id", ids)
      .order("order_index");
    if (lErr) throw lErr;

    const cMap = new Map(chapters.map((c) => [c.id, c]));
    return (lessons ?? []).map((l) => {
      const c = cMap.get(l.chapter_id);
      return {
        lesson_id: l.id,
        lesson_title: l.title_ar || l.title,
        chapter_id: l.chapter_id,
        chapter_title_ar: c?.title_ar || c?.title || "",
        chapter_title_fr: c?.title || "",
      };
    });
  };

  const runBatch = async () => {
    setRunning(true);
    setErrors([]);
    setCompleted(false);
    try {
      const all = await fetchLessons();
      setProgress({ done: 0, total: all.length });
      if (!all.length) {
        toast.warning("لا توجد دروس");
        setRunning(false);
        return;
      }
      const errs: { lesson: string; error: string }[] = [];
      for (let i = 0; i < all.length; i += BATCH_SIZE) {
        const chunk = all.slice(i, i + BATCH_SIZE).map((l) => ({
          lesson_id: l.lesson_id,
          chapter_id: l.chapter_id,
          lesson_title: l.lesson_title,
          lesson_title_ar: l.lesson_title,
          lesson_title_fr: l.lesson_title,
          chapter_title_ar: l.chapter_title_ar,
        }));
        try {
          const { data, error } = await supabase.functions.invoke("bulk-gen-batch", {
            body: { lessons: chunk },
          });
          if (error) throw error;
          (data?.results ?? []).forEach((r: any) => {
            if (!r.ok) errs.push({ lesson: r.lesson_title || r.lesson_id, error: r.error || "unknown" });
          });
        } catch (e: any) {
          chunk.forEach((c) => errs.push({ lesson: c.lesson_title, error: e.message ?? String(e) }));
        }
        setProgress({ done: Math.min(i + BATCH_SIZE, all.length), total: all.length });
        setErrors([...errs]);
      }
      setCompleted(true);
      if (errs.length === 0) {
        toast.success(`تم توليد ${all.length} درسا بنجاح (10 تمارين + 10 أسئلة لكل درس)`);
      } else {
        toast.warning(`اكتمل التوليد مع ${errs.length} خطأ`);
      }
    } catch (e: any) {
      toast.error(e.message ?? String(e));
    } finally {
      setRunning(false);
    }
  };

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Sparkles className="h-5 w-5" />
          توليد جماعي للتمارين والأسئلة - السنة النهائية علوم
        </CardTitle>
        <CardDescription>
          يحذف ويعيد توليد 10 تمارين و 10 أسئلة لكل درس من دروس السنة النهائية شعبة العلوم التجريبية. العملية قد تستغرق عدة دقائق.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {running && (
          <div className="space-y-2">
            <Progress value={pct} />
            <p className="text-sm text-muted-foreground">
              {progress.done} / {progress.total} درس ({pct}%)
            </p>
          </div>
        )}
        {completed && !running && (
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            ✅ اكتملت العملية: {progress.done} / {progress.total}
          </p>
        )}
        {errors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:bg-red-950/30">
            <p className="mb-2 flex items-center gap-1 font-semibold text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" /> أخطاء ({errors.length})
            </p>
            <ul className="max-h-40 list-disc space-y-1 overflow-auto pr-4 text-red-700 dark:text-red-300">
              {errors.map((e, i) => (
                <li key={i}>
                  <strong>{e.lesson}:</strong> {e.error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={running} className="bg-amber-600 hover:bg-amber-700">
              {running ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جارٍ التوليد...
                </>
              ) : (
                <>
                  <Sparkles className="ml-2 h-4 w-4" /> بدء التوليد الجماعي
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد التوليد الجماعي</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم <strong>حذف</strong> جميع التمارين والأسئلة الحالية للسنة النهائية علوم وإعادة توليدها (10 + 10 لكل درس). هذه العملية لا يمكن التراجع عنها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={runBatch}>تأكيد البدء</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
