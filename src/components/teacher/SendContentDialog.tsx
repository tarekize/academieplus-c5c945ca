import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { getSchoolLevelLabel } from "@/lib/validation";

interface ClassOption {
  id: string;
  name: string;
  school_level: string | null;
  filiere: string | null;
}

interface ChapterOption { id: string; title: string; }
interface LessonOption { id: string; title: string; chapter_id: string; }

interface SendContentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  teacherId: string;
  schoolLevel?: string | null;
  onConfirm: (classIds: string[], chapterId: string | null, lessonId: string | null) => Promise<void> | void;
  /** Exercice/quiz : impose de choisir chapitre puis leçon avant l'envoi (pas
   * pertinent pour un examen, qui peut couvrir plusieurs chapitres). */
  requireLesson?: boolean;
  chapters?: ChapterOption[];
  defaultChapterId?: string | null;
  defaultLessonId?: string | null;
}

// Dialogue de sélection des classes destinataires (et, pour un
// exercice/quiz, du chapitre/leçon associé) avant d'envoyer un contenu créé
// par l'enseignant. La liste des classes proposées est toujours filtrée par
// teacher_id côté requête : impossible de cibler la classe d'un autre enseignant.
export default function SendContentDialog({
  open, onOpenChange, teacherId, schoolLevel, onConfirm,
  requireLesson, chapters = [], defaultChapterId, defaultLessonId,
}: SendContentDialogProps) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [chapterLessons, setChapterLessons] = useState<LessonOption[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setChapterId(defaultChapterId || null);
    setLessonId(defaultLessonId || null);
    (async () => {
      setLoading(true);
      let q = supabase
        .from("classes")
        .select("id, name, school_level, filiere")
        .eq("teacher_id", teacherId);
      if (schoolLevel) q = q.eq("school_level", schoolLevel as any);
      const { data } = await q.order("created_at", { ascending: false });
      setClasses((data as ClassOption[]) || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teacherId, schoolLevel]);

  // Récupère les leçons du chapitre choisi à la volée : l'appelant ne les a
  // pas forcément déjà en mémoire (ex. contenu importé depuis un document,
  // qui n'est jamais passé par l'étape "choix du chapitre" de l'assistant).
  useEffect(() => {
    if (!open || !requireLesson || !chapterId) { setChapterLessons([]); return; }
    let active = true;
    (async () => {
      setLoadingLessons(true);
      const { data } = await supabase
        .from("lessons")
        .select("id, title, chapter_id")
        .eq("chapter_id", chapterId)
        .order("order_index");
      if (!active) return;
      setChapterLessons((data as LessonOption[]) || []);
      setLoadingLessons(false);
    })();
    return () => { active = false; };
  }, [open, requireLesson, chapterId]);

  // Coche/décoche une classe dans la sélection.
  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  // Valide la sélection (classes + chapitre/leçon si requis) puis délègue
  // l'envoi effectif au parent via onConfirm.
  const handleSend = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast.error("Sélectionnez au moins une classe.");
      return;
    }
    if (requireLesson && !chapterId) {
      toast.error("Choisissez le chapitre.");
      return;
    }
    if (requireLesson && !lessonId) {
      toast.error("Choisissez la leçon.");
      return;
    }
    setSending(true);
    try {
      await onConfirm(ids, chapterId, lessonId);
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer aux classes</DialogTitle>
          <DialogDescription>
            Choisissez les classes qui recevront ce contenu
            {schoolLevel ? ` (niveau ${getSchoolLevelLabel(schoolLevel)})` : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune classe correspondante pour ce niveau.
            </p>
          ) : (
            <div className="space-y-2">
              {classes.map((c) => (
                <label key={c.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                  <Checkbox checked={!!selected[c.id]} onCheckedChange={() => toggle(c.id)} />
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getSchoolLevelLabel(c.school_level || "")}{c.filiere ? ` · ${c.filiere}` : ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {requireLesson && (
            <div className="space-y-3 pt-1 border-t">
              <div className="space-y-1.5 pt-3">
                <p className="text-xs font-semibold text-muted-foreground">Chapitre *</p>
                {chapters.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun chapitre disponible.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {chapters.map((ch) => (
                      <Button
                        key={ch.id} type="button" size="sm"
                        variant={chapterId === ch.id ? "default" : "outline"}
                        onClick={() => { setChapterId(ch.id); setLessonId(null); }}
                      >
                        {ch.title}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {chapterId && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Leçon *</p>
                  {loadingLessons ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : chapterLessons.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune leçon pour ce chapitre.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {chapterLessons.map((ls) => (
                        <Button
                          key={ls.id} type="button" size="sm"
                          variant={lessonId === ls.id ? "default" : "outline"}
                          onClick={() => setLessonId(ls.id)}
                        >
                          {ls.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSend} disabled={sending || loading} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Confirmer l'envoi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
