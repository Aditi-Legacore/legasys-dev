'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <CustomThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};
