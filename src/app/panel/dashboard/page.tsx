'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Grid, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import {
  People as PeopleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  MeetingRoom as MeetingRoomIcon,
} from '@mui/icons-material';
import { dashboardService, organizationService } from '@/services';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalLogins: number;
  totalProfiles: number;
  totalBranches: number;
  totalDepartments: number;
  totalEnvironments: number;
}

const fetcher = async (url: string): Promise<DashboardStats> => {
  const response = await dashboardService.getStats();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data as DashboardStats;
};

export default function DashboardPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<DashboardStats, Error>(
    status === 'authenticated' ? '/api/dashboard/stats' : null,
    fetcher
  );

  useEffect(() => {
    const checkOrganization = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await organizationService.getCompletedWizardData(session.user.id);
        if (!response.data?.hasCompletedWizard) {
          router.replace('/panel/wizard');
        }
      } catch (error) {
        console.error('Erro ao verificar organização:', error);
      }
    };

    checkOrganization();
  }, [session, router]);

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (status === 'loading' || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="error">Erro ao carregar estatísticas: {error.message}</Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography>Nenhum dado disponível</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={<PeopleIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Filiais"
            value={stats.totalBranches}
            icon={<BusinessIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Departamentos"
            value={stats.totalDepartments}
            icon={<ApartmentIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Ambientes"
            value={stats.totalEnvironments}
            icon={<MeetingRoomIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Perfis"
            value={stats.totalProfiles}
            icon={<SettingsIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Logins"
            value={stats.totalLogins}
            icon={<HistoryIcon fontSize="large" color="primary" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
