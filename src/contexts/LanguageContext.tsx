'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translatePage: (lang: string) => void;
  translateText: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  // Load from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const translatePage = useCallback((lang: string) => {
    if (window.google && window.google.translate) {
      const googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,or',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');

        // Hide the Google Translate widget
        const widget = document.getElementById('google_translate_element');
        if (widget) {
          widget.style.display = 'none';
        }

        // Trigger translation
        setTimeout(() => {
          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
          }
        }, 1000);
      };

      if (typeof window.googleTranslateElementInit === 'function') {
        googleTranslateElementInit();
      } else {
        window.googleTranslateElementInit = googleTranslateElementInit;
      }
    }
  }, []);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === 'en') return text;

    // Use Google Translate API
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data[0][0][0] || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translatePage, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
