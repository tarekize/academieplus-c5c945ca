import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import RichContentField from "./RichContentField";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";

// ---- Quiz CRUD ----
interface QuizFormProps {
  chapterId: string;
  lessonId?: string;
  onSaved: () => void;
  quiz?: { id: string; question: string; options: string[]; correct_answer: string; explanation: string | null; difficulty?: number; hint?: string | null };
}

export function QuizFormDialog({ chapterId, lessonId, onSaved, quiz }: QuizFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(quiz?.question || "");
  const [options, setOptions] = useState<string[]>(quiz?.options || ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(quiz?.correct_answer || "");
  const [explanation, setExplanation] = useState(quiz?.explanation || "");
  const [hint, setHint] = useState(quiz?.hint || "");
  const [difficulty, setDifficulty] = useState(quiz?.difficulty || 1);
  const isEdit = !!quiz;

  const handleSubmit = async () => {
    if (!question.trim() || !correctAnswer.trim()) {
      toast.error("السؤال والإجابة الصحيحة مطلوبان");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase.from("chapter_quizzes").update({
          question: question.trim(),
          options: options.filter(o => o.trim()),
          correct_answer: correctAnswer.trim(),
          explanation: explanation.trim() || null,
          hint: hint.trim() || null,
          difficulty: difficulty,
        }).eq("id", quiz.id);
        if (error) throw error;
        toast.success("تم تعديل السؤال");
      } else {
        const { error } = await supabase.from("chapter_quizzes").insert({
          chapter_id: chapterId,
          lesson_id: lessonId ?? null,
          question: question.trim(),
          options: options.filter(o => o.trim()),
          correct_answer: correctAnswer.trim(),
          explanation: explanation.trim() || null,
          hint: hint.trim() || null,
          difficulty: difficulty,
        });
        if (error) throw error;
        toast.success("تمت إضافة السؤال");
      }
      setOpen(false);
      onSaved();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && quiz) {
        setQuestion(quiz.question);
        setOptions(quiz.options.length >= 4 ? quiz.options : [...quiz.options, ...Array(4 - quiz.options.length).fill("")]);
        setCorrectAnswer(quiz.correct_answer);
        setExplanation(quiz.explanation || "");
        setHint(quiz.hint || "");
        setDifficulty(quiz.difficulty || 1);
      }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />سؤال جديد</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle dir="rtl">{isEdit ? "تعديل السؤال" : "سؤال جديد"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir="rtl">
          <RichContentField label="نص السؤال" value={question} onChange={setQuestion} minHeight={120} />
          <div className="space-y-2">
            <label className="text-sm font-medium">الخيارات</label>
            {options.map((opt, i) => (
              <Input key={i} value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                placeholder={`الخيار ${i + 1}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">الإجابة الصحيحة</label>
              <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="الإجابة الصحيحة" />
            </div>
            <div>
              <label className="text-sm font-medium">مستوى الصعوبة</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصعوبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - سهل جداً</SelectItem>
                  <SelectItem value="2">2 - سهل</SelectItem>
                  <SelectItem value="3">3 - متوسط</SelectItem>
                  <SelectItem value="4">4 - صعب</SelectItem>
                  <SelectItem value="5">5 - صعب جداً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <RichContentField label="الشرح" value={explanation} onChange={setExplanation} minHeight={100} />
          <div>
            <label className="text-sm font-medium">💡 مساعدة (Hint) — يظهر للتلميذ عند الطلب</label>
            <Textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder="فكرة أو تلميح يساعد التلميذ على الوصول للجواب..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "تعديل" : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteQuizButton({ quizId, onDeleted }: { quizId: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("chapter_quizzes").delete().eq("id", quizId);
      if (error) throw error;
      toast.success("تم حذف السؤال");
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>حذف السؤال؟</AlertDialogTitle>
          <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Exercise CRUD ----
interface ExerciseFormProps {
  chapterId: string;
  lessonId?: string;
  onSaved: () => void;
  exercise?: { id: string; title: string; statement: string; expected_answer?: string; accepted_answers?: string[]; solution?: string; difficulty?: number; hint?: string | null };
}

export function ExerciseFormDialog({ chapterId, lessonId, onSaved, exercise }: ExerciseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(exercise?.title || "");
  const [statement, setStatement] = useState(exercise?.statement || "");
  const [expectedAnswer, setExpectedAnswer] = useState(exercise?.expected_answer || "");
  const [acceptedAnswers, setAcceptedAnswers] = useState(exercise?.accepted_answers?.join(", ") || "");
  const [solution, setSolution] = useState(exercise?.solution || "");
  const [hint, setHint] = useState(exercise?.hint || "");
  const [difficulty, setDifficulty] = useState(exercise?.difficulty || 1);
  const isEdit = !!exercise;

  const handleSubmit = async () => {
    if (!title.trim() || !statement.trim()) {
      toast.error("العنوان والتمرين مطلوبان");
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        statement: statement.trim(),
        expected_answer: expectedAnswer.trim(),
        accepted_answers: acceptedAnswers.split(",").map(s => s.trim()).filter(Boolean),
        solution: solution.trim(),
        hint: hint.trim() || null,
        difficulty: difficulty,
      };
      if (isEdit) {
        const { error } = await supabase.from("chapter_exercises").update(data).eq("id", exercise.id);
        if (error) throw error;
        toast.success("تم تعديل التمرين");
      } else {
        const { error } = await supabase.from("chapter_exercises").insert({ chapter_id: chapterId, lesson_id: lessonId ?? null, ...data });
        if (error) throw error;
        toast.success("تمت إضافة التمرين");
      }
      setOpen(false);
      onSaved();
    } catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && exercise) {
        setTitle(exercise.title); setStatement(exercise.statement);
        setExpectedAnswer(exercise.expected_answer);
        setAcceptedAnswers(exercise.accepted_answers?.join(", ") || "");
        setSolution(exercise.solution);
        setHint(exercise.hint || "");
        setDifficulty(exercise.difficulty || 1);
      }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />تمرين جديد</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle dir="rtl">{isEdit ? "تعديل التمرين" : "تمرين جديد"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir="rtl">
          <div>
            <label className="text-sm font-medium">العنوان</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان التمرين" />
          </div>
          <RichContentField label="نص التمرين" value={statement} onChange={setStatement} minHeight={120} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">الإجابة المتوقعة</label>
              <Input value={expectedAnswer} onChange={(e) => setExpectedAnswer(e.target.value)} placeholder="الإجابة" />
            </div>
            <div>
              <label className="text-sm font-medium">مستوى الصعوبة</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصعوبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - سهل جداً</SelectItem>
                  <SelectItem value="2">2 - سهل</SelectItem>
                  <SelectItem value="3">3 - متوسط</SelectItem>
                  <SelectItem value="4">4 - صعب</SelectItem>
                  <SelectItem value="5">5 - صعب جداً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">إجابات مقبولة (مفصولة بفواصل)</label>
            <Input value={acceptedAnswers} onChange={(e) => setAcceptedAnswers(e.target.value)} placeholder="إجابة1, إجابة2" />
          </div>
          <RichContentField label="الحل المفصل" value={solution} onChange={setSolution} minHeight={140} />
          <div>
            <label className="text-sm font-medium">💡 مساعدة (Hint) — يظهر للتلميذ عند الطلب</label>
            <Textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder="فكرة أو تلميح يساعد التلميذ على الوصول للجواب..." className="min-h-[60px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "تعديل" : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteExerciseButton({ exerciseId, onDeleted }: { exerciseId: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("chapter_exercises").delete().eq("id", exerciseId);
      if (error) throw error;
      toast.success("تم حذف التمرين");
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>حذف التمرين؟</AlertDialogTitle>
          <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Generate with AI button ----
type ContentType = "exercises" | "quizzes";
type Section = "discover" | "understand";

export function GenerateQuizExercisesButton({
  chapterId,
  lessonId,
  onGenerated,
  lockedContentType,
}: {
  chapterId: string;
  lessonId: string;
  onGenerated: () => void;
  /** Si fourni, verrouille le type de contenu généré (بدون سؤال) — utilisé quand le bouton
   * est déclenché depuis l'onglet "تمارين" ou l'onglet "اسئله متعدده الاختيارات". */
  lockedContentType?: ContentType;
}) {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [sections, setSections] = useState<Section[]>(["discover", "understand"]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(
    lockedContentType ? [lockedContentType] : ["exercises", "quizzes"]
  );
  const [count, setCount] = useState(10);
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(5);

  const toggleSection = (s: Section) => {
    setSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };
  const toggleContentType = (t: ContentType) => {
    if (lockedContentType) return;
    setContentTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleGenerate = async () => {
    if (sections.length === 0) {
      toast.error("اختر مكان توليد الأسئلة (اكتشف أو افهم) على الأقل");
      return;
    }
    if (contentTypes.length === 0) {
      toast.error("اختر تمارين أو أسئلة على الأقل");
      return;
    }
    if (difficultyMin > difficultyMax) {
      toast.error("المستوى الأدنى يجب أن يكون أصغر أو يساوي المستوى الأقصى");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-gen-terminale-gemini", {
        body: {
          chapter_id: chapterId,
          lesson_id: lessonId,
          replace: mode === "replace",
          sections,
          content_types: contentTypes,
          count,
          difficulty_min: difficultyMin,
          difficulty_max: difficultyMax,
        },
      });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      if (data?.success === false) throw new Error(data.error || "خطأ في التوليد");
      if (data?.error) throw new Error(data.error);
      const quizCount = data?.inserted_quizzes ?? 0;
      const exerciseCount = data?.inserted_exercises ?? 0;
      toast.success(`تم إنشاء ${exerciseCount} تمارين و ${quizCount} أسئلة بنجاح`);
      setOpenDialog(false);
      onGenerated();
    } catch (err: any) {
      toast.error(err.message || "خطأ في التوليد");
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = lockedContentType === "exercises" ? "تمارين فقط" : lockedContentType === "quizzes" ? "أسئلة اختيار من متعدد فقط" : null;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Sparkles className="h-3 w-3" />
          توليد بالذكاء الاصطناعي
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle dir="rtl">توليد الأسئلة والتمارين بالذكاء الاصطناعي</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2" dir="rtl">
          {/* Ajouter / Remplacer */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">كيفية الإضافة</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`p-2.5 border-2 rounded-lg text-sm transition-all ${mode === "add" ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50"}`}
                onClick={() => setMode("add")}
              >
                إضافة إلى الموجود
              </button>
              <button
                type="button"
                className={`p-2.5 border-2 rounded-lg text-sm transition-all ${mode === "replace" ? "border-destructive bg-destructive/5 font-medium text-destructive" : "border-border hover:border-destructive/50"}`}
                onClick={() => setMode("replace")}
              >
                استبدال الموجود
              </button>
            </div>
          </div>

          {/* Emplacement : Découvrir / Comprendre */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">أين تريد وضع الأسئلة؟</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sections.includes("discover")} onCheckedChange={() => toggleSection("discover")} />
                اكتشف (Découvrir)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sections.includes("understand")} onCheckedChange={() => toggleSection("understand")} />
                افهم (Comprendre)
              </label>
            </div>
            {sections.length === 2 && (
              <p className="text-xs text-muted-foreground">سيتم توزيع العدد على المرحلتين معاً</p>
            )}
          </div>

          {/* Type : Exercices / Quiz */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">ماذا تريد أن تولّد؟</Label>
            {typeLabel ? (
              <p className="text-sm px-3 py-2 rounded-md bg-muted font-medium">{typeLabel}</p>
            ) : (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={contentTypes.includes("exercises")} onCheckedChange={() => toggleContentType("exercises")} />
                  تمارين
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={contentTypes.includes("quizzes")} onCheckedChange={() => toggleContentType("quizzes")} />
                  أسئلة اختيار من متعدد
                </label>
              </div>
            )}
            {contentTypes.length === 2 && (
              <p className="text-xs text-muted-foreground">سيتم توليد نفس العدد لكل من التمارين والأسئلة</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <Label className="text-sm font-medium">كم عدد الأسئلة/التمارين؟</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>

          {/* Niveau min / max */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">المستوى الأدنى</Label>
              <Select value={difficultyMin.toString()} onValueChange={(v) => setDifficultyMin(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">المستوى الأقصى</Label>
              <Select value={difficultyMax.toString()} onValueChange={(v) => setDifficultyMax(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className={mode === "replace" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                توليد
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
