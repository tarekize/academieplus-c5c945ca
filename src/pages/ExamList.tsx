import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold" dir="rtl">{trimesterLabels[trimester] || "اختبارات"}</h1>
          {canManage && (
            <Button className="gap-2" onClick={openCreateForm}>
              <Plus className="h-4 w-4" />
              إضافة اختبار
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground" dir="rtl">لا توجد اختبارات حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right" dir="rtl">العنوان</TableHead>
                  <TableHead className="text-right" dir="rtl">المدة (دقيقة)</TableHead>
                  <TableHead className="text-right" dir="rtl">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell dir="rtl">
                      <div>
                        <p className="font-medium">{exam.title_ar || exam.title}</p>
                        {exam.title_ar && (
                          <p className="text-sm text-muted-foreground">{exam.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell dir="rtl">{exam.duration_minutes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        {canManage ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openEditForm(exam)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(exam.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="gap-2" onClick={() => setViewExam(exam)}>
                            <Play className="h-4 w-4" />
                            اجتياز الاختبار
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle dir="rtl">{editExam ? "تعديل الاختبار" : "إضافة اختبار جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre (FR)</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div>
              <Label dir="rtl">العنوان (عربي)</Label>
              <Input dir="rtl" value={formTitleAr} onChange={(e) => setFormTitleAr(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div>
              <Label>Contenu (JSON)</Label>
              <Textarea
                rows={6}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder='[{"question": "...", "options": ["A","B","C","D"], "answer": "A"}]'
              />
            </div>
            <div>
              <Label dir="rtl">المدة (دقيقة)</Label>
              <Input type="number" value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave}>{editExam ? "حفظ التعديلات" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exam Dialog (Student) */}
      <Dialog open={!!viewExam} onOpenChange={(open) => !open && setViewExam(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle dir="rtl">{viewExam?.title_ar || viewExam?.title}</DialogTitle>
          </DialogHeader>
          {viewExam && (
            <div className="space-y-4">
              {viewExam.description && (
                <p className="text-muted-foreground" dir="rtl">{viewExam.description}</p>
              )}
              <p className="text-sm text-muted-foreground" dir="rtl">
                المدة: {viewExam.duration_minutes} دقيقة
              </p>
              <div className="border-t pt-4">
                {Array.isArray(viewExam.content) ? (
                  viewExam.content.map((item: any, idx: number) => (
                    <div key={idx} className="mb-4 p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium mb-2" dir="rtl">
                        {idx + 1}. {item.question || item.statement || JSON.stringify(item)}
                      </p>
                      {item.options && Array.isArray(item.options) && (
                        <div className="space-y-1 mr-4" dir="rtl">
                          {item.options.map((opt: string, oi: number) => (
                            <p key={oi} className="text-sm">• {opt}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground" dir="rtl">
                    {typeof viewExam.content === "string" ? viewExam.content : JSON.stringify(viewExam.content)}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewExam(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
