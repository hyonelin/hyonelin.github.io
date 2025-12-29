import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zh from './zh.json';

export function getLangFromPath(): 'zh' | 'en' {
  const hash = window.location.hash;
  if (hash.includes('/en-US')) return 'en';
  return 'zh';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: getLangFromPath(),
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

export default i18n;
