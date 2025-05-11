'use client';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import theme from './theme';
import { Toaster } from 'sonner';
import './globals.css';
import '../lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/lp/weddings/Footer';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanelRoute = pathname?.startsWith('/panel');

  return (
    <html lang="pt-BR">
      <head>
        <title>QualiSight</title>
        <meta name="description" content="QualiSight" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster position="top-right" />
            {!isPanelRoute && <Header />}
            {children}
            {!isPanelRoute && <Footer />}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
