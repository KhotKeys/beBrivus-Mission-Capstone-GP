import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import en from './translations/en';
import fr from './translations/fr';
import sw from './translations/sw';
import am from './translations/am';
import ha from './translations/ha';
import yo from './translations/yo';
import zu from './translations/zu';
import ar from './translations/ar';
import pt from './translations/pt';
import dinka from './translations/dinka';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  sw: { translation: sw },
  am: { translation: am },
  ha: { translation: ha },
  yo: { translation: yo },
  zu: { translation: zu },
  ar: { translation: ar },
  pt: { translation: pt },
  dinka: { translation: dinka },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('bebrivus_language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bebrivus_language',
      caches: ['localStorage'],
    },
  });

// Set RTL for Arabic
if (i18n.language === 'ar') {
  document.documentElement.dir = 'rtl';
} else {
  document.documentElement.dir = 'ltr';
}

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('bebrivus_language', lng);
});

export default i18n;
