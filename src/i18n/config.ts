import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar }
    },
    lng: localStorage.getItem('i18nextLng') ? undefined : 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      // Only respect an explicit prior user choice (the FR/AR toggle). Never
      // guess from the browser's language — the app defaults to Arabic and
      // only switches to French when the user clicks the FR button.
      order: ['localStorage'],
      caches: ['localStorage']
    }
  });

// Single source of truth for <html lang>/dir — keeps every page (not just the
// ones rendering the toggle) in sync: Arabic = RTL, French = LTR.
const syncDocumentDirection = (lng: string) => {
  const isArabic = lng?.startsWith('ar');
  document.documentElement.lang = isArabic ? 'ar' : 'fr';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
};

syncDocumentDirection(i18n.language);
i18n.on('languageChanged', syncDocumentDirection);

export default i18n;
