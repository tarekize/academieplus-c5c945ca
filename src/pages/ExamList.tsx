import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2, Play, Clock, FileText, BookOpenCheck, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
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

  const [formTitle, setFormTitle] = useState("");
  const [formTitleAr, setFormTitleAr] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDuration, setFormDuration] = useState(60);

  const trimesterLabels: Record<number, string> = {
    1: "اختبارات الفصل الأول",
    2: "اختبارات الفصل الثاني",
    3: "اختبارات الفصل الثالث",
    4: "بكالوريا بيضاء",
    5: "بكالوريا نهائية",
  };

  const trimesterLabelsFr: Record<number, string> = {
    1: "1er Trimestre",
    2: "2ème Trimestre",
    3: "3ème Trimestre",
    4: "Bac Blanc",
    5: "Bac Finale",
  };

  const trimesterColors: Record<number, string> = {
    1: "from-blue-500 to-blue-600",
    2: "from-emerald-500 to-emerald-600",
    3: "from-amber-500 to-orange-500",
    4: "from-violet-500 to-purple-600",
    5: "from-rose-500 to-red-600",
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
    const { data: { user } } = await supabase.auth.getUser();
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
    setFormContent(typeof exam.content === "string" ? exam.content : JSON.stringify(exam.content, null, 2));
    setFormDuration(exam.duration_minutes);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
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
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم التعديل بنجاح" });
    } else {
      const { error } = await supabase
        .from("exams" as any)
        .insert(payload as any);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تمت الإضافة بنجاح" });
    }

    setFormOpen(false);
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("exams" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف بنجاح" });
    fetchExams();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1" dir="rtl">
            <h1 className="text-lg font-bold">{trimesterLabels[trimester]}</h1>
            <p className="text-xs text-muted-foreground">{niveau}</p>
          </div>
          {canManage && (
            <Button onClick={openCreateForm} className="gap-2 rounded-xl shadow-md">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة اختبار</span>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Trimester Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r ${trimesterColors[trimester] || "from-primary to-primary/70"} text-white shadow-md`}>
            <BookOpenCheck className="h-4 w-4" />
            <span className="text-sm font-medium">{trimesterLabels[trimester]}</span>
            {trimesterLabelsFr[trimester] && (
              <span className="text-white/70 text-xs">— {trimesterLabelsFr[trimester]}</span>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : exams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <Search className="h-9 w-9 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1" dir="rtl">لا توجد اختبارات حالياً</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {canManage ? "ابدأ بإضافة اختبار جديد لهذا الفصل" : "لم يتم إضافة اختبارات لهذا الفصل بعد"}
            </p>
            {canManage && (
              <Button onClick={openCreateForm} className="mt-6 gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                إضافة اختبار
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {exams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-5 md:p-6">
                    {/* Exam Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${trimesterColors[trimester]} flex items-center justify-center shadow-sm`}>
                      <FileText className="h-5 w-5 text-white" />
                    </div>

                    {/* Exam Info */}
                    <div className="flex-1 min-w-0" dir="rtl">
                      <h3 className="font-semibold text-foreground truncate">
                        {exam.title_ar || exam.title}
                      </h3>
                      {exam.title_ar && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{exam.title}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" />
                          {exam.duration_minutes} دقيقة
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canManage ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl h-9 w-9 hover:bg-secondary"
                            onClick={() => openEditForm(exam)}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl h-9 w-9 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle dir="rtl">تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription dir="rtl">
                                  هل أنت متأكد من حذف هذا الاختبار؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(exam.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <Button
                          onClick={() => setViewExam(exam)}
                          className="gap-2 rounded-xl shadow-sm"
                          size="sm"
                        >
                          <Play className="h-3.5 w-3.5" />
                          اجتياز
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle dir="rtl">{editExam ? "تعديل الاختبار" : "إضافة اختبار جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Titre (FR)</Label>
              <Input className="rounded-xl mt-1" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground" dir="rtl">العنوان (عربي)</Label>
              <Input className="rounded-xl mt-1" dir="rtl" value={formTitleAr} onChange={(e) => setFormTitleAr(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea className="rounded-xl mt-1" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contenu (JSON)</Label>
              <Textarea
                className="rounded-xl mt-1 font-mono text-xs"
                rows={6}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder='[{"question": "...", "options": ["A","B","C","D"], "answer": "A"}]'
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground" dir="rtl">المدة (دقيقة)</Label>
              <Input className="rounded-xl mt-1" type="number" value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave} className="rounded-xl">{editExam ? "حفظ التعديلات" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exam Dialog (Student) */}
      <Dialog open={!!viewExam} onOpenChange={(open) => !open && setViewExam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3" dir="rtl">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trimesterColors[trimester]} flex items-center justify-center`}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle dir="rtl">{viewExam?.title_ar || viewExam?.title}</DialogTitle>
                {viewExam?.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{viewExam.description}</p>
                )}
              </div>
            </div>
          </DialogHeader>
          {viewExam && (
            <div className="space-y-4 mt-2">
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full" dir="rtl">
                <Clock className="h-3 w-3" />
                المدة: {viewExam.duration_minutes} دقيقة
              </div>
              <div className="border-t pt-4 space-y-3">
                {Array.isArray(viewExam.content) ? (
                  viewExam.content.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                      <p className="font-medium text-sm" dir="rtl">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold ml-2">
                          {idx + 1}
                        </span>
                        {item.question || item.statement || JSON.stringify(item)}
                      </p>
                      {item.options && Array.isArray(item.options) && (
                        <div className="space-y-1.5 mt-3 mr-8" dir="rtl">
                          {item.options.map((opt: string, oi: number) => (
                            <div key={oi} className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-2 rounded-lg">
                              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm" dir="rtl">
                    {typeof viewExam.content === "string" ? viewExam.content : JSON.stringify(viewExam.content)}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setViewExam(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
