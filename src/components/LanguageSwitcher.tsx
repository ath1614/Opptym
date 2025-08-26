import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Sparkles } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-white/20 dark:border-primary-700/20 rounded-xl shadow-glass hover:shadow-glass-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent group"
        aria-label="Select language"
      >
        <div className="w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
          <Globe className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-primary-700 group-hover:text-accent-700 transition-colors">
          {currentLanguage.flag} {currentLanguage.nativeName}
        </span>
        <ChevronDown className={`w-4 h-4 text-primary-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white/90 dark:bg-primary-800/90 backdrop-blur-lg border border-white/20 dark:border-primary-700/20 rounded-2xl shadow-glass z-50 animate-fade-in-up max-h-96 overflow-y-auto">
          <div className="p-2">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200 flex items-center justify-between group ${
                  i18n.language === language.code 
                    ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-glow' 
                    : 'text-primary-700 hover:bg-accent-50 hover:text-accent-700'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{language.nativeName}</span>
                    <span className={`text-xs ${i18n.language === language.code ? 'text-white/80' : 'text-primary-500'}`}>
                      {language.name}
                    </span>
                  </div>
                </div>
                {i18n.language === language.code && (
                  <div className="w-2 h-2 bg-white dark:bg-primary-300 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;
