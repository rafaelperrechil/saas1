'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ListAlt as ListAltIcon,
  Apartment as ApartmentIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const drawerWidth = 240;
const collapsedWidth = 60;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [openInspections, setOpenInspections] = useState(false);
  const [openChecklists, setOpenChecklists] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="nav" sx={{ flexShrink: 0 }}>
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar sx={{ justifyContent: open ? 'flex-end' : 'center', px: [1] }}>
            <IconButton onClick={handleDrawerToggle} size="small">
              <MenuIcon sx={{ color: 'primary.main' }} />
            </IconButton>
          </Toolbar>
          <Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => router.push('/panel/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.dashboard')} />
                </ListItemButton>
              </ListItem>

              {/* Menu Inspeções */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpenInspections(!openInspections)}>
                  <ListItemIcon>
                    <AssignmentTurnedInIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.inspections.title')} />
                  {openInspections ? (
                    <ExpandLess sx={{ color: 'primary.main' }} />
                  ) : (
                    <ExpandMore sx={{ color: 'primary.main' }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openInspections} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/panel/inspections')}>
                    <ListItemText primary={t('menu.inspections.all')} />
                  </ListItemButton>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => router.push('/panel/inspections/new')}
                  >
                    <ListItemText primary={t('menu.inspections.create')} />
                  </ListItemButton>
                </List>
              </Collapse>

              {/* Menu Checklists */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpenChecklists(!openChecklists)}>
                  <ListItemIcon>
                    <ListAltIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.checklists.title')} />
                  {openChecklists ? (
                    <ExpandLess sx={{ color: 'primary.main' }} />
                  ) : (
                    <ExpandMore sx={{ color: 'primary.main' }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openChecklists} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/panel/checklists')}>
                    <ListItemText primary={t('menu.checklists.all')} />
                  </ListItemButton>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => router.push('/panel/checklists/new')}
                  >
                    <ListItemText primary={t('menu.checklists.create')} />
                  </ListItemButton>
                </List>
              </Collapse>

              {/* Ambientes */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => router.push('/panel/environments')}>
                  <ListItemIcon>
                    <ApartmentIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.environments')} />
                </ListItemButton>
              </ListItem>

              {/* Departamentos */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => router.push('/panel/departments')}>
                  <ListItemIcon>
                    <GroupIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.departments')} />
                </ListItemButton>
              </ListItem>

              {/* Configurações */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => router.push('/panel/settings')}>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.settings')} />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* Menu Administrativo */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpenAdmin(!openAdmin)}>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.administrative.title')} />
                  {openAdmin ? (
                    <ExpandLess sx={{ color: 'primary.main' }} />
                  ) : (
                    <ExpandMore sx={{ color: 'primary.main' }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openAdmin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/panel/users')}>
                      <ListItemIcon>
                        <PeopleIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={t('menu.administrative.users')} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/panel/profiles')}>
                      <ListItemIcon>
                        <SettingsIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={t('menu.administrative.profiles')} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/panel/plans')}>
                      <ListItemIcon>
                        <SettingsIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={t('menu.administrative.plans')} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/panel/history')}>
                      <ListItemIcon>
                        <HistoryIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={t('menu.administrative.history')} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>
            </List>
            <Divider />
          </Box>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
