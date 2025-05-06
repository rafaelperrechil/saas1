'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Typography, Button, Container, Grid, Box, useTheme, useMediaQuery } from '@mui/material';

export default function HomePage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant={isMdUp ? 'h2' : 'h3'} component="h1" gutterBottom>
              We Are Creative Agencies
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Boltzshift Studio is a design & develop agency of the future with 120+ successful
              projects in their portfolio.
            </Typography>
            <Button component={Link} href="/demo" variant="contained" color="warning" size="large">
              Book a demo
            </Button>
          </Grid>
          <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
            <Box sx={{ position: 'relative', width: '100%', height: 0, pt: '200%' }}>
              <Image
                src="/images/hero-phone.png"
                alt="App preview"
                fill
                style={{ objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -32,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  border: '4px solid white',
                  borderRadius: '50%',
                }}
              >
                <Image
                  src="/images/avatar.png"
                  alt="Avatar"
                  width={64}
                  height={64}
                  style={{ borderRadius: '50%' }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 4 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} SaaS Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
