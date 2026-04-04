import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-students.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Ã‰lÃ¨ves souriants travaillant ensemble" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/40" />
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm text-primary-foreground px-5 py-2.5 rounded-full mb-8 border border-primary-foreground/20"
          >
            <Sparkles className="h-4 w-4" />
            <span className="font-medium text-sm">{t("hero.badge")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-8 leading-tight"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
            >
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-2 text-primary-foreground/80 mt-6"
          >
            <span className="text-xl">ðŸ‡©ðŸ‡¿</span>
            <span className="text-sm">{t("hero.programs")}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
