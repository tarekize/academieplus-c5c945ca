import { GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Native-app landing screen. Intentionally minimal (logo + two buttons) —
 * the marketing content on Index (Hero/Pricing/FAQ/...) is web-only.
 */
const MobileHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-soft)]" />
      <div className="absolute -top-32 -right-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 -z-10 h-[22rem] w-[22rem] rounded-full bg-accent/25 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-[var(--shadow-elegant)] mb-6">
          <GraduationCap className="h-10 w-10 text-primary-foreground" />
        </div>

        <h1 className="font-display text-3xl font-extrabold text-foreground">
          {t("header.logo")}
        </h1>

        <p className="mt-3 max-w-xs text-base text-muted-foreground">
          {t("mobileHome.tagline")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-12 w-full max-w-xs flex flex-col gap-3"
      >
        <Button
          onClick={() => navigate("/auth?mode=signup")}
          size="lg"
          className="w-full text-base py-7 rounded-2xl shadow-[var(--shadow-elegant)] font-bold"
        >
          {t("mobileHome.signup")}
        </Button>
        <Button
          onClick={() => navigate("/auth?mode=login")}
          size="lg"
          variant="outline"
          className="w-full text-base py-7 rounded-2xl font-bold border-2 bg-card/60 backdrop-blur-sm"
        >
          {t("mobileHome.login")}
        </Button>
      </motion.div>
    </div>
  );
};

export default MobileHome;
