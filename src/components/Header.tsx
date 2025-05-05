import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'common.white' }}>
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}
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
          {status === 'authenticated' && session?.user ? (
            <>
              <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>{session.user.name?.[0] ?? '?'}</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleMenuClose}>
                  {t('account.myAccount') || 'Minha conta'}
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>{t('account.myPlan') || 'Meu plano'}</MenuItem>
                <MenuItem component={Link} href="/panel/dashboard" onClick={handleMenuClose}>
                  {t('account.goToPanel') || 'Acessar Painel'}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    signOut();
                  }}
                >
                  {t('account.logout') || 'Logout'}
                </MenuItem>
              </Menu>
            </>
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
