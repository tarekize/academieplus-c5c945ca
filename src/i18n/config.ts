import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

/** Applique le sens d'écriture (RTL pour l'arabe, LTR pour le français) au document. */
export const applyDirection = (lang: string) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar }
    },
    // Arabe par défaut : si aucune langue n'a été choisie, on force l'arabe.
    lng: (typeof localStorage !== 'undefined' && localStorage.getItem('i18nextLng')) || 'ar',
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'fr'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage']
    }
  });

// Applique la direction initiale puis à chaque changement de langue.
applyDirection(i18n.language || 'ar');
i18n.on('languageChanged', (lng) => applyDirection(lng));

export default i18n;
