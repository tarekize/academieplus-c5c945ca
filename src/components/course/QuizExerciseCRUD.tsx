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
      toast.error("Ø§Ù„Ø³Ø¤Ø§Ù„ ÙˆØ§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø© Ù…Ø·Ù„ÙˆØ¨Ø§Ù†");
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
        toast.success("ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø¤Ø§Ù„");
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
        toast.success("ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø³Ø¤Ø§Ù„");
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
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle dir="rtl">{isEdit ? "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø¤Ø§Ù„" : "Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir="rtl">
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ù†Øµ Ø§Ù„Ø³Ø¤Ø§Ù„..." className="min-h-[60px]" />
          <div className="space-y-2">
            <label className="text-sm font-medium">Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª</label>
            {options.map((opt, i) => (
              <Input key={i} value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                placeholder={`Ø§Ù„Ø®ÙŠØ§Ø± ${i + 1}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©</label>
              <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©" />
            </div>
            <div>
              <label className="text-sm font-medium">Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØµØ¹ÙˆØ¨Ø©</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Ø§Ø®ØªØ± Ø§Ù„ØµØ¹ÙˆØ¨Ø©" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Ø³Ù‡Ù„ Ø¬Ø¯Ø§Ù‹</SelectItem>
                  <SelectItem value="2">2 - Ø³Ù‡Ù„</SelectItem>
                  <SelectItem value="3">3 - Ù…ØªÙˆØ³Ø·</SelectItem>
                  <SelectItem value="4">4 - ØµØ¹Ø¨</SelectItem>
                  <SelectItem value="5">5 - ØµØ¹Ø¨ Ø¬Ø¯Ø§Ù‹</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Ø§Ù„Ø´Ø±Ø­</label>
            <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Ø´Ø±Ø­ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Ø¥Ù„ØºØ§Ø¡</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "ØªØ¹Ø¯ÙŠÙ„" : "Ø¥Ø¶Ø§ÙØ©"}
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
      toast.success("ØªÙ… Ø­Ø°Ù Ø§Ù„Ø³Ø¤Ø§Ù„");
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Ø­Ø°Ù Ø§Ù„Ø³Ø¤Ø§Ù„ØŸ</AlertDialogTitle>
          <AlertDialogDescription>Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù†Ù‡.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ø¥Ù„ØºØ§Ø¡</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ø­Ø°Ù"}
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
      toast.error("Ø§Ù„Ø¹Ù†ÙˆØ§Ù† ÙˆØ§Ù„ØªÙ…Ø±ÙŠÙ† Ù…Ø·Ù„ÙˆØ¨Ø§Ù†");
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
        toast.success("ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ØªÙ…Ø±ÙŠÙ†");
      } else {
        const { error } = await supabase.from("chapter_exercises").insert({ chapter_id: chapterId, lesson_id: lessonId ?? null, ...data });
        if (error) throw error;
        toast.success("ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„ØªÙ…Ø±ÙŠÙ†");
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
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />ØªÙ…Ø±ÙŠÙ† Ø¬Ø¯ÙŠØ¯</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle dir="rtl">{isEdit ? "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ØªÙ…Ø±ÙŠÙ†" : "ØªÙ…Ø±ÙŠÙ† Ø¬Ø¯ÙŠØ¯"}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir="rtl">
          <div>
            <label className="text-sm font-medium">Ø§Ù„Ø¹Ù†ÙˆØ§Ù†</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØªÙ…Ø±ÙŠÙ†" />
          </div>
          <div>
            <label className="text-sm font-medium">Ù†Øµ Ø§Ù„ØªÙ…Ø±ÙŠÙ†</label>
            <Textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Ù†Øµ Ø§Ù„ØªÙ…Ø±ÙŠÙ†..." className="min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø©</label>
              <Input value={expectedAnswer} onChange={(e) => setExpectedAnswer(e.target.value)} placeholder="Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©" />
            </div>
            <div>
              <label className="text-sm font-medium">Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØµØ¹ÙˆØ¨Ø©</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Ø§Ø®ØªØ± Ø§Ù„ØµØ¹ÙˆØ¨Ø©" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Ø³Ù‡Ù„ Ø¬Ø¯Ø§Ù‹</SelectItem>
                  <SelectItem value="2">2 - Ø³Ù‡Ù„</SelectItem>
                  <SelectItem value="3">3 - Ù…ØªÙˆØ³Ø·</SelectItem>
                  <SelectItem value="4">4 - ØµØ¹Ø¨</SelectItem>
                  <SelectItem value="5">5 - ØµØ¹Ø¨ Ø¬Ø¯Ø§Ù‹</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Ø¥Ø¬Ø§Ø¨Ø§Øª Ù…Ù‚Ø¨ÙˆÙ„Ø© (Ù…ÙØµÙˆÙ„Ø© Ø¨ÙÙˆØ§ØµÙ„)</label>
            <Input value={acceptedAnswers} onChange={(e) => setAcceptedAnswers(e.target.value)} placeholder="Ø¥Ø¬Ø§Ø¨Ø©1, Ø¥Ø¬Ø§Ø¨Ø©2" />
          </div>
          <div>
            <label className="text-sm font-medium">Ø§Ù„Ø­Ù„ Ø§Ù„Ù…ÙØµÙ„</label>
            <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Ø®Ø·ÙˆØ§Øª Ø§Ù„Ø­Ù„..." className="min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Ø¥Ù„ØºØ§Ø¡</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "ØªØ¹Ø¯ÙŠÙ„" : "Ø¥Ø¶Ø§ÙØ©"}
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
      toast.success("ØªÙ… Ø­Ø°Ù Ø§Ù„ØªÙ…Ø±ÙŠÙ†");
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Ø­Ø°Ù Ø§Ù„ØªÙ…Ø±ÙŠÙ†ØŸ</AlertDialogTitle>
          <AlertDialogDescription>Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù†Ù‡.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ø¥Ù„ØºØ§Ø¡</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ø­Ø°Ù"}
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
      toast.success(`ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ ${quizCount} Ø£Ø³Ø¦Ù„Ø© Ùˆ ${exerciseCount} تمارين`);
      onGenerated();
    } catch (err: any) {
      toast.error(err.message || "Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªÙˆÙ„ÙŠØ¯");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="gap-1">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      ØªÙˆÙ„ÙŠØ¯ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ
    </Button>
  );
}
