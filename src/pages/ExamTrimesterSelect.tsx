import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, GraduationCap, Award } from "lucide-react";
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
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-500/25",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      id: 2,
      label: "اختبارات الفصل الثاني",
      labelFr: "2ème Trimestre",
      icon: GraduationCap,
      gradient: "from-violet-500 to-purple-400",
      shadow: "shadow-violet-500/25",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      iconColor: "text-violet-500",
    },
    {
      id: 3,
      label: "اختبارات الفصل الثالث",
      labelFr: "3ème Trimestre",
      icon: Award,
      gradient: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-500/25",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button
            variant="ghost"
            className="gap-2 mb-8 hover:bg-primary/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 mb-6">
              <BookOpen className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3" dir="rtl">
              الاختبارات
            </h1>
            <p className="text-muted-foreground text-lg" dir="rtl">
              اختر الفصل الدراسي للوصول إلى الاختبارات
            </p>
          </motion.div>
        </div>
      </div>

      {/* Trimester Cards */}
      <div className="container mx-auto px-4 -mt-4 pb-12 max-w-3xl">
        <div className="grid gap-6">
          {trimesters.map((t, index) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
              >
                <button
                  onClick={() =>
                    navigate(`/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}`)
                  }
                  className={`w-full group relative overflow-hidden rounded-2xl border ${t.border} ${t.bg} p-6 md:p-8 text-right transition-all duration-300 hover:scale-[1.02] hover:${t.shadow} hover:shadow-xl`}
                >
                  {/* Decorative gradient bar */}
                  <div className={`absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b ${t.gradient} rounded-r-2xl`} />
                  
                  <div className="flex items-center gap-5 flex-row-reverse">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    
                    <div className="flex-1 text-right">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1" dir="rtl">
                        {t.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{t.labelFr}</p>
                    </div>

                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center`}>
                        <ArrowLeft className={`h-5 w-5 ${t.iconColor} rotate-180`} />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExamTrimesterSelect;
