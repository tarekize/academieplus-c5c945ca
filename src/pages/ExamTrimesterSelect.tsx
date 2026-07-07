import { useNavigate, useSearchParams } from "react-router-dom";
import { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, Award, Star } from "lucide-react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";

type TrimesterItem = {
  id: number;
  label: string;
  labelFr: string;
  icon: string;
  color: string;
  IconComp: ComponentType<{ className?: string }> | null;
};

function ExamRow({ t, niveau, subject, filiere }: {
  t: TrimesterItem;
  niveau: string;
  subject: string;
  filiere: string;
}) {
  const Icon = t.IconComp;
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/exams/list?niveau=${niveau}&subject=${subject}&trimester=${t.id}${filiere ? `&filiere=${filiere}` : ''}`)
      }
      className="group w-full flex items-center gap-4 px-6 py-4 hover:bg-white/40 transition-colors text-left"
    >
      <div className="h-11 w-11 rounded-xl bg-[image:var(--gradient-violet)] flex items-center justify-center shrink-0 text-white shadow-md">
        {Icon ? <Icon className="h-5 w-5" /> : <span className="font-display font-extrabold text-sm">{t.icon}</span>}
      </div>
      <div className="flex-1 min-w-0 text-right" dir="rtl">
        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {t.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{t.labelFr}</p>
      </div>
      <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
    </button>
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
    { id: 1, label: "اختبارات الفصل الأول", labelFr: "1er Trimestre", icon: "01", color: "text-blue-600", IconComp: null },
    { id: 2, label: "اختبارات الفصل الثاني", labelFr: "2ème Trimestre", icon: "02", color: "text-emerald-600", IconComp: null },
    { id: 3, label: "اختبارات الفصل الثالث", labelFr: "3ème Trimestre", icon: "03", color: "text-amber-600", IconComp: null },
    ...(isTerminale ? [
      { id: 4, label: "بكالوريا بيضاء", labelFr: "Bac Blanc", icon: "BB", color: "text-violet-600", IconComp: Star },
      { id: 5, label: "بكالوريا نهائية", labelFr: "Bac Finale", icon: "BF", color: "text-rose-600", IconComp: Award },
    ] as TrimesterItem[] : []),
  ];

  return (
    <div className="min-h-screen student-shell">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 rounded-full gap-2 active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div dir="rtl">
            <h1 className="font-display text-xl font-extrabold text-foreground">
              الاختبارات — اختر نوع الاختبار
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sélectionnez le trimestre pour accéder aux examens
          </p>
        </motion.div>

        {/* Trimester list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card className="glass-card border-0 overflow-hidden mb-6">
            <div className="px-6 py-3.5 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" dir="rtl">
                فصول دراسية
              </p>
            </div>
            <div className="divide-y divide-border">
              {trimesters.filter(t => t.id <= 3).map((t) => (
                <ExamRow key={t.id} t={t} niveau={niveau} subject={subject} filiere={filiere} />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Bac section — terminale only */}
        {isTerminale && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          >
            <Card className="glass-card border-0 overflow-hidden">
              <div className="px-6 py-3.5 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" dir="rtl">
                  بكالوريا
                </p>
              </div>
              <div className="divide-y divide-border">
                {trimesters.filter(t => t.id >= 4).map((t) => (
                  <ExamRow key={t.id} t={t} niveau={niveau} subject={subject} filiere={filiere} />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ExamTrimesterSelect;
