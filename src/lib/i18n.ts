import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt: {
        translation: require('./locales/pt/translation.json'),
      },
      en: {
        translation: require('./locales/en/translation.json'),
      },
      es: {
        translation: require('./locales/es/translation.json'),
      },
    },
  });

export default i18n;
