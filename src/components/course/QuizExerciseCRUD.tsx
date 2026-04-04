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
import { Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ---- Quiz CRUD ----
interface QuizFormProps {
  chapterId: string;
  lessonId?: string;
  onSaved: () => void;
  quiz?: { id: string; question: string; options: string[]; correct_answer: string; explanation: string | null; difficulty?: number };
}

export function QuizFormDialog({ chapterId, lessonId, onSaved, quiz }: QuizFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(quiz?.question || "");
  const [options, setOptions] = useState<string[]>(quiz?.options || ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(quiz?.correct_answer || "");
  const [explanation, setExplanation] = useState(quiz?.explanation || "");
  const [difficulty, setDifficulty] = useState(quiz?.difficulty || 1);
  const isEdit = !!quiz;

  const handleSubmit = async () => {
    if (!question.trim() || !correctAnswer.trim()) {
      toast.error("اÙ„سؤاÙ„ ÙˆاÙ„إجابة اÙ„صحÙŠحة Ù…طÙ„ÙˆباÙ†");
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
          difficulty: difficulty,
        }).eq("id", quiz.id);
        if (error) throw error;
        toast.success("تÙ… تعدÙŠÙ„ اÙ„سؤاÙ„");
      } else {
        const { error } = await supabase.from("chapter_quizzes").insert({
          chapter_id: chapterId,
          lesson_id: lessonId ?? null,
          question: question.trim(),
          options: options.filter(o => o.trim()),
          correct_answer: correctAnswer.trim(),
          explanation: explanation.trim() || null,
          difficulty: difficulty,
        });
        if (error) throw error;
        toast.success("تÙ…ت إضافة اÙ„سؤاÙ„");
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
        setDifficulty(quiz.difficulty || 1);
      }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />سؤاÙ„ جدÙŠد</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle dir="rtl">{isEdit ? "تعدÙŠÙ„ اÙ„سؤاÙ„" : "سؤاÙ„ جدÙŠد"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir="rtl">
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ù†ص اÙ„سؤاÙ„..." className="min-h-[60px]" />
          <div className="space-y-2">
            <label className="text-sm font-medium">اÙ„خÙŠارات</label>
            {options.map((opt, i) => (
              <Input key={i} value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                placeholder={`اÙ„خÙŠار ${i + 1}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">اÙ„إجابة اÙ„صحÙŠحة</label>
              <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="اÙ„إجابة اÙ„صحÙŠحة" />
            </div>
            <div>
              <label className="text-sm font-medium">Ù…ستÙˆÙ‰ اÙ„صعÙˆبة</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر اÙ„صعÙˆبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - سÙ‡Ù„ جداÙ‹</SelectItem>
                  <SelectItem value="2">2 - سÙ‡Ù„</SelectItem>
                  <SelectItem value="3">3 - Ù…تÙˆسط</SelectItem>
                  <SelectItem value="4">4 - صعب</SelectItem>
                  <SelectItem value="5">5 - صعب جداÙ‹</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">اÙ„شرح</label>
            <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="شرح اÙ„إجابة..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إÙ„غاء</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "تعدÙŠÙ„" : "إضافة"}
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
      toast.success("تÙ… حذف اÙ„سؤاÙ„");
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>حذف اÙ„سؤاÙ„ØŸ</AlertDialogTitle>
          <AlertDialogDescription>Ù‡ذا اÙ„إجراء Ù„ا ÙŠÙ…ÙƒÙ† اÙ„تراجع عÙ†Ù‡.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إÙ„غاء</AlertDialogCancel>
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
  exercise?: { id: string; title: string; statement: string; expected_answer?: string; accepted_answers?: string[]; solution?: string; difficulty?: number };
}

export function ExerciseFormDialog({ chapterId, lessonId, onSaved, exercise }: ExerciseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(exercise?.title || "");
  const [statement, setStatement] = useState(exercise?.statement || "");
  const [expectedAnswer, setExpectedAnswer] = useState(exercise?.expected_answer || "");
  const [acceptedAnswers, setAcceptedAnswers] = useState(exercise?.accepted_answers?.join(", ") || "");
  const [solution, setSolution] = useState(exercise?.solution || "");
  const [difficulty, setDifficulty] = useState(exercise?.difficulty || 1);
  const isEdit = !!exercise;

  const handleSubmit = async () => {
    if (!title.trim() || !statement.trim()) {
      toast.error("اÙ„عÙ†ÙˆاÙ† ÙˆاÙ„تÙ…رÙŠÙ† Ù…طÙ„ÙˆباÙ†");
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
        difficulty: difficulty,
      };
      if (isEdit) {
        const { error } = await supabase.from("chapter_exercises").update(data).eq("id", exercise.id);
        if (error) throw error;
        toast.success("تÙ… تعدÙŠÙ„ اÙ„تÙ…رÙŠÙ†");
      } else {
        const { error } = await supabase.from("chapter_exercises").insert({ chapter_id: chapterId, lesson_id: lessonId ?? null, ...data });
        if (error) throw error;
        toast.success("تÙ…ت إضافة اÙ„تÙ…رÙŠÙ†");
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
        setDifficulty(exercise.difficulty || 1);
      }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />تÙ…رÙŠÙ† جدÙŠد</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle dir="rtl">{isEdit ? "تعدÙŠÙ„ اÙ„تÙ…رÙŠÙ†" : "تÙ…رÙŠÙ† جدÙŠد"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir="rtl">
          <div>
            <label className="text-sm font-medium">اÙ„عÙ†ÙˆاÙ†</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عÙ†ÙˆاÙ† اÙ„تÙ…رÙŠÙ†" />
          </div>
          <div>
            <label className="text-sm font-medium">Ù†ص اÙ„تÙ…رÙŠÙ†</label>
            <Textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Ù†ص اÙ„تÙ…رÙŠÙ†..." className="min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">اÙ„إجابة اÙ„Ù…تÙˆÙ‚عة</label>
              <Input value={expectedAnswer} onChange={(e) => setExpectedAnswer(e.target.value)} placeholder="اÙ„إجابة" />
            </div>
            <div>
              <label className="text-sm font-medium">Ù…ستÙˆÙ‰ اÙ„صعÙˆبة</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر اÙ„صعÙˆبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - سÙ‡Ù„ جداÙ‹</SelectItem>
                  <SelectItem value="2">2 - سÙ‡Ù„</SelectItem>
                  <SelectItem value="3">3 - Ù…تÙˆسط</SelectItem>
                  <SelectItem value="4">4 - صعب</SelectItem>
                  <SelectItem value="5">5 - صعب جداÙ‹</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">إجابات Ù…Ù‚بÙˆÙ„ة (Ù…فصÙˆÙ„ة بفÙˆاصÙ„)</label>
            <Input value={acceptedAnswers} onChange={(e) => setAcceptedAnswers(e.target.value)} placeholder="إجابة1, إجابة2" />
          </div>
          <div>
            <label className="text-sm font-medium">اÙ„حÙ„ اÙ„Ù…فصÙ„</label>
            <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="خطÙˆات اÙ„حÙ„..." className="min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إÙ„غاء</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "تعدÙŠÙ„" : "إضافة"}
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
      toast.success("تÙ… حذف اÙ„تÙ…رÙŠÙ†");
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>حذف اÙ„تÙ…رÙŠÙ†ØŸ</AlertDialogTitle>
          <AlertDialogDescription>Ù‡ذا اÙ„إجراء Ù„ا ÙŠÙ…ÙƒÙ† اÙ„تراجع عÙ†Ù‡.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إÙ„غاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Generate with AI button ----
export function GenerateQuizExercisesButton({ chapterId, lessonId, onGenerated }: { chapterId: string; lessonId?: string; onGenerated: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-chapter-quizzes", {
        body: { chapter_id: chapterId, lesson_id: lessonId ?? null },
      });
      if (error) throw error;
      const quizCount = data?.quizzes ?? 0;
      const exerciseCount = data?.exercises ?? 0;
      toast.success(`تÙ… إÙ†شاء ${quizCount} أسئÙ„ة Ùˆ ${exerciseCount} تمارين`);
      onGenerated();
    } catch (err: any) {
      toast.error(err.message || "خطأ فÙŠ اÙ„تÙˆÙ„ÙŠد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="gap-1">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      تÙˆÙ„ÙŠد باÙ„ذÙƒاء اÙ„اصطÙ†اعÙŠ
    </Button>
  );
}
