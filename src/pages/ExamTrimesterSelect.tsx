import { useNavigate, useSearchParams } from "react-router-dom";
import { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, ChevronLeft, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

type TrimesterItem = {
  id: number;
  label: string;
  labelFr: string;
  icon: string;
  gradient: string;
  IconComp: ComponentType<{ className?: string }> | null;
};

function BacCard({ t, niveau, subject, filiere }: {
  t: TrimesterItem;
  niveau: string;
  subject: string;
  filiere: string;
}) {
  const navigate = useNavigate();
  const Icon = t.IconComp;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <button
        className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        style={{ borderColor: t.id === 4 ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--accent) / 0.4)' }}
        onClick={() =>
          navigate(`/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}${filiere ? `&filiere=${filiere}` : ''}`)
        }
      >
        <div className="flex items-center gap-4 p-5">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            {Icon ? <Icon className="h-5 w-5 text-white" /> : <span className="text-white font-bold text-sm">{t.icon}</span>}
          </div>
          <div className="flex-1 text-right" dir="rtl">
            <p className="font-bold text-foreground group-hover:text-primary transition-colors">
              {t.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{t.labelFr}</p>
          </div>
          <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300 flex-shrink-0" />
        </div>
      </button>
    </motion.div>
  );
}

const ExamTrimesterSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";
  const filiere = searchParams.get("filiere") || "";

  const isTerminale = niveau === "terminale";

  const trimesters: TrimesterItem[] = [
    { id: 1, label: "اختبارات الفصل الأول", labelFr: "1er Trimestre", icon: "01", gradient: "from-blue-500 to-blue-600", IconComp: null },
    { id: 2, label: "اختبارات الفصل الثاني", labelFr: "2ème Trimestre", icon: "02", gradient: "from-emerald-500 to-emerald-600", IconComp: null },
    { id: 3, label: "اختبارات الفصل الثالث", labelFr: "3ème Trimestre", icon: "03", gradient: "from-amber-500 to-orange-500", IconComp: null },
    ...(isTerminale ? [
      { id: 4, label: "بكالوريا بيضاء", labelFr: "Bac Blanc", icon: "BB", gradient: "from-violet-500 to-purple-600", IconComp: Star },
      { id: 5, label: "بكالوريا نهائية", labelFr: "Bac Finale", icon: "BF", gradient: "from-rose-500 to-red-600", IconComp: Award },
    ] as TrimesterItem[] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/95 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 max-w-3xl flex items-center h-14 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-bold" dir="rtl">الاختبارات</h1>
            <p className="text-xs text-muted-foreground">Examens</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-7 text-center text-primary-foreground shadow-[var(--shadow-elegant)] mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-card/20 backdrop-blur-sm mb-4">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-1" dir="rtl">
            اختر نوع الاختبار
          </h2>
          <p className="text-primary-foreground/75 text-sm">
            Sélectionnez le trimestre pour accéder aux examens
          </p>
        </motion.div>

        {/* Section label for trimesters */}
        {isTerminale && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1" dir="rtl">
            فصول دراسية
          </p>
        )}

        {/* Trimester Cards */}
        <div className="grid gap-3">
          {trimesters.filter(t => t.id <= 3).map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <button
                className="w-full group relative overflow-hidden rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                onClick={() =>
                  navigate(`/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}${filiere ? `&filiere=${filiere}` : ''}`)
                }
              >
                <div className="flex items-center gap-4 p-5">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-sm">{t.icon}</span>
                  </div>
                  <div className="flex-1 text-right" dir="rtl">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.labelFr}</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300 flex-shrink-0" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bac section — terminale only */}
        {isTerminale && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-7 mb-3 px-1" dir="rtl">
              بكالوريا
            </p>
            <div className="grid gap-3">
              {trimesters.filter(t => t.id >= 4).map(t => (
                <BacCard key={t.id} t={t} niveau={niveau} subject={subject} filiere={filiere} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamTrimesterSelect;
