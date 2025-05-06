import { cookies, headers } from 'next/headers';

// Traduções para Server Components (importação dinâmica)
import ptTranslations from './locales/pt/translation.json';
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import frTranslations from './locales/fr/translation.json';
import deTranslations from './locales/de/translation.json';
import zhTranslations from './locales/zh/translation.json';

// Define o tipo da estrutura de tradução
type TranslationResource = {
  [key: string]: string | TranslationResource;
};

// Recursos de tradução
const resources: Record<string, TranslationResource> = {
  pt: ptTranslations as TranslationResource,
  en: enTranslations as TranslationResource,
  es: esTranslations as TranslationResource,
  fr: frTranslations as TranslationResource,
  de: deTranslations as TranslationResource,
  zh: zhTranslations as TranslationResource,
};

// Função para ser usada em Server Components
export async function getTranslation() {
  // Obter a preferência de idioma do usuário a partir dos cookies ou headers
  const cookieStore = cookies();
  const headersList = headers();

  // Verificar o cookie i18next ou o header Accept-Language
  const langCookie = cookieStore.get('i18next')?.value;
  const acceptLanguage = headersList.get('Accept-Language');

  // Determinar o idioma com base nos dados disponíveis
  let lang = 'pt'; // Idioma padrão

  if (langCookie) {
    lang = langCookie;
  } else if (acceptLanguage) {
    // Extrair o idioma principal do header Accept-Language
    const preferredLang = acceptLanguage.split(',')[0].trim().split('-')[0];
    if (['pt', 'en', 'es', 'fr', 'de', 'zh'].includes(preferredLang)) {
      lang = preferredLang;
    }
  }

  // Função de tradução
  const t = (key: string) => {
    const keys = key.split('.');
    let value: TranslationResource = resources[lang] || resources.pt;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k] as TranslationResource;
      } else {
        return key; // Retornar a chave se não encontrar a tradução
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return t;
}
