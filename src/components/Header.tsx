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
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setSession(session); }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("Erreur lors de la déconnexion"); }
    else { toast.success("Déconnexion réussie"); navigate("/"); }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) { element.scrollIntoView({ behavior: "smooth" }); setIsMenuOpen(false); }
  };

  const changeLanguage = (lang: "fr" | "ar") => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-background/80 backdrop-blur-sm"
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{t("header.logo")}</span>
          </div>

          {/* Desktop Navigation */}
          {!minimal && (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                onClick={() => scrollToSection("pricing")}
                className="font-medium px-5"
              >
                {t("header.discoverPlans")}
              </Button>

              <a
                href={`tel:${t("header.phone").replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-accent/50"
              >
                <Phone className="h-4 w-4 text-primary" />
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
                  className="text-foreground font-medium hover:text-primary"
                >
                  {t("header.login")}
                </Button>
              )}

              {!session && (
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="font-medium px-6"
                >
                  {t("header.freeTrial")}
                </Button>
              )}

              {/* Language Selector */}
              <div className="flex items-center gap-1 ml-2 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => changeLanguage("fr")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    i18n.language === "fr" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ðŸ‡«ðŸ‡· FR
                </button>
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    i18n.language === "ar" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ðŸ‡©ðŸ‡¿ AR
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {!minimal && (
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {!minimal && isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3 border-t pt-4">
            <Button onClick={() => scrollToSection("pricing")} className="w-full font-semibold">
              {t("header.discoverPlans")}
            </Button>

            <a
              href={`tel:${t("header.phone").replace(/\s/g, "")}`}
              className="block text-center text-lg text-foreground font-semibold hover:text-primary py-2"
            >
              ðŸ“ž {t("header.phone")}
            </a>

            {session ? (
              <Button variant="outline" onClick={handleLogout} className="w-full font-semibold">
                <LogOut className="h-4 w-4 mr-2" />
                {t("header.logout")}
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth?mode=login")}
                variant="ghost"
                className="w-full text-foreground font-semibold"
              >
                {t("header.login")}
              </Button>
            )}

            {!session && (
              <Button onClick={() => navigate("/auth?mode=signup")} className="w-full font-semibold">
                {t("header.freeTrial")}
              </Button>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => changeLanguage("fr")}
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  i18n.language === "fr" ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                ðŸ‡«ðŸ‡· Français
              </button>
              <button
                onClick={() => changeLanguage("ar")}
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  i18n.language === "ar" ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                ðŸ‡©ðŸ‡¿ اÙ„عربÙŠة
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
