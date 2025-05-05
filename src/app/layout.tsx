'use client';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import theme from './theme';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import './globals.css';
import '../lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const metadata: Metadata = {
  title: 'SaaS Platform',
  description: 'SaaS Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster position="top-right" />
            {/* Header global */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: 'common.white' }}>
              <Container
                maxWidth="lg"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 2,
                }}
              >
                <Typography variant="h6" component="div">
                  SaaS Platform
                </Typography>
                <Box>
                  {['home', 'products', 'solutions', 'help', 'pricing'].map((key) => (
                    <Button
                      key={key}
                      component={Link}
                      href={`/${key}`}
                      sx={{ color: 'text.primary', mx: 1 }}
                    >
                      {t(`nav.${key}`)}
                    </Button>
                  ))}
                  <Button component={Link} href="/login" sx={{ color: 'text.primary', mx: 1 }}>
                    {t('nav.login')}
                  </Button>
                  <Button
                    component={Link}
                    href="/register"
                    variant="contained"
                    color="warning"
                    sx={{ ml: 2 }}
                  >
                    {t('nav.getStarted')}
                  </Button>
                  <Box sx={{ display: 'inline-block', ml: 2, mt: '10px' }}>
                    <LanguageSelector />
                  </Box>
                </Box>
              </Container>
            </AppBar>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
