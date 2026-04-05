import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const ExamTrimesterSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";

  const trimesters = [
    { id: 1, label: "اختبارات الفصل الأول", labelFr: "Examens du 1er trimestre" },
    { id: 2, label: "اختبارات الفصل الثاني", labelFr: "Examens du 2ème trimestre" },
    { id: 3, label: "اختبارات الفصل الثالث", labelFr: "Examens du 3ème trimestre" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="outline"
          className="gap-2 mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          رجوع
        </Button>

        <div className="text-center mb-8">
          <FileText className="h-12 w-12 mx-auto mb-3 text-primary" />
          <h1 className="text-2xl font-bold" dir="rtl">الاختبارات</h1>
          <p className="text-muted-foreground mt-1">اختر الفصل الدراسي</p>
        </div>

        <div className="space-y-4">
          {trimesters.map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                navigate(`/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}`)
              }
            >
              <CardContent className="p-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.labelFr}</span>
                <span className="text-lg font-semibold" dir="rtl">{t.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamTrimesterSelect;
