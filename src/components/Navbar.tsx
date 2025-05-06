import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div>
      {/* ... existing code ... */}

      <MenuItem onClick={() => router.push('/account/billing')}>
        <ListItemIcon>
          <PaymentIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('account.billing.title')}</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => router.push('/account/profile')}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('account.profile.title')}</ListItemText>
      </MenuItem>

      {/* ... existing code ... */}
    </div>
  );
};

export default Navbar;
