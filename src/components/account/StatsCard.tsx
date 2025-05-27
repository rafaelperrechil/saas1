import React from 'react';
import { Card, Typography, Box, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ChecklistIcon from '@mui/icons-material/CheckBoxOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

interface StatsCardProps {
  translations: {
    statistics: string;
  };
  stats: {
    totalUsers: number;
    maxUsers?: number;
    totalChecklists: number;
    maxChecklists?: number;
    totalInspections: number;
    totalTickets: number;
    maxInspections: number;
    maxTickets: number;
  };
}

export default function StatsCard({ translations, stats }: StatsCardProps) {
  const usersUsed = stats.totalUsers;
  const usersMax = stats.maxUsers || 1;
  const usersPercentage = (usersUsed / usersMax) * 100;

  const checklistsUsed = stats.totalChecklists;
  const checklistsMax = stats.maxChecklists || 1;
  const checklistsPercentage = (checklistsUsed / checklistsMax) * 100;

  const inspectionsUsed = stats.totalInspections;
  const inspectionsMax = stats.maxInspections;
  const inspectionsPercentage = (inspectionsUsed / inspectionsMax) * 100;

  const ticketsUsed = stats.totalTickets;
  const ticketsMax = stats.maxTickets;
  const ticketsPercentage = (ticketsUsed / ticketsMax) * 100;

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {translations.statistics}
      </Typography>

      {/* Estatísticas de usuários */}
      <Box sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            Usuários: {usersUsed}/{usersMax}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={usersPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: usersPercentage > 80 ? 'error.main' : 'primary.main',
            },
          }}
        />
      </Box>

      {/* Estatísticas de checklists */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ChecklistIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            Checklists: {checklistsUsed}/{checklistsMax}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={checklistsPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: checklistsPercentage > 80 ? 'error.main' : 'primary.main',
            },
          }}
        />
      </Box>

      {/* Inspeções realizadas */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AssignmentTurnedInIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            Inspeções realizadas: {inspectionsUsed}/{inspectionsMax}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={inspectionsPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: inspectionsPercentage > 80 ? 'error.main' : 'primary.main',
            },
          }}
        />
      </Box>

      {/* Tickets */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ConfirmationNumberIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            Tickets: {ticketsUsed}/{ticketsMax}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={ticketsPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: ticketsPercentage > 80 ? 'error.main' : 'primary.main',
            },
          }}
        />
      </Box>
    </Card>
  );
}
