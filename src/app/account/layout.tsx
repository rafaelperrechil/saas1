'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useTranslation } from 'react-i18next';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Lista de navegação da conta
  const accountNavItems = [
    {
      title: t('account.myAccount'),
      icon: <PersonIcon />,
      path: '/account/profile',
    },
    {
      title: t('account.billing.title'),
      icon: <ReceiptIcon />,
      path: '/account/billing',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Sidebar de navegação */}
        <Box component="nav" sx={{ width: { xs: '100%', md: 250 } }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <List>
              {accountNavItems.map((item) => (
                <ListItem
                  key={item.path}
                  component={Link}
                  href={item.path}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    bgcolor: pathname === item.path ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Conteúdo principal */}
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
      </Box>
    </Container>
  );
}
