'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { IconButton, Menu, MenuItem, Avatar } from '@mui/material';

export default function UserMenu() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{session.user.name?.[0] ?? '?'}</Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem component={Link} href="/panel/profile" onClick={handleMenuClose}>
          {t('account.profile.title')}
        </MenuItem>
        <MenuItem component={Link} href="/panel/billing" onClick={handleMenuClose}>
          {t('account.myPlan')}
        </MenuItem>
        <MenuItem component={Link} href="/panel/dashboard" onClick={handleMenuClose}>
          {t('account.goToPanel')}
        </MenuItem>
        <MenuItem component={Link} href="/logout" onClick={handleMenuClose}>
          {t('account.logout')}
        </MenuItem>
      </Menu>
    </>
  );
}
