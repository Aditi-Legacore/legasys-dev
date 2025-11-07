import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

export const useTranslation = (text: string) => {
  const { language, translateText } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en') {
        setTranslatedText(text);
      } else {
        const result = await translateText(text);
        setTranslatedText(result);
      }
    };
    translate();
  }, [text, language, translateText]);

  return translatedText;
};
