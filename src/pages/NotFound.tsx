import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-md">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 font-display text-5xl font-extrabold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">{t("notFound.description")}</p>
        <Button asChild>
          <Link to="/liste-cours">{t("notFound.backToCourses")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
