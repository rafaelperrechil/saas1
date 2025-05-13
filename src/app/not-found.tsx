'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, CircularProgress, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '200px 0',
        }}
      >
        {/* <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} /> */}
        <Typography variant="h4" gutterBottom>
          Página não encontrada :(
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 3 }}>
          Você será redirecionado em {countdown} segundos...
        </Typography>
        <Box sx={{ mb: 3 }}>
          <CircularProgress variant="determinate" value={(countdown / 5) * 100} size={40} />
        </Box>
      </Box>
    </Container>
  );
}
