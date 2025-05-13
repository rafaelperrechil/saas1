'use client';
import { AppBar, Box, Toolbar } from '@mui/material';
import LanguageSelector from '@/components/LanguageSelector';
import UserMenu from '@/components/UserMenu';
import BranchSelector from '@/components/BranchSelector';
interface PanelHeaderProps {
  open?: boolean;
}

export default function PanelHeader({ open }: PanelHeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 2, minHeight: '64px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BranchSelector />
          <UserMenu />
          <LanguageSelector />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
