import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar os arquivos de tradução
import ptTranslations from './locales/pt/translation.json';
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import frTranslations from './locales/fr/translation.json';
import deTranslations from './locales/de/translation.json';
import zhTranslations from './locales/zh/translation.json';

// Configuração do i18next para client components
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt: {
        translation: ptTranslations,
      },
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      de: {
        translation: deTranslations,
      },
      zh: {
        translation: zhTranslations,
      },
    },
  });

export default i18n;
