import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

const ExamTrimesterSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";

  const trimesters = [
    { id: 1, label: "اختبارات الفصل الأول", labelFr: "1er Trimestre", icon: "01", gradient: "from-blue-500 to-blue-600" },
    { id: 2, label: "اختبارات الفصل الثاني", labelFr: "2ème Trimestre", icon: "02", gradient: "from-emerald-500 to-emerald-600" },
    { id: 3, label: "اختبارات الفصل الثالث", labelFr: "3ème Trimestre", icon: "03", gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold" dir="rtl">الاختبارات</h1>
            <p className="text-xs text-muted-foreground">Examens</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg mb-5">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" dir="rtl">
            اختر الفصل الدراسي
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Sélectionnez le trimestre pour accéder aux examens
          </p>
        </motion.div>

        {/* Trimester Cards */}
        <div className="grid gap-4 md:gap-5">
          {trimesters.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                className="w-full group relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                onClick={() =>
                  navigate(`/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}`)
                }
              >
                <div className="flex items-center gap-5 p-5 md:p-6">
                  {/* Number Badge */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-lg">{t.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-right" dir="rtl">
                    <p className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.labelFr}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamTrimesterSelect;
