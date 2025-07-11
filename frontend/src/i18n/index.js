/**
 * Internationalization (i18n) Configuration
 * Supports Vietnamese, English, and Chinese languages
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import viTranslations from './locales/vi.json';
import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

const resources = {
  vi: {
    translation: viTranslations
  },
  en: {
    translation: enTranslations
  },
  zh: {
    translation: zhTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Default to Vietnamese
    debug: (import.meta.env && import.meta.env.DEV) || false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;

// Language configuration
export const languages = [
  {
    code: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    direction: 'ltr'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    direction: 'ltr'
  }
];

// Helper functions
export const getCurrentLanguage = () => {
  return i18n.language || 'vi';
};

export const changeLanguage = (lng) => {
  return i18n.changeLanguage(lng);
};

export const getLanguageInfo = (code) => {
  return languages.find(lang => lang.code === code) || languages[0];
};
