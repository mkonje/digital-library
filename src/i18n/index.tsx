// src/i18n/index.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sw } from './sw';
import { en } from './en';

type Language = 'sw' | 'en';
type Translations = typeof sw;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('maktaba_lang');
    return saved === 'en' ? 'en' : 'sw'; // Default to Kiswahili
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('maktaba_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = language === 'sw' ? sw : en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
