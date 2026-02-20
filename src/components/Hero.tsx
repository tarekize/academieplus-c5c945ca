import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-students.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingImage from "./FloatingImage";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <FloatingImage src={heroImage} alt="Élèves souriants travaillant ensemble" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60" />
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full mb-8">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">{t("hero.badge")}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            {t("hero.title")}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl px-16 py-9 rounded-lg mb-6 flex items-center justify-center"
            >
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-2 text-white">
            <span className="text-xl">🇩🇿</span>
            <span className="text-base">{t("hero.programs")}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
