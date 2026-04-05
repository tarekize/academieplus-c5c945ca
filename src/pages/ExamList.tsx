import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Play,
  Clock,
  FileText,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ExamTimer } from "@/components/exam/ExamTimer";

interface Exam {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  content: any;
  duration_minutes: number;
  created_at: string;
}

const ExamList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";
  const trimester = parseInt(searchParams.get("trimester") || "1");
  const { toast } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formTitleAr, setFormTitleAr] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDuration, setFormDuration] = useState(60);

  const trimesterLabels: Record<number, string> = {
    1: "اختبارات الفصل الأول",
    2: "اختبارات الفصل الثاني",
    3: "اختبارات الفصل الثالث",
  };

  const trimesterColors: Record<number, string> = {
    1: "from-blue-500 to-cyan-400",
    2: "from-violet-500 to-purple-400",
    3: "from-amber-500 to-orange-400",
  };

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams" as any)
      .select("*")
      .eq("school_level", niveau)
      .eq("trimester", trimester)
      .eq("subject", subject)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setExams(data as any[]);
    }
    setLoading(false);
  };

  const checkRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const r = roles?.map((x) => x.role) || [];
    setCanManage(r.includes("admin") || r.includes("pedago"));
  };

  useEffect(() => {
    checkRole();
    fetchExams();
  }, [niveau, trimester, subject]);

  const openCreateForm = () => {
    setEditExam(null);
    setFormTitle("");
    setFormTitleAr("");
    setFormDescription("");
    setFormContent("");
    setFormDuration(60);
    setFormOpen(true);
  };

  const openEditForm = (exam: Exam) => {
    setEditExam(exam);
    setFormTitle(exam.title);
    setFormTitleAr(exam.title_ar || "");
    setFormDescription(exam.description || "");
    setFormContent(
      typeof exam.content === "string"
        ? exam.content
        : JSON.stringify(exam.content, null, 2)
    );
    setFormDuration(exam.duration_minutes);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let contentJson: any;
    try {
      contentJson = JSON.parse(formContent || "[]");
    } catch {
      contentJson = formContent;
    }

    const payload = {
      title: formTitle,
      title_ar: formTitleAr || null,
      description: formDescription || null,
      content: contentJson,
      duration_minutes: formDuration,
      school_level: niveau,
      trimester,
      subject,
      created_by: user.id,
    };

    if (editExam) {
      const { error } = await supabase
        .from("exams" as any)
        .update(payload as any)
        .eq("id", editExam.id);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم التعديل بنجاح ✅" });
    } else {
      const { error } = await supabase
        .from("exams" as any)
        .insert(payload as any);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تمت الإضافة بنجاح ✅" });
    }

    setFormOpen(false);
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("exams" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف بنجاح ✅" });
    setDeleteConfirm(null);
    fetchExams();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl bg-gradient-to-br ${trimesterColors[trimester] || "from-primary to-primary/60"} flex items-center justify-center`}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-bold" dir="rtl">
                {trimesterLabels[trimester]}
              </h1>
              <p className="text-xs text-muted-foreground">{niveau}</p>
            </div>
          </div>

          {canManage ? (
            <Button
              onClick={openCreateForm}
              className={`gap-2 rounded-xl bg-gradient-to-r ${trimesterColors[trimester] || "from-primary to-primary/80"} border-0 text-white shadow-lg hover:opacity-90 transition-opacity`}
            >
              <Plus className="h-4 w-4" />
              إضافة اختبار
            </Button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">جاري التحميل...</p>
          </div>
        ) : exams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1" dir="rtl">
                لا توجد اختبارات حالياً
              </p>
              <p className="text-sm text-muted-foreground" dir="rtl">
                {canManage
                  ? "ابدأ بإضافة اختبار جديد"
                  : "لم يتم إضافة اختبارات بعد لهذا الفصل"}
              </p>
            </div>
            {canManage && (
              <Button onClick={openCreateForm} className="mt-2 gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                إضافة اختبار
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {exams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md group">
                    <CardContent className="p-0">
                      <div className="flex items-stretch" dir="rtl">
                        {/* Color stripe */}
                        <div
                          className={`w-1.5 bg-gradient-to-b ${trimesterColors[trimester]} shrink-0`}
                        />

                        <div className="flex-1 p-4 flex items-center gap-4">
                          {/* Icon */}
                          <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground truncate">
                              {exam.title_ar || exam.title}
                            </p>
                            {exam.title_ar && (
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {exam.title}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge
                                variant="secondary"
                                className="gap-1 text-xs font-normal"
                              >
                                <Clock className="h-3 w-3" />
                                {exam.duration_minutes} د
                              </Badge>
                              {Array.isArray(exam.content) && (
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-xs font-normal"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  {exam.content.length} سؤال
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {canManage ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-xl h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                  onClick={() => openEditForm(exam)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-xl h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setDeleteConfirm(exam.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => setViewExam(exam)}
                                className="gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 border-0 text-white shadow-md hover:opacity-90 transition-opacity"
                              >
                                <Play className="h-4 w-4" />
                                اجتياز
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-lg" dir="rtl">
                حذف الاختبار
              </h3>
              <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                هل أنت متأكد من حذف هذا الاختبار؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setDeleteConfirm(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              >
                حذف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle dir="rtl" className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-lg bg-gradient-to-br ${trimesterColors[trimester]} flex items-center justify-center`}
              >
                <FileText className="h-4 w-4 text-white" />
              </div>
              {editExam ? "تعديل الاختبار" : "إضافة اختبار جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Titre (FR)</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground" dir="rtl">
                  العنوان (عربي)
                </Label>
                <Input
                  dir="rtl"
                  value={formTitleAr}
                  onChange={(e) => setFormTitleAr(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="rounded-xl mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contenu (JSON)</Label>
              <Textarea
                rows={5}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder='[{"question": "...", "options": ["A","B","C","D"], "answer": "A"}]'
                className="rounded-xl mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground" dir="rtl">
                المدة (دقيقة)
              </Label>
              <Input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="rounded-xl mt-1 w-32"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">
                إلغاء
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              className={`rounded-xl bg-gradient-to-r ${trimesterColors[trimester]} border-0 text-white`}
            >
              {editExam ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exam Dialog (Student) */}
      <Dialog
        open={!!viewExam}
        onOpenChange={(open) => !open && setViewExam(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {viewExam && (
            <>
              {/* Exam header */}
              <div
                className={`bg-gradient-to-r ${trimesterColors[trimester]} p-6 text-white`}
              >
                <div className="flex items-center justify-between" dir="rtl">
                  <div>
                    <h2 className="text-xl font-bold">
                      {viewExam.title_ar || viewExam.title}
                    </h2>
                    {viewExam.description && (
                      <p className="text-white/80 text-sm mt-1">
                        {viewExam.description}
                      </p>
                    )}
                  </div>
                  <ExamTimer
                    duration={viewExam.duration_minutes * 60}
                    onTimeUp={() => {
                      toast({ title: "⏰ انتهى الوقت!" });
                      setViewExam(null);
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-4" dir="rtl">
                  <Badge className="bg-white/20 text-white border-0 gap-1">
                    <Clock className="h-3 w-3" />
                    {viewExam.duration_minutes} دقيقة
                  </Badge>
                  {Array.isArray(viewExam.content) && (
                    <Badge className="bg-white/20 text-white border-0 gap-1">
                      <BookOpen className="h-3 w-3" />
                      {viewExam.content.length} سؤال
                    </Badge>
                  )}
                </div>
              </div>

              {/* Questions */}
              <div className="p-6 space-y-4" dir="rtl">
                {Array.isArray(viewExam.content) ? (
                  viewExam.content.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/50 p-4 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {item.question || item.statement || JSON.stringify(item)}
                          </p>
                          {item.options && Array.isArray(item.options) && (
                            <div className="mt-3 space-y-2">
                              {item.options.map((opt: string, oi: number) => (
                                <div
                                  key={oi}
                                  className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                >
                                  <span className="h-6 w-6 rounded-full border-2 border-border text-xs flex items-center justify-center font-medium">
                                    {String.fromCharCode(1571 + oi)}
                                  </span>
                                  <span className="text-sm">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    {typeof viewExam.content === "string"
                      ? viewExam.content
                      : JSON.stringify(viewExam.content)}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 flex justify-end">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setViewExam(null)}
                >
                  إغلاق الاختبار
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
