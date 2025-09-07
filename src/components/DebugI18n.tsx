import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DebugI18n() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
    setAvailableLanguages(i18n.languages);
  }, [i18n.language, i18n.languages]);

  const testTranslations = {
    'common.search': t('common.search'),
    'navbar.welcomeBack': t('navbar.welcomeBack'),
    'navbar.search': t('navbar.search'),
    'navbar.profile': t('navbar.profile'),
    'navbar.settings': t('navbar.settings'),
    'navbar.logout': t('navbar.logout'),
    'navbar.notifications': t('navbar.notifications'),
    'landing.hero.title': t('landing.hero.title'),
    'landing.hero.subtitle': t('landing.hero.subtitle'),
    'landing.hero.cta': t('landing.hero.cta'),
    'dashboard.title': t('dashboard.title'),
    'dashboard.welcome': t('dashboard.welcome'),
    'sidebar.dashboard': t('sidebar.dashboard'),
    'sidebar.projects': t('sidebar.projects'),
    'sidebar.tools': t('sidebar.tools'),
    'sidebar.directory': t('sidebar.directory'),
    'sidebar.seoTasks': t('sidebar.seoTasks'),
    'sidebar.reports': t('sidebar.reports'),
    'sidebar.pricing': t('sidebar.pricing'),
    'sidebar.profile': t('sidebar.profile')
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  return (
    <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">🔍 DEBUG: i18n System</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Status */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">🌐 Language Status</h3>
          <p><strong>Current Language:</strong> {currentLanguage}</p>
          <p><strong>Available Languages:</strong> {availableLanguages.join(', ')}</p>
          <p><strong>Is Ready:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</p>
          <p><strong>Has Resource Bundle:</strong> {i18n.hasResourceBundle(currentLanguage) ? 'Yes' : 'No'}</p>
        </div>

        {/* Language Switcher */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">🔄 Language Switcher</h3>
          <div className="space-y-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                  currentLanguage === lang
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translation Tests */}
      <div className="mt-6 bg-white p-4 rounded border">
        <h3 className="text-lg font-semibold mb-4">📝 Translation Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(testTranslations).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-600">{key}</div>
              <div className="text-gray-900 mt-1">
                {value || <span className="text-red-500 italic">Missing translation</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Bundle Info */}
      <div className="mt-6 bg-white p-4 rounded border">
        <h3 className="text-lg font-semibold mb-2">📦 Resource Bundle Info</h3>
        <div className="text-sm text-gray-600">
          <p><strong>Current Language Resources:</strong></p>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-48">
            {JSON.stringify(i18n.getResourceBundle(currentLanguage, 'translation'), null, 2)}
          </pre>
        </div>
      </div>

      {/* Missing Keys */}
      <div className="mt-6 bg-white p-4 rounded border">
        <h3 className="text-lg font-semibold mb-2">❌ Missing Keys</h3>
        <div className="text-sm">
          {Object.entries(testTranslations).filter(([_, value]) => !value).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(testTranslations)
                .filter(([_, value]) => !value)
                .map(([key, _]) => (
                  <div key={key} className="text-red-600">• {key}</div>
                ))}
            </div>
          ) : (
            <div className="text-green-600">✅ All test translations are working!</div>
          )}
        </div>
      </div>
    </div>
  );
}
