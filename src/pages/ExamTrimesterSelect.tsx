import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const ExamTrimesterSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";

  const trimesters = [
    {
      id: 1,
      label: "اختبارات الفصل الأول",
      labelFr: "1er Trimestre",
      icon: "01",
      gradient: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-500/25",
    },
    {
      id: 2,
      label: "اختبارات الفصل الثاني",
      labelFr: "2ème Trimestre",
      icon: "02",
      gradient: "from-violet-500 to-purple-400",
      shadow: "shadow-violet-500/25",
    },
    {
      id: 3,
      label: "اختبارات الفصل الثالث",
      labelFr: "3ème Trimestre",
      icon: "03",
      gradient: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-500/25",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">الاختبارات</h1>
              <p className="text-xs text-muted-foreground">{niveau}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            اختر الفصل الدراسي
          </div>
          <h2 className="text-2xl font-bold text-foreground" dir="rtl">
            فصول الاختبارات
          </h2>
          <p className="text-muted-foreground mt-2 text-sm" dir="rtl">
            اختر الفصل الذي تريد عرض اختباراته
          </p>
        </motion.div>

        <div className="space-y-4">
          {trimesters.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() =>
                  navigate(
                    `/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}`
                  )
                }
                className={`w-full group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 text-left transition-all duration-300 hover:shadow-lg hover:${t.shadow} hover:border-transparent hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex items-center gap-4" dir="rtl">
                  {/* Number badge */}
                  <div
                    className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shrink-0 shadow-lg ${t.shadow} transition-transform group-hover:scale-110`}
                  >
                    <span className="text-white font-black text-lg">{t.icon}</span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base mb-0.5">
                      {t.label}
                    </p>
                    <p className="text-muted-foreground text-sm">{t.labelFr}</p>
                  </div>

                  {/* Arrow */}
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5 rotate-180 rtl:rotate-0" />
                  </div>
                </div>

                {/* Decorative gradient line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamTrimesterSelect;
