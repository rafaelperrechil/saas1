'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface NicheCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

const NicheCard: React.FC<NicheCardProps> = ({ title, description, Icon }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: 4,
        p: 2,
        boxShadow: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-8px)',
        },
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        <Icon size={48} strokeWidth={1.5} />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NicheCard;
