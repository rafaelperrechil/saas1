import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('pt')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'pt' ? 'bg-[#9c27b0] text-white' : 'bg-gray-200'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'en' ? 'bg-[#9c27b0] text-white' : 'bg-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'es' ? 'bg-[#9c27b0] text-white' : 'bg-gray-200'
        }`}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSelector;
