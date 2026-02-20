import { GraduationCap, LogOut, Globe, Menu, X, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Header = ({ minimal = false }: { minimal?: boolean }) => {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      toast.success("Déconnexion réussie");
      navigate("/");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const changeLanguage = (lang: "fr" | "ar") => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl text-gray-900 font-bold">{t("header.logo")}</span>
          </div>

          {/* Desktop Navigation */}
          {!minimal && (
            <div className="hidden lg:flex items-center gap-3">
              <Button
                onClick={() => scrollToSection("pricing")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
              >
                {t("header.discoverPlans")}
              </Button>

              <a
                href={`tel:${t("header.phone").replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-gray-900 font-medium hover:text-blue-600 transition-colors px-4"
              >
                <Phone className="h-5 w-5 text-pink-500" />
                {t("header.phone")}
              </a>

              {session ? (
                <Button variant="outline" onClick={handleLogout} className="font-medium">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("header.logout")}
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/auth?mode=login")}
                  variant="ghost"
                  className="text-gray-900 font-medium hover:text-blue-600"
                >
                  {t("header.login")}
                </Button>
              )}

              {!session && (
                <Button 
                  onClick={() => navigate("/auth?mode=signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                >
                  {t("header.freeTrial")}
                </Button>
              )}

              {/* Language Selector */}
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => changeLanguage("fr")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    i18n.language === "fr" ? "bg-blue-50" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">🇫🇷</span>
                  <span className="text-sm font-medium">FR</span>
                </button>
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    i18n.language === "ar" ? "bg-blue-50" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">🇩🇿</span>
                  <span className="text-sm font-medium">AR</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {!minimal && (
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {!minimal && isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3">
            <Button
              onClick={() => scrollToSection("pricing")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold"
            >
              {t("header.discoverPlans")}
            </Button>

            <a
              href={`tel:${t("header.phone").replace(/\s/g, "")}`}
              className="block text-center text-xl text-gray-900 font-bold hover:text-blue-600 py-2"
            >
              📞 {t("header.phone")}
            </a>

            {session ? (
              <Button variant="outline" onClick={handleLogout} className="w-full font-bold">
                <LogOut className="h-4 w-4 mr-2" />
                {t("header.logout")}
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth?mode=login")}
                className="w-full text-xl text-gray-900 font-bold bg-transparent hover:bg-gray-100"
              >
                {t("header.login")}
              </Button>
            )}

            {!session && (
              <Button 
                onClick={() => navigate("/auth?mode=signup")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold"
              >
                {t("header.freeTrial")}
              </Button>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => changeLanguage("fr")}
                className={`flex-1 py-2 rounded-lg border ${
                  i18n.language === "fr" ? "bg-blue-50 border-blue-600" : "border-gray-200"
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => changeLanguage("ar")}
                className={`flex-1 py-2 rounded-lg border ${
                  i18n.language === "ar" ? "bg-blue-50 border-blue-600" : "border-gray-200"
                }`}
              >
                🇩🇿 العربية
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
