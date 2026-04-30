import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface EnrichChapterButtonProps {
  chapterId: string;
  chapterTitle: string;
  lessonsCount: number;
  onDone?: () => void;
}

export function EnrichChapterButton({ chapterId, chapterTitle, lessonsCount, onDone }: EnrichChapterButtonProps) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const tId = toast.loading(`✨ جاري إثراء ${lessonsCount} درس بالذكاء الاصطناعي...`, {
      description: "قد يستغرق هذا عدة دقائق. لا تغلق الصفحة.",
    });
    try {
      const { data, error } = await supabase.functions.invoke("enrich-chapter-lessons", {
        body: { chapterId },
      });
      toast.dismiss(tId);
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Échec de l'enrichissement");

      toast.success(`✅ تم إثراء ${data.enriched}/${data.total} درس بنجاح`, {
        description: data.failed > 0 ? `فشل ${data.failed} درس - يمكنك إعادة المحاولة` : "تم تحديث محتوى الدروس بتصميم احترافي",
      });
      onDone?.();
    } catch (e: any) {
      toast.dismiss(tId);
      toast.error("خطأ في إثراء المحتوى", { description: e?.message || "حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || lessonsCount === 0}
          className="gap-2 border-purple-500/40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 hover:from-purple-500/20 hover:to-pink-500/20 dark:text-purple-300"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {loading ? "جاري الإثراء..." : "Enrichir avec IA"}
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enrichir tout le contenu du chapitre ?</AlertDialogTitle>
          <AlertDialogDescription>
            L'IA va régénérer et enrichir le contenu des <strong>{lessonsCount} leçons</strong> du chapitre
            <strong> « {chapterTitle} »</strong> avec un design moderne (cartes colorées, formules LaTeX, exemples,
            applications, etc.). <br />
            <br />
            ⚠️ Le contenu actuel sera <strong>remplacé</strong>. Cette opération peut prendre plusieurs minutes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={run}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-1" /> Lancer l'enrichissement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EnrichChapterButton;
