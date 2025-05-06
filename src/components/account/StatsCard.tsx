import React from 'react';
import { Card, Typography, Box, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ChecklistIcon from '@mui/icons-material/CheckBoxOutlined';

interface StatsCardProps {
  translations: {
    statistics: string;
  };
}

export default function StatsCard({ translations }: StatsCardProps) {
  // Valores estáticos para demonstração
  const usersUsed = 1;
  const usersMax = 5;
  const usersPercentage = (usersUsed / usersMax) * 100;

  const checklistsUsed = 2;
  const checklistsMax = 5;
  const checklistsPercentage = (checklistsUsed / checklistsMax) * 100;

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
    </Card>
  );
}
