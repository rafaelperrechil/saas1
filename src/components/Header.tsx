'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import UserMenu from '@/components/UserMenu';
import { AppBar, Typography, Button, Container, Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { t } = useTranslation();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'common.white' }}>
        <Container
          maxWidth="lg"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}
        >
          <Typography variant="h6" component="div" color="primary.dark">
            QualiSight
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ minWidth: '300px' }}></div>
          </Box>
        </Container>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'common.white' }}>
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}
      >
        <Typography variant="h6" component="div" color="primary.dark">
          QualiSight
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
          {status === 'authenticated' ? (
            <UserMenu />
          ) : (
            <>
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
            </>
          )}
          <Box sx={{ display: 'inline-block', ml: 2, mt: '10px' }}>
            <LanguageSelector />
          </Box>
        </Box>
      </Container>
    </AppBar>
  );
}
