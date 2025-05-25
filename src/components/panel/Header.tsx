'use client';
import { AppBar, Box, Toolbar } from '@mui/material';
import LanguageSelector from '@/components/LanguageSelector';
import UserMenu from '@/components/UserMenu';
import BranchSelector from '@/components/BranchSelector';
interface PanelHeaderProps {
  open?: boolean;
}

export default function PanelHeader({ open }: PanelHeaderProps) {
  const drawerWidth = 240;
  const collapsedWidth = 60;
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        color: 'text.primary',
        marginLeft: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
        width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedWidth}px)`,
        transition: (theme) =>
          theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2, minHeight: '64px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BranchSelector />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <UserMenu />
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
            }}
          >
            <LanguageSelector />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
