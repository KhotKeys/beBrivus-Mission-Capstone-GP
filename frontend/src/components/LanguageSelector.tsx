import React from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
  region: string;
}

const LANGUAGES: Language[] = [
  // International
  { code: 'en', name: 'English', flag: '🇬🇧', region: 'International' },
  { code: 'fr', name: 'Français — French', flag: '🇫🇷', region: 'International' },
  { code: 'pt', name: 'Português — Portuguese', flag: '🇦🇴', region: 'International' },
  
  // East Africa
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  { code: 'am', name: 'አማርኛ — Amharic', flag: '🇪🇹', region: 'East Africa' },
  { code: 'dinka', name: 'Thuɔŋjäŋ — Dinka', flag: '🇸🇸', region: 'East Africa' },
  
  // West Africa
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', region: 'West Africa' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬', region: 'West Africa' },
  
  // Southern Africa
  { code: 'zu', name: 'isiZulu — Zulu', flag: '🇿🇦', region: 'Southern Africa' },
  
  // North Africa
  { code: 'ar', name: 'العربية — Arabic', flag: '🇪🇬', region: 'North Africa' },
];

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('bebrivus_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new Event('languagechange'));
  };

  // Group languages by region
  const groupedLanguages = LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.region]) {
      acc[lang.region] = [];
    }
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, Language[]>);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label htmlFor="language-selector" className="text-sm font-medium text-gray-700">
          {t('Select Language')}
        </label>
      )}
      <select
        id="language-selector"
        value={i18n.language}
        onChange={handleLanguageChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-colors relative z-[9999]"
        style={{
          minWidth: '180px',
        }}
      >
        {Object.entries(groupedLanguages).map(([region, langs]) => (
          <optgroup key={region} label={`── ${region} ──`}>
            {langs.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

// Compact version for navbar
export const LanguageSelectorCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('bebrivus_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new Event('languagechange'));
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className="appearance-none bg-transparent border border-gray-300 rounded-md px-2 py-1 pr-8 text-sm cursor-pointer hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 relative z-[9999]"
        title="Select Language"
        style={{ minWidth: '100px' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name.split(' — ')[0]}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-[10000]">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
