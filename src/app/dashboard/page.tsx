'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import {
  People as PeopleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Erro ao carregar dados');
  }
  return res.json();
};

interface DashboardStats {
  totalUsers: number;
  totalLogins: number;
  totalProfiles: number;
}

export default function DashboardPage() {
  const { status } = useSession();
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<DashboardStats>(status === 'authenticated' ? '/api/dashboard/stats' : null, fetcher);

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
            title="Total de Logins"
            value={stats.totalLogins}
            icon={<HistoryIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Perfis"
            value={stats.totalProfiles}
            icon={<SettingsIcon fontSize="large" color="primary" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
