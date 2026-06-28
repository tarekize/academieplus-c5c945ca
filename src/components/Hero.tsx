import { ArrowRight, Sparkles, Trophy, Users, BookOpenCheck } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-students.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: "+10 000", label: t("hero.programs") },
    { icon: Trophy, value: "98%", label: "Réussite" },
    { icon: BookOpenCheck, value: "8", label: "Niveaux" },
  ];

  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16"
    >
      {/* Soft gradient mesh background */}
      <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-soft)]" />
      <div className="absolute -top-32 -right-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-accent/25 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-4 py-2 backdrop-blur-sm shadow-[var(--shadow-card)]"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t("hero.badge")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground"
            >
              {t("hero.title")}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="group text-base px-8 py-7 rounded-2xl shadow-[var(--shadow-elegant)] font-bold"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => {
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
                size="lg"
                variant="outline"
                className="text-base px-8 py-7 rounded-2xl font-bold border-2 bg-card/60 backdrop-blur-sm"
              >
                {t("header.discoverPlans")}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 grid grid-cols-3 gap-3 max-w-md"
            >
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm shadow-[var(--shadow-card)]"
                  >
                    <Icon className="h-5 w-5 text-primary mb-2" />
                    <p className="font-display text-xl font-extrabold leading-none">{s.value}</p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground line-clamp-1">
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Right: image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-border shadow-[var(--shadow-elegant)]">
              <img
                src={heroImage}
                alt="Élèves souriants travaillant ensemble"
                className="w-full h-[34rem] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-elegant)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] text-accent-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold leading-none">Programme officiel</p>
                <p className="mt-1 text-xs text-muted-foreground">🇩🇿 Algérie</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
