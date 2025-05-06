'use client';

import React from 'react';
import { Paper, Avatar, Typography, Box } from '@mui/material';

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
  avatar: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, testimonial, avatar }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 24px rgba(123, 31, 162, 0.15)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={avatar} alt={name} sx={{ width: 56, height: 56, mr: 2 }} />
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              color: '#7B1FA2',
              fontWeight: 600,
              fontSize: '1.1rem',
              mb: 0.5,
            }}
          >
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {role}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body1"
        color="text.primary"
        sx={{
          flex: 1,
          lineHeight: 1.6,
          fontSize: '1rem',
        }}
      >
        "{testimonial}"
      </Typography>
    </Paper>
  );
};

export default TestimonialCard;
