'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import theme from './theme';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaaS Platform',
  description: 'SaaS Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="absolute top-4 right-4">
              <LanguageSelector />
            </div>
            {children}
          </ThemeProvider>
        </SessionProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
