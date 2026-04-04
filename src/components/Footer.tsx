import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">{t("header.logo")}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("footer.navigation")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#accueil" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.home")}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.plans")}
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.faq")}
                </a>
              </li>
              <li>
                <a href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.legal")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("footer.subjects")}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{t("footer.math")}</li>
              <li>{t("footer.physics")}</li>
              <li>{t("footer.science")}</li>
              <li>{t("footer.french")}</li>
              <li>{t("footer.arabic")}</li>
              <li>{t("footer.english")}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-400">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href={`tel:${t("header.phone").replace(/\s/g, "")}`} className="hover:text-white transition-colors">
                  {t("header.phone")}
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href="mailto:contact@academieplus.dz" className="hover:text-white transition-colors">
                  contact@academieplus.dz
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>{t("footer.location")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {t("header.logo")}. {t("footer.rights")}</p>
          <p className="mt-2">
            {t("footer.conformity")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
