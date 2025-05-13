'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  Tooltip,
  Typography,
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
  BugReport as BugReportIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import PanelHeader from '@/components/panel/Header';
import LoadingScreen from '@/components/common/LoadingScreen';

const drawerWidth = 240;
const collapsedWidth = 60;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [openInspections, setOpenInspections] = useState(false);
  const [openChecklists, setOpenChecklists] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const isWizardPage = pathname === '/panel/wizard';

  const handleDrawerToggle = () => {
    if (open) {
      setOpenInspections(false);
      setOpenChecklists(false);
      setOpenAdmin(false);
    }
    setOpen(!open);
  };

  const handleItemClick = (route: string) => {
    if (!open) {
      setOpen(true);
    } else {
      router.push(route);
    }
  };

  const handleSubmenuClick = (setSubmenuOpen: (value: boolean) => void, isSubmenuOpen: boolean) => {
    if (!open) {
      setOpen(true);
    } else {
      setSubmenuOpen(!isSubmenuOpen);
    }
  };

  const tooltipStyles = {
    tooltip: {
      sx: {
        bgcolor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontSize: '0.875rem',
        padding: '8px 12px',
      },
    },
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <LoadingScreen />;
  }

  if (isWizardPage) {
    return children;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <PanelHeader />
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          position: 'absolute',
          '& .MuiDrawer-paper': {
            position: 'fixed',
            width: open ? drawerWidth : collapsedWidth,
            backgroundColor: theme.palette.primary.main,
            height: '100vh',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: 200,
            }),
            overflowX: 'hidden',
            zIndex: 1300,
          },
        }}
      >
        <Box>
          <List sx={{ mt: 0, pt: 0 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleDrawerToggle} sx={{ bgcolor: 'primary.dark' }}>
                <ListItemIcon>
                  <MenuIcon sx={{ color: '#FFFFFF' }} />
                </ListItemIcon>
                <ListItemText
                  primary={'QualiSight'}
                  sx={{
                    color: '#FFFFFF',
                    opacity: open ? 1 : 0,
                    transition: 'opacity 200ms',
                    '& .MuiListItemText-primary': {
                      fontWeight: 700,
                      fontSize: '1.3rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.dashboard') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton onClick={() => handleItemClick('/panel/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('menu.dashboard')}
                    sx={{
                      color: '#FFFFFF',
                      opacity: open ? 1 : 0,
                      transition: 'opacity 200ms',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Menu Inspeções */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.inspections.title') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton
                  onClick={() => {
                    if (!open) {
                      setOpen(true);
                    } else {
                      setOpenInspections(!openInspections);
                    }
                  }}
                >
                  <ListItemIcon>
                    <AssignmentTurnedInIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('menu.inspections.title')}
                    sx={{
                      color: '#FFFFFF',
                      opacity: open ? 1 : 0,
                      transition: 'opacity 200ms',
                    }}
                  />
                  {open &&
                    (openInspections ? (
                      <ExpandLess sx={{ color: '#FFFFFF' }} />
                    ) : (
                      <ExpandMore sx={{ color: '#FFFFFF' }} />
                    ))}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <Collapse in={openInspections} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleItemClick('/panel/inspections')}
                >
                  <ListItemText primary={t('menu.inspections.all')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleItemClick('/panel/inspections/new')}
                >
                  <ListItemText primary={t('menu.inspections.create')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Menu Checklists */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.checklists.title') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton
                  onClick={() => {
                    if (!open) {
                      setOpen(true);
                    } else {
                      setOpenChecklists(!openChecklists);
                    }
                  }}
                >
                  <ListItemIcon>
                    <ListAltIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.checklists.title')} sx={{ color: '#FFFFFF' }} />
                  {openChecklists ? (
                    <ExpandLess sx={{ color: '#FFFFFF' }} />
                  ) : (
                    <ExpandMore sx={{ color: '#FFFFFF' }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <Collapse in={openChecklists} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} onClick={() => handleItemClick('/panel/checklists')}>
                  <ListItemText primary={t('menu.checklists.all')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleItemClick('/panel/checklists/new')}
                >
                  <ListItemText primary={t('menu.checklists.create')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Ambientes */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.environments') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton onClick={() => handleItemClick('/panel/environments')}>
                  <ListItemIcon>
                    <ApartmentIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('menu.environments')}
                    sx={{
                      color: '#FFFFFF',
                      opacity: open ? 1 : 0,
                      transition: 'opacity 200ms',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Departamentos */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.departments') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton onClick={() => handleItemClick('/panel/departments')}>
                  <ListItemIcon>
                    <GroupIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.departments')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Departamentos */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? 'Tickets & Chamados' : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton onClick={() => handleItemClick('/panel/departments')}>
                  <ListItemIcon>
                    <BugReportIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText primary={'Tickets & Chamados'} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Relatórios */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.reports') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton onClick={() => handleItemClick('/panel/reports')}>
                  <ListItemIcon>
                    <AssessmentIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.reports')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Configurações */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.settings') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton onClick={() => handleItemClick('/panel/settings')}>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('menu.settings')} sx={{ color: '#FFFFFF' }} />
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <Divider sx={{ my: 1 }} />

            {/* Menu Administrativo */}
            <ListItem disablePadding>
              <Tooltip
                title={!open ? t('menu.administrative.title') : ''}
                placement="right"
                componentsProps={tooltipStyles}
              >
                <ListItemButton
                  onClick={() => {
                    if (!open) {
                      setOpen(true);
                    } else {
                      setOpenAdmin(!openAdmin);
                    }
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('menu.administrative.title')}
                    sx={{ color: '#FFFFFF' }}
                  />
                  {openAdmin ? (
                    <ExpandLess sx={{ color: '#FFFFFF' }} />
                  ) : (
                    <ExpandMore sx={{ color: '#FFFFFF' }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <Collapse in={openAdmin} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <Tooltip
                    title={!open ? t('menu.administrative.users') : ''}
                    placement="right"
                    componentsProps={tooltipStyles}
                  >
                    <ListItemButton sx={{ pl: 4 }} onClick={() => handleItemClick('/panel/users')}>
                      <ListItemText
                        primary={t('menu.administrative.users')}
                        sx={{ color: '#FFFFFF' }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                <ListItem disablePadding>
                  <Tooltip
                    title={!open ? t('menu.administrative.profiles') : ''}
                    placement="right"
                    componentsProps={tooltipStyles}
                  >
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleItemClick('/panel/profiles')}
                    >
                      <ListItemText
                        primary={t('menu.administrative.profiles')}
                        sx={{ color: '#FFFFFF' }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                <ListItem disablePadding>
                  <Tooltip
                    title={!open ? t('menu.administrative.plans') : ''}
                    placement="right"
                    componentsProps={tooltipStyles}
                  >
                    <ListItemButton sx={{ pl: 4 }} onClick={() => handleItemClick('/panel/plans')}>
                      <ListItemText
                        primary={t('menu.administrative.plans')}
                        sx={{ color: '#FFFFFF' }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                <ListItem disablePadding>
                  <Tooltip
                    title={!open ? t('menu.administrative.history') : ''}
                    placement="right"
                    componentsProps={tooltipStyles}
                  >
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleItemClick('/panel/history')}
                    >
                      <ListItemText
                        primary={t('menu.administrative.history')}
                        sx={{ color: '#FFFFFF' }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </List>
            </Collapse>
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: '64px', // Altura do AppBar
          pl: open ? `calc(${drawerWidth}px + 24px)` : `calc(${collapsedWidth}px + 24px)`,
          transition: theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: 200,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
